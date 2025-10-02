![Banner](./banner.jpg)

# NodeMCU Integration & Attendance System

A modern RFID-based attendance solution powered by NodeMCU, supporting both PHP and Node.js backends.

---

## 🚀 Features

- **RFID Attendance:** Tap RFID cards to log attendance instantly.
- **Dual Backend:** Choose PHP or Node.js for your server.
- **CSV Storage:** Attendance saved securely in CSV files.
- **Interactive Dashboard:** Visualize attendance with a sleek web dashboard.
- **Flexible Hosting:** Deploy locally or on the cloud.

---

## 📦 Project Structure

```plaintext
NFCA/
 ├─ Local/
 │   ├─ attendance.csv
 │   ├─ package-lock.json
 │   ├─ package.json
 │   ├─ README.md
 │   ├─ ReadMe.txt
 │   ├─ rfid_data.csv
 │   └─ server.js
 ├─ NodeMCU/
 │   ├─ NodeMCU.ino
 │   └─ ReadMe.txt
 ├─ php Web/
 │   ├─ clr/
 │   │   └─ index.php
 │   ├─ rfid/
 │   │   ├─ attendance.csv
 │   │   └─ index.php
 │   ├─ index.php
 │   ├─ ReadMe.txt
 │   └─ script.js
 ├─ banner.jpg
 └─ README.md
```

---

## 🛠️ Quick Start

### 1. NodeMCU Setup

- Edit `NodeMCU.ino`:
    - Enter your WiFi SSID & Password
    - Set your domain name
- Upload via [Arduino IDE](https://www.youtube.com/watch?v=YN522_npNqs)
- **Libraries Needed:**
    - MFRC522, EasyMFRC, AIO Module for ESP8266, THINX for ESP8266, ESP32 HTTP Update, Adafruit MFRC630, ABB PowerOne Aurora Inverter

### 2. Backend Setup

#### **A. PHP Hosting**

- Upload files to your PHP server.
- Update `yourdomain.com` in `index.php`.
- Attendance API:  
    ```
    yourdomain.com/rfid?rfidKey=XXXXXXXXXXXX
    ```
- Dashboard:  
    ```
    yourdomain.com
    ```

#### **B. Node.js Local Server**

- Install [Node.js](https://nodejs.org/)
- Start server:
    ```
    node server.js
    ```
- Rename `index.php` to `index.html` for dashboard.
- Use [Cloudflared](https://developers.cloudflare.com/cloudflared/) for secure public access.

---

## ⚡ Workflow Overview

1. **Scan RFID:** NodeMCU sends `/rfid?rfidKey=XXXXXXXXXXXX`
2. **Backend:** Looks up RFID key in CSV
3. **Attendance:** Records timestamp (one entry per day)
4. **Dashboard:** Displays attendance visually

---

## 📝 Reset Attendance

- Visit:  
    ```
    yourdomain.com/clr
    ```
- Resets attendance CSV from `/clr` folder.

---

## ⚠️ Hosting Tips

- **InfinityFree:** Free plan uses JavaScript captcha—NodeMCU/Arduino cannot solve it.  
    Use Hostinger or similar for best results.

---

## 💬 Need Help?

Check the [video tutorial](https://www.youtube.com/watch?v=YN522_npNqs) and confirm all libraries are installed.

---

**Build your RFID Attendance System with style!**
