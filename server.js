require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");

const app = express();
app.use(express.json());
app.use(morgan("dev"));

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("❌ MONGO_URI is not set in .env file");
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
  
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String },
  status: { type: String, enum: ["ENTER", "EXIT"], default: "ENTER" },
});
const User = mongoose.model("User", userSchema);

// RFID API
app.post("/rfid", async (req, res) => {
  try {
    const { uid, name } = req.body;
    if (!uid) return res.status(400).json({ error: "UID is required" });

    let user = await User.findOne({ uid });

    if (user) {
      // Toggle status
      user.status = user.status === "ENTER" ? "EXIT" : "ENTER";
      await user.save();
      return res.json({
        message: `Status toggled to ${user.status}`,
        user,
      });
    } else {
      if (!name) {
        return res.status(400).json({
          error: "New user detected. Provide 'name' in request body.",
        });
      }
      const newUser = new User({ uid, name, status: "ENTER" });
      await newUser.save();
      return res.json({
        message: `New user ${name} registered with UID ${uid}`,
        user: newUser,
      });
    }
  } catch (err) {
    console.error("❌ Error in /rfid route:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Health Check
app.get("/", (req, res) => {
  res.json({ status: "Server is running" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
