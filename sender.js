engine.on('game_crash', function (data) {
    try{
    var url = "https://localhost:3000/crash";
    var params = "crash=" + data.game_crash;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(params);
    }catch(e){
        
    }

});

