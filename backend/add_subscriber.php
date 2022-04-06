<?php
require 'database.php';
session_start();
//mime type to application/json
header("Content-Type: application/json");

$json_str = file_get_contents('php://input');
//This will store the data into an associative array
$json_obj = json_decode($json_str, true);

$user_id = $_SESSION['user_id'];
$subscriber = htmlspecialchars($json_obj['subscriber']);
$subscriber_id = $json_obj['subscriber_id'];
$token = $json_obj['token'];

if(!hash_equals($_SESSION['token'], $token)){
    echo json_encode(array(
        "message" => "Wrong Token!"
    ));
    exit;
}

if (empty($subscriber)){
    echo json_encode(array(
        "message" => "Please enter an email!"
    ));
    exit;
}

// add subscriber flow: add to db
        
//insert all relevant things into the db
//content is default null since it's optional
$stmt = $mysqli->prepare("INSERT INTO subs (user, subscriber_id, subscriber) values (?, ?, ?)");

if(!$stmt){
    //adapted for passing info into json format

   $message = `Query Prep Failed: ${error}\n`;
   echo json_encode(array(
       "success" => false,
       "message" => $message
   ));
   exit;
}
     
$stmt->bind_param('iis', $user_id, $subscriber_id, $subscriber);

$stmt->execute();
        
$stmt->close();

echo json_encode(array(
    "success" => true,
    "message" => "Calendar shared."
));
exit;

?>