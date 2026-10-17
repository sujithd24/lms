import { Schema, model } from "mongoose";
import { cleanJSON } from "../db";

const transactionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    transactionId: { type: String, required: true, unique: true },
    dateTime: { type: String, required: true },
    courseId: { type: String, required: true, index: true },
    paymentProvider: { type: String, enum: ["stripe"], required: true },
    amount: Number,
  },
  {
    strict: false, // keep extra fields, as the previous schema did (saveUnknown)
    timestamps: true,
    toJSON: cleanJSON,
    toObject: cleanJSON,
  }
);

const Transaction = model("Transaction", transactionSchema);
export default Transaction;
