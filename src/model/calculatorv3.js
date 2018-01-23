var fs = require('fs');
var stream;

//Setting
var InitialInvenstAmount = 1;
var thredshold = 12;
var initialRecoverRate = 1.65;
var initialGuideRate = 3.7;
//Game Variable
var recoverRate = initialRecoverRate;
var guideRate = initialGuideRate;
var bettingRate = 0;
var resultOfThisTurn = 0;

var investAmount = InitialInvenstAmount;
var go = false;
var lastGameWin = false;

var gameNumber = 1;
var maxArray = new Map();
var loseCountArray = new Map();
var possibleArray = new Map();
var absolutePossibleArray = [];

var previousGameNumber = 0; // To determine if current game number is subsequent number.

var cumulativeInvestCount = 0;
var cumulativeInvestAmount = 0;
var MaxCumulativeInvestAmount = 0;

var budget = 1400;
//Game Variable

exports.result = () => {
    return (`Final Budget: ${budget} Bits, Max Cumulative Spent Money: ${MaxCumulativeInvestAmount} Bits`);
}

exports.init = () => {
    fs.unlink('log.txt', function (err) {
        if (err) {
        } else {
            console.log('log.txt File deleted!');
        };
    });
    stream = fs.createWriteStream("log.txt", { flags: 'a' });
    initializer();    
}

exports.compute = (game, rate) => {
    // return new Promise((resolve, reject) => {
        try {
            if (lastGameWin) {
                thredsholdAdjust();
            }
            // Initialize Result Value. Client won't work with 0
            var result = {
                "bettingRate": 0,
                "investAmount": 0,
            }

            /* Determine if Game Number is Continuous*/
            if (previousGameNumber + 1 != game) {
                log("Missing Game Number: Prev#", previousGameNumber, "Current#", game);
                //console.log("Missing Game Number: Prev#", previousGameNumber, "Current#", game);                
                initializer();
            }
            previousGameNumber = game;

            // Store Crash Result            
            log(` *Crash: ${rate} x at ${gameNumber}th Game(#${game})`);
            
            gameNumber++;
            resultOfThisTurn = parseFloat(rate);

            // If invested this turn, calculate profit or loss.
            if (go) {
                calculateAfterGoAndCrash();
            }

            // Analyze next turn
            decideNextTurn();

            // If invest next turn, Set return payload for amount, and rate. Then, calculate cumulative money spending.        
            if (go) {
                log(`--------------------------------------\r\n#Go ${investAmount} bits on Rate ${bettingRate}`);
                //console.log(`--------------------------------------\r\n#Go ${investAmount} bits on Rate ${bettingRate}`);
                result.bettingRate = bettingRate;
                result.investAmount = investAmount;
                calculateBeforeCrash();
            }
            //resolve(result);
            return result;
        }
        catch (error) {
            log(error);
            //console.log(error);
            //reject(error);

        }
        
    // });
}

function thredsholdAdjust() {
    recoverRate = initialRecoverRate;
    guideRate = initialGuideRate;
    if (budget > 8984716) {
        thredshold = 29;
    } else if (budget > 5445281) {
        thredshold = 28;
    } else if (budget > 3300169) {
        thredshold = 27;
    } else if (budget > 2000101) {
        thredshold = 26;
    } else if (budget > 1212181) {
        thredshold = 25;
    } else if (budget > 734654) {
        thredshold = 24;
    } else if (budget > 445244) {
        thredshold = 23;
    } else if (budget > 269844) {
        thredshold = 22;
    } else if (budget > 163541) {
        thredshold = 21;
    } else if (budget > 99115) {
        thredshold = 20;
    } else if (budget > 60069) {
        thredshold = 19;
    } else if (budget > 36405) {
        thredshold = 18;
    } else if (budget > 22063) {
        thredshold = 17;
    } else if (budget > 13371) {
        thredshold = 16;
    } else if (budget > 8103) {
        thredshold = 15;
    } else if (budget > 4910) {
        thredshold = 14;
    } else if (budget > 2975) {
        thredshold = 13;
    } else {
        thredshold = 9;
        recoverRate = 2.1;
        guideRate = 2;
    }    
}



