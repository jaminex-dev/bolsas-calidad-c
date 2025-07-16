<?php
$Servidor = "10.1.1.197";
$Usuario = "sena2025";
$Password = "Minex.sena";
$BaseDeDatos = "Traz";

$connectionInfo = array("Database" => $BaseDeDatos,"UID" => $Usuario,"PWD" => $Password,"CharacterSet" => "UTF-8",);
$conn = sqlsrv_connect($Servidor, $connectionInfo)or die("Error ::: !!! El servidor no puede conectar con la base de datos, verifique los datos del servidor, usuario y password.");
