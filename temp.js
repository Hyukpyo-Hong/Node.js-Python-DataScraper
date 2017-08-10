var fs = require('fs');
function log() {
        
    for(i = 0; i < arguments.length; i++) {
        fs.appendFileSync('log2.txt', arguments[i]+" ", encoding = 'utf8');
    }
    fs.appendFileSync('log2.txt',"\n", encoding = 'utf8');
  }

log(3,4,5,6,"34");
