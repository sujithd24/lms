import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../db";
import Course from "../models/courseModel";
import Transaction from "../models/transactionModel";
import UserCourseProgress from "../models/userCourseProgressModel";
import { fillMissingQuizzes } from "./fillQuizzes";

dotenv.config();

const collections = [
  { file: "courses.json", model: Course, name: "courses" },
  { file: "transactions.json", model: Transaction, name: "transactions" },
  { file: "userCourseProgress.json", model: UserCourseProgress, name: "user course progress" },
] as const;

/**
 * Loads the sample data in ./data.
 * - Default: only fills collections that are EMPTY, so it is safe to run on startup.
 * - reset: true wipes each collection first (explicit, never automatic).
 */
export default async function seed({ reset = false }: { reset?: boolean } = {}) {
  await connectDB();
  const dataDir = path.join(__dirname, "data");
  let seededAny = false;

  for (const { file, model, name } of collections) {
    const Model = model as mongoose.Model<any>;
    const existing = await Model.countDocuments();

    if (existing > 0 && !reset) {
      console.log(`Skipping ${name}: already has ${existing} document(s)`);
      continue;
    }
    if (reset) await Model.deleteMany({});

    const docs = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
    await Model.syncIndexes();
    const inserted = await Model.insertMany(docs, { ordered: false });
    console.log(`Seeded ${inserted.length} ${name}`);
    seededAny = true;
  }

  // Give the sample courses' chapters a quiz (by category). Only when sample data
  // was actually loaded, so teacher-made chapters without a quiz are left alone.
  if (seededAny) {
    const added = await fillMissingQuizzes();
    console.log(`Added a sample quiz to ${added} chapter(s)`);
  }
}

// `npm run seed` (fills empty collections) or `npm run seed -- --reset` (wipes first)
const isMainModule = process.argv[1] && /seed\.(ts|js)$/.test(process.argv[1]);
if (isMainModule) {
  seed({ reset: process.argv.includes("--reset") })
    .then(() => mongoose.disconnect())
    .catch(async (error) => {
      console.error("Seeding failed:", error);
      await mongoose.disconnect();
      process.exit(1);
    });
}
