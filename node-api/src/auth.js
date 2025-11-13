export function requireUser(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing Authorization token" });
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return res.status(401).json({ error: "Invalid token format" });
    }
    const payloadB64 = parts[1];
    const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload = JSON.parse(payloadJson);

    if (!payload.sub) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    req.user = { id: payload.sub };
    next();
  } catch (err) {
    console.error("Failed to decode auth token", err);
    res.status(401).json({ error: "Invalid token" });
  }
}
