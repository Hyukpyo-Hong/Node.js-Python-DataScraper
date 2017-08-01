// Using Express engine
var express = require('express');
var session = require('express-session');
var app = express();

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
    password: 'root',
    database: 'bustapick'     
});
conn.connect();

app.io.on('connection', function (socket) {


})


app.post('/crash', (req, res) => {
    var result = req.body.crash;
    var sql = 'INSERT INTO record values(?,?)';
    var params = [result, new Date()];
    conn.query(sql, params, function (err, results) {
        if (err) {
            console.log(err);
            res.status(500);
        } else {            
            
        }
    });
});


//Server Launch
var port = 3000
app.listen(port, () => {
    console.log('Connected to port: ' + port);
})