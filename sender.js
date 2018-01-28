var config = {
    wager: {
        value: 100, type: 'balance', label: 'wager'
    },
    payout: {
        value: 2, type: 'multiplier', label: 'payout'
    }
};
var time;
var go = false;
var betAmount, betRate = 0;
var api = "https://localhost:3001";
var api = "https://ec2-34-203-159-36.compute-1.amazonaws.com:3001";


engine.on('GAME_STARTING', onGameStarted);
engine.on('GAME_ENDED', onGameEnded);

function onGameStarted() {
    makeBet();
}

function onGameEnded() {
    var lastGame = engine.history.first();
    log("Crashed at ", lastGame.bust, "x. ID:", lastGame.id);
    betAmount, betRate = 0;
    try {
        let params = "game=" + lastGame.id + "&rate=" + lastGame.bust + "&time=" + null;
        let xhr = new XMLHttpRequest();
        xhr.open("POST", api + "/crash", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                var json = JSON.parse(xhr.responseText);
                log("\r\nAPI Response:");
                if (json.bettingRate == 0 || json.investAmount == 0) {
                    log("Wait");
                    go = false;
                    bettingRate = json.bettingRate;
                    investAmount = json.investAmount;
                } else {
                    go = true;
                    log("Betting:", json.bettingRate * 100);
                    log("InvestAmount:", json.investAmount * 100);
                    //bettingRate = json.bettingRate*100;
                    //investAmount = json.investAmount*100;
                }
            } else {
                log(`xhr.status=${xhr.status}`);
                
            }
        }
        xhr.send(params);
    } catch (e) {
        log(e);
    }
}

function makeBet() {
    var now = new Date;
    time = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds() - 5);

    if (betAmount != 0 && betRate != 0) {
        engine.bet(betAmoun * 100, betRate);
        log("Betting:", bettingRate);
        log("InvestAmount:", investAmount);
    }
    // 100 = 1btc, 1.01 for 
}

