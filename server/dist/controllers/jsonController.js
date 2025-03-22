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
exports.uploadJson = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uploadJson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const jsonFile = req.file;
        const filePath = path_1.default.join(__dirname, "../uploads", jsonFile.originalname);
        // Read JSON content
        const jsonData = fs_1.default.readFileSync(jsonFile.path, "utf8");
        // Parse and log JSON data
        const parsedData = JSON.parse(jsonData);
        console.log("Received JSON:", parsedData);
        // Save the file with its original name
        fs_1.default.writeFileSync(filePath, jsonData);
        res.status(200).json({
            message: "JSON file uploaded successfully",
            filename: jsonFile.originalname,
            size: jsonFile.size
        });
    }
    catch (error) {
        console.error("Error processing JSON file:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.uploadJson = uploadJson;
