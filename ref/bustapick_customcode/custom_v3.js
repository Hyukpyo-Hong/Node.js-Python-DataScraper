
//Setting
var InitialInvenstAmount = 100;

//Game Variable
var bettingRate = 0;
var resultOfThisTurn = 0;

var investAmount = InitialInvenstAmount;
var go = false;

var gameNumber = 1;
var maxArray = [];
var loseCountArray = []
var possibleArray = [];
var absolutePossibleArray = [];

var cumulativeInvestCount = 0;
var cumulativeInvestAmount = 0;
var MaxCumulativeInvestAmount = 0;

var budget = 0;
var gameCount = 1;
//Game Variable


function init() {
    log("Initialize")
    for (let key in maxArray) {
      loseCountArray[key] = 0;
    }
  }
  
  function arrayMin(arr) {
    var len = arr.length, min = Infinity;
    while (len--) {
      if (arr[len] < min) {
        min = arr[len];
      }
    }
    return min;
  };
  
  function decideNextTurn() {
    for (let key in loseCountArray) {
      if (key <= resultOfThisTurn) {
        loseCountArray[key] = 0;
      } else {
        loseCountArray[key]++;
      }
  
      let maxLoseOfThisKey = maxArray[key];
      let probability = 1 / (maxLoseOfThisKey - loseCountArray[key]);
  
      if (!isFinite(probability) && key <= 970) {
        log(`!!100% ${key / 100} `);
        absolutePossibleArray.push(key);
      }
      else if (key >= 200) {
        if ((maxLoseOfThisKey - loseCountArray[key]) <= 20) {
          log(`${key / 100}: 1/${maxLoseOfThisKey - loseCountArray[key]} [${maxLoseOfThisKey}], P:(${Math.round(probability * 100) / 100})`);
          //possibleArray[key] = maxLoseOfThisKey - loseCountArray[key];
        }
      }
    }
    if (absolutePossibleArray.length > 0) {
      go = true;
      bettingRate = arrayMin(absolutePossibleArray);
  
      if (budget > 100 && bettingRate < 200) {
        investAmount = Math.round(budget * ((bettingRate - 100) / 100)) * 100;
      } else if (budget > 100 && bettingRate < 500) {
        investAmount = Math.round(budget * 0.2) * 100;
      }
      absolutePossibleArray = [];
    } else if (possibleArray.length > 0) {
      go = true;
      let mostMinimumDiff = 1000;
      let mostMinimumKey;
      for (let key in possibleArray) {
        if (possibleArray[key] < mostMinimumDiff) {
          mostMinimumDiff = possibleArray[key];
          mostMinimumKey = key;
        }
      }
      bettingRate = mostMinimumKey;
      possibleArray = [];
    } else {
      go = false;
    }
  }
  function calculateBeforeCrash() {
    cumulativeInvestAmount += investAmount;
    cumulativeInvestCount++;
    if (MaxCumulativeInvestAmount < cumulativeInvestAmount) {
      MaxCumulativeInvestAmount = cumulativeInvestAmount;
    }
    log(`  Cumulative Spent Count: ${cumulativeInvestCount}, Cumulative Spent Amount: ${cumulativeInvestAmount / 100} Bits`);
  }
  
  
  function calculateAfterGoAndCrash() {
    if (resultOfThisTurn >= bettingRate) {
      budget += (investAmount / 100) * ((bettingRate / 100) - 1);
      log(`  Win! ${(investAmount / 100) * ((bettingRate / 100) - 1)} bits. Budget: ${Math.round(budget * 100) / 100} Bits.`)
  
      investAmount = InitialInvenstAmount;
      cumulativeInvestAmount = 0;
      cumulativeInvestCount = 0;
  
    } else {
      budget -= (investAmount / 100);
      log(`  Lose! ${investAmount / 100} bits. Budget: ${Math.round(budget * 100) / 100} Bits.`)
  
      investAmount *= 2;
    }
  }
  


