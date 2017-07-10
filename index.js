var express = require('express');
var app = express();
var path = require('path');
var mime = require('mime');
var fs = require('fs');

//View Engine
app.set('view engine', 'pug');
app.set('views', './src/views');
app.use(express.static('./public')); // serve static files

//DB connection
var mysql = require('mysql');

var conn = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'bustapick'
});
conn.connect();

//Modules 
var dal = require('./src/model/dal');



app.get('/downall', (req, res) => {
  var file = __dirname + '/records.csv';
  console.log(file);

  dal.downall(conn, fs, file).then(() => {
    var filename = path.basename(file);
    var mimetype = mime.lookup(file);

    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);

    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
  }).catch((error) => {
    console.log(error);
    res.send(error);
  });
});

app.get('/getall', (req, res) => {
  dal.getall(conn).then((list) => {
    res.render('getall', {
      list: list,
    })
  }).catch((error) => {
    console.log(error);
    res.send(error);
  });
})

const id = Math.floor(Math.random() * (1000 - 1 + 1)) + 1;

app.get('/', (req, res) => {

  if (req.query.id == id) {
    dal.getMax(conn).then((max_array) => {
      dal.getRecent(conn, 300).then((recent_array) => {
        dal.calculate(max_array, recent_array).then((html) => {
          res.render('main', {
            html: html,
          })
        })
      }).catch((error) => {
        console.log(error);
        res.send(error);
      });

    })
  } else {
    res.redirect('http://www.google.com');
  }
});

function test() {
  dal.getMax(conn).then((max_array) => {    
    dal.getRecent(conn, 300).then((recent_array) => {      
      dal.calculate(max_array, recent_array).then((msg) => {
        console.log(msg);
        //res.render('main', {
        //html: html,
        process.exit();
      })
    })
  }).catch((error) => {
    console.log(error);
    res.send(error);
  });

}


  console.log("\n\n\n------------------------------------------------------------");
  test();



/*
//Server Launch
var port = 3000
var addr = "http://ec2-54-186-19-191.us-west-2.compute.amazonaws.com:" + port + "?id=" + id;
var addr2 = "http://localhost:" + port + "?id=" + id;
app.listen(port, () => {
  console.log("Sever launced at: ", addr);
  console.log("Test: ", addr2);
})
*/