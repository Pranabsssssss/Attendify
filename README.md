# Attendify

Attendify is a school attendance management application built with Next.js, TypeScript, MongoDB, and optional ESP8266/RC522 RFID hardware. It includes role-based dashboards for students, teachers, principals, and IT administrators, plus leave requests, holidays, email OTP password changes, and web push notifications.

This repository is a starting point for your own school deployment. It does not include production credentials, school data, or a preconfigured database.

## Technology

- Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS 4
- MongoDB with Mongoose
- Signed JWT sessions using `jose`, password hashing with `bcryptjs`
- Nodemailer for email and `web-push` for browser notifications
- Optional Arduino firmware for NodeMCU ESP8266 and RC522 RFID readers
- Three.js / React Three Fiber for the attendance machine visual

## Requirements

- Node.js 20.9 or newer and npm
- A MongoDB database (local or hosted)
- A modern browser
- Optional: Arduino IDE, NodeMCU ESP8266, RC522 reader, and the display hardware listed in `rfid/rfid.ino`

## Run locally

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/Pranabsssssss/Attendify.git
   cd Attendify
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the values. `.env.local` is ignored by Git. Generate a session secret with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Generate VAPID keys for push notifications with:

   ```bash
   npx web-push generate-vapid-keys
   ```

   Push notification keys are optional; leave them unset to disable push. SMTP settings are needed for email OTP password changes. Set up the database, session secret, and role registration codes before running the app.

3. Start the development server:

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000).

4. Create your initial IT administrator using the IT Admin registration code configured in `.env.local`. Configure the other role codes and distribute them to the people who should enroll.

## Environment variables

See [`.env.example`](.env.example) for the full list and suggested values.

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection URI for this deployment |
| `ATTENDANCE_SECURE_KEY` | Random secret (at least 32 characters) used to sign sessions and authenticate RFID requests; use the same value in the firmware |
| `LATE_TIME` | Local school arrival cutoff in `HH:MM:SS` format |
| `NEXT_PUBLIC_ACCESS_CODE_*` | Per-role enrollment codes. `NEXT_PUBLIC_` values are included in browser JavaScript, so treat them as enrollment gates, not secrets. Disable public registration or add a trusted invitation/admin workflow before relying on them for production access control. |
| `NEXT_PUBLIC_CLASS_RANGE_START`, `NEXT_PUBLIC_CLASS_RANGE_END` | Allowed class grade range |
| `NEXT_PUBLIC_RESTRICTED_SECTIONS` | Comma-separated section names or class-section values to hide/block, for example `C,6-A` |
| `NEXT_PUBLIC_ATTENDANCE_START_DATE` | First date shown in attendance history (`YYYY-MM-DD`) |
| `NEXT_PUBLIC_LEAVE_CUTOFF_TIME` | Leave request cutoff in `HH:MM` |
| `SMTP_*` | SMTP host, port, login, password, and sender used for OTP email |
| `VAPID_*` | Web push subject and VAPID keys; the public key is exposed to browsers by design |

Use separate, strong values and separate databases for development and production. Never commit `.env.local`, production credentials, or real school/student data.

## Optional RFID hardware

The firmware is in [`rfid/rfid.ino`](rfid/rfid.ino). Install the Arduino libraries used by its includes (ESP8266 core, MFRC522, LiquidCrystal_I2C, and TM1637Display), then set the Wi-Fi SSID/password, server URL, and API key placeholders in the sketch before flashing it. The server URL should use HTTPS in deployments where TLS is available. Keep the API key out of source control and configure it as `ATTENDANCE_SECURE_KEY` on the server. Enroll each card's UID to the corresponding user in the database.

## Production notes

- Deploy to a Node.js-compatible host and configure environment variables in the host's secret manager.
- Use HTTPS, restrict database network access, and back up MongoDB.
- Review registration and account provisioning before opening the app to the public. Browser-exposed role codes are not authentication secrets.
- Set up your own SMTP provider and VAPID keys if you need email or push notifications.
- Attendance logic currently uses India Standard Time (`Asia/Kolkata`) and treats Sundays and second Saturdays as non-working days. Adapt this to your school's calendar and timezone before use.
- Review privacy, retention, and applicable education/data-protection requirements for your deployment.

## Useful commands

```bash
npm run dev    # local development
npm run lint   # lint the project
npm run build  # production build
npm run start  # serve a production build
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
