var fs = require('fs');
fs.readFile('C:/Users/Daniel/Desktop/qoin/response.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
    //console.log(data);
   var JSONdata = JSON.parse(data);
    var cryptAbbrs = "{";
    for(var i=0; i<JSONdata.length; i++) {
        cryptAbbrs += "\"" + JSONdata[i].symbol + "\": \"" +  JSONdata[i].tokens[0] + "\",";
    }
    cryptAbbrs = cryptAbbrs.substring(0, cryptAbbrs.length-1);
    cryptAbbrs += "}";
    console.log(cryptAbbrs);
    //cryptAbbrs = JSON.parse(cryptAbbrs);
    //console.log(cryptAbbrs.BTC);
    //JSONdata[0].tokens[0]);
    //JSONdata[0].symbol
    
});