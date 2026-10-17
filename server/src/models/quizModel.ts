import { Schema, model } from "mongoose";
import { cleanJSON } from "../db";

/**
 * A chapter's quiz. Stored in MongoDB (not on the server's disk) so quizzes
 * survive restarts and redeploys on hosts with ephemeral storage such as Render.
 */
const questionSchema = new Schema(
  {
    id: { type: Schema.Types.Mixed, required: true }, // number or string
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true }, // index into options
  },
  { _id: false }
);

const quizSchema = new Schema(
  {
    chapterId: { type: String, required: true, unique: true, index: true },
    filename: { type: String },
    questions: { type: [questionSchema], required: true },
  },
  { timestamps: true, toJSON: cleanJSON, toObject: cleanJSON }
);

const Quiz = model("Quiz", quizSchema);
export default Quiz;

/** Returns a list of problems with a quiz file, or [] when it is valid. */
export const validateQuiz = (data: any): string[] => {
  if (!data || typeof data !== "object" || !Array.isArray(data.questions)) {
    return ['The file must be an object with a "questions" array'];
  }
  if (data.questions.length === 0) return ["Add at least one question"];

  const problems: string[] = [];
  data.questions.forEach((q: any, i: number) => {
    const n = `Question ${i + 1}`;
    if (q?.id === undefined || q?.id === null || q?.id === "") problems.push(`${n}: missing "id"`);
    if (typeof q?.question !== "string" || !q.question.trim()) problems.push(`${n}: missing "question" text`);
    if (!Array.isArray(q?.options) || q.options.length < 2) {
      problems.push(`${n}: "options" needs at least 2 answers`);
    } else if (
      !Number.isInteger(q.correctAnswer) ||
      q.correctAnswer < 0 ||
      q.correctAnswer >= q.options.length
    ) {
      problems.push(`${n}: "correctAnswer" must be an option index from 0 to ${q.options.length - 1}`);
    }
  });
  return problems.slice(0, 5);
};