function decideNextTurn() {

    for (var [key, value] of loseCountArray) {
        // Update Lose Count Table
        if (key <= resultOfThisTurn) {
            loseCountArray.set(key, 0);
        } else {
            loseCountArray.set(key, ++value);
        }


        // Calculate Each Winning Probability for next Turn        
        let maxLoseOfThisKey = maxArray.get(key);
        let diff = (maxLoseOfThisKey - loseCountArray.get(key));
        let probability = 1 / diff;
        
        if(probability>0.05&& key>=2){
            log(` <0.05,2x Candidate- ${key}x 1/${diff} [${maxLoseOfThisKey}], P(${Math.round(probability * 100) / 100}) Thredshold: ${thredshold}`);
        }        
        // Find rate will win 100% and less than 9.7
        if (!isFinite(probability) && key <= 9.7) {
            log(`!!100% ${key} `);
            
            absolutePossibleArray.push(key);
        }

        // Or, Find possible winning rate over rate 3.0
        else if (key >= guideRate) {
            if (diff <= thredshold && diff > -3) {
                log(` Real Candidate- ${key}x 1/${diff} [${maxLoseOfThisKey}], P(${Math.round(probability * 100) / 100}) Thredshold: ${thredshold}`);                
                possibleArray.set(key, diff);
            }
        }

    };
    // IF 100% rate is exist, Go
    if (absolutePossibleArray.length > 0) {
        go = true;
        bettingRate = arrayMin(absolutePossibleArray);

        if (budget > 100 && bettingRate < 2) {
            investAmount = Math.round(budget * (bettingRate - 1));
        } else if (budget > 100 && bettingRate < 5) {
            investAmount = Math.round(budget * 0.2);
        }
        absolutePossibleArray = [];
    }
    //Or possible rate is exist, Go
    else if (possibleArray.size > 0) {
        go = true;
        // Find rate which has the most highest possibiility
        let mostMinimumDiff = 1000;
        let mostMinimumKey;
        for (var [key, diff] of possibleArray) {
            if (diff < mostMinimumDiff) {
                mostMinimumDiff = diff;
                mostMinimumKey = key;
            }
        }
        bettingRate = mostMinimumKey;
        possibleArray.clear();
    } else {
        go = false;
    }
}

function calculateBeforeCrash() {
    cumulativeInvestAmount += investAmount;
    cumulativeInvestCount++;
    log(`  Cumulative Spent Count: ${cumulativeInvestCount}, Cumulative Spent Amount: ${cumulativeInvestAmount} Bits`);
    //console.log(`  Cumulative Spent Count: ${cumulativeInvestCount}, Cumulative Spent Amount: ${cumulativeInvestAmount} Bits`);
    if (MaxCumulativeInvestAmount < cumulativeInvestAmount) {
        MaxCumulativeInvestAmount = cumulativeInvestAmount;
        log(`  Update Max Cumulative Spent Count: ${cumulativeInvestCount}, Max Cumulative Spent Amount: ${cumulativeInvestAmount} Bits`);
        //console.log(`  !!Update Max Cumulative Spent Count: ${cumulativeInvestCount}, Max Cumulative Spent Amount: ${cumulativeInvestAmount} Bits`);
    }
}


function calculateAfterGoAndCrash() {
    // If win
    if (resultOfThisTurn >= bettingRate) {
        budget += Math.round((investAmount * (bettingRate - 1)));
        log(`  [Win] ${investAmount * (bettingRate - 1)} bits. Budget: ${budget} Bits.`)
        //console.log(`  Win! ${investAmount * (bettingRate - 1)} bits. Budget: ${budget} Bits.`);

        investAmount = InitialInvenstAmount;
        cumulativeInvestAmount = 0;
        cumulativeInvestCount = 0;
        lastGameWin = true;
    }
    // If lose
    else {
        budget -= investAmount;
        log(`  [Lose] ${investAmount} bits. Budget: ${budget} Bits.`);
        //console.log(`  Lose! ${investAmount} bits. Budget: ${budget} Bits.`);
        investAmount = Math.round(investAmount * recoverRate);
        lastGameWin = false;
    }
}

function initializer() {
    maxArray.forEach((value, key) => loseCountArray.set(key, 0));
}


function arrayMin(arr) {
    var len = arr.length, min = 10000.0;
    while (len--) {
        if (arr[len] < min) {
            min = arr[len];
        }
    }
    return min;
};

function log() {
    let msg = "";
    for (let i = 0; i < arguments.length; i++) {
        msg += arguments[i] + " ";
    }
    console.log(msg);    
    stream.write(msg+"\r\n");
}
// function log() {
//     for (i = 0; i < arguments.length; i++) {
//         fs.appendFileSync('log.txt', arguments[i] + " ", encoding = 'utf8');
//     }
//     fs.appendFileSync('log.txt', "\r\n", encoding = 'utf8');
// }


