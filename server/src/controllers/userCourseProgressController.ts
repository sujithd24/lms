import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import UserCourseProgress from "../models/userCourseProgressModel";
import Course from "../models/courseModel";
import { calculateOverallProgress } from "../utils/utils";
import { mergeSections } from "../utils/utils";

export const getUserEnrolledCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const auth = getAuth(req);

  if (!auth || auth.userId !== userId) {
    res.status(403).json({ message: "Access denied" });
    return;
  }

  try {
    const enrolledCourses = await UserCourseProgress.find({ userId });
    const courseIds = enrolledCourses.map((item: any) => item.courseId);
    const courses =
      courseIds.length > 0 ? await Course.find({ courseId: { $in: courseIds } }) : [];
    res.json({
      message: "Enrolled courses retrieved successfully",
      data: courses,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving enrolled courses", error });
  }
};

export const getUserCourseProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId } = req.params;
  const auth = getAuth(req);

  if (!auth || auth.userId !== userId) {
    res.status(403).json({ message: "Access denied" });
    return;
  }

  try {
    const progress = await UserCourseProgress.findOne({ userId, courseId });
    if (!progress) {
      res
        .status(404)
        .json({ message: "Course progress not found for this user" });
      return;
    }
    res.json({
      message: "Course progress retrieved successfully",
      data: progress,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving user course progress", error });
  }
};

export const updateUserCourseProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId } = req.params;
  const progressData = req.body;
  const auth = getAuth(req);

  if (!auth || auth.userId !== userId) {
    res.status(403).json({ message: "Access denied" });
    return;
  }

  try {
    let progress = await UserCourseProgress.findOne({ userId, courseId });

    if (!progress) {
      // If no progress exists, create initial progress
      progress = new UserCourseProgress({
        userId,
        courseId,
        enrollmentDate: new Date().toISOString(),
        overallProgress: 0,
        sections: progressData.sections || [],
        lastAccessedTimestamp: new Date().toISOString(),
      });
    } else {
      // Merge existing progress with new progress data. Work on plain objects:
      // spreading Mongoose sub-documents would copy their internal fields.
      const merged = mergeSections(
        progress.toObject().sections ?? [],
        progressData.sections || []
      );
      progress.set("sections", merged);
      progress.lastAccessedTimestamp = new Date().toISOString();
      progress.overallProgress = calculateOverallProgress(merged);
    }

    await progress.save();

    res.json({
      message: "",
      data: progress,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating user course progress",
      error,
    });
  }
};

export const unenrollFromCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId } = req.params;
  const auth = getAuth(req);

  if (!auth || auth.userId !== userId) {
    res.status(403).json({ message: "Access denied" });
    return;
  }

  try {
    const progress = await UserCourseProgress.findOne({ userId, courseId });
    if (!progress) {
      res.status(404).json({ message: "You are not enrolled in this course" });
      return;
    }

    // Remove the student's progress record
    await UserCourseProgress.deleteOne({ userId, courseId });

    // Remove every enrollment entry for this user (also cleans up old duplicates).
    // Payment records are intentionally kept so billing history stays accurate.
    await Course.updateOne({ courseId }, { $pull: { enrollments: { userId } } });

    res.json({ message: "Unenrolled from course", data: { courseId } });
  } catch (error) {
    res.status(500).json({ message: "Error unenrolling from course", error });
  }
};
