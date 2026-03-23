import express from "express";
import { StreamChat } from "stream-chat";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Stream client
const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("❌ Missing Stream API credentials in .env file");
}

const serverClient = StreamChat.getInstance(apiKey, apiSecret);

router.post("/token", (req, res) => {
  try {
    let { userId } = req.body;

    console.log("Received userId:", userId, "Type:", typeof userId);

    // Check if userId exists
    if (!userId) {
      return res.status(400).json({ 
        error: "UserId is required" 
      });
    }

    // Convert userId to string if it's not already
    userId = String(userId).trim();
    
    // Check if userId is empty after trimming
    if (userId === "") {
      return res.status(400).json({ 
        error: "UserId cannot be empty" 
      });
    }

    console.log("Processed userId:", userId, "Type:", typeof userId);

    // Generate token
    const token = serverClient.createToken(userId);

    // Send response
    res.json({ 
      token, 
      apiKey,
      userId 
    });

  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate token"
    });
  }
});

// Add a test endpoint to verify the route is working
router.get("/test", (req, res) => {
  res.json({ 
    message: "Stream routes are working",
    apiKeyPresent: !!apiKey,
    apiSecretPresent: !!apiSecret
  });
});

export default router;