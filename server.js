require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const app = express();

app.use(morgan("combined"));
app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const PORT = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("MONGO_URI is not set in .env");
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

const rfidSchema = new mongoose.Schema({
  rfidKey: { type: String, required: true },
  date: { type: String, required: true },
  timestamp: { type: String, required: true }
});

const RFID = mongoose.model("RFID", rfidSchema);

function getTodayDate() {
  return new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
}

app.post("/rfid", async (req, res, next) => {
  try {
    const { rfidKey } = req.query;
    if (!rfidKey || typeof rfidKey !== "string" || rfidKey.trim() === "") {
      return res.status(400).json({ error: "rfidKey query parameter is required" });
    }

    const key = rfidKey.trim();
    const today = getTodayDate();
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const existingToday = await RFID.findOne({ rfidKey: key, date: today });
    if (existingToday) {
      return res.status(409).json({ message: "Already recorded today", rfidKey: key });
    }

    const newRFID = new RFID({ rfidKey: key, date: today, timestamp });
    await newRFID.save();

    res.status(201).json({
      message: "RFID saved for today",
      data: { rfidKey: key, timestamp }
    });
  } catch (err) {
    next(err);
  }
});

app.get("/", (req, res) => {
  res.json({ status: "Server is running" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong, please try again later" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