//maxArray.set(1, 2);
maxArray.set(1.1, 5);
maxArray.set(1.2, 8);
maxArray.set(1.3, 11);
maxArray.set(1.4, 11);
maxArray.set(1.5, 13);
maxArray.set(1.6, 15);
maxArray.set(1.7, 15);
maxArray.set(1.8, 15);
maxArray.set(1.9, 15);
maxArray.set(2, 18);
maxArray.set(2.1, 25);
maxArray.set(2.2, 25);
maxArray.set(2.3, 25);
maxArray.set(2.4, 26);
maxArray.set(2.5, 26);
maxArray.set(2.6, 26);
maxArray.set(2.7, 33);
maxArray.set(2.8, 33);
maxArray.set(2.9, 33);
maxArray.set(3, 33);
maxArray.set(3.1, 35);
maxArray.set(3.2, 36);
maxArray.set(3.3, 36);
maxArray.set(3.4, 36);
maxArray.set(3.5, 37);
maxArray.set(3.6, 37);
maxArray.set(3.7, 38);
maxArray.set(3.8, 41);
maxArray.set(3.9, 42);
maxArray.set(4, 42);
maxArray.set(4.1, 42);
maxArray.set(4.2, 42);
maxArray.set(4.3, 42);
maxArray.set(4.4, 45);
maxArray.set(4.5, 45);
maxArray.set(4.6, 59);
maxArray.set(4.7, 59);
maxArray.set(4.8, 59);
maxArray.set(4.9, 59);
maxArray.set(5, 63);
maxArray.set(5.1, 73);
maxArray.set(5.2, 73);
maxArray.set(5.3, 73);
maxArray.set(5.4, 75);
maxArray.set(5.5, 75);
maxArray.set(5.6, 75);
maxArray.set(5.7, 75);
maxArray.set(5.8, 75);
maxArray.set(5.9, 75);
maxArray.set(6, 75);
maxArray.set(6.1, 75);
maxArray.set(6.2, 75);
maxArray.set(6.3, 75);
maxArray.set(6.4, 75);
maxArray.set(6.5, 75);
maxArray.set(6.6, 75);
maxArray.set(6.7, 75);
maxArray.set(6.8, 75);
maxArray.set(6.9, 75);
maxArray.set(7, 75);
maxArray.set(7.1, 75);
maxArray.set(7.2, 75);
maxArray.set(7.3, 77);
maxArray.set(7.4, 85);
maxArray.set(7.5, 85);
maxArray.set(7.6, 98);
maxArray.set(7.7, 98);
maxArray.set(7.8, 98);
maxArray.set(7.9, 98);
maxArray.set(8, 98);
maxArray.set(8.1, 98);
maxArray.set(8.2, 101);
maxArray.set(8.3, 102);
maxArray.set(8.4, 102);
maxArray.set(8.5, 102);
maxArray.set(8.6, 102);
maxArray.set(8.7, 105);
maxArray.set(8.8, 105);
maxArray.set(8.9, 105);
maxArray.set(9, 105);
maxArray.set(9.1, 105);
maxArray.set(9.2, 105);
maxArray.set(9.3, 105);
maxArray.set(9.4, 105);
maxArray.set(9.5, 105);
maxArray.set(9.6, 105);
maxArray.set(9.7, 120);
maxArray.set(9.8, 120);
maxArray.set(9.9, 120);
maxArray.set(10, 120);
maxArray.set(11, 120);
maxArray.set(12, 124);
maxArray.set(13, 148);
maxArray.set(14, 159);
maxArray.set(15, 174);
maxArray.set(16, 174);
maxArray.set(17, 174);
maxArray.set(18, 190);
maxArray.set(19, 190);
maxArray.set(20, 208);
maxArray.set(21, 208);
maxArray.set(22, 246);
maxArray.set(23, 246);
maxArray.set(24, 292);
maxArray.set(25, 292);
maxArray.set(26, 292);
maxArray.set(27, 292);
maxArray.set(28, 292);
maxArray.set(29, 292);
maxArray.set(30, 292);
maxArray.set(31, 292);
maxArray.set(32, 292);
maxArray.set(33, 366);
maxArray.set(34, 386);
maxArray.set(35, 386);
maxArray.set(36, 386);
maxArray.set(37, 386);
maxArray.set(38, 386);
maxArray.set(39, 386);
maxArray.set(40, 386);
maxArray.set(41, 386);
maxArray.set(42, 386);
maxArray.set(43, 386);
maxArray.set(44, 386);
maxArray.set(45, 417);
maxArray.set(46, 417);
maxArray.set(47, 417);
maxArray.set(48, 417);
maxArray.set(49, 417);
maxArray.set(50, 417);
