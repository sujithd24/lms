/**
 * One-off: move quiz files saved on disk by the old upload route
 * (src/uploads/<chapterId>/*.json) into MongoDB.
 *
 *   npm run migrate:quizzes
 *
 * For each chapter the newest file wins (the same file the old route served).
 * Safe to re-run: quizzes are upserted by chapterId.
 */
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../db";
import Quiz, { validateQuiz } from "../models/quizModel";

dotenv.config();

const candidates = [
  path.join(__dirname, "../uploads"), // dist/uploads or src/uploads, relative to this file
  path.join(process.cwd(), "src/uploads"),
];

async function importQuizzes() {
  const dir = candidates.find((d) => fs.existsSync(d));
  if (!dir) {
    console.log("No uploads folder found - nothing to import");
    return;
  }
  await connectDB();

  let imported = 0;
  for (const chapterId of fs.readdirSync(dir)) {
    const chapterDir = path.join(dir, chapterId);
    if (!fs.statSync(chapterDir).isDirectory()) continue;

    const newest = fs
      .readdirSync(chapterDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => ({ f, t: fs.statSync(path.join(chapterDir, f)).mtimeMs }))
      .sort((a, b) => b.t - a.t)[0];
    if (!newest) continue;

    try {
      const data = JSON.parse(fs.readFileSync(path.join(chapterDir, newest.f), "utf8"));
      const problems = validateQuiz(data);
      if (problems.length > 0) {
        console.warn(`  ${chapterId}: skipped (${problems[0]})`);
        continue;
      }
      await Quiz.findOneAndUpdate(
        { chapterId },
        { chapterId, filename: newest.f, questions: data.questions },
        { upsert: true }
      );
      imported++;
      console.log(`  ${chapterId}: ${data.questions.length} questions`);
    } catch (error: any) {
      console.warn(`  ${chapterId}: skipped (${error.message})`);
    }
  }
  console.log(`Imported ${imported} quiz(zes) into MongoDB`);
}

importQuizzes()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error("Quiz import failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  });
