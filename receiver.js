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

// Calculator
var calculator = require('./src/model/calculatorv3');
calculator.init();



app.post('/crash', (req, res) => {
    var game = parseInt(req.body.game);
    var rate = req.body.rate;
    var time = parseInt(req.body.time);
    time = new Date(time).toISOString().slice(0, 19).replace('T', ' ');


    dbModel.insertRate(conn, game, rate, time).then(() => {
        if (investMode) {
            let value = calculator.compute(game, rate);
            console.log("Return:", value);
            res.status(200).header("Access-Control-Allow-Origin", "*").send(value);

        } else {
            res.status(400).header("Access-Control-Allow-Origin", "*").send();
        }
    })
});


app.post('/error', function (req, res) {
    dbModel.insertError(conn, req.body.params).then(() => { });
});


app.get('/', function (req, res) {
    res.write("Server is Working");
});

app.io.on('connection', function (socket) {
})


//Server Launch
var port = 3001
var sslOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
    passphrase: 'fhzkfmsh'
};
https.createServer(sslOptions, app).listen(port)
console.log("Server Start.  ec2-34-203-159-36.compute-1.amazonaws.com:" + port);
