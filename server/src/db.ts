import mongoose from "mongoose";

/**
 * MongoDB connection (MongoDB Atlas in production, a local server in development).
 * The connection is cached so serverless (Lambda) invocations reuse it.
 */
let connection: Promise<typeof mongoose> | null = null;

export const connectDB = (): Promise<typeof mongoose> => {
  if (connection) return connection;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("MONGODB_URI is not set");
    }
  }

  const target = uri || "mongodb://127.0.0.1:27017/lms";
  mongoose.set("strictQuery", true);

  connection = mongoose
    .connect(target, { serverSelectionTimeoutMS: 10000 })
    .then((m) => {
      console.log(`MongoDB connected: ${m.connection.host}/${m.connection.name}`);
      return m;
    })
    .catch((error) => {
      connection = null; // allow a retry on the next call
      throw error;
    });

  return connection;
};

/** Removes Mongo internals so API responses keep the same shape as before. */
export const cleanJSON = {
  virtuals: false,
  versionKey: false,
  transform: (_doc: unknown, ret: Record<string, unknown>) => {
    delete ret._id;
    return ret;
  },
};
