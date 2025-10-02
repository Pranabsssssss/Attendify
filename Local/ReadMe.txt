NodeMCU Integration and Attendance System Documentation
-------------------------------------------------------

1. Local Server
The `server.js` file hosts a local server on your PC. When the NodeMCU device sends a request to your local server, the system records the data in both the `rfid_data` and `attendance.csv` files. This approach is ideal if you do not have a domain or hosting; however, your PC must remain powered on while using NodeMCU for attendance marking. To expose your server to the internet, you can use Cloudflared tunnels. Additionally, rename `index.php` to `index.html` and update the URL according to your domain and attendance.csv File. Ensure Node.js is installed and added to your system PATH.
Run the Sever Using "Node server.js" in Command Prompt in your Folder.
2. System Workflow:
- When a user accesses the URL `yourdomain.com/rfid?rfidKey=xxxxxxxxxxxx`, the Node.js backend searches for the RFID key in a CSV file.
- If a match is found, the system records the current timestamp in the corresponding cell for that date.
- Multiple scans on the same date are not counted as additional attendance entries.
- The attendance dashboard is available at `yourdomain.com`. The `index.php` file in the root directory retrieves and displays attendance data from the CSV file located in the `rfid` folder.
