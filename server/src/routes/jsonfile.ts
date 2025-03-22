import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { chapterId } = req.params;

    if (!chapterId) {
      return cb(new Error("Chapter ID is required"), "");
    }

    const uploadDir = path.join(__dirname, `../uploads/${chapterId}`);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage });

// Upload JSON file
router.post("/upload/:chapterId", upload.single("jsonFile"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chapterId } = req.params;

    if (!chapterId) {
      res.status(400).json({ message: "Chapter ID is required" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const jsonFile = req.file || {};

    try {
      const jsonData = await fs.promises.readFile(jsonFile.path, "utf8");
      JSON.parse(jsonData); // Validate JSON format

      console.log(`✅ JSON uploaded for chapter ${chapterId}:`, jsonFile.filename);
      
      res.status(200).json({ 
        message: "JSON file uploaded successfully", 
        chapterId,
        filename: jsonFile.filename,
        size: jsonFile.size
      });
    } catch (parseError) {
      console.error("❌ Invalid JSON file:", parseError);
      fs.unlinkSync(jsonFile.path); // Delete invalid JSON file
      res.status(400).json({ message: "Invalid JSON format" });
    }
  } catch (error) {
    console.error("❌ Error processing upload:", error);
    res.status(500).json({ message: "Server error" });
    next(error);
  }
});

// Get JSON file by chapterId
router.get("/json/:chapterId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chapterId } = req.params;
    const uploadDir = path.join(__dirname, `../uploads/${chapterId}`);

    if (!fs.existsSync(uploadDir)) {
      res.status(404).json({ message: "No JSON file found for this chapter" });
      return;
    }

    const files = fs.readdirSync(uploadDir).filter(file => file.endsWith(".json"));

    if (files.length === 0) {
      res.status(404).json({ message: "No JSON file found for this chapter" });
      return;
    }

    const mostRecentFile = files.sort((a, b) => {
      return (
        fs.statSync(path.join(uploadDir, b)).mtime.getTime() -
        fs.statSync(path.join(uploadDir, a)).mtime.getTime()
      );
    })[0];

    const filePath = path.join(uploadDir, mostRecentFile);
    const jsonData = await fs.promises.readFile(filePath, "utf8");
    const parsedData = JSON.parse(jsonData);

    res.status(200).json({ 
      chapterId,
      filename: mostRecentFile,
      data: parsedData
    });

  } catch (error) {
    console.error("❌ Error fetching JSON file:", error);
    res.status(500).json({ message: "Server error" });
    next(error);
  }
});

export default router;
