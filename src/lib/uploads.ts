import fs from "node:fs";
import path from "node:path";

export const uploadDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });
