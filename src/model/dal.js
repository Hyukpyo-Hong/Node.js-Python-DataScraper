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
                resolve(recent);
            }
        });
    });
}
exports.calculate = (max_array, recent_array) => {
    return new Promise((resolve, reject) => {
        const mybudget = 3613;

        max_array_minMax = getminMax(max_array);
        recent_array_minMax = getminMax(recent_array);
        max_array_min = max_array_minMax['min'];
        max_array_max = max_array_minMax['max'];
        recent_array_min = recent_array_minMax['min'];
        recent_array_max = recent_array_minMax['max'];
        
        console.log("My Budget: ", mybudget)
        console.log("Survery on the latest",(recent_array_max-recent_array_min),"games.");
        console.log("Min_max Table is based on the latest ",(max_array_max-max_array_min),"games.");
        console.log(recent_array[recent_array_max], "Game#", recent_array_max);
        console.log(recent_array[recent_array_max - 1], "Game#", recent_array_max - 1);
        console.log(recent_array[recent_array_max - 2], "Game#", recent_array_max - 2);
        console.log("------------------------------------------------------------");

        for (i = max_array_min * 10; i <= max_array_max * 10; i++) {
            var max = max_array[i / 10];
            var count = 0;

            for (j = recent_array_max; j >= recent_array_min; j--) {
                //console.log("Compare with ", i / 10, "(max: ", max_array[i/10], ") with Game#", j, "(", recent_array[j], ")");
                if (recent_array[j] > (i / 10)) {
                    break;
                } else {
                    count++;
                }
            }
            //console.log("Count:",count,"Max:",max_array[i/10]);
            if (count < max_array[i / 10] && count > max_array[i / 10] * 0.3) {
                console.log("Rate", (i / 10), "will win within", max_array[i / 10] - count, "Games, Passed", count, "/", max_array[i / 10]);
                console.log('\u0007');
            } else {
                //  console.log("Rate ", (i / 10), " is negative.");
            }
        }
        resolve("------------------------------------------------------------");
    });
}
function getminMax(array) {
    value = {}
    value['min'] = 100000000;
    value['max'] = 0;

    for (key in array) {
        if (key > value['max']) {
            value['max'] = key;
        }
        if (key < value['min']) {
            value['min'] = key;
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