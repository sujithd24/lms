/**
 * Gives every chapter that has no quiz a sample quiz from data/quizBank.json,
 * picked by the course's category (falling back to a general quiz).
 * Never touches a quiz that already exists, so teacher uploads are kept.
 *
 *   npm run quizzes:fill
 */
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../db";
import Course from "../models/courseModel";
import Quiz from "../models/quizModel";

dotenv.config();

type Question = { id: number; question: string; options: string[]; correctAnswer: number };

const loadBank = (): Record<string, Question[]> =>
  JSON.parse(fs.readFileSync(path.join(__dirname, "data", "quizBank.json"), "utf8"));

export async function fillMissingQuizzes(): Promise<number> {
  await connectDB();
  const bank = loadBank();

  const existing = new Set(
    (await Quiz.find({}, { chapterId: 1 }).lean()).map((q) => q.chapterId)
  );

  const ops: any[] = [];
  for (const course of await Course.find().lean()) {
    const questions = bank[course.category] ?? bank.default;
    for (const section of course.sections ?? []) {
      for (const chapter of section.chapters ?? []) {
        if (existing.has(chapter.chapterId)) continue;
        ops.push({
          updateOne: {
            filter: { chapterId: chapter.chapterId },
            // $setOnInsert: only creates; an existing quiz is never overwritten
            update: {
              $setOnInsert: {
                chapterId: chapter.chapterId,
                filename: "sample-quiz.json",
                questions,
              },
            },
            upsert: true,
          },
        });
      }
    }
  }

  if (ops.length > 0) await Quiz.bulkWrite(ops);
  return ops.length;
}

const isMainModule = process.argv[1] && /fillQuizzes\.(ts|js)$/.test(process.argv[1]);
if (isMainModule) {
  fillMissingQuizzes()
    .then(async (added) => {
      console.log(`Added a sample quiz to ${added} chapter(s)`);
      await mongoose.disconnect();
    })
    .catch(async (error) => {
      console.error("Filling quizzes failed:", error);
      await mongoose.disconnect();
      process.exit(1);
    });
}
