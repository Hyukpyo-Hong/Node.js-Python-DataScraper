exports.insertRate = (conn, game, rate, time) => {
    return new Promise((resolve, reject) => {
        var sql = 'INSERT INTO record values(?,?,?)';
        var params = [game, rate, time];
        conn.query(sql, params, function (err, results) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log("Inserted: #", game, rate, "x,", time);
                resolve(true);
            }
        });
    });
}

exports.insertError = (conn, params) => {
    return new Promise((resolve, reject) => {
        var sql = "INSERT INTO error values(?,now())"; 
        var data = "Sender couldn't send data Correctly. PayLoad: " + params;

        conn.query(sql, data, function (err, results) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log("!!!!Error Inserted: #",data);
                resolve(true);
            }
        });
    });
}