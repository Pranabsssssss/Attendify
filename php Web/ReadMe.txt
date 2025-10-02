This PHP-based Attendance System is designed for seamless integration with NodeMCU and RFID scanners. The files in this directory provide a PHP website solution, ideal for developers who prefer PHP hosting over traditional Node.js backend, frontend, and database setups, which may be more complex or require a dedicated local server.

Configuration Instructions:
To set up the website, update the domain in the index.php file. Locate the placeholder "yourdomain.com" in index.php and replace it with your actual domain name to ensure proper website functionality.

Important Note:
If you are hosting on InfinityFree and using NodeMCU or Arduino, please note that the free plan includes a JavaScript verification check for each user. When NodeMCU or Arduino accesses the website (e.g., yourdomain.com/rfid?rfidKey=XXXXXXXXXXXX), InfinityFree presents a JavaScript captcha that cannot be solved by NodeMCU/Arduino, as these devices do not support JavaScript execution. For seamless integration, consider using a hosting provider such as Hostinger or another service that does not enforce JavaScript verification for every user.

System Workflow:
When a user visits the website using a URL such as yourdomain.com/rfid?rfidKey=xxxxxxxxxxxx, the PHP backend searches for the RFID key in a CSV file. If a match is found for a particular student, the system records the current time in the corresponding cell for that date. Subsequent scans on the same date are not counted as additional attendance entries. When someone visits yourdomain.com (the attendance dashboard), index.php in the root directory retrieves data from the attendance CSV file in the rfid folder and displays the attendance records to the user.

To reset attendance records, visiting yourdomain.com/clr replaces the CSV file in /rfid with the default file stored in /clr. You may store the default file with no attendance in the clr folder, or delete the folder if you do not require this feature.