import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, maxlength: 40, default: "Home" },
    street: { type: String, trim: true, maxlength: 120, default: "" },
    city: { type: String, trim: true, maxlength: 60, default: "" },
    state: { type: String, trim: true, maxlength: 60, default: "" },
    postalCode: { type: String, trim: true, maxlength: 12, default: "" },
  },
  { _id: false }
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
      required: [true, "Email is required"],
      unique: true,
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
  },
  { timestamps: true }
);

homeownerSchema.index({ email: 1 });

export default mongoose.models.Homeowner || mongoose.model("Homeowner", homeownerSchema);
