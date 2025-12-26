import mongoose from "mongoose";

let isConnected = false; // global connection flag

const connectDB = async () => {
  if (isConnected) {
    console.log("✅ MongoDB already connected");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "YannDB", // optional: replace with your actual DB name
      // Note: useNewUrlParser and useUnifiedTopology are deprecated in MongoDB Driver 4.0+
      // These options are no longer needed and have no effect
    });

    isConnected = true;
    console.log("✅ MongoDB connected:", conn.connection.host);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
};

export default connectDB;
