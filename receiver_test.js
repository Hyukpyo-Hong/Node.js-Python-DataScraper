// Command Betting to Sender
var investMode = true;

// Using Express engine
var express = require('express');
var session = require('express-session');
var app = express();
var https = require('https');
var fs = require('fs')

//socket io
app.io = require('socket.io')();

// To process post request
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

//View Engine
app.set('view engine', 'pug');
app.set('views', './src/views');
app.use(express.static('./src/resources')); // using static file from here.

// DB connection
var mysql = require('mysql');
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'fhzkfmsh12',
    database: 'bustapick'
});
conn.connect();
var dbModel = require('./src/model/dbModel');

app.get('/', function (req, res) {
    res.write("Server is Working");
});

app.io.on('connection', function (socket) {
})


//Server Launch
var port = 80

https.createServer(sslOptions, app).listen(port)
console.log("Server Start.  Prt" + port);
