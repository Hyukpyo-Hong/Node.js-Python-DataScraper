//DB connection
var mysql = require('mysql');

var conn = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'bustapick'
});
conn.connect();

const get_minmax = (conn) => {
    var value = [];
    return new Promise((resolve, reject) => {
        sql = "select max(game) as max, min(game) as min from record"
        conn.query(sql, function (err, rows, fields) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                value[0] = rows[0].min;
                value[1] = rows[0].max;

                resolve(value);
            }
        })
    })
}

const create = (conn, value, start_rate, end_rate) => {
    return new Promise((resolve, reject) => {
        var minGame = value[0];
        var maxGame = value[1];
        var maxArray = {};
        var sql = "select rate from record where game= ?";
        var compare = start_rate * 100;
        var idx = minGame;        
        var max = 0;
        var submax = 0;

        (function loop() {
            if (idx <= maxGame) {
                conn.query(sql, idx, function (err, rows, fields) {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        var rate = rows[0].rate;
                        if (rate < (compare / 100)) {
                            submax++;
                        } else {
                            if (submax > max) {
                                max = submax;
                            }
                            submax = 0;
                        }
                        idx += 1;
                        loop();
                    }
                })
            } else {
                maxArray[(compare / 100)] = max;
                if (compare < (end_rate * 100)) {
                    console.log("comapre: ", compare / 100, " max: ", max);
                    max = 0;
                    submax = 0;
                    compare += 1;
                    idx = minGame;
                    loop();
                } else {
                    resolve(maxArray);
                }
            }
        }());
    });
};
// Maybe need to Make CSV file by date
const input = (conn, array, start_rate, end_rate) => {
    return new Promise((resolve, reject) => {
        var idx = start_rate*100;
        var sql = "insert into max_table values(?,?)";

        (function loop() {
            if (idx <= end_rate*100) {
                conn.query(sql, [idx/100, array[idx/100]], function (err, rows, fields) {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        idx += 1;
                        loop();
                    }
                })
            } else {
                resolve();
                
            }
        }());
    });
};


function make_Max_Table(start_rate, end_rate) {
    get_minmax(conn).then((value) => {
        console.log("Min-Max: ", value[0], value[1], " ", value[1] - value[0], " data");
        create(conn, value, start_rate, end_rate).then((array) => {
            for (key in array) {
                console.log(key, array[key]);
            }
            input(conn, array, start_rate, end_rate).then(() => {
                console.log("Finish!");
                process.exit();
            })

        });
    })
};

make_Max_Table(10.01, 15.00);


