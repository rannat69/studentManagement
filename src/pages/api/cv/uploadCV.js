import fs from "fs/promises";
import path from "path";
import allowedOrigin from "../allowedOrigin";

const studentsFilePath = path.join(process.cwd(), "data", "students.json");

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb", // Set this to a higher limit like 10mb or 20mb
    },
  },
};

export default async function handler(req, res) {
  // Handle CORS / Allowed Origins
  const orig = allowedOrigin(req, res);

  if (!orig) {
    return res.status(403).json({ message: "Access denied" });
  }

  // Return early if preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Reject non-POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, fileName, fileBase64, areas } = req.body;

    // 1. Validate required fields
    if (!email || !fileName || !fileBase64 || !areas) {
      return res.status(400).json({
        message:
          "Missing required fields: email, fileName, fileBase64, areas are all required.",
      });
    }

    console.log("email", email);
    console.log("filename", fileName);
    console.log("areas", areas);
    // 2. Create directory: data/{user}/yyyymmdd/
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const userDir = path.join(process.cwd(), "data", email, dateStr);
    await fs.mkdir(userDir, { recursive: true });

    // 3. Save the file
    const filePath = path.join(userDir, fileName);
    const buffer = Buffer.from(fileBase64, "base64");
    await fs.writeFile(filePath, buffer);

    // 4. Update students.json: set uploaded: true for the matching email
    let students = [];
    try {
      const fileData = await fs.readFile(studentsFilePath, "utf8");
      students = JSON.parse(fileData);
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }

    const updatedStudents = students.map((student) =>
      student.email === email
        ? { ...student, uploaded: true, areas: areas }
        : student,
    );

    await fs.writeFile(
      studentsFilePath,
      JSON.stringify(updatedStudents, null, 2),
      "utf8",
    );

    return res.status(200).json({
      message: "CV uploaded successfully",
      filePath: `data/${email}/${dateStr}/${fileName}`,
    });
  } catch (error) {
    console.error("Error uploading CV:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
