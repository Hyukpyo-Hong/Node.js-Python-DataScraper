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

//Setting
var betting = 3.2 * 100;
var invest_increase_ratio = 2;
var invest_initial = 100;
var max_lost = 6;
//Setting

//Game Variable
var invest = invest_initial;
var go = true;
var cum_lost = 0;
var max_loss = 0;
var lastGamePlayed = false;
var giveUpCount = 0;
var gameCount = 0;
var guide_budget = 0;
var budget = 0;
var max_budget = 0;
var min_budget = 100000000000;
//Game Variable

//----Only For Test
var testAmount = 80000;
var balance = 500000;
var crash_result = 0;
var hrstart = process.hrtime();
var hrend;

//----Only For Test

function log() {
  for (i = 0; i < arguments.length; i++) {
    fs.appendFileSync('log.txt', arguments[i] + " ", encoding = 'utf8');
  }
  fs.appendFileSync('log.txt', "\r\n", encoding = 'utf8');
}

function logEssense() {
  for (i = 0; i < arguments.length; i++) {
    fs.appendFileSync('log_Essense.txt', arguments[i] + " ", encoding = 'utf8');
  }
  fs.appendFileSync('log_Essense.txt', "\r\n", encoding = 'utf8');
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
  console.log("Test Start!");
  fs.unlink('log.txt', function (err) {
    if (err) {
    } else {
      console.log('log.txt File deleted!');
    };
  });
  fs.unlink('log_Essense.txt', function (err) {
    if (err) {
    } else {
      console.log('log_Essense.txt File deleted!');
    };
  });

  dal.getRecent(conn, testAmount).then((origin) => {

    var minmax = getminMax(origin);

    for (gameCount = 0; gameCount < testAmount; gameCount++) {
      if (gameCount == testAmount - 1) {
        console.log("Finish");
        hrend = process.hrtime(hrstart);
        console.info("Execution time (hr): %ds %dms", hrend[0], hrend[1] / 1000000);
        process.exit();
      }
      if (gameCount % 2500 == 0) {
        console.log(`Game #${gameCount} is calculated`);
      }
      log('------------------------');
      log("Game #", gameCount);


      crash_result = origin[minmax["min"] + gameCount] * 100;
      start();
      crash();
    }
  }).catch((error) => {
    log(error);
  });
};

function start() {
  if (go) {
    log(`Go: ${invest} bits(/100) on ${betting}x(/100)`);
    lastGamePlayed = true;
  } else {
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
      cum_lost = 0;
      giveUpCount = 0;
      go = true;
    } else {
      log(`~~ Lose ~~ ${invest / 100} bits`)
      if ((invest / 100) < max_loss) {
        log(`New Max Loss: ${invest / 100} bits at Game #${gameCount}`);
        logEssense(`New Max Loss: ${invest / 100} bits at Game #${gameCount}`);
      }
      budget -= (invest / 100);
      guide_budget += invest;
      cum_lost++;
      if (cum_lost == max_lost) {
        giveUpCount += 1;
        log("Give Up #", giveUpCount);
        logEssense(`Game #${gameCount} Giveup #${giveUpCount}`)
        invest = Math.ceil(guide_budget / (betting - 100)) * 100;

        //guide_budget = 0;
        cum_lost = 0;
        go = false;
      } else {
        invest = invest * invest_increase_ratio;
        go = true;
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
  } else if (lastGamePlayed == false) {
    if (crash_result >= betting) {
      log("Release!");
      go = true;
    } else {
      log("Wait..");
    }
  }
};


test();

