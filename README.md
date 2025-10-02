# NodeMCU Integration & Attendance System

A complete solution for RFID-based attendance tracking using NodeMCU, with both PHP and Node.js backend options.

---

## 🚀 Features

- **RFID Attendance:** Scan RFID cards to mark attendance.
- **Dual Backend:** Supports both PHP and Node.js servers.
- **CSV Data Storage:** Attendance records saved in CSV files.
- **Dashboard:** View attendance via a web dashboard.
- **Local & Cloud Hosting:** Works locally or with web hosting.

---

## 📦 Project Structure

```
📦NFCA
 ┣ 📂Local
 ┃ ┣ 📜attendance.csv
 ┃ ┣ 📜package-lock.json
 ┃ ┣ 📜package.json
 ┃ ┣ 📜README.md
 ┃ ┣ 📜ReadMe.txt
 ┃ ┣ 📜rfid_data.csv
 ┃ ┗ 📜server.js
 ┣ 📂NodeMCU
 ┃ ┣ 📜NodeMCU.ino
 ┃ ┗ 📜ReadMe.txt
 ┣ 📂php Web
 ┃ ┣ 📂clr
 ┃ ┃ ┗ 📜index.php
 ┃ ┣ 📂rfid
 ┃ ┃ ┣ 📜attendance.csv
 ┃ ┃ ┗ 📜index.php
 ┃ ┣ 📜index.php
 ┃ ┣ 📜ReadMe.txt
 ┃ ┗ 📜script.js
 ┗ 📜README.md
```

---

## 🛠️ Setup Instructions

### 1. NodeMCU Firmware

- Edit `NodeMCU.ino`:
    - Set your WiFi SSID & Password
    - Set your domain name
- Upload using [Arduino IDE](https://www.youtube.com/watch?v=YN522_npNqs)
- **Required Libraries:**
    - MFRC522
    - EasyMFRC
    - AIO Module for ESP8266
    - THINX for ESP8266
    - ESP32 HTTP Update
    - Adafruit MFRC630
    - ABB PowerOne Aurora Inverter

### 2. Backend Options

#### **A. PHP Hosting**

- Upload files to your PHP server.
- Update `yourdomain.com` in `index.php` to your actual domain.
- Attendance is recorded via:  
    ```
    yourdomain.com/rfid?rfidKey=XXXXXXXXXXXX
    ```
- Dashboard:  
    ```
    yourdomain.com
    ```

#### **B. Node.js Local Server**

- Install [Node.js](https://nodejs.org/)
- Run in terminal:
    ```
    node server.js
    ```
- Rename `index.php` to `index.html` for dashboard.
- Use [Cloudflared](https://developers.cloudflare.com/cloudflared/) to expose locally.

---

## ⚡ System Workflow

1. **Scan RFID:** NodeMCU sends request to `/rfid?rfidKey=XXXXXXXXXXXX`
2. **Backend:** Searches for RFID key in CSV
3. **Attendance:** If found, records timestamp for the date (no duplicate entries per day)
4. **Dashboard:** Displays attendance records from CSV

---

## 📝 Reset Attendance

- Visit:  
    ```
    yourdomain.com/clr
    ```
- Replaces attendance CSV with default from `/clr` folder.

---

## ⚠️ Hosting Notes

- **InfinityFree:** Free plan uses JavaScript captcha—NodeMCU/Arduino cannot solve it.  
    Use Hostinger or similar for seamless integration.

---

## 💬 Support

For help, see the [video tutorial](https://www.youtube.com/watch?v=YN522_npNqs) and ensure all required libraries are installed.

---

**Enjoy building your RFID Attendance System!**
