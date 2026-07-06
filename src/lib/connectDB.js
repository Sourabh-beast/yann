import mongoose from "mongoose";
import logger from "./logger";

// Cache the connection promise on `global` so it survives serverless module
// reuse across warm invocations, and so concurrent cold-start requests await
// the same in-flight connect() instead of racing to open separate ones.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: "YannDB",
      bufferCommands: false,
      // Small per-instance pool: Vercel can scale to many concurrent function
      // instances, each holding its own pool, so this must stay well under
      // the Atlas tier's total connection ceiling (e.g. ~1500 on M10).
      maxPoolSize: 5,
      maxIdleTimeMS: 10000,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongooseInstance) => {
      logger.info({ host: mongooseInstance.connection.host }, "MongoDB connected");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    logger.error({ err: error }, "MongoDB connection error");
    throw new Error("Failed to connect to MongoDB");
  }

  return cached.conn;
};

export default connectDB;
