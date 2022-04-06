<?php
     // render calendar events in main calendar with sql query
        
    require 'database.php';
    session_start();

    //mime type to application/json
    header("Content-Type: application/json");

    $json_str = file_get_contents('php://input');
    //This will store the data into an associative array
    $json_obj = json_decode($json_str, true);

    $day = $json_obj['day'];
    $token = $json_obj['token'];

    if(!hash_equals($_SESSION['token'], $token)){
        echo json_encode(array(
            "message" => "Wrong Token!"
        ));
        exit;
    }
    
    $stmt = $mysqli->prepare("SELECT *
      FROM events 
    --   probably don't need line below if the creator is stored as localUsername // Session username
      LEFT JOIN users ON events.creator = users.id
      LEFT JOIN subs ON users.id = subs.user
      WHERE DAY(events.startTime) = ?
      AND (events.creator = ? OR events.invitee = ? OR subs.subscriber_id = ?)
    --   
      ORDER BY events.startTime asc");

    if(!$stmt){
        //adapted for passing info into json format
        $message = `Query Prep Failed: ${error}\n`;
        echo json_encode(array(
            "success" => false,
            "message" => $message
        ));
        exit;
    }

    $stmt->bind_param('iisi', $day, $_SESSION['user_id'], $_SESSION['email'], $_SESSION['user_id']);
    $stmt->execute();

    $result = $stmt->get_result();
    
    //JSON encode MySQL results https://stackoverflow.com/questions/383631/json-encode-mysql-results
    //also read https://www.php.net/manual/en/function.array-push.php
    //will need to encode json as array anyways
    $data = array();
    //can I create separate arrays for each row? not sure how this looks
    while($row = $result->fetch_assoc()){ 
        //append each row to an array
        array_push($data, $row);
        // $data[] = $row; 
    }
    
    $stmt->close();

    //pass the query data back to main page
    echo json_encode(array(
        "success" => true,
        "data" => $data,
        "message" => "Events rendered."
    
    ));

?>