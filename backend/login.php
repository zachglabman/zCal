<?php
//session started only if user is logged in correctly
require 'database.php';

header("Content-Type: application/json"); // Since we are sending a JSON response here (not an HTML document), set the MIME Type to application/json

$json_str = file_get_contents('php://input');
//This will store the data into an associative array
$json_obj = json_decode($json_str, true);

$username = $json_obj['username'];
$password = $json_obj['password'];

//login flow: query database, check if passwords match, bada bing bada boom

// Query database for usernames in it
$stmt = $mysqli->prepare("SELECT id, username, password, email FROM users WHERE username=?");

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
$stmt->bind_result($id, $username_query, $password_query, $email);
$stmt->fetch();

//if username not in database
if( is_null($username_query) ){
    echo json_encode(array(
		"success" => false,
		"message" => "User doesn't exist."
	));
	exit;
}

else if (!is_null($username_query)){
    //check password legitness
    if (password_verify($password, $password_query)) {
        session_start();
        $_SESSION['username'] = $username;
        $_SESSION['user_id'] = $id;
        $_SESSION['email'] = $email;
        $_SESSION['token'] = bin2hex(random_bytes(32));
        $_SESSION["loggedin"] = true; 

        echo json_encode(array(
            "success" => true,
            "username" => $username,
            "user_id" => $id,
            "token" => $_SESSION['token']
        ));
        exit;
    }
    //password is incorrect
    else {
        echo json_encode(array(
            "success" => false,
            "message" => "Incorrect password, try again."
        ));
        exit;
    }

}

?>