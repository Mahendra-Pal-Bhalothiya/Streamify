import express from "express";
const router = express.Router();

router.get("/token", (req, res) => {
  res.json({
    token: "stream-chat-token-here",
    apiKey: "your-stream-api-key"
  });
});

export default router;