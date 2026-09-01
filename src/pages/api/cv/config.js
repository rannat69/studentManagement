import fs from "fs/promises";
import path from "path";
import allowedOrigin from "../allowedOrigin";

const filePath = path.join(process.cwd(), "data", "config.json");

export default async function handler(req, res) {
  const orig = allowedOrigin(req, res);
  if (!orig) {
    return res.status(403).json({ message: "Access denied" });
  }

  if (req.method === "GET") {
    try {
      const fileData = await fs.readFile(filePath, "utf-8");
      const config = JSON.parse(fileData);
      return res.status(200).json(config);
    } catch (error) {
      if (error.code === "ENOENT") {
        return res.status(404).json({ error: "Config file not found" });
      }
      return res.status(500).json({ error: "Failed to read config file" });
    }
  }

  if (req.method === "POST") {
    const { prompt } = req.body;

    if (typeof prompt === "undefined") {
      return res
        .status(400)
        .json({ error: "Property 'prompt' is required in request body" });
    }

    try {
      let currentConfig = {};
      try {
        const fileData = await fs.readFile(filePath, "utf-8");
        currentConfig = JSON.parse(fileData);
      } catch (error) {
        // If file doesn't exist yet, we will create it with defaults
        if (error.code !== "ENOENT") throw error;
      }

      const updatedConfig = { ...currentConfig, prompt };

      await fs.writeFile(
        filePath,
        JSON.stringify(updatedConfig, null, 2),
        "utf-8",
      );
      return res.status(200).json({
        message: "Config updated successfully",
        config: updatedConfig,
      });
    } catch (error) {
      console.log("error", error);

      return res.status(500).json({ error: "Failed to update config file" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
