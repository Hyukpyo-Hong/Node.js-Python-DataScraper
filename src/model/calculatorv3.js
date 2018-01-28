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
    return (`Final Budget: ${Math.round(budget*100)/100} Bits, Max Cumulative Spent Money: ${MaxCumulativeInvestAmount} Bits.`);
}

exports.init = () => {
    thredsholdAdjust();
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
            initializer();
        }
        previousGameNumber = game;

        // Store Crash Result            
        log(`[Crash] ${rate}x ${gameNumber}th Game(#${game})`);

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
            calculateBeforeCrash();
            log(`[  Go ] ${bettingRate}x ${investAmount} bits`);
            result.bettingRate = bettingRate;
            result.investAmount = investAmount;

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
        thredshold = 28;
    } else if (budget > 5445281) {
        thredshold = 27;
    } else if (budget > 3300169) {
        thredshold = 26;
    } else if (budget > 2000101) {
        thredshold = 25;
    } else if (budget > 1212181) {
        thredshold = 24;
    } else if (budget > 734654) {
        thredshold = 23;
    } else if (budget > 445244) {
        thredshold = 22;
    } else if (budget > 269844) {
        thredshold = 21;
    } else if (budget > 163541) {
        thredshold = 20;
    } else if (budget > 99115) {
        thredshold = 19;
    } else if (budget > 60069) {
        thredshold = 18;
    } else if (budget > 36405) {
        thredshold = 17;
    } else if (budget > 22063) {
        thredshold = 16;
    } else if (budget > 13371) {
        thredshold = 15;
    } else if (budget > 8103) {
        thredshold = 14;
    } else if (budget > 4910) {
        thredshold = 13;
    } else if (budget > 2975) {
        thredshold = 12;
    } else {
        thredshold = 9;
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

        // Find rate will win 100% and less than 9.7
        if (!isFinite(probability) && key <= 9.7) {
            log(`\t100% ${key} `);
            absolutePossibleArray.push(key);
        }
        else if (key >= 2 && diff <= 9) {
            log(`\tCandidate- ${key}x 1/${diff} [${maxLoseOfThisKey}], P(${Math.round(probability * 100) / 100}) Thredshold: ${thredshold}`);
            possibleArray.set(key, diff);
        }
        // Or, Find possible winning rate over rate 3.0
        else if (key >= guideRate) {
            if (diff <= thredshold && diff >= -10) {
                log(`\tCandidate- ${key}x 1/${diff} [${maxLoseOfThisKey}], P(${Math.round(probability * 100) / 100}) Thredshold: ${thredshold}`);
                possibleArray.set(key, diff);
            }
        }

    };

    // IF 100% rate is exist, Go
    if (absolutePossibleArray.length > 0) {
        go = true;
        bettingRate = arrayMax(absolutePossibleArray);
        if (bettingRate < 3) {
            let temp = Math.round(budget * 0.25);
            if (temp > investAmount) {
                investAmount = temp;
            }

        }
        absolutePossibleArray = [];
    }
    //Or possible rate is exist, Go
    else if (possibleArray.size > 0) {
        go = true;
        // Find rate which has the most highest possibiility
        let mostMinumumDiff = 1000000;
        let mostMinimumKey;
        for (var [key, diff] of possibleArray) {
            if (diff <= mostMinumumDiff) {
                mostMinumumDiff = diff;
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
    log(`\tCumulative Spent Count: ${cumulativeInvestCount}, Cumulative Spent Amount: ${cumulativeInvestAmount} Bits`);
    if (MaxCumulativeInvestAmount < cumulativeInvestAmount) {
        MaxCumulativeInvestAmount = cumulativeInvestAmount;
        log(`\tMax Cumulative Spent Count: ${cumulativeInvestCount}, Max Cumulative Spent Amount: ${cumulativeInvestAmount} Bits`);
    }
}


function calculateAfterGoAndCrash() {
    // If win
    if (resultOfThisTurn >= bettingRate) {
        let profit = Math.round((investAmount * (bettingRate - 1)) * 100) / 100
        budget += profit;
        log(`[Win] ${Math.round(budget*100)/100} Bits(Budget). Get ${Math.round((investAmount * (bettingRate - 1)) * 100) / 100} bits. Mark#${profit.toString()[0] + " x e" + (profit.toString().length - 1)}`);

        investAmount = InitialInvenstAmount;
        cumulativeInvestAmount = 0;
        cumulativeInvestCount = 0;
        lastGameWin = true;
    }
    // If lose
    else {
        budget -= investAmount;
        log(`[ Lose] ${Math.round(budget*100)/100} Bits(Budget). Lost ${investAmount} bits. `);
        if (bettingRate < 2.09) {
            investAmount = investAmount * 2;
        } else {
            investAmount = Math.round(investAmount * recoverRate);
        }
        if (budget - investAmount <= 0) {
            investAmount = budget;
        }
        lastGameWin = false;
    }
}

function initializer() {
    maxArray.forEach((value, key) => loseCountArray.set(key, 0));
}


function arrayMax(arr) {
    var len = arr.length, max = 0;
    while (len--) {
        if (arr[len] > max) {
            max = arr[len];
        }
    }
    return max;
};

function log() {
    let msg = "";
    for (let i = 0; i < arguments.length; i++) {
        msg += arguments[i] + " ";
    }
    //console.log(msg);    
    stream.write(msg + "\r\n");
}

//maxArray.set(1, 2);
maxArray.set(1.01, 3);
maxArray.set(1.02, 3);
maxArray.set(1.03, 4);
maxArray.set(1.04, 4);
maxArray.set(1.05, 4);
maxArray.set(1.06, 4);
maxArray.set(1.07, 4);
maxArray.set(1.08, 5);
maxArray.set(1.09, 5);
maxArray.set(1.1, 5);
maxArray.set(1.11, 5);
maxArray.set(1.12, 5);
maxArray.set(1.13, 6);
maxArray.set(1.14, 6);
maxArray.set(1.15, 6);
maxArray.set(1.16, 6);
maxArray.set(1.17, 7);
maxArray.set(1.18, 7);
maxArray.set(1.19, 7);
maxArray.set(1.2, 8);
maxArray.set(1.21, 8);
maxArray.set(1.22, 10);
maxArray.set(1.23, 10);
maxArray.set(1.24, 10);
maxArray.set(1.25, 10);
maxArray.set(1.26, 10);
maxArray.set(1.27, 10);
maxArray.set(1.28, 10);
maxArray.set(1.29, 11);
maxArray.set(1.3, 11);
maxArray.set(1.31, 11);
maxArray.set(1.32, 11);
maxArray.set(1.33, 11);
maxArray.set(1.34, 11);
maxArray.set(1.35, 11);
maxArray.set(1.36, 11);
maxArray.set(1.37, 11);
maxArray.set(1.38, 11);
maxArray.set(1.39, 11);
maxArray.set(1.4, 11);
maxArray.set(1.41, 11);
maxArray.set(1.42, 11);
maxArray.set(1.43, 11);
maxArray.set(1.44, 11);
maxArray.set(1.45, 11);
maxArray.set(1.46, 11);
maxArray.set(1.47, 11);
maxArray.set(1.48, 11);
maxArray.set(1.49, 12);
maxArray.set(1.5, 13);
maxArray.set(1.51, 13);
maxArray.set(1.52, 13);
maxArray.set(1.53, 13);
maxArray.set(1.54, 13);
maxArray.set(1.55, 13);
maxArray.set(1.56, 13);
maxArray.set(1.57, 13);
maxArray.set(1.58, 13);
maxArray.set(1.59, 13);
maxArray.set(1.6, 15);
maxArray.set(1.61, 15);
maxArray.set(1.62, 15);
maxArray.set(1.63, 15);
maxArray.set(1.64, 15);
maxArray.set(1.65, 15);
maxArray.set(1.66, 15);
maxArray.set(1.67, 15);
maxArray.set(1.68, 15);
maxArray.set(1.69, 15);
maxArray.set(1.7, 15);
maxArray.set(1.71, 15);
maxArray.set(1.72, 15);
maxArray.set(1.73, 15);
maxArray.set(1.74, 15);
maxArray.set(1.75, 15);
maxArray.set(1.76, 15);
maxArray.set(1.77, 15);
maxArray.set(1.78, 15);
maxArray.set(1.79, 15);
maxArray.set(1.8, 15);
maxArray.set(1.81, 15);
maxArray.set(1.82, 15);
maxArray.set(1.83, 15);
maxArray.set(1.84, 15);
maxArray.set(1.85, 15);
maxArray.set(1.86, 15);
maxArray.set(1.87, 15);
maxArray.set(1.88, 15);
maxArray.set(1.89, 15);
maxArray.set(1.9, 15);
maxArray.set(1.91, 15);
maxArray.set(1.92, 15);
maxArray.set(1.93, 16);
maxArray.set(1.94, 16);
maxArray.set(1.95, 16);
maxArray.set(1.96, 16);
maxArray.set(1.97, 18);
maxArray.set(1.98, 18);
maxArray.set(1.99, 18);
maxArray.set(2, 18);
maxArray.set(2.01, 18);
maxArray.set(2.02, 18);
maxArray.set(2.03, 18);
maxArray.set(2.04, 18);
maxArray.set(2.05, 18);
maxArray.set(2.06, 18);
maxArray.set(2.07, 18);
maxArray.set(2.08, 18);
maxArray.set(2.09, 25);
maxArray.set(2.1, 25);
maxArray.set(2.11, 25);
maxArray.set(2.12, 25);
maxArray.set(2.13, 25);
maxArray.set(2.14, 25);
maxArray.set(2.15, 25);
maxArray.set(2.16, 25);
maxArray.set(2.17, 25);
maxArray.set(2.18, 25);
maxArray.set(2.19, 25);
maxArray.set(2.2, 25);
maxArray.set(2.21, 25);
maxArray.set(2.22, 25);
maxArray.set(2.23, 25);
maxArray.set(2.24, 25);
maxArray.set(2.25, 25);
maxArray.set(2.26, 25);
maxArray.set(2.27, 25);
maxArray.set(2.28, 25);
maxArray.set(2.29, 25);
maxArray.set(2.3, 25);
maxArray.set(2.31, 25);
maxArray.set(2.32, 25);
maxArray.set(2.33, 25);
maxArray.set(2.34, 25);
maxArray.set(2.35, 25);
maxArray.set(2.36, 25);
maxArray.set(2.37, 25);
maxArray.set(2.38, 25);
maxArray.set(2.39, 26);
maxArray.set(2.4, 26);
maxArray.set(2.41, 26);
maxArray.set(2.42, 26);
maxArray.set(2.43, 26);
maxArray.set(2.44, 26);
maxArray.set(2.45, 26);
maxArray.set(2.46, 26);
maxArray.set(2.47, 26);
maxArray.set(2.48, 26);
maxArray.set(2.49, 26);
maxArray.set(2.5, 26);
maxArray.set(2.51, 26);
maxArray.set(2.52, 26);
maxArray.set(2.53, 26);
maxArray.set(2.54, 26);
maxArray.set(2.55, 26);
maxArray.set(2.56, 26);
maxArray.set(2.57, 26);
maxArray.set(2.58, 26);
maxArray.set(2.59, 26);
maxArray.set(2.6, 26);
maxArray.set(2.61, 26);
maxArray.set(2.62, 26);
maxArray.set(2.63, 26);
maxArray.set(2.64, 26);
maxArray.set(2.65, 33);
maxArray.set(2.66, 33);
maxArray.set(2.67, 33);
maxArray.set(2.68, 33);
maxArray.set(2.69, 33);
maxArray.set(2.7, 33);
maxArray.set(2.71, 33);
maxArray.set(2.72, 33);
maxArray.set(2.73, 33);
maxArray.set(2.74, 33);
maxArray.set(2.75, 33);
maxArray.set(2.76, 33);
maxArray.set(2.77, 33);
maxArray.set(2.78, 33);
maxArray.set(2.79, 33);
maxArray.set(2.8, 33);
maxArray.set(2.81, 33);
maxArray.set(2.82, 33);
maxArray.set(2.83, 33);
maxArray.set(2.84, 33);
maxArray.set(2.85, 33);
maxArray.set(2.86, 33);
maxArray.set(2.87, 33);
maxArray.set(2.88, 33);
maxArray.set(2.89, 33);
maxArray.set(2.9, 33);
maxArray.set(2.91, 33);
maxArray.set(2.92, 33);
maxArray.set(2.93, 33);
maxArray.set(2.94, 33);
maxArray.set(2.95, 33);
maxArray.set(2.96, 33);
maxArray.set(2.97, 33);
maxArray.set(2.98, 33);
maxArray.set(2.99, 33);
maxArray.set(3, 33);
maxArray.set(3.01, 35);
maxArray.set(3.02, 35);
maxArray.set(3.03, 35);
maxArray.set(3.04, 35);
maxArray.set(3.05, 35);
maxArray.set(3.06, 35);
maxArray.set(3.07, 35);
maxArray.set(3.08, 35);
maxArray.set(3.09, 35);
maxArray.set(3.1, 35);
maxArray.set(3.11, 35);
maxArray.set(3.12, 35);
maxArray.set(3.13, 35);
maxArray.set(3.14, 35);
maxArray.set(3.15, 35);
maxArray.set(3.16, 35);
maxArray.set(3.17, 35);
maxArray.set(3.18, 35);
maxArray.set(3.19, 35);
maxArray.set(3.2, 36);
maxArray.set(3.21, 36);
maxArray.set(3.22, 36);
maxArray.set(3.23, 36);
maxArray.set(3.24, 36);
maxArray.set(3.25, 36);
maxArray.set(3.26, 36);
maxArray.set(3.27, 36);
maxArray.set(3.28, 36);
maxArray.set(3.29, 36);
maxArray.set(3.3, 36);
maxArray.set(3.31, 36);
maxArray.set(3.32, 36);
maxArray.set(3.33, 36);
maxArray.set(3.34, 36);
maxArray.set(3.35, 36);
maxArray.set(3.36, 36);
maxArray.set(3.37, 36);
maxArray.set(3.38, 36);
maxArray.set(3.39, 36);
maxArray.set(3.4, 36);
maxArray.set(3.41, 36);
maxArray.set(3.42, 36);
maxArray.set(3.43, 36);
maxArray.set(3.44, 36);
maxArray.set(3.45, 36);
maxArray.set(3.46, 36);
maxArray.set(3.47, 36);
maxArray.set(3.48, 36);
maxArray.set(3.49, 36);
maxArray.set(3.5, 37);
maxArray.set(3.51, 37);
maxArray.set(3.52, 37);
maxArray.set(3.53, 37);
maxArray.set(3.54, 37);
maxArray.set(3.55, 37);
maxArray.set(3.56, 37);
maxArray.set(3.57, 37);
maxArray.set(3.58, 37);
maxArray.set(3.59, 37);
maxArray.set(3.6, 37);
maxArray.set(3.61, 37);
maxArray.set(3.62, 37);
maxArray.set(3.63, 37);
maxArray.set(3.64, 38);
maxArray.set(3.65, 38);
maxArray.set(3.66, 38);
maxArray.set(3.67, 38);
maxArray.set(3.68, 38);
maxArray.set(3.69, 38);
maxArray.set(3.7, 38);
maxArray.set(3.71, 38);
maxArray.set(3.72, 38);
maxArray.set(3.73, 38);
maxArray.set(3.74, 41);
maxArray.set(3.75, 41);
maxArray.set(3.76, 41);
maxArray.set(3.77, 41);
maxArray.set(3.78, 41);
maxArray.set(3.79, 41);
maxArray.set(3.8, 41);
maxArray.set(3.81, 41);
maxArray.set(3.82, 41);
maxArray.set(3.83, 41);
maxArray.set(3.84, 41);
maxArray.set(3.85, 42);
maxArray.set(3.86, 42);
maxArray.set(3.87, 42);
maxArray.set(3.88, 42);
maxArray.set(3.89, 42);
maxArray.set(3.9, 42);
maxArray.set(3.91, 42);
maxArray.set(3.92, 42);
maxArray.set(3.93, 42);
maxArray.set(3.94, 42);
maxArray.set(3.95, 42);
maxArray.set(3.96, 42);
maxArray.set(3.97, 42);
maxArray.set(3.98, 42);
maxArray.set(3.99, 42);
maxArray.set(4, 42);
maxArray.set(4.01, 42);
maxArray.set(4.02, 42);
maxArray.set(4.03, 42);
maxArray.set(4.04, 42);
maxArray.set(4.05, 42);
maxArray.set(4.06, 42);
maxArray.set(4.07, 42);
maxArray.set(4.08, 42);
maxArray.set(4.09, 42);
maxArray.set(4.1, 42);
maxArray.set(4.11, 42);
maxArray.set(4.12, 42);
maxArray.set(4.13, 42);
maxArray.set(4.14, 42);
maxArray.set(4.15, 42);
maxArray.set(4.16, 42);
maxArray.set(4.17, 42);
maxArray.set(4.18, 42);
maxArray.set(4.19, 42);
maxArray.set(4.2, 42);
maxArray.set(4.21, 42);
maxArray.set(4.22, 42);
maxArray.set(4.23, 42);
maxArray.set(4.24, 42);
maxArray.set(4.25, 42);
maxArray.set(4.26, 42);
maxArray.set(4.27, 42);
maxArray.set(4.28, 42);
maxArray.set(4.29, 42);
maxArray.set(4.3, 42);
maxArray.set(4.31, 42);
maxArray.set(4.32, 42);
maxArray.set(4.33, 42);
maxArray.set(4.34, 42);
maxArray.set(4.35, 42);
maxArray.set(4.36, 42);
maxArray.set(4.37, 42);
maxArray.set(4.38, 42);
maxArray.set(4.39, 45);
maxArray.set(4.4, 45);
maxArray.set(4.41, 45);
maxArray.set(4.42, 45);
maxArray.set(4.43, 45);
maxArray.set(4.44, 45);
maxArray.set(4.45, 45);
maxArray.set(4.46, 45);
maxArray.set(4.47, 45);
maxArray.set(4.48, 45);
maxArray.set(4.49, 45);
maxArray.set(4.5, 45);
maxArray.set(4.51, 45);
maxArray.set(4.52, 45);
maxArray.set(4.53, 45);
maxArray.set(4.54, 54);
maxArray.set(4.55, 54);
maxArray.set(4.56, 54);
maxArray.set(4.57, 54);
maxArray.set(4.58, 54);
maxArray.set(4.59, 54);
maxArray.set(4.6, 59);
maxArray.set(4.61, 59);
maxArray.set(4.62, 59);
maxArray.set(4.63, 59);
maxArray.set(4.64, 59);
maxArray.set(4.65, 59);
maxArray.set(4.66, 59);
maxArray.set(4.67, 59);
maxArray.set(4.68, 59);
maxArray.set(4.69, 59);
maxArray.set(4.7, 59);
maxArray.set(4.71, 59);
maxArray.set(4.72, 59);
maxArray.set(4.73, 59);
maxArray.set(4.74, 59);
maxArray.set(4.75, 59);
maxArray.set(4.76, 59);
maxArray.set(4.77, 59);
maxArray.set(4.78, 59);
maxArray.set(4.79, 59);
maxArray.set(4.8, 59);
maxArray.set(4.81, 59);
maxArray.set(4.82, 59);
maxArray.set(4.83, 59);
maxArray.set(4.84, 59);
maxArray.set(4.85, 59);
maxArray.set(4.86, 59);
maxArray.set(4.87, 59);
maxArray.set(4.88, 59);
maxArray.set(4.89, 59);
maxArray.set(4.9, 59);
maxArray.set(4.91, 59);
maxArray.set(4.92, 59);
maxArray.set(4.93, 63);
maxArray.set(4.94, 63);
maxArray.set(4.95, 63);
maxArray.set(4.96, 63);
maxArray.set(4.97, 63);
maxArray.set(4.98, 63);
maxArray.set(4.99, 63);
maxArray.set(5, 63);
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