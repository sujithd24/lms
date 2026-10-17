import express, { Request, Response } from "express";
import multer from "multer";
import Quiz, { validateQuiz } from "../models/quizModel";

const router = express.Router();

// Kept in memory and saved to MongoDB: nothing is written to the server's disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 }, // 1 MB is plenty for a quiz
});

// Upload (or replace) a chapter's quiz JSON
router.post(
  "/upload/:chapterId",
  upload.single("jsonFile"),
  async (req: Request, res: Response) => {
    const { chapterId } = req.params;

    if (!chapterId) {
      res.status(400).json({ message: "Chapter ID is required" });
      return;
    }
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    let data: any;
    try {
      data = JSON.parse(req.file.buffer.toString("utf8"));
    } catch {
      res.status(400).json({ message: "Invalid JSON format" });
      return;
    }

    const problems = validateQuiz(data);
    if (problems.length > 0) {
      res.status(400).json({ message: `Invalid quiz: ${problems.join("; ")}`, problems });
      return;
    }

    try {
      await Quiz.findOneAndUpdate(
        { chapterId },
        { chapterId, filename: req.file.originalname, questions: data.questions },
        { upsert: true, new: true, runValidators: true }
      );
      res.status(200).json({
        message: "Quiz uploaded successfully",
        chapterId,
        filename: req.file.originalname,
        questions: data.questions.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Error saving quiz", error });
    }
  }
);

// Get a chapter's quiz
router.get("/json/:chapterId", async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findOne({ chapterId: req.params.chapterId });
    if (!quiz) {
      res.status(404).json({ message: "No quiz found for this chapter" });
      return;
    }
    res.status(200).json({
      chapterId: quiz.chapterId,
      filename: quiz.filename,
      data: { questions: quiz.toJSON().questions },
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving quiz", error });
  }
});

export default router;
