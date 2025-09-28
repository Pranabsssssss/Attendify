require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const fs = require("fs").promises;
const path = require("path");

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
const csvFilePath = process.env.CSV_PATH || path.join(__dirname, "rfid_data.csv");

async function ensureCSV() {
  try {
    await fs.access(csvFilePath);
  } catch {
    await fs.writeFile(csvFilePath, "rfidKey,timestamp\n", "utf8");
  }
}
ensureCSV();

async function saveToCSV(rfidKey, timestamp) {
  const row = `${rfidKey},${timestamp}\n`;
  await fs.appendFile(csvFilePath, row, "utf8");
}

app.post("/rfid", async (req, res, next) => {
  try {
    const { rfidKey } = req.query;

    if (!rfidKey || typeof rfidKey !== "string" || rfidKey.trim() === "") {
      return res.status(400).json({ error: "rfidKey query parameter is required" });
    }

    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    await saveToCSV(rfidKey.trim(), timestamp);

    res.status(201).json({
      message: "RFID data saved successfully",
      data: { rfidKey: rfidKey.trim(), timestamp },
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

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
