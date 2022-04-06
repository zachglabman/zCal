<?php
require 'database.php';
session_start();
//mime type to application/json
header("Content-Type: application/json");

$json_str = file_get_contents('php://input');
//This will store the data into an associative array
$json_obj = json_decode($json_str, true);

$email = $json_obj['email'];
$token = $json_obj['token'];

if(!hash_equals($_SESSION['token'], $token)){
    echo json_encode(array(
        "message" => "Wrong Token!"
    ));
    exit;
}

// quick query and fill (w help from our frontend)
$stmt = $mysqli->prepare("SELECT *
    FROM users
    WHERE users.email = ?");

if(!$stmt){
    //adapted for passing info into json format

   $message = `Query Prep Failed: ${error}\n`;
   echo json_encode(array(
       "success" => false,
       "message" => $message
   ));
   exit;
}
     
$stmt->bind_param('s', $email);
$stmt->execute();

// Bind the results
$stmt->bind_result($id, $username, $password, $email);
$stmt->fetch();

//pass the query data back to main page
echo json_encode(array(
    "success" => true,
    "subscriber_id" => $id,
    "subscriber" => $username,
    "subscriber_email" => $email
));

?>