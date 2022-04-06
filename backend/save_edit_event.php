<?php
session_start();
require 'database.php';

//mime type to application/json
header("Content-Type: application/json");

$json_str = file_get_contents('php://input');
//This will store the data into an associative array
$json_obj = json_decode($json_str, true);

$event_id = $json_obj['event_id'];
$token = $json_obj['token'];
$title = htmlspecialchars($json_obj['title']);
$start_time = $json_obj['start'];
$end_time = $json_obj['end'];
$content = htmlspecialchars($json_obj['content']);
$creator = $_SESSION['user_id'];
$duration = $json_obj['duration'];
$tag = $json_obj['tag'];
$invitee = $json_obj['invitee'];

if(!hash_equals($_SESSION['token'], $token)){
    echo json_encode(array(
        "message" => "Wrong Token!"
    ));
    exit;
}

// can't leave these empty
if (empty($title) || empty($start_time) || empty($end_time)){
    echo json_encode(array(
        "message" => "Please enter a value in all required fields!"
    ));
    exit;
}


//insert all relevant things into the db
//content is default null since it's optional
$stmt = $mysqli->prepare("UPDATE events
SET title = ?, startTime = ?, endTime = ?, duration = ?, content = ?, tag = ?, invitee = ?
WHERE event_id = ?");

if(!$stmt){
    //adapted for passing info into json format

   $message = `Query Prep Failed: ${error}\n`;
   echo json_encode(array(
       "success" => false,
       "message" => $message
   ));
   exit;
}
     
$stmt->bind_param('sssssssi', $title, $start_time, $end_time, $duration, $content, $tag, $invitee, $event_id);

$stmt->execute();
        
$stmt->close();

echo json_encode(array(
    "success" => true,
    "message" => "Event updated."
));
exit;

?>