exports.downall = (conn, fs, file) => {
    return new Promise((resolve, reject) => {
        var sql = "SELECT * FROM record order by game";
        conn.query(sql, function (err, rows, fields) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                var fite = '';
                for (var i in rows) {
                    fite += rows[i].game + ',';
                    fite += rows[i].rate + '\n';
                }

                fs.writeFile(file, fite, function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                });
                resolve(file);
            }
        });
    });
}

exports.getall = (conn) => {
    return new Promise((resolve, reject) => {
        var sql = "SELECT * FROM record order by game";
        conn.query(sql, function (err, rows) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log("Loaded");
                var html = makeHtml(rows);
                resolve(html);
            }
        });
    });
}

exports.getMax = (conn) => {
    return new Promise((resolve, reject) => {
        var sql = "SELECT * FROM max_table order by rate";
        conn.query(sql, function (err, rows) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                var array = {};
                for (i in rows) {
                    array[rows[i].rate] = rows[i].max;
                }
                resolve(array);
            }
        });
    });
}

exports.getRate = (conn) => {
    return new Promise((resolve, reject) => {
        var sql = "SELECT * FROM rate order by rate";
        conn.query(sql, function (err, rows) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                var array = {};
                for (i in rows) {
                    array[rows[i].rate] = rows[i].loss;
                }
                resolve(array);
            }
        });
    });
}


exports.getRecent = (conn, number) => {
    return new Promise((resolve, reject) => {
        var sql = "select * from record order by game desc limit ? offset 0;";
        conn.query(sql, [number], function (err, rows) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                var recent = {};
                
                for (i in rows) {
                    recent[rows[i].game] = rows[i].rate;
                }

                console.log("Fetched");                
                resolve(recent);
            }
        });
    });
}

// max array -> Maximum lose count, [rate,max]
// rate array -> Failure rate per one game [rate, loss]
exports.rate_calculate = (max_array, rate_array, recent_array) => {
    return new Promise((resolve, reject) => {
        const log = console.log;
        log("HEY");
        max_array_minMax = getminMax(max_array);
        recent_array_minMax = getminMax(recent_array);
        max_array_min = max_array_minMax['min'];
        max_array_max = max_array_minMax['max'];
        recent_array_min = recent_array_minMax['min'];
        recent_array_max = recent_array_minMax['max'];
        var rate_condition = 0.05;

        log("Survery on the latest", (recent_array_max - recent_array_min + 1), "data.");
        log("#", recent_array_max, recent_array[recent_array_max]);
        log("#", recent_array_max - 1, recent_array[recent_array_max - 1]);
        log("#", recent_array_max - 2, recent_array[recent_array_max - 2]);
        log(`Apply Condition: Below ${rate_condition * 100}%`);
        log("------------------------------------------------------------\n");
        var array = [];
        var t = 0;
        var prev = 0;

        for (i = max_array_max * 100; i >= max_array_min * 100; i--) {
            var max = max_array[i / 100];
            var count = 0;

            for (j = recent_array_max; j >= recent_array_min; j--) {
                var temp = recent_array[j];
                if (temp.search(",") >= 0) {
                    temp = removeCommas(temp);
                }

                if (temp >= (i / 100)) {
                    break;
                } else {
                    count++;
                }
            }
            var Minimum_rate = 100;
            var Minimum_msg;

            var loss_rate = rate_array[i / 100];
            var next_loss_rate = Math.pow(loss_rate, count + 1);
            if (next_loss_rate >= 0) {
                if (next_loss_rate <= rate_condition && i >= 200) {
                    if (prev == next_loss_rate) {
                    }
                    else {
                        let msg = `${(i / 100)} x   : ${Math.round(next_loss_rate * 10000) / 100}% => ${Math.round(next_loss_rate * loss_rate * 10000) / 100}% , ${count}/${max} Passed`;
                        if (next_loss_rate < Minimum_rate) {
                            Minimum_msg = msg;
                        }
                        array[t] = msg;
                        t++;
                        prev = next_loss_rate;
                    }
                }
            }
        }

        if (array.length > 0) {
            log("***** Let's Bet! *****");
            log("<Best Rate>    ");
            log(`${Minimum_msg}`);
            log("\n------------------------------------------------------------\n");
            log("<All List>    ");

        }
        for (p = 0; p <= array.length - 1; p++) {
            log(array[p]);
        }
        resolve("\n\n\n------------------------------------------------------------");
    });
}

exports.max_calculate = (max_array, recent_array) => {
    return new Promise((resolve, reject) => {
        const mybudget = 4000;

        max_array_minMax = getminMax(max_array);
        recent_array_minMax = getminMax(recent_array);
        max_array_min = max_array_minMax['min'];
        max_array_max = max_array_minMax['max'];
        recent_array_min = recent_array_minMax['min'];
        recent_array_max = recent_array_minMax['max'];

        console.log("My Budget: ", mybudget, "  Survery on the latest", (recent_array_max - recent_array_min + 1), "games.")
        console.log(recent_array[recent_array_max], "Game#", recent_array_max);
        console.log(recent_array[recent_array_max - 1], "Game#", recent_array_max - 1);
        console.log(recent_array[recent_array_max - 2], "Game#", recent_array_max - 2);
        console.log("------------------------------------------------------------\n");
        var array = [];
        var t = 0;
        for (i = max_array_min * 10; i <= max_array_max * 10; i++) {
            var max = max_array[i / 10];
            var count = 0;

            for (j = recent_array_max; j >= recent_array_min; j--) {
                var temp = recent_array[j];
                if (temp.search(",") >= 0) {
                    temp = removeCommas(temp);
                }

                if (temp >= (i / 10)) {
                    break;
                } else {
                    count++;
                }
            }

            var delta = max - count;
            if (delta <= 25 && i > 19) {
                if (count > max * 3) {
                    let msg = "Rate " + (i / 10) + " will win within " + (max - count) + " Games, Passed " + count + " / " + max;
                    array[t] = msg;
                    t++;
                }

            }
        }

        const log = console.log;
        if (array.length > 0) {
            log("***** Let's Bet! *****\n")
        }
        for (p = array.length - 1; p >= 0; p--) {
            log(array[p]);
        }
        resolve("\n\n\n------------------------------------------------------------");
    });
}

function removeCommas(str) {
    while (str.search(",") >= 0) {
        str = (str + "").replace(',', '');
    }
    return str;
};

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

function makeHtml(rows) {
    var html = '';
    html += '<table>';
    html += '<thead>';
    html += '<th class="text-center">No</th>';
    html += '<th class="text-center">Game No.</th>';
    html += '<th class="text-center">Rate</th>';
    html += '</thead>';
    html += '<tbody>';
    for (var i in rows) {
        html += `<tr>`;
        html += '<td>' + i + '</td>';
        html += '<td>' + rows[i].game + '</td>';
        html += '<td>' + rows[i].rate + '</td>';
        html += `</tr>`;
    }
    html += '</tbody>';
    html += '</table>';

    return html;
}