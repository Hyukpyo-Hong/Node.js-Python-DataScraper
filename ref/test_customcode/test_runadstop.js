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

var dal = require('../../src/model/dal');

var betting = 2.5*100;
var invest_initial = 100;
var invest = invest_initial;
var invest_increase_ratio = 2;

var go = true;
var budget = 0;
var maxCount = 3;
var cum_lost = 0;
var guide_budget = 0;
var lastGamePlayed = false;
var max_budget = 0;
var min_budget = 100000000000;
//----Test
var testAmount = 80000;
var balance = 500000;
var crash_result = 0;


function log() {
  for (i = 0; i < arguments.length; i++) {
    fs.appendFileSync('log.txt', arguments[i] + " ", encoding = 'utf8');
  }
  fs.appendFileSync('log.txt', "\r\n", encoding = 'utf8');
}

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

function test() {
  console.log("Start");
  fs.unlink('log.txt', function (err) {
    if (err) {
    } else {
      console.log('log.txt File deleted!');
    };
    });

  dal.getRecent(conn, testAmount).then((origin) => {

    var minmax = getminMax(origin);

    for (l = 0; l < testAmount; l++) {
      if (l == testAmount - 1) {
        console.log("Finish");
        process.exit();
      }
      log('------------------------');
      log("Game Number:", l);

      
      crash_result = origin[minmax["min"] + l] * 100;
      start();
      crash();
    }
  }).catch((error) => {
    log(error);
    res.send(error);
  });
};

function start() {
  if (go) {
    log(`Go: ${invest} bits(/100) on ${betting}x(/100)`);
    lastGamePlayed = true;    
  }else{
    lastGamePlayed = false;    
  } 
};



function crash() {
  log('Result: ', crash_result / 100);
  if (lastGamePlayed == true) {
    if (crash_result >= betting) {      
      log(`**!! Win !!** ${(invest / 100) * ((betting / 100) - 1)} bits`)
      budget += ((invest / 100) * ((betting / 100) - 1));
      invest = invest_initial;    
      guide_budget = 0;
      cum_lost=0;
      go = true;
    } else {      
      log(`~~ Lose ~~ ${invest / 100} bits`)
      budget -= (invest / 100);    
      guide_budget += invest;    
      cum_lost++;
      if(cum_lost==maxCount){
        log("Give Up");
        invest = Math.ceil(guide_budget/(betting-100))*100;
        
        guide_budget = 0;
        cum_lost = 0;
        go = false;
      }else{
        invest = invest * invest_increase_ratio;
        go=true;
      }   
    }
    
    if (max_budget < budget) {
      max_budget = budget;
    }
    if (min_budget > budget) {
      min_budget = budget;
    }
    log(`Current Budget: ${budget}`);    
    log(`Min-Max Budget: ${min_budget} - ${max_budget}`);
  }else if(lastGamePlayed == false){
    if (crash_result >= betting) {
      log("Release!");
      go = true;
    }else{
      log("Wait..");
    }
  }
};


test();

