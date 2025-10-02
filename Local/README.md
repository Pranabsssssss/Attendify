# NFCA

## Overview

NFCA is a project for automated attendance tracking using NFC technology. It leverages NodeMCU (ESP8266/ESP32) and RFID sensors to record attendance efficiently and securely.

## Features

- Contactless attendance marking via RFID/NFC cards
- Real-time data upload to a server or cloud
- User authentication and logging
- Simple web dashboard for attendance management
- Low-cost hardware implementation

## Hardware Requirements

- NodeMCU (ESP8266 or ESP32)
- RFID Sensor (e.g., RC522)
- NFC/RFID cards or tags
- Jumper wires and breadboard

## Software Requirements

- Arduino IDE or PlatformIO
- Required libraries: `MFRC522`, `ESP8266WiFi`/`ESP32WiFi`
- Web server (optional for dashboard)

## Getting Started

1. Clone this repository.
2. Connect the RFID sensor to NodeMCU as per the wiring diagram.
3. Install necessary libraries in Arduino IDE.
4. Upload the firmware to NodeMCU.
5. Configure WiFi credentials and server endpoints in the code.
6. Use NFC/RFID cards to mark attendance.

## Usage

- Power on the device.
- Tap your NFC/RFID card on the sensor.
- Attendance is logged and sent to the server.
- View attendance records on the dashboard.

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements.

## License

This project is licensed under the MIT License.