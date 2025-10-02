<?php
// Force immediate output and bypass any hosting middleware
if (ob_get_level()) {
    ob_end_clean();
}

// Set headers to prevent caching and indicate API response
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('X-Robots-Tag: noindex, nofollow');

// Output buffer to ensure immediate response
ob_start();

// Get rfidKey from any source (GET/POST)
$rfidKey = '';
$contentType = $_SERVER["CONTENT_TYPE"] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (strpos($contentType, 'application/json') !== false) {
        $input = json_decode(file_get_contents('php://input'), true);
        $rfidKey = isset($input['rfidKey']) ? trim($input['rfidKey']) : '';
    } else {
        $rfidKey = isset($_POST['rfidKey']) ? trim($_POST['rfidKey']) : '';
    }
} else {
    $rfidKey = isset($_GET['rfidKey']) ? trim($_GET['rfidKey']) : '';
}

// Exit immediately if no rfidKey
if (empty($rfidKey)) {
    echo json_encode(['error' => 'rfidKey required']);
    ob_end_flush();
    exit;
}

$csvFile = __DIR__ . '/attendance.csv';

if (!file_exists($csvFile)) {
    echo json_encode(['error' => 'CSV not found']);
    ob_end_flush();
    exit;
}

// Quick CSV processing
$rows = array_map('str_getcsv', file($csvFile));
if (!$rows) {
    echo json_encode(['error' => 'CSV read error']);
    ob_end_flush();
    exit;
}

$headers = array_map('trim', $rows[0]);
$rfidColIndex = array_search('RFID UID', $headers);

if ($rfidColIndex === false) {
    echo json_encode(['error' => 'RFID column missing']);
    ob_end_flush();
    exit;
}

date_default_timezone_set('Asia/Kolkata');
$day = intval(date('j'));
$month = intval(date('n'));
$year = intval(date('Y'));

$monthDays = [31,28,31,30,31,30,31,31,30,31,30,31];
if (($year % 4 == 0 && $year % 100 != 0) || ($year % 400 == 0)) {
    $monthDays[1] = 29;
}

$offset = 4;
for ($m = 1; $m < $month; $m++) {
    $offset += $monthDays[$m - 1];
}
$attendanceColIndex = $offset + ($day - 1);

if ($attendanceColIndex >= count($headers)) {
    echo json_encode(['error' => 'Column index out of bounds']);
    ob_end_flush();
    exit;
}

$found = false;
for ($i = 1; $i < count($rows); $i++) {
    $row = $rows[$i];
    if (isset($row[$rfidColIndex]) && trim($row[$rfidColIndex]) === $rfidKey) {
        $found = true;
        if (!empty(trim($row[$attendanceColIndex]))) {
            echo json_encode(['error' => 'Already marked today']);
            ob_end_flush();
            exit;
        }
        $rows[$i][$attendanceColIndex] = date('d-m-Y H:i:s');
        break;
    }
}

if (!$found) {
    echo json_encode(['error' => 'RFID not found']);
    ob_end_flush();
    exit;
}

$fp = fopen($csvFile, 'w');
foreach ($rows as $fields) {
    fputcsv($fp, $fields);
}
fclose($fp);

echo json_encode([
    'success' => true,
    'rfidKey' => $rfidKey,
    'markedAt' => date('d-m-Y H:i:s'),
    'day' => $day,
    'month' => $month
]);

ob_end_flush();
exit;
?>
