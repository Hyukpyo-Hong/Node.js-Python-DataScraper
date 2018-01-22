
var calculator = require('./src/model/calculatorv3');
calculator.init();

const send = (game, rate) => {
    console.log(game, ": ", rate);
    let value = calculator.compute(game, rate)
    console.log("\r\nAPI Response:");
    if (value.bettingRate == 0 || value.investAmount == 0) {
        console.log("#", game, "Wait");
    } else {
        console.log("#", game, "Betting:", value.bettingRate, "InvestAmount:", value.investAmount);
    }

};

var mockarray = [];
for (let i = 0; i < 2; i++) {
    mockarray.push("9.1");
}

for (let i in mockarray) {
    send(i, mockarray[i]);
}
