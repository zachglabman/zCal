<?php

$mysqli = new mysqli('localhost', 'zach', 'jj', 'm5');

if($mysqli->connect_errno) {
	printf("Connection Failed: %s\n", $mysqli->connect_error);
	exit;
}
?>
