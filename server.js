require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const fs = require("fs").promises;
const fsSync = require("fs");
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
const attendancePath = process.env.ATTENDANCE_PATH || path.join(__dirname, "attendance.csv");
const csvFilePath = process.env.CSV_PATH || path.join(__dirname, "rfid_data.csv");

// Get current IST timestamp - CORRECTED VERSION
function getISTTimestamp() {
    const now = new Date();
    const istTime = now.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    // Convert from "28/09/2025, 16:02" to "28-09-2025 16:02"
    return istTime.replace(/\//g, '-').replace(',', '');
}

// Get current IST date
function getISTDate() {
    const now = new Date();
    const istDate = now.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric'
    });
    return parseInt(istDate);
}

// Ensure RFID data CSV exists
async function ensureCSV() {
    try {
        await fs.access(csvFilePath);
    } catch {
        await fs.writeFile(csvFilePath, "rfidKey,timestamp\n", "utf8");
    }
}
ensureCSV();

// Ensure attendance CSV exists with proper headers
async function ensureAttendanceCSV() {
    try {
        await fs.access(attendancePath);
    } catch {
        const headers = "Serial No.,Student Name,Student ID,RFID UID,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30\n";
        await fs.writeFile(attendancePath, headers, "utf8");
        console.log("Created attendance.csv with default headers");
    }
}
ensureAttendanceCSV();

// Log all known RFID UIDs from attendance CSV on startup
async function logRFIDKeys() {
    try {
        if (!fsSync.existsSync(attendancePath)) {
            console.log("Attendance CSV not found for RFID logging.");
            return;
        }
        const csvText = await fs.readFile(attendancePath, "utf8");
        const lines = csvText.split("\n").filter(Boolean);
        if (lines.length < 2) {
            console.log("Attendance CSV has no student data.");
            return;
        }
        const header = lines[0].split(",");
        const rfidColIdx = header.indexOf("RFID UID");
        if (rfidColIdx === -1) {
            console.log("RFID UID column missing in attendance CSV.");
            return;
        }
        let rfids = [];
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(",");
            if (row[rfidColIdx]) rfids.push(row[rfidColIdx].trim());
        }
        console.log("Known RFID UIDs in attendance CSV:", rfids);
    } catch (error) {
        console.error("Error reading RFID UIDs:", error);
    }
}
logRFIDKeys();

// Append RFID entry to log CSV
async function saveToCSV(rfidKey, timestamp) {
    const row = `${rfidKey},${timestamp}\n`;
    await fs.appendFile(csvFilePath, row, "utf8");
}

// Main RFID attendance endpoint
app.post("/rfid", async(req, res, next) => {
    try {
        const rfidKey = req.query.rfidKey;
        console.log(`📡 Received RFID request: ${rfidKey}`);

        if (!rfidKey || typeof rfidKey !== "string" || rfidKey.trim() === "") {
            console.log("❌ Invalid or missing rfidKey parameter");
            return res.status(400).json({ error: "rfidKey query parameter is required" });
        }

        if (!fsSync.existsSync(attendancePath)) {
            console.log("❌ Attendance file not found");
            return res.status(500).json({ error: "Attendance file not found." });
        }

        // Read the entire CSV and split into lines
        const csvText = await fs.readFile(attendancePath, "utf8");
        const lines = csvText.split("\n").filter(Boolean);
        if (lines.length === 0) {
            console.log("❌ Attendance CSV is empty");
            return res.status(500).json({ error: "Attendance CSV is empty." });
        }

        // Parse header and find columns
        const header = lines[0].split(",").map(col => col.trim());
        const rfidColIdx = header.indexOf("RFID UID");
        const currentDay = getISTDate();

        // Find the column for today's date
        let dayColIdx = -1;
        for (let i = 0; i < header.length; i++) {
            if (header[i] === currentDay.toString()) {
                dayColIdx = i;
                break;
            }
        }

        console.log(`📅 Current IST date: ${currentDay}`);
        console.log(`🔍 Looking for day column: ${currentDay}, found at index: ${dayColIdx}`);
        console.log(`🆔 RFID column at index: ${rfidColIdx}`);

        if (rfidColIdx === -1) {
            console.log("❌ RFID UID column not found in headers");
            return res.status(500).json({ error: "RFID UID column not found in CSV headers." });
        }

        if (dayColIdx === -1) {
            console.log(`❌ Day column '${currentDay}' not found in headers`);
            return res.status(500).json({ error: `Day column '${currentDay}' not found in CSV headers.` });
        }

        // Find student by RFID
        let found = false;

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(",").map(col => col.trim());
            if (row[rfidColIdx] && row[rfidColIdx] === rfidKey.trim()) {
                found = true;

                // Check if attendance already marked for today
                if (row[dayColIdx] && row[dayColIdx] !== "") {
                    console.log(`⚠️ Attendance already marked for RFID ${rfidKey} on day ${currentDay}: ${row[dayColIdx]}`);
                    return res.status(409).json({
                        error: "Attendance already marked for today",
                        message: `Already marked at ${row[dayColIdx]}`,
                        previousTimestamp: row[dayColIdx],
                        day: currentDay
                    });
                }

                // Mark attendance
                const timestamp = getISTTimestamp();
                row[dayColIdx] = timestamp;
                lines[i] = row.join(",");

                // Save updated CSV
                await fs.writeFile(attendancePath, lines.join("\n") + "\n", "utf8");

                // Log to RFID data CSV
                await saveToCSV(rfidKey.trim(), timestamp);

                console.log(`✅ Attendance marked for RFID: ${rfidKey.trim()} at ${timestamp} (IST) on day ${currentDay}`);

                return res.status(201).json({
                    success: true,
                    message: "Attendance marked successfully",
                    rfidKey: rfidKey.trim(),
                    timestamp: timestamp,
                    day: currentDay
                });
            }
        }

        if (!found) {
            console.log(`❌ RFID UID '${rfidKey.trim()}' not found in attendance list`);
            return res.status(404).json({ error: "RFID UID not found in attendance list." });
        }

    } catch (error) {
        console.error("💥 Error in /rfid handler:", error);
        next(error);
    }
});

app.get("/", (req, res) => {
    res.json({
        status: "🚀 RFID Attendance Server is running",
        currentTime: getISTTimestamp(),
        currentDay: getISTDate(),
        timezone: "Asia/Kolkata (IST)"
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("💥 Unhandled error:", err);
    res.status(500).json({ error: "Something went wrong, please try again later" });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📅 Current IST time: ${getISTTimestamp()}`);
    console.log(`📅 Current IST date: ${getISTDate()}`);
    console.log(`🌏 Timezone: Asia/Kolkata (IST)`);
});