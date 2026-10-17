import { Schema, model } from "mongoose";
import { cleanJSON } from "../db";

const chapterProgressSchema = new Schema(
  {
    chapterId: { type: String, required: true },
    completed: { type: Boolean, required: true },
  },
  { _id: false }
);

const sectionProgressSchema = new Schema(
  {
    sectionId: { type: String, required: true },
    chapters: { type: [chapterProgressSchema], default: [] },
  },
  { _id: false }
);

const userCourseProgressSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    courseId: { type: String, required: true },
    enrollmentDate: { type: String, required: true },
    overallProgress: { type: Number, required: true },
    sections: { type: [sectionProgressSchema], default: [] },
    lastAccessedTimestamp: { type: String, required: true },
  },
  { timestamps: true, toJSON: cleanJSON, toObject: cleanJSON }
);

// One progress record per student per course (was the DynamoDB hash + range key)
userCourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const UserCourseProgress = model("UserCourseProgress", userCourseProgressSchema);
export default UserCourseProgress;
