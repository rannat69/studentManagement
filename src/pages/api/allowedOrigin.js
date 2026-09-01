export default function allowedOrigin(req, res) {
  const allowedOriginRoot = process.env.SITE_URL;

  // 1. Get origin or referer header (Origin is safer for POST/CORS requests)
  const incomingOrigin = req.headers.origin || req.headers.referer || "";

  console.log(
    "Origin check - Incoming:",
    incomingOrigin,
    "| Allowed root:",
    allowedOriginRoot,
  );

  // 2. Validate if the request origin starts with your allowed root URL
  const isAllowed = Boolean(
    allowedOriginRoot && incomingOrigin.startsWith(allowedOriginRoot),
  );

  // 3. Set standard CORS header if allowed
  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", incomingOrigin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }

  // 4. Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    if (isAllowed) {
      return res.status(200).end();
    }
    return res.status(403).json({ message: "Access denied" });
  }

  // 5. Block disallowed origins
  if (!isAllowed) {
    res.status(403).json({ message: "Access denied" });
    return false; // Return false so calling functions know validation failed
  }

  return true;
}
