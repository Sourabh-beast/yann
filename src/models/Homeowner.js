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

export default mongoose.models.Homeowner || mongoose.model("Homeowner", homeownerSchema);
