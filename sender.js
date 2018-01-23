var time, investAmount, bettingRate;
var go = false;
//var api = "https://localhost:3001";
var api = "https://ec2-34-203-159-36.compute-1.amazonaws.com:3001";

console.clear();

engine.on('game_starting', function (info) {
    var now = new Date;
    time = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds() - 5);
    if (investAmount == null && bettingRate == null) {
        console.log("API doesn't reply Invest Information.");
    }
    else if (go) {
        engine.placeBet(investAmount, bettingRate, false);
        console.log(`--------------------------------------\r\n#Go ${investAmount} bits(/100) on Rate ${bettingRate}(/100)`);
    };
});



engine.on('game_crash', function (data) {
    try {
        // Initializer 
        go = false;
        investAmount = null;
        bettingRate = null;

        //Pick the latest Game Number and Rate
        var pattern = "/game/";
        var els = document.querySelectorAll("a[href^='/game/'] > span");        
        let game = els[0].parentElement.getAttribute("href");
        game = game.substr(pattern.length);
        let rate = els[0].innerHTML;

        // Get the Rate from Socket IO to Compare
        var socketResult = data.game_crash / 100;
        socketResult = Math.round(socketResult * 100) / 100;

        // Show Information
        console.clear();
        console.log(game, ": ", rate, " SocketIO#:", socketResult);
        console.log(new Date(time).toUTCString());

        // Validate and Send to API
        if (socketResult == rate && (typeof game != 'undefined' && typeof rate != 'undefined' && typeof time != 'undefined')) {
            let params = "game=" + game + "&rate=" + rate + "&time=" + time;
            let xhr = new XMLHttpRequest();
            xhr.open("POST", api + "/crash", true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function () {
                if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                    var json = JSON.parse(xhr.responseText);
                    console.log("\r\nAPI Response:");
                    if (json.bettingRate == 0 || json.investAmount == 0) {
                        console.log("Wait");
                        go = false;
                        bettingRate = json.bettingRate;
                        investAmount = json.investAmount;
                    } else {
                        go = true;
                        console.log("Betting:", json.bettingRate*100);
                        console.log("InvestAmount:", json.investAmount*100);
                        //bettingRate = json.bettingRate*100;
                        //investAmount = json.investAmount*100;
                    }
                }else{
                    console.log(`xhr.status=${xhr.status}`);
                }
            }
            xhr.send(params);
        } else {
            let params = "params=" + game + " " + rate + " " + time;
            let xhr = new XMLHttpRequest();
            xhr.open("POST", api + "/error", true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(params);
        }
    } catch (e) {
        console.log(e);
    }
});

