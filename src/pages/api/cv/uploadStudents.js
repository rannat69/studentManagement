import fs from "fs/promises";
import path from "path";
import allowedOrigin from "../allowedOrigin";

const filePath = path.join(process.cwd(), "data", "students.json");

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
    const incomingData = req.body;

    // 1. Validate payload structure
    if (!Array.isArray(incomingData)) {
      return res
        .status(400)
        .json({ message: "Payload must be an array of objects." });
    }

    // 2. Read existing data from JSON file (or create array if file missing)
    let existingData = [];
    try {
      const fileData = await fs.readFile(filePath, "utf8");
      existingData = JSON.parse(fileData);
    } catch (err) {
      // If file doesn't exist, start with an empty array
      if (err.code !== "ENOENT") {
        throw err;
      }
    }

    // 3. Build a Set of existing "name|email" composite keys for O(1) duplicate checks
    const existingKeys = new Set(
      existingData.map(
        (item) => `${item.name.toLowerCase()}|${item.email.toLowerCase()}`,
      ),
    );

    // 4. Filter incoming array to find genuinely new entries
    const newEntries = [];
    for (const item of incomingData) {
      if (!item.name || !item.email) continue; // Skip invalid entries

      const compositeKey = `${item.name.trim().toLowerCase()}|${item.email.trim().toLowerCase()}`;

      if (!existingKeys.has(compositeKey)) {
        existingKeys.add(compositeKey); // Prevent intra-batch duplicates
        newEntries.push({
          name: item.name.trim(),
          email: item.email.trim(),
        });
      }
    }

    // 5. Save updated array to JSON file if new entries were found
    if (newEntries.length > 0) {
      const updatedData = [...existingData, ...newEntries];

      // Ensure target directory exists before writing
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(
        filePath,
        JSON.stringify(updatedData, null, 2),
        "utf8",
      );
    }

    return res.status(200).json({
      message: "Processing complete",
      addedCount: newEntries.length,
      addedItems: newEntries,
    });
  } catch (error) {
    console.error("Error saving data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
