import fs from "fs/promises";
import path from "path";
import allowedOrigin from "../allowedOrigin";

const filePath = path.join(process.cwd(), "data", "students.json");

export default async function handler(req, res) {
  // Handle CORS / Allowed Origins if needed
  const orig = allowedOrigin(req, res);

  if (!orig) {
    return res.status(403).json({ message: "Access denied" });
  }

  // Return early if preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Allow only GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const fileData = await fs.readFile(filePath, "utf8");
    const students = JSON.parse(fileData);

    return res.status(200).json(students);
  } catch (error) {
    // If the file doesn't exist yet, return an empty array
    if (error.code === "ENOENT") {
      return res.status(200).json([]);
    }

    console.error("Error reading students data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
