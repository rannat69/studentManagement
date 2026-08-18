import fs from "fs/promises";
import path from "path";
import allowedOrigin from "../allowedOrigin";

const filePath = path.join(process.cwd(), "data", "config.json");

export default async function handler(req, res) {
  const orig = allowedOrigin(req, res);
  if (!orig) {
    return res.status(403).json({ message: "Access denied" });
  }

  if (req.method === "POST") {
    const { prompt } = req.body;

    console.log("sendToAI prompt", prompt);

    try {
      const sendToAI = {
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: "Test" },
          { role: "user", content: prompt },
        ],
      };

      const aiResponse2 = await fetch(
        "https://hkust.azure-api.net/hkust-genai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": "cf0a8bf76cb449fda7c7100f06aed879",
          },
          body: JSON.stringify(sendToAI), // Adjust payload structure if Azure expects { model, messages }
        },
      );

      const data2 = await aiResponse2.json();

      console.log("data AI@", data2);

      if (!aiResponse2.ok) {
        return res.status(aiResponse2.status).json(data2);
      }

      return res.status(200).json(data2);
    } catch (error) {
      console.error("Error calling Azure AI API:", error);
      return res.status(500).json({ error: "Failed to connect to AI API" });
    }
  }

  res.setHeader("Allow", ["POST"]);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
