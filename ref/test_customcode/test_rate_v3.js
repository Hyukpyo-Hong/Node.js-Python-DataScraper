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
var expectNetProfit = 0.1;
var invest_initial = 100;
var max_lost = 4;
var freeze_betting = 2 * 100;
var freeze_group = 5;
var freeze_initial = 20;

//Setting

//Game Variable
var invest = invest_initial;
var lastGamePlayed = false;
var go = true;

var HistoryArray

var cum_lost = 0;
var cum_lost_budget = 0;

var budget = 0;
var max_budget = 0;
var min_budget = 100000000000;

var gameCount = 1;
//Game Variable

//----Only For Test
var startGame;
var endGame;
var startPoint;
var endPoint;
var totalGame;
var testAmountUnit = 5000;
var balance = 500000;
var max_loss = 0;
var crash_result = 0;
var hrstart = process.hrtime();
var hrend;

function start() {
  if (go) {

    log(`---------------\r\nBet ${invest} bits(/100) on ${betting}x(/100)`);
    lastGamePlayed = true;
  } else {
    log(`---------------\r\nDon't Bet`);
    lastGamePlayed = false;
  }
};

function crash() {
  log(`#${gameCount++}: Crash ${crash_result / 100} Bits`);
  if (HistoryArray.length == MaxHistoryArray) {
    record_array.shift();
    record_array.push(data.game_crash);
  } else {
    record_array.push(data.game_crash);
  }


  budget -= (invest / 100);
  cum_lost_budget += invest;
  invest = Math.ceil((cum_lost_budget * (expectNetProfit + 1)) / (freeze_betting - 100)) * 100;

  if ((cum_lost_budget / 100) >= max_loss) {
    max_loss = cum_lost_budget / 100;
    logEssense(`Max Loss: ${max_loss} bits at Freeze Go / ID# ${startGame - 1}`);
  }
}
if (max_budget < budget) {
  max_budget = budget;
}
if (min_budget > budget) {
  min_budget = budget;
}
log(`Current Budget: ${Math.floor(budget)}`);
log(`Min-Max Budget: ${Math.floor(min_budget)} - ${Math.floor(max_budget)}`);
    }

  } else {
  if (lastGamePlayed == true) {
    if (crash_result >= betting) {
      log(`**!! Win !!** ${(invest / 100) * ((betting / 100) - 1)} bits`)
      budget += ((invest / 100) * ((betting / 100) - 1));
      invest = invest_initial;
      cum_lost_budget = 0;
      cum_lost = 0;
      groupNumber = 1;
      go = true;
    } else {
      log(`~~ Lose ~~ ${invest / 100} bits`)

      budget -= (invest / 100);
      cum_lost_budget += invest;
      cum_lost++;

      if ((cum_lost_budget / 100) >= max_loss) {
        max_loss = cum_lost_budget / 100;
        logEssense(`Max Loss: ${max_loss} bits at Group ${groupNumber} / Count ${cum_lost} / ID# ${startGame - 1}`);
      }

      invest = Math.ceil((cum_lost_budget * (expectNetProfit + 1)) / (betting - 100)) * 100;

      if (cum_lost == max_lost) {
        groupNumber += 1;
        cum_lost = 0;
        go = false;
        if (groupNumber == freeze_group) {
          freeze = true;
          freeze_go = true;
          log("!!!! Freeze !!!!");
          invest = Math.ceil((cum_lost_budget * (expectNetProfit + 1)) / (freeze_betting - 100)) * 100;
        }
      } else {
        go = true;
      }
    }

    if (max_budget < budget) {
      max_budget = budget;
    }
    if (min_budget > budget) {
      min_budget = budget;
    }
    log(`Current Budget: ${Math.floor(budget)}`);
    log(`Min-Max Budget: ${Math.floor(min_budget)} - ${Math.floor(max_budget)}`);
  } else if (lastGamePlayed == false) {
    if (crash_result >= betting) {
      log("Release!");
      go = true;
    } else {
      log("Wait..");
    }
  }
}
};

//----Only For Test Start

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


var injectRecordAndStart = () => {
  return new Promise((resolve, reject) => {
    dal.getRecords(conn, startPoint, endPoint)
      .then((records) => {
        gameCount += testAmountUnit;
        console.log(`${Math.round(gameCount / totalGame * 100)}% Tested`);
        for (let i = 0; i < testAmountUnit; i++) {
          crash_result = records[i] * 100;
          start();
          crash();
        }
        return true;
      })
      .then(() => {
        startPoint = endPoint + 1;
        endPoint = startPoint + testAmountUnit - 1;
        if (endPoint > endGame) {
          resolve();
        }
        else {
          injectRecordAndStart()
            .then(() => {
              resolve();
            });
        }
      });
  });
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
  dal.getMinMaxGameNumber(conn).then((value) => {
    startGame = value['min'];
    endGame = value['max'];
    totalGame = endGame - startGame + 1;
    console.log("Start ID# %d, End ID# %d", startGame, endGame);
    startPoint = startGame;
    endPoint = startPoint + testAmountUnit - 1;
    return true;
  }).then(() => {
    injectRecordAndStart().then(() => {
      hrend = process.hrtime(hrstart);
      console.info("Execution time (hr): %ds %dms", hrend[0], hrend[1] / 1000000);
      console.log("Finish");
      process.exit();
    })
  });
};

//----Only For Test End

test();

