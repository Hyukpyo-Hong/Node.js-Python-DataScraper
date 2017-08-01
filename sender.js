engine.on('game_crash', function (data) {    
    $.ajax({
        url: "ec2-54-204-184-186.compute-1.amazonaws.com:3000/crash",
        type: "POST",
        data: {
            'crash': (data.game_crash / 100),
        },
    });
});

