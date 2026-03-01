import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 40, default: "Home" },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    phone: { type: String, required: true, trim: true, maxlength: 15 },
    apartment: { type: String, trim: true, maxlength: 40, default: "" },
    building: { type: String, trim: true, maxlength: 60, default: "" },
    street: { type: String, required: true, trim: true, maxlength: 120 },
    city: { type: String, trim: true, maxlength: 60, default: "" },
    state: { type: String, trim: true, maxlength: 60, default: "" },
    postalCode: { type: String, trim: true, maxlength: 12, default: "" },
    fullAddress: { type: String, trim: true, maxlength: 300, default: "" },
    latitude: { type: Number },
    longitude: { type: Number },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: true } // Enable _id for subdocuments
);

const homeownerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (value) => !value || /^[0-9]{10}$/.test(value),
        message: "Please enter a valid 10-digit phone number",
      },
    },
    avatar: {
      type: String,
      default: "",
    },
    preferences: {
      type: [String],
      default: [],
    },
    savedProviders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceProvider",
      },
    ],
    addressBook: {
      type: [addressSchema],
      default: [],
    },
    lastLoginAt: {
      type: Date,
    },
    // Admin controls
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedAt: {
      type: Date,
    },
    blockedReason: {
      type: String,
      default: "",
    },
    // Wallet
    wallet: {
      balance: {
        type: Number,
        default: 0,
        min: 0,
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    // Aadhaar Verification (Meon DigiLocker)
    aadhaarVerified: {
      type: Boolean,
      default: false,
    },
    aadhaarPhone: {
      type: String,
      trim: true,
    },
    aadhaarVerifiedAt: {
      type: Date,
    },
    // Document verification
    documents: {
      aadhaar: {
        number: String,
        verified: { type: Boolean, default: false },
        verifiedAt: Date,
        imageUrl: String,
      },
      pan: {
        number: String,
        verified: { type: Boolean, default: false },
        verifiedAt: Date,
        imageUrl: String,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Push Notifications
    pushToken: {
      type: String,
      default: null,
    },
    pushNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
    // UGC Blocking
    blockedUsers: [{
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      userModel: { type: String, required: true, enum: ['Homeowner', 'ServiceProvider'] },
      blockedAt: { type: Date, default: Date.now }
    }],
  },
  { timestamps: true }
);

// Create sparse unique indexes for email and phone
// This allows users to sign up with either email OR phone
// IMPORTANT: If old non-sparse indexes exist in MongoDB, they must be dropped first
// Run this in MongoDB shell: db.homeowners.dropIndex("email_1"); db.homeowners.dropIndex("phone_1");
homeownerSchema.index({ email: 1 }, { unique: true, sparse: true });
homeownerSchema.index({ phone: 1 }, { unique: true, sparse: true });

// Ensure at least one of email or phone is present
homeownerSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    next(new Error('Either email or phone number is required'));
  } else {
    next();
  }
});

// Auto-fix stale indexes on model initialization
const fixIndexes = async (model) => {
  try {
    const collection = model.collection;
    const indexes = await collection.indexes();
    
    for (const idx of indexes) {
      // Check for non-sparse unique indexes on email or phone
      if (idx.unique && !idx.sparse && (idx.key?.email || idx.key?.phone)) {
        const fieldName = idx.key?.email ? 'email' : 'phone';
        console.log(`⚠️ Dropping stale non-sparse unique index '${idx.name}' on '${fieldName}'`);
        try {
          await collection.dropIndex(idx.name);
          console.log(`✅ Dropped stale index '${idx.name}'. Mongoose will recreate it as sparse.`);
        } catch (dropErr) {
          console.error(`❌ Failed to drop stale index '${idx.name}':`, dropErr.message);
        }
      }
    }
    
    // Ensure correct indexes exist
    await model.ensureIndexes();
  } catch (err) {
    // Silently ignore - index fix is best effort
    console.error('Index fix error:', err.message);
  }
};

const HomeownerModel = mongoose.models.Homeowner || mongoose.model("Homeowner", homeownerSchema);

// Run index fix asynchronously (non-blocking)
if (typeof process !== 'undefined' && !process.env._HOMEOWNER_INDEX_FIXED) {
  process.env._HOMEOWNER_INDEX_FIXED = '1';
  // Delay to ensure connection is ready
  setTimeout(() => {
    if (mongoose.connection.readyState === 1) {
      fixIndexes(HomeownerModel).catch(() => {});
    }
  }, 3000);
}

export default HomeownerModel;
