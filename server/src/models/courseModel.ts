import { Schema, model } from "mongoose";
import { cleanJSON } from "../db";

// Sub-documents keep their own string ids (sectionId, chapterId, ...) as before,
// so Mongo's automatic _id is disabled on them.
const commentSchema = new Schema(
  {
    commentId: { type: String, required: true },
    userId: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: String, required: true },
  },
  { _id: false }
);

const chapterSchema = new Schema(
  {
    chapterId: { type: String, required: true },
    type: { type: String, enum: ["Text", "Quiz", "Video"], required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    comments: { type: [commentSchema], default: [] },
    video: { type: String },
    quiz: { type: String },
  },
  { _id: false }
);

const sectionSchema = new Schema(
  {
    sectionId: { type: String, required: true },
    sectionTitle: { type: String, required: true },
    sectionDescription: { type: String },
    chapters: { type: [chapterSchema], default: [] },
  },
  { _id: false }
);

const enrollmentSchema = new Schema(
  { userId: { type: String, required: true } },
  { _id: false }
);

const courseSchema = new Schema(
  {
    courseId: { type: String, required: true, unique: true, index: true },
    teacherId: { type: String, required: true, index: true },
    teacherName: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true, index: true },
    image: { type: String },
    price: { type: Number },
    level: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    status: { type: String, required: true, enum: ["Draft", "Published"] },
    sections: { type: [sectionSchema], default: [] },
    enrollments: { type: [enrollmentSchema], default: [] },
  },
  { timestamps: true, toJSON: cleanJSON, toObject: cleanJSON }
);

const Course = model("Course", courseSchema);
export default Course;
