<?php
require 'database.php';
session_start();
//mime type to application/json
header("Content-Type: application/json");

$json_str = file_get_contents('php://input');
//This will store the data into an associative array
$json_obj = json_decode($json_str, true);

$event_id = $json_obj['event_id'];
$token = $json_obj['token'];

if(!hash_equals($_SESSION['token'], $token)){
    echo json_encode(array(
        "message" => "Wrong Token!"
    ));
    exit;
}

// quick query and fill (w help from our frontend)
$stmt = $mysqli->prepare("SELECT events.event_id, events.title, events.startTime, events.endTime, events.duration, events.content, events.creator, events.tag, events.invitee
    FROM events
    WHERE events.event_id = ?");

if(!$stmt){
    //adapted for passing info into json format

   $message = `Query Prep Failed: ${error}\n`;
   echo json_encode(array(
       "success" => false,
       "message" => $message
   ));
   exit;
}
     
$stmt->bind_param('i', $event_id);
$stmt->execute();

$result = $stmt->get_result();
    
    //JSON encode MySQL results https://stackoverflow.com/questions/383631/json-encode-mysql-results
    //also read https://www.php.net/manual/en/function.array-push.php
    $data = array();

    while($row = $result->fetch_assoc()){ 
        //append each row to an array
        array_push($data, $row);
        // $data[] = $row; 
    }
    
    $stmt->close();

    //pass the query data back to main page
    echo json_encode($data
    );

?>