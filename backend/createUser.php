<?php
require 'database.php';

header("Content-Type: application/json"); // Since we are sending a JSON response here (not an HTML document), set the MIME Type to application/json

$json_str = file_get_contents('php://input');
//This will store the data into an associative array
$json_obj = json_decode($json_str, true);

$username = $json_obj['username'];
$password = $json_obj['password'];
$email = $json_obj['email'];

// create user flow: check if user exists, if not then create a user

if (empty($username) || empty($password) || empty($email)){
       echo json_encode(array(
           "success" => false,
           "message" => "Please enter a username, password and email."
       ));
       exit;
}

// Query database for usernames in it
$stmt = $mysqli->prepare("SELECT id, username, password FROM users WHERE username=?");

if(!$stmt){
     //from php unit

	$message = `Query Prep Failed: ${error}\n`;
    echo json_encode(array(
		"success" => false,
		"message" => $message
	));
	exit;
}

// Bind the parameter
$stmt->bind_param('s', $username);
$stmt->execute();
 
// Bind the results
$stmt->bind_result($id, $username_query, $password_query);
$stmt->fetch();

//if username not in database
if( is_null($username_query) ){

    //add user to database

    //create password hash for database
    $pass = password_hash($password, PASSWORD_BCRYPT);
            
    //insert username and password into users database
    $stmt = $mysqli->prepare("INSERT INTO users (username, password, email) values (?, ?, ?)");
    
    if(!$stmt){
        //from php unit
   
       $message = `Query Prep Failed: ${error}\n`;
       echo json_encode(array(
           "success" => false,
           "message" => $message
       ));
       exit;
   }
            
    $stmt->bind_param('sss', $username, $pass, $email);
    
    $stmt->execute();
            
    $stmt->close();

    echo json_encode(array(
		"success" => true,
        "message" => "User created."
	));
	exit;
}

else if (!is_null($username_query)){
    
        echo json_encode(array(
            "success" => false,
            "message" => "Username taken."
        ));
        exit;
    }
   
    // else {
    //     echo json_encode(array(
    //         "success" => false,
    //         "message" => "Incorrect password, try again."
    //     ));
    //     exit;
    // }

?>