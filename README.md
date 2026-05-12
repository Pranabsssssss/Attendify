# Attendify

**Attendify** is a production-ready, full-stack, hardware-integrated attendance tracking system. It bridges the gap between physical IoT hardware and modern web technologies to deliver an instantaneous, real-time smart attendance experience. 

> **Live Implementation**: Attendify is actively deployed and running in a real-world educational institution, handling daily influxes of student attendances seamlessly, ensuring reliability, security, and performance at scale.

## 🚀 Features & Architecture

### High-Performance Web Platform
- **Modern Stack:** Built on **Next.js 16** (App Router) with **TypeScript**, powered by **Turbopack** for blazing fast compilation.
- **Interactive UI/UX:** Stunning user interfaces crafted with **Tailwind CSS**, **Framer Motion** for micro-animations, and **Radix UI** primitives for accessibility.
- **3D Experiences:** Integrates **Three.js** via React Three Fiber (`@react-three/fiber`, `@react-three/drei`) for engaging, dynamic 3D elements in the frontend.
- **Database Architecture:** Robust data modeling with **Mongoose (MongoDB)** handling thousands of attendance logs, securely mapping students, RFID tags, and holiday schedules.

### Advanced IoT Integration
- **Custom Hardware Firmware:** Written in **C++** for NodeMCU ESP8266 (`rfid/rfid.ino`).
- **Real-Time Processing:** Incorporates RC522 RFID Scanners, TM1637 Displays, and I2C LCDs to give immediate tactile and visual feedback on the device.
- **Smart Debouncing & Offline Resilience:** Edge-level handling of duplicate card taps and Wi-Fi disconnect fallbacks, preventing server flooding.

### Enterprise-Grade Backend Logic
- **Timezone-Aware Computations:** Built-in logic for IST calculations to detect late arrivals, second Saturdays, Sundays, and dynamic holidays without heavy server load.
- **Security & Cryptography:** Custom `x-api-key` validation for hardware endpoints, paired with **bcryptjs** and **jose** (JWTs) for secure user sessions.
- **Push Notifications:** Automated Web Push Notifications (`web-push`) and Email alerts (`nodemailer`) dispatched immediately upon attendance marking.

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB instance (Local or Atlas)
- NodeMCU ESP8266 + RC522 Module (for hardware setup)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Pranabsssssss/Attendify.git
   cd Attendify
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add the required variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ATTENDANCE_SECURE_KEY=your_hardware_api_secret
   LATE_TIME=08:00:00
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

### Hardware Setup
Flash the firmware located in `rfid/rfid.ino` to your NodeMCU using the Arduino IDE. Ensure you update the Wi-Fi credentials and `apiUrl` to point to your live or local server.

## 📈 Scalability & Impact
Attendify was built with scalability in mind. Its decoupled architecture ensures that the lightweight Next.js backend can process high-frequency concurrent requests from multiple RFID nodes effortlessly. It represents a complete end-to-end engineering solution—from soldering hardware and writing C++ firmware to deploying an optimized serverless web application.

---
*Developed by Pranab Saini*
