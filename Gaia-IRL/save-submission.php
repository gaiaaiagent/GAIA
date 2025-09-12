<?php
// Simple PHP script to save grant submissions
// This should be placed on a server with PHP support

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get the JSON data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

// Generate application ID
$applicationId = uniqid('grant-', true);

// Add metadata
$data['applicationId'] = $applicationId;
$data['submittedAt'] = date('Y-m-d H:i:s');
$data['ipAddress'] = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

// Create submissions directory if it doesn't exist
$submissionsDir = __DIR__ . '/submissions';
if (!is_dir($submissionsDir)) {
    mkdir($submissionsDir, 0755, true);
}

// Save to JSON file
$filename = $submissionsDir . '/' . $applicationId . '.json';
$saved = file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT));

if ($saved === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save submission']);
    exit;
}

// Return success response
echo json_encode([
    'success' => true,
    'applicationId' => $applicationId,
    'message' => 'Application submitted successfully'
]);
?>