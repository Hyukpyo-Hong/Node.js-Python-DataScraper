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
var array_saving = 400;
var rate_condition_initial = 0.05;
var invest_initial = 300;
var invest_increase = 300;
var cooltime_initial = 10;
var max_cum_loss = 5;
var max_flag_count = 1;
var min_flag_count = 50;
var idle_count_maximum = 100;

var max_flag = 0;
var min_flag = 0;
var go = false;
var rate_condition = rate_condition_initial;
var invest = invest_initial;
var record_array = [];
var possible_array = [];
var rate_array = {};
var result = {};
var prev = 0;
var Minimum_rate = 100;
var Minimum_betting;
var Minumum_msg;
var loss_rate;
var next_loss_rate;
var t = 0;
var count = 0;
var cooltime = cooltime_initial;
var cooltime_flag = false;
var cum_loss = 0;
var game_count = 0;
var win_count = 0;
var idle_count = 0;
var budget = 0;

//----Test
var balance = 500000;
var lastGamePlay = 'LOST';
var lastGamePlayed = false;
var crash_result = 0;
var max_budget = 0;
var min_budget = 100000000000;
var invest_rate = 200;

function test() {

  dal.getRecent(conn, 73000).then((origin) => {

    var minmax = getminMax(origin);

    for (l = 0; l < 70000 - array_saving; l++) {
    
      if (l == 70000 - array_saving - 1) {
        process.exit();
      }
      console.log("Game Number:", l);
      if (max_budget < budget) {
        max_budget = budget;
      }
      if (min_budget > budget) {
        min_budget = budget;
      }
      crash_result = origin[minmax["min"] + l] * 100;
      start();
      crash();
    }
  }).catch((error) => {
    console.log(error);
    res.send(error);
  });
};

function start() {
  console.log('------------------------');
  console.log('New Competition Start');
  if (go) {
    console.log(`Go: Invest: ${invest / 100} bits`);
    lastGamePlayed = true;
    //engine.placeBet(invest, Minimum_betting, false);
  } else {
    console.log('Wait...');
    lastGamePlayed = false;
  }
};

function crash() {
  console.log('Result: ', crash_result / 100);
  if (crash_result >= invest_rate) {
    go = true;
    if (lastGamePlayed) {
      console.log(`Win: `, (invest * (invest_rate - 100)) / 10000);
      budget += (invest * (invest_rate - 100)) / 10000;
    }
  } else {
    go = false;
    if (lastGamePlayed) {
      console.log(`Lose: `, (invest / 100));
      budget -= (invest / 100);
    }
  }
  console.log(`Budget: ${budget}, Min-Max Budget: ${min_budget} - ${max_budget}`);
};

function getminMax(array) {
  value = {}
  value['min'] = 100000000;
  value['max'] = 0;

  for (key in array) {
    if (parseFloat(key) > value['max']) {
      value['max'] = parseFloat(key);
    }
    if (parseFloat(key) < value['min']) {
      value['min'] = parseFloat(key);
    }
  }
  return value;

}
test();