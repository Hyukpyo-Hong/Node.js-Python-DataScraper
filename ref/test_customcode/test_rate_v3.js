var fs = require('fs');

//DB connection
var mysql = require('mysql');

var conn = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'fhzkfmsh12',
  database: 'bustapick'
});
conn.connect();

// Models
var dal = require('../../src/model/dal');
var calculator = require('../../src/model/calculatorv3');

//----Only For Test
var gameCount = 1;
var startGameNumber;
var endGameNumber;
var startPoint;
var endPoint;
var totalGame;
var testAmountUnit = 5000;
var hrstart = process.hrtime();
var hrend;

var injectRecordAndStart = () => {
  return new Promise((resolve, reject) => {
    dal.getRecords(conn, startPoint, endPoint)
      .then((records) => {
        gameCount += testAmountUnit;
        console.log(`Testing ${Math.round(gameCount / totalGame * 100)}%`);
        for (let i = 0; i < testAmountUnit; i++) {
          calculator.compute(startPoint+i,records[i].toString());         
        }
        return true;
      })
      .then(() => {
        startPoint = endPoint + 1;
        endPoint = startPoint + testAmountUnit - 1;
        if (endPoint > endGameNumber) {
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
  calculator.init();

  dal.getMinMaxGameNumber(conn).then((value) => {
    startGameNumber = value['min'];
    endGameNumber = value['max'];
    //endGameNumber = startGameNumber + 100000;
    totalGame = endGameNumber - startGameNumber + 1;
    console.log(`Game #${startGameNumber} to #${endGameNumber}`);
    startPoint = startGameNumber;
    endPoint = startPoint + testAmountUnit - 1;
    return true;
  }).then(() => {
    injectRecordAndStart().then(() => {
      hrend = process.hrtime(hrstart);
      console.log(calculator.result());
      console.info("Execution time (hr): %ds %dms", hrend[0], hrend[1] / 1000000);
      console.log("Finish");
      process.exit();
    })
  });
};

test();

