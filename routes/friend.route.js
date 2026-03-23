import express from "express";
const router = express.Router();

router.get("/list", (req, res) => {
  res.json({ message: "Friends list route working" });
});

router.get("/outgoing-requests", (req, res) => {
  res.json({ message: "Outgoing requests route working" });
});

export default router;