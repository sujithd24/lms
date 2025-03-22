// controller.ts
import { Request, Response } from "express";
import fs from "fs";
import path from "path";

export const uploadJson = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const jsonFile = req.file;
    const filePath = path.join(__dirname, "../uploads", jsonFile.originalname);

    // Read JSON content
    const jsonData = fs.readFileSync(jsonFile.path, "utf8");
    
    // Parse and log JSON data
    const parsedData = JSON.parse(jsonData);
    console.log("Received JSON:", parsedData);
    
    // Save the file with its original name
    fs.writeFileSync(filePath, jsonData);

    res.status(200).json({ 
      message: "JSON file uploaded successfully",
      filename: jsonFile.originalname,
      size: jsonFile.size
    });
  } catch (error) {
    console.error("Error processing JSON file:", error);
    res.status(500).json({ message: "Server error" });
  }
};