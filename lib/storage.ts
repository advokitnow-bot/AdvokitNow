import fs from "fs";
import path from "path";

// Function to save uploaded files locally
export async function uploadToLocal(file: File, folder: string) {
  // Convert file to buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Define upload directory path
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

  // Ensure the directory exists
  fs.mkdirSync(uploadDir, { recursive: true });

  // Create a unique filename (timestamp + original name)
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);

  // Write file to disk
  fs.writeFileSync(filePath, buffer);

  // Return public-accessible file URL
  return fileName;
}