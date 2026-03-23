import express from "express";
const router = express.Router();

/* =========================
   MOCK USERS DATABASE
========================= */

const users = [
  {
    _id: "1",
    fullName: "Rahul Sharma",
    email: "rahul@example.com",
    nativeLanguage: "hindi",
    learningLanguage: "english",
    profilePic: "/default-avatar.png",
    location: "India",
    bio: "Excited to improve my English!",
  },
  {
    _id: "2",
    fullName: "Ananya Singh",
    email: "ananya@example.com",
    nativeLanguage: "english",
    learningLanguage: "spanish",
    profilePic: "/default-avatar.png",
    location: "Delhi",
    bio: "Love meeting new learners!",
  },
  {
    _id: "3",
    fullName: "Carlos Lopez",
    email: "carlos@example.com",
    nativeLanguage: "spanish",
    learningLanguage: "english",
    profilePic: "/default-avatar.png",
    location: "Mexico",
    bio: "Happy to help with Spanish!",
  },
];

/* =========================
   FRIENDS
========================= */

router.get("/friends", (req, res) => {
  res.json({
    friends: [users[1]], // returning one friend
  });
});

/* =========================
   RECOMMENDED USERS
========================= */

router.get("/recommended", (req, res) => {
  res.json({
    users: [users[2]], // recommend Carlos
  });
});

/* =========================
   OUTGOING FRIEND REQUESTS
========================= */

router.get("/outgoing-friend-requests", (req, res) => {
  res.json({
    requests: [
      {
        _id: "101",
        recipient: users[2],
        status: "pending",
      },
    ],
  });
});

/* =========================
   INCOMING FRIEND REQUESTS
========================= */

router.get("/friend-requests", (req, res) => {
  res.json({
    requests: [
      {
        _id: "201",
        sender: users[2],
        status: "pending",
      },
    ],
  });
});

/* =========================
   SEND FRIEND REQUEST
========================= */

router.post("/friend-request/:userId", (req, res) => {
  const { userId } = req.params;

  const recipient = users.find((u) => u._id === userId);

  if (!recipient) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    message: "Friend request sent",
    request: {
      _id: Date.now().toString(),
      recipient,
      status: "pending",
    },
  });
});

/* =========================
   ACCEPT FRIEND REQUEST
========================= */

router.put("/friend-request/:requestId/accept", (req, res) => {
  const { requestId } = req.params;

  res.json({
    message: "Friend request accepted",
    requestId,
    status: "accepted",
  });
});

export default router;