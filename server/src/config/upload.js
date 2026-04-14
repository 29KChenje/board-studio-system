import fs from "fs";
import path from "path";
import multer from "multer";
import { env } from "./env.js";

const uploadDir = path.resolve(process.cwd(), env.uploadDir || "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  }
});

export const upload = multer({ storage });
export const uploadDirectory = uploadDir;
