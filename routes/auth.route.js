import express from "express";
const router = express.Router();

router.post("/signup", (req, res) => {
  try {
    const { email, password, name } = req.body;
    res.status(201).json({ 
      message: "User created successfully",
      user: { 
        email, 
        name, 
        id: "123",
        isOnboarded: false  
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;
    res.json({ 
      message: "Login successful",
      user: { 
        email, 
        name: "Test User", 
        id: "123",
        isOnboarded: true  
      },
      token: "jwt-token-here" 
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

router.get("/me", (req, res) => {
  res.json({ user: null });
});
router.post("/onboarding", (req, res) => {
  try {
    const userData = req.body;
    res.json({ 
      message: "Onboarding completed",
      user: { ...userData, isOnboarded: true }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;