var express = require('express');
var app = express();
var path = require('path');
var mime = require('mime');
var fs = require('fs');

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
function test() {
  dal.getMax(conn).then((max_array) => {
    dal.getRate(conn).then((rate_array) => {
      dal.getRecent(conn, 72000).then((recent_array) => {
        dal.test_model(max_array, rate_array, recent_array).then((msg) => {
          console.log(msg);
          process.exit();
        })
      })
    })
  }).catch((error) => {
    console.log(error);
    res.send(error);
  });
}

test();
