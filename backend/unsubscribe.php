<?php
session_start();
require 'database.php';

// mime type to application/json
header("Content-Type: application/json");

$json_str = file_get_contents('php://input');

// This will store the data into an associative array
$json_obj = json_decode($json_str, true);

$user_id = $_SESSION['user_id'];
$email = $json_obj['email'];
$token = $json_obj['token'];

if(!hash_equals($_SESSION['token'], $token)){
    echo json_encode(array(
        "message" => "Wrong Token!"
    ));
    exit;
}

// delete event query
$stmt = $mysqli->prepare("DELETE
FROM subs
WHERE subs.subscriber= ?
AND subs.user = ?");

if(!$stmt){
     //from php unit

	$message = `Query Prep Failed: ${error}\n`;
    echo json_encode(array(
		"success" => false,
		"message" => $message
	));
	exit;
}

$stmt->bind_param('si', $email, $user_id);

$stmt->execute();

$stmt->close();

echo json_encode(array(
    "success" => true,
    "message" => "Unsubscribed."
));
exit;


?>