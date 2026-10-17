import Stripe from "stripe";
import dotenv from "dotenv";
import { Request, Response } from "express";
import Course from "../models/courseModel";
import Transaction from "../models/transactionModel";
import UserCourseProgress from "../models/userCourseProgressModel";

dotenv.config();

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const listTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId  } = req.query;

  try {
    const transactions = userId
      ? await Transaction.find({ userId: String(userId) })
      : await Transaction.find();

    res.json({
      message: "Transactions retrieved successfully",
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving transactions", error });
  }
};

export const listByIdTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId , courseId  } = req.query;

  try {
    const filter: Record<string, string> = {};
    if (userId) filter.userId = String(userId);
    if (courseId) filter.courseId = String(courseId);

    const transactions = await Transaction.find(filter);

    res.json({
      message: "Transactions retrieved successfully",
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving transactions", error });
  }
};

export const createStripePaymentIntent = async (
  req: Request,
  res: Response
): Promise<void> => {
  let { amount } = req.body;

  if (!amount || amount <= 0) {
    amount = 50;
  }

  try {
    if (!stripe) {
      res.status(500).json({ message: "Stripe is not configured" });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    res.json({
      message: "",
      data: {
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating stripe payment intent", error });
  }
};

export const createTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId, transactionId, amount, paymentProvider } = req.body;

  if (!userId || !courseId || !transactionId) {
    res
      .status(400)
      .json({ message: "User ID, course ID and transaction ID are required" });
    return;
  }

  try {
    // 1. get course info
    const course = await Course.findOne({ courseId });

    // 2. create transaction record
    const newTransaction = new Transaction({
      dateTime: new Date().toISOString(),
      userId,
      courseId,
      transactionId,
      amount,
      paymentProvider,
    });
    await newTransaction.save();

    // 3. create initial course progress (keep existing progress if the
    //    user was already enrolled, so a repeat purchase never resets it)
    if (course) {
      const existingProgress = await UserCourseProgress.findOne({ userId, courseId });
      if (!existingProgress) {
        const initialProgress = new UserCourseProgress({
          userId,
          courseId,
          enrollmentDate: new Date().toISOString(),
          overallProgress: 0,
          sections: (course.sections || []).map((section: any) => ({
            sectionId: section.sectionId,
            chapters: (section.chapters || []).map((chapter: any) => ({
              chapterId: chapter.chapterId,
              completed: false,
            })),
          })),
          lastAccessedTimestamp: new Date().toISOString(),
        });
        await initialProgress.save();
      }

      // 4. add enrollment to relevant course (skip if already listed)
      const alreadyListed = (course.enrollments || []).some(
        (e: any) => e.userId === userId
      );
      if (!alreadyListed) {
        // $addToSet never adds the same enrollment twice
        await Course.updateOne(
          { courseId },
          { $addToSet: { enrollments: { userId } } }
        );
      }
    }

    res.json({
      message: "Purchased Course successfully",
      data: {
        transaction: newTransaction
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating transaction and enrollment", error });
  }
};


export const createFreeTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId , userId } = req.body;

  if (!courseId || !userId) {
    res.status(400).json({ message: "Course ID and user ID are required" });
    return;
  }

  try {
    // 1. get course info
    const course = await Course.findOne({ courseId });
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    // 2. already enrolled: return existing progress instead of resetting it
    //    and appending a duplicate enrollment
    const existingProgress = await UserCourseProgress.findOne({ userId, courseId });
    if (existingProgress) {
      res.json({
        message: "You're already enrolled in this course",
        data: { courseProgress: existingProgress },
      });
      return;
    }

    // 3. create initial course progress
    const initialProgress = new UserCourseProgress({
      userId,
      courseId,
      enrollmentDate: new Date().toISOString(),
      overallProgress: 0,
      sections: (course.sections || []).map((section: any) => ({
        sectionId: section.sectionId,
        chapters: (section.chapters || []).map((chapter: any) => ({
          chapterId: chapter.chapterId,
          completed: false,
        })),
      })),
      lastAccessedTimestamp: new Date().toISOString(),
    });
    await initialProgress.save();

    // 4. add enrollment to relevant course (skip if already listed)
    const alreadyListed = (course.enrollments || []).some(
      (e: any) => e.userId === userId
    );
    if (!alreadyListed) {
      // $addToSet never adds the same enrollment twice
        await Course.updateOne(
          { courseId },
          { $addToSet: { enrollments: { userId } } }
        );
    }

    res.json({
      message: "Enrolled successfully",
      data: {
        courseProgress: initialProgress,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating transaction and enrollment", error });
  }
};
