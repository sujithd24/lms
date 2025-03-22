"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const { chapterId } = req.params;
        if (!chapterId) {
            return cb(new Error("Chapter ID is required"), "");
        }
        const uploadDir = path_1.default.join(__dirname, `../uploads/${chapterId}`);
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});
const upload = (0, multer_1.default)({ storage });
// Upload JSON file
router.post("/upload/:chapterId", upload.single("jsonFile"), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            const jsonData = yield fs_1.default.promises.readFile(jsonFile.path, "utf8");
            JSON.parse(jsonData); // Validate JSON format
            console.log(`✅ JSON uploaded for chapter ${chapterId}:`, jsonFile.filename);
            res.status(200).json({
                message: "JSON file uploaded successfully",
                chapterId,
                filename: jsonFile.filename,
                size: jsonFile.size
            });
        }
        catch (parseError) {
            console.error("❌ Invalid JSON file:", parseError);
            fs_1.default.unlinkSync(jsonFile.path); // Delete invalid JSON file
            res.status(400).json({ message: "Invalid JSON format" });
        }
    }
    catch (error) {
        console.error("❌ Error processing upload:", error);
        res.status(500).json({ message: "Server error" });
        next(error);
    }
}));
// Get JSON file by chapterId
router.get("/json/:chapterId", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chapterId } = req.params;
        const uploadDir = path_1.default.join(__dirname, `../uploads/${chapterId}`);
        if (!fs_1.default.existsSync(uploadDir)) {
            res.status(404).json({ message: "No JSON file found for this chapter" });
            return;
        }
        const files = fs_1.default.readdirSync(uploadDir).filter(file => file.endsWith(".json"));
        if (files.length === 0) {
            res.status(404).json({ message: "No JSON file found for this chapter" });
            return;
        }
        const mostRecentFile = files.sort((a, b) => {
            return (fs_1.default.statSync(path_1.default.join(uploadDir, b)).mtime.getTime() -
                fs_1.default.statSync(path_1.default.join(uploadDir, a)).mtime.getTime());
        })[0];
        const filePath = path_1.default.join(uploadDir, mostRecentFile);
        const jsonData = yield fs_1.default.promises.readFile(filePath, "utf8");
        const parsedData = JSON.parse(jsonData);
        res.status(200).json({
            chapterId,
            filename: mostRecentFile,
            data: parsedData
        });
    }
    catch (error) {
        console.error("❌ Error fetching JSON file:", error);
        res.status(500).json({ message: "Server error" });
        next(error);
    }
}));
exports.default = router;
