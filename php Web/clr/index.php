<?php
// Paths relative to this clr/index.php file
$rfidFile = __DIR__ . '/../rfid/attendance.csv';
$clrFile = __DIR__ . '/attendance.csv';

// Delete attendance.csv in rfid folder if it exists
if (file_exists($rfidFile)) {
    unlink($rfidFile);
}

// Copy attendance.csv from clr folder to rfid folder
if (file_exists($clrFile)) {
    if (copy($clrFile, $rfidFile)) {
        echo "Attendance file successfully updated.";
    } else {
        echo "Failed to copy attendance file.";
    }
} else {
    echo "Attendance file not found in clr folder.";
}
?>
