NodeMCU Integration and Attendance System Documentation
-------------------------------------------------------

1. NodeMCU Firmware Setup:
The `NodeMCU.ino` file contains the firmware code for your NodeMCU device. Before uploading, update the following parameters:
- WiFi SSID
- WiFi Password
- Domain name

The device communicates with your server by making requests to `/rfid?rfidKey=XXXXXXXXXXXXX`, which records attendance for the scanned RFID key.

For instructions on programming the NodeMCU using the Arduino IDE, refer to this video: https://www.youtube.com/watch?v=YN522_npNqs

Required Arduino IDE Extensions (install via the Libraries tab):
- MFRC522
- EasyMFRC
- AIO Module for ESP8266
- THINX for ESP8266
- ESP32 HTTP Update
- Adafruit MFRC630
- ABB PowerOne Aurora Inverter

2. System Workflow:
- When a user accesses the URL `yourdomain.com/rfid?rfidKey=xxxxxxxxxxxx`, the PHP backend searches for the RFID key in a CSV file.
- If a match is found, the system records the current timestamp in the corresponding cell for that date.
- Multiple scans on the same date are not counted as additional attendance entries.
- The attendance dashboard is available at `yourdomain.com`. The `index.php` file in the root directory retrieves and displays attendance data from the CSV file located in the `rfid` folder.

For further assistance, consult the provided video tutorial and ensure all required extensions are installed.