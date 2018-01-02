var betting = 3.2 * 100;
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

engine.on('game_starting', function (info) {
    console.log('------------------------');
    if (go) {
        console.log(`Go: ${invest / 100} bits on ${betting / 100}x`);
        engine.placeBet(invest, betting, false);
        lastGamePlayed = true;
    } else {
        lastGamePlayed = false;
    }
});

engine.on('game_crash', function (data) {
    var crash_result = data.game_crash;
    console.log('Result: ', crash_result / 100);
    if (lastGamePlayed == true) {
        if (crash_result >= betting) {
            console.log(`**!! Win !!** ${(invest / 100) * ((betting / 100) - 1)} bits`)
            budget += ((invest / 100) * ((betting / 100) - 1));
            invest = invest_initial;
            guide_budget = 0;
            cum_lost = 0;
            go = true;
        } else {
            console.log(`~~ Lose ~~ ${invest / 100} bits`)
            budget -= (invest / 100);
            guide_budget += invest;
            cum_lost++;
            if (cum_lost == maxCount) {
                console.log("Give Up");
                invest = Math.ceil(guide_budget / (betting - 100)) * 100;

                guide_budget = 0;
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
        console.log(`Current Budget: ${budget}`);
        console.log(`Min-Max Budget: ${min_budget} - ${max_budget}`);
    } else if (lastGamePlayed == false) {
        if (crash_result >= betting) {
            console.log("Release!");
            go = true;
        } else {
            console.log("Wait..");
        }
    }
});


engine.on('game_started', function (data) {
    //console.log('Game Started', data);
});

engine.on('player_bet', function (data) {
    //console.log('The player ', data.username, ' placed a bet. This player could be me :o.')
});

engine.on('cashed_out', function (resp) {
    //console.log('The player ', resp.username, ' cashed out. This could be me.');
});

engine.on('msg', function (data) {
    //console.log('Chat message!...');
});

engine.on('connect', function () {
    console.log('Client connected, this wont happen when you run the script');
});

engine.on('disconnect', function () {
    console.log('Client disconnected');
});