//----Only For Test End
maxArray[110] = 5;
maxArray[120] = 8;
maxArray[130] = 11;
maxArray[140] = 11;
maxArray[150] = 13;
maxArray[160] = 15;
maxArray[170] = 15;
maxArray[180] = 15;
maxArray[190] = 15;
maxArray[200] = 18;
maxArray[210] = 25;
maxArray[220] = 25;
maxArray[230] = 25;
maxArray[240] = 26;
maxArray[250] = 26;
maxArray[260] = 26;
maxArray[270] = 33;
maxArray[280] = 33;
maxArray[290] = 33;
maxArray[300] = 33;
maxArray[310] = 35;
maxArray[320] = 36;
maxArray[330] = 36;
maxArray[340] = 36;
maxArray[350] = 37;
maxArray[360] = 37;
maxArray[370] = 38;
maxArray[380] = 41;
maxArray[390] = 42;
maxArray[400] = 42;
maxArray[410] = 42;
maxArray[420] = 42;
maxArray[430] = 42;
maxArray[440] = 45;
maxArray[450] = 45;
maxArray[460] = 59;
maxArray[470] = 59;
maxArray[480] = 59;
maxArray[490] = 59;
maxArray[500] = 63;
maxArray[510] = 73;
maxArray[520] = 73;
maxArray[530] = 73;
maxArray[540] = 75;
maxArray[550] = 75;
maxArray[560] = 75;
maxArray[570] = 75;
maxArray[580] = 75;
maxArray[590] = 75;
maxArray[600] = 75;
maxArray[610] = 75;
maxArray[620] = 75;
maxArray[630] = 75;
maxArray[640] = 75;
maxArray[650] = 75;
maxArray[660] = 75;
maxArray[670] = 75;
maxArray[680] = 75;
maxArray[690] = 75;
maxArray[700] = 75;
maxArray[710] = 75;
maxArray[720] = 75;
maxArray[730] = 77;
maxArray[740] = 85;
maxArray[750] = 85;
maxArray[760] = 98;
maxArray[770] = 98;
maxArray[780] = 98;
maxArray[790] = 98;
maxArray[800] = 98;
maxArray[810] = 98;
maxArray[820] = 101;
maxArray[830] = 102;
maxArray[840] = 102;
maxArray[850] = 102;
maxArray[860] = 102;
maxArray[870] = 105;
maxArray[880] = 105;
maxArray[890] = 105;
maxArray[900] = 105;
maxArray[910] = 105;
maxArray[920] = 105;
maxArray[930] = 105;
maxArray[940] = 105;
maxArray[950] = 105;
maxArray[960] = 105;
maxArray[970] = 120;
maxArray[980] = 120;
maxArray[990] = 120;
maxArray[1000] = 120;
maxArray[1100] = 120;
maxArray[1200] = 124;
maxArray[1300] = 148;
maxArray[1400] = 159;
maxArray[1500] = 174;
maxArray[1600] = 174;
maxArray[1700] = 174;
maxArray[1800] = 190;
maxArray[1900] = 190;
maxArray[2000] = 208;
maxArray[2100] = 208;
maxArray[2200] = 246;
maxArray[2300] = 246;
maxArray[2400] = 292;
maxArray[2500] = 292;
maxArray[2600] = 292;
maxArray[2700] = 292;
maxArray[2800] = 292;
maxArray[2900] = 292;
maxArray[3000] = 292;
maxArray[3100] = 292;
maxArray[3200] = 292;
maxArray[3300] = 366;
maxArray[3400] = 386;
maxArray[3500] = 386;
maxArray[3600] = 386;
maxArray[3700] = 386;
maxArray[3800] = 386;
maxArray[3900] = 386;
maxArray[4000] = 386;
maxArray[4100] = 386;
maxArray[4200] = 386;
maxArray[4300] = 386;
maxArray[4400] = 386;
maxArray[4500] = 417;
maxArray[4600] = 417;
maxArray[4700] = 417;
maxArray[4800] = 417;
maxArray[4900] = 417;
maxArray[5000] = 417;
init();  

engine.on('game_starting', function (info) {
    if (go) {
        engine.placeBet(investAmount, bettingRate, false);
        log(`--------------------------------------\r\n#Go ${investAmount / 100} bits on Rate ${bettingRate / 100}`);
        calculateBeforeCrash();
      }
});


engine.on('game_crash', function (data) {
    resultOfThisTurn = data.game_crash;
    log(`#${gameNumber++}: Crash ${resultOfThisTurn / 100} Bits`);
    if (go) {
      calculateAfterGoAndCrash();
    }
    decideNextTurn();

});


engine.on('game_started', function (data) {
    //log('Game Started', data);
});

engine.on('player_bet', function (data) {
    //log('The player ', data.username, ' placed a bet. This player could be me :o.')
});

engine.on('cashed_out', function (resp) {
    //log('The player ', resp.username, ' cashed out. This could be me.');
});

engine.on('msg', function (data) {
    //log('Chat message!...');
});

engine.on('connect', function () {
    log('Client connected, this wont happen when you run the script');
});

engine.on('disconnect', function () {
    log('Client disconnected');
});



