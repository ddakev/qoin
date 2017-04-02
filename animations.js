var touchX = null;
var touchY = null;
var dx = 0;
var dir = 0;
var moveSide = false;
var trackGraph = false;
var animation = null;
var args = null;
var url = 'https://qoin-app.herokuapp.com';
var recentHistory = [];
var totalHistory = [];
var bitRecHist = '';
var bitTotHist = '';
var curBitPrice = 0;
var randRecent = [];
var randTotal = [];
window.addEventListener('load', function() {
    args = parseArgs();
    console.log(args);
    var title = document.getElementById("profile-title");
    if(document.getElementById('sell-btn')) {
        document.getElementById('sell-btn').addEventListener('click', function(e) {
            animMove(document.getElementById('sidebar'), 0);
        });
    }
    if(document.getElementById('sidebar')) {
        var sidebarReq = new XMLHttpRequest();
        sidebarReq.onreadystatechange = function() {
            if(sidebarReq.readyState == 4) {
                if(sidebarReq.status == 200) {
                    var data = JSON.parse(sidebarReq.responseText);
                    var sidebar = document.getElementById('sidebar');
                    sidebar.innerHTML = '<a class="sidebar-item" id="sidebar-dash-button" href="dash.html"><span class="big-text gain">$2341</span><br><span class="tiny-text">invested</span><br><span class="big-text gain">+$135</span><br><span class="tiny-text">profits</span><br><span class="big-text">Dashboard</span></a>\n';
                    var sData = [];
                    for(var i=0; i<data.length; i++) {
                        sData.push({code: data[i].code, change: data[i].day_change});
                    }
                    sData.sort(function(a, b) {return a.code > b.code? 1 : -1;});
                    for(var i=0; i<sData.length; i++) {
                        var newCoin = "";
                        newCoin = "<a class='sidebar-item ";
                        if(sData[i].change < 0) newCoin += "loss";
                        else newCoin += "gain";
                        newCoin += "' href='coin_profile.html?c=" + sData[i].code + "'>\n";
                        newCoin += "<div class='coin-info'>\n<span class='coin-name'>" + sData[i].code + "</span>\n";
                        newCoin += "<span class='coin-gain'>";
                        if(sData[i].change>0) newCoin += "+";
                        newCoin += (sData[i].change*100).toFixed(2) + "%</span>\n";
                        newCoin += "</div>\n</a>\n";
                        sidebar.innerHTML += newCoin;
                    }
                }
                else {
                    console.log("Error getting sidebar info");
                }
            }
        };
        sidebarReq.open('GET', url + '/coins', true);
        sidebarReq.send(null);
    }
    if(title) {
        document.getElementsByClassName('form-textbox')[0].addEventListener('keyup', function(e) {
            if(e.target.value != '') {
                document.getElementsByClassName('form-textbox')[1].value = e.target.value / recentHistory[recentHistory.length-1].y;
            }
            else {
                document.getElementsByClassName('form-textbox')[1].value = '';
            }
        });
        document.getElementsByClassName('form-textbox')[1].addEventListener('keyup', function(e) {
            if(e.target.value != '') {
                document.getElementsByClassName('form-textbox')[0].value = e.target.value * recentHistory[recentHistory.length-1].y;
            }

            else {
                document.getElementsByClassName('form-textbox')[0].value = '';
            }
        });
        document.getElementById('coinSellbtn').addEventListener('click', function(e) {
            var buttons = document.getElementsByClassName('tab-bar')[0].getElementsByClassName('tab-button');
            for(var i=0; i<buttons.length; i++) buttons[i].style.borderBottomColor = 'transparent';
            buttons[1].style.borderBottomColor = '#2196F3';
            document.getElementsByClassName('screen')[0].style.marginLeft = -window.innerWidth + 'px';
        });
        document.getElementById("confirm-purchase").addEventListener("click", function(e) {
            var buttons = document.getElementsByClassName('tab-bar')[0].getElementsByClassName('tab-button');
            for(var i=0; i<buttons.length; i++) buttons[i].style.borderBottomColor = 'transparent';
            buttons[0].style.borderBottomColor = '#2196F3';
            document.getElementsByClassName('screen')[0].style.marginLeft = 0 + 'px';
        });
    }
    var btcRHistReq = new XMLHttpRequest();
    btcRHistReq.onreadystatechange = function() {
        if(btcRHistReq.readyState == 4) {
            if(btcRHistReq.status == 200) {
                var data = JSON.parse(btcRHistReq.responseText);
                bitRecHist = "{";
                for(var i=data.length-1; i>=0; i--) {
                    bitRecHist += "\"" + data[i].date + "\": \"" + data[i].weightedAverage + "\", ";
                    randRecent.push({x: data[i].date, y: data[i].weightedAverage / Math.log(data[i].date)});
                }
                curBitPrice = data[data.length-1].weightedAverage;
                bitRecHist = bitRecHist.substring(0,bitRecHist.length-2);
                bitRecHist += "}";
                bitRecHist = JSON.parse(bitRecHist);
                
                if(document.getElementById('sell-btn')) {
                    document.getElementsByClassName('big-text gain')[1].innerHTML = '+$' + randRecent[randRecent.length-1].y.toFixed(2);
                    document.getElementsByClassName('big-text gain')[2].innerHTML = '+$' + randRecent[randRecent.length-1].y.toFixed(2);
                    document.getElementsByClassName('medium-text')[1].innerHTML = 'Current worth: $' + (2341+randRecent[randRecent.length-1].y).toFixed(2);
                }
                var newPoints = [];
                var now = Math.floor(Date.now()/1000);
                for(var j=0; j<randRecent.length; j++) {
                    if(Math.abs(now - randRecent[j].x) <= 60*60) {
                        newPoints.push(randRecent[j]);
                    }
                    else break;
                }
                setChartingPoints(newPoints);
            }
            else {
                console.log('Error when fetching bitcoin recent history');
            }
        }
    };
    btcRHistReq.open('GET', "https://poloniex.com/public?command=returnChartData&currencyPair=USDT_BTC&start=" + (Math.floor(Date.now()/1000) - 86400) + "&end=" + Math.floor(Date.now()/1000) + "&period=300", true);
    btcRHistReq.send(null);
    var btcHistReq = new XMLHttpRequest();
    btcHistReq.onreadystatechange = function() {
        if(btcHistReq.readyState == 4) {
            if(btcHistReq.status == 200) {
                var data = JSON.parse(btcHistReq.responseText);
                bitTotHist = "{";
                for(var i=data.length-1; i>=0; i--) {
                    bitTotHist += "\"" + data[i].date + "\": \"" + data[i].weightedAverage + "\", ";
                    randTotal.push({x: data[i].date, y: data[i].weightedAverage / Math.log(data[i].date)});
                }
                bitTotHist = bitTotHist.substr(0, bitTotHist.length-2);
                bitTotHist += "}";
                bitTotHist = JSON.parse(bitTotHist);
            }
            else {
                console.log('Error when fetching bitcoin total history');
            }
        }
    };
    btcHistReq.open('GET', "https://poloniex.com/public?command=returnChartData&currencyPair=USDT_BTC&start=1424304000&end=" + Math.floor(Date.now()/1000) + "&period=86400", true);
    btcHistReq.send(null);
    if(title) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if(xhttp.readyState == 4) {
                if(xhttp.status == 200) {
                    var JSONdata = JSON.parse(xhttp.responseText);
                    var gain = (JSONdata.day_change*100).toFixed(2);
                    document.getElementById("gain").innerHTML = gain + '% / $' + parseFloat(JSONdata.price).toFixed(5);
                    if(gain > 0) document.getElementById("gain").classList = 'medium-text gain';
                    else if(gain < 0) document.getElementById("gain").classList = 'medium-text loss';
                    var rhistReq = new XMLHttpRequest();
                    rhistReq.onreadystatechange = function() {
                        if(rhistReq.readyState == 4) {
                            if(rhistReq.status == 200) {
                                var histJSON = JSON.parse(rhistReq.responseText);
                                for(var i=histJSON.length-1; i>=0; i--) {
                                    var yVal = histJSON[i].weightedAverage;
                                    if(args.c != 'BTC') {
                                        if(bitRecHist[histJSON[i].date.toString()]) {
                                            yVal *= bitRecHist[histJSON[i].date.toString()];
                                        }
                                        else yVal *= curBitPrice;
                                    }
                                    recentHistory.push({x: histJSON[i].date, y: yVal});
                                }
                                var newPoints = [];
                                var now = Math.floor(Date.now()/1000);
                                for(var j=0; j<recentHistory.length; j++) {
                                    if(Math.abs(now - recentHistory[j].x) <= 60*60) {
                                        newPoints.push(recentHistory[j]);
                                    }
                                    else break;
                                }
                                setChartingPoints(newPoints);
                            }
                            else {
                                console.log('Error sending recent history request');
                            }
                        }
                    };
                    rhistReq.open('GET', JSONdata.recent_history_url, true);
                    rhistReq.send();
                    var histReq = new XMLHttpRequest();
                    histReq.onreadystatechange = function() {
                        if(histReq.readyState == 4) {
                            if(histReq.status == 200) {
                                var histJSON = JSON.parse(histReq.responseText);
                                for(var i=histJSON.length-1; i>=0; i--) {
                                    var yVal = histJSON[i].weightedAverage;
                                    if(args.c != 'BTC') {
                                        if(bitTotHist[histJSON[i].date.toString()]) {
                                            yVal *= bitTotHist[histJSON[i].date.toString()];
                                        }
                                        else yVal *= curBitPrice;
                                    }
                                    totalHistory.push({x: histJSON[i].date, y: yVal});   // wrong names
                                }
                            }
                            else {
                                console.log('Error sending total history request');
                            }
                        }
                    };
                    histReq.open('GET', JSONdata.history_url, true);
                    histReq.send(null);
                }
                else {
                    console.log('Error sending coin request');
                }
            }
        };
        xhttp.open('GET', url + '/coins/' + args.c, true);
        xhttp.send(null);
        Array.prototype.forEach.call(document.getElementsByClassName('graph-controls')[0].getElementsByClassName('tab-button'), function(tb) {
            tb.addEventListener('click', function(e) {
                var tbs = document.getElementsByClassName('graph-controls')[0].getElementsByClassName('tab-button');
                for(var i=0; i<tbs.length; i++) {
                    if(tbs[i] == e.target) {
                        if(i == 0) {                                                // last hour
                            var newPoints = [];
                            var now = Math.floor(Date.now()/1000);
                            for(var j=0; j<recentHistory.length; j++) {
                                if(Math.abs(now - recentHistory[j].x) <= 60*60) {
                                    newPoints.push(recentHistory[j]);
                                }
                                else break;
                            }
                            setChartingPoints(newPoints);
                        }
                        else if(i == 1) {                                           // last day
                            var newPoints = [];
                            var now = Math.floor(Date.now()/1000);
                            for(var j=0; j<recentHistory.length; j++) {
                                if(Math.abs(now - recentHistory[j].x) <= 24*60*60) {
                                    newPoints.push(recentHistory[j]);
                                }
                                else break;
                            }
                            setChartingPoints(newPoints);
                        }
                        else if(i == 2) {                                           // last week
                            var newPoints = [];
                            var now = Math.floor(Date.now()/1000);
                            for(var j=0; j<totalHistory.length; j++) {
                                if(Math.abs(now - totalHistory[j].x) <= 7*24*60*60) {
                                    newPoints.push(totalHistory[j]);
                                }
                                else break;
                            }
                            setChartingPoints(newPoints);
                        }
                        else if(i == 3) {                                           // last month
                            var newPoints = [];
                            var now = Math.floor(Date.now()/1000);
                            for(var j=0; j<totalHistory.length; j++) {
                                if(Math.abs(now - totalHistory[j].x) <= 30*24*60*60) {
                                    newPoints.push(totalHistory[j]);
                                }
                                else break;
                            }
                            setChartingPoints(newPoints);
                        }
                        else if(i == 4) {                                           // last year
                            var newPoints = [];
                            var now = Math.floor(Date.now()/1000);
                            for(var j=0; j<totalHistory.length; j++) {
                                if(Math.abs(now - totalHistory[j].x) <= 365*24*60*60) {
                                    newPoints.push(totalHistory[j]);
                                }
                                else break;
                            }
                            setChartingPoints(newPoints);
                        }
                        else if(i == 5) {                                           // all time
                            setChartingPoints(totalHistory);
                        }
                    }
                }
            });
        });
    }
    else if(document.getElementById('sidebar')) {
        Array.prototype.forEach.call(document.getElementsByClassName('graph-controls')[0].getElementsByClassName('tab-button'), function(tb) {
            tb.addEventListener('click', function(e) {
                var tbs = document.getElementsByClassName('graph-controls')[0].getElementsByClassName('tab-button');
                for(var i=0; i<tbs.length; i++) {
                    if(tbs[i] == e.target) {
                        if(i == 0) {                                                // last hour
                            var newPoints = [];
                            var now = Math.floor(Date.now()/1000);
                            for(var j=0; j<randRecent.length; j++) {
                                if(Math.abs(now - randRecent[j].x) <= 60*60) {
                                    newPoints.push(randRecent[j]);
                                }
                                else break;
                            }
                            setChartingPoints(newPoints);
                        }
                        else if(i == 1) {                                           // last day
                            var newPoints = [];
                            var now = Math.floor(Date.now()/1000);
                            for(var j=0; j<randRecent.length; j++) {
                                if(Math.abs(now - randRecent[j].x) <= 24*60*60) {
                                    newPoints.push(randRecent[j]);
                                }
                                else break;
                            }
                            setChartingPoints(newPoints);
                        }
                        else if(i == 2) {                                           // last week
                            var newPoints = [];
                            var now = Math.floor(Date.now()/1000);
                            for(var j=0; j<randTotal.length; j++) {
                                if(Math.abs(now - randTotal[j].x) <= 7*24*60*60) {
                                    newPoints.push(randTotal[j]);
                                }
                                else break;
                            }
                            setChartingPoints(newPoints);
                        }
                        else if(i == 3) {                                           // last month
                            var newPoints = [];
                            var now = Math.floor(Date.now()/1000);
                            for(var j=0; j<randTotal.length; j++) {
                                if(Math.abs(now - randTotal[j].x) <= 30*24*60*60) {
                                    newPoints.push(randTotal[j]);
                                }
                                else break;
                            }
                            setChartingPoints(newPoints);
                        }
                        else if(i == 4) {                                           // last year
                            var newPoints = [];
                            var now = Math.floor(Date.now()/1000);
                            for(var j=0; j<randTotal.length; j++) {
                                if(Math.abs(now - randTotal[j].x) <= 365*24*60*60) {
                                    newPoints.push(randTotal[j]);
                                }
                                else break;
                            }
                            setChartingPoints(newPoints);
                        }
                        else if(i == 5) {                                           // all time
                            setChartingPoints(randTotal);
                        }
                    }
                }
            });
        });
    }
    if(title) {
        if(typeof cryptAbbrs[args.c] == 'undefined') {
            title.innerHTML = args.c + " (" + args.c + ")";
            document.getElementsByClassName('screen')[1].getElementsByClassName('medium-text')[0].innerHTML = 'per ' + args.c;
            document.title = args.c + " Profile - Qoin";
        }
        else {
            title.innerHTML = cryptAbbrs[args.c] + " (" + args.c + ")";
            document.getElementsByClassName('screen')[1].getElementsByClassName('medium-text')[0].innerHTML = 'per ' + cryptAbbrs[args.c];
            document.title = cryptAbbrs[args.c] + " Profile - Qoin";
        }
        document.getElementsByClassName('screen')[1].getElementsByTagName('input')[3].placeholder = "0 " + args.c;
        setTimeout("document.getElementsByClassName('screen')[1].getElementsByClassName('big-text')[0].innerHTML = '$' + recentHistory[recentHistory.length-1].y.toFixed(5)", 500);
    }
    try {
        document.getElementById('sidebar').style.left = -parseFloat(getComputedStyle(document.getElementById('sidebar')).width) + 'px';
    }
    catch(e) {
        console.log('sidebar not available');
    }
    try {
        document.getElementById('menu-btn').style.width = parseFloat(getComputedStyle(document.getElementsByClassName('tab-bar')[0]).height)*5/8 + 'px';
        document.getElementById('menu-btn').style.height = parseFloat(getComputedStyle(document.getElementsByClassName('tab-bar')[0]).height)*5/8 + 'px';
        document.getElementById('menu-btn').style.top = parseFloat(getComputedStyle(document.getElementsByClassName('tab-bar')[0]).height)*3/16 + 'px';
        document.getElementById('menu-btn').addEventListener('click', function(e) {
            if(parseFloat(getComputedStyle(document.getElementById('sidebar')).left) > -parseFloat(getComputedStyle(document.getElementById('sidebar')).width)) {
                animMove(document.getElementById('sidebar'), -parseFloat(getComputedStyle(document.getElementById('sidebar')).width));
            }
            else {
                animMove(document.getElementById('sidebar'), 0);
            }
        });
    }
    catch(e) {
        console.log('menu-btn not available');
    }
    try {
        document.addEventListener('touchstart', function(e) {
            touchX = e.touches[0].clientX;
            touchY = e.touches[0].clientY;
            var gLx = document.getElementsByTagName('canvas')[0].offsetLeft;
            var gLy = document.getElementsByTagName('canvas')[0].offsetTop;
            var gUx = gLx + parseFloat(getComputedStyle(document.getElementsByTagName('canvas')[0]).width);
            var gUy = gLy + parseFloat(getComputedStyle(document.getElementsByTagName('canvas')[0]).height);
            if(touchX < window.innerWidth/6 || parseFloat(getComputedStyle(document.getElementById('sidebar')).left) > -parseFloat(getComputedStyle(document.getElementById('sidebar')).width)) {
                moveSide = true;
            }
            else moveSide = false;
            if(touchX >= gLx && touchX <= gUx && touchY >= gLy && touchY <= gUy) {
                trackGraph = true;
                track(touchX-gLx);
                return;
            }
        });
        document.addEventListener('touchmove', function(e) {
            if(moveSide) {
                if(!touchX) {
                    touchX = e.touches[0].clientX;
                    return;
                }
                var newX = e.touches[0].clientX;
                dx = newX - touchX;
                if (dx>0) dir = 1;
                else dir = -1;
                var newPos = parseFloat(getComputedStyle(document.getElementById('sidebar')).left) + dx;
                var sideWidth = parseFloat(getComputedStyle(document.getElementById('sidebar')).width);
                if(newPos >= -sideWidth && newPos <= 0)
                    document.getElementById('sidebar').style.left = newPos + 'px';
                else if (newPos < -sideWidth)
                    document.getElementById('sidebar').style.left = -sideWidth + 'px';
                else
                    document.getElementById('sidebar').style.left = 0 + 'px';
                touchX = newX;
            }
            else if(trackGraph) {
                var newX = e.touches[0].clientX;
                var newY = e.touches[0].clientY;
                track(newX - document.getElementsByTagName('canvas')[0].offsetLeft);
                touchX = newX;
                touchY = newY;
            }
        });
        document.addEventListener('touchend', function(e) {
            if(trackGraph) {
                track();
                trackGraph = false;
            }
            if(dir == 0 && parseFloat(getComputedStyle(document.getElementById('sidebar')).left) > -parseFloat(getComputedStyle(document.getElementById('sidebar')).width) && touchX > parseFloat(getComputedStyle(document.getElementById('sidebar')).width)) {
                animMove(document.getElementById('sidebar'), -parseFloat(getComputedStyle(document.getElementById('sidebar')).width));
            }
            if(moveSide && dir != 0) {
                if(dir == 1) {
                    animMove(document.getElementById('sidebar'), 0);
                }
                else {
                    animMove(document.getElementById('sidebar'), -parseFloat(getComputedStyle(document.getElementById('sidebar')).width));
                }
                moveSide = false;
                dir = 0;
            }
        });
    }
    catch(e) {
        console.log('touch events not available on page');
    }
    try {
        document.getElementById('sidebar').addEventListener('scroll', function(e) {
            moveSide = false;
            document.getElementById('sidebar').style.left = '0px';
        });
        Array.prototype.forEach.call(document.getElementsByClassName('graph-controls')[0].getElementsByClassName('tab-button'), function(tb) {
            tb.addEventListener('click', function(e) {
                var buttons = document.getElementsByClassName('graph-controls')[0].getElementsByClassName('tab-button');
                for(var i=0; i<buttons.length; i++) {
                    buttons[i].style.borderBottomColor = 'transparent';
                    buttons[i].style.boxShadow = '0 15px 30px -10px transparent';
                }
                for(var i=0; i<buttons.length; i++) {
                    if(buttons[i] === e.target) {
                        buttons[i].style.borderBottomColor = '#2196F3';
                        buttons[i].style.boxShadow = '0 15px 30px -10px rgba(33,150,243, 0.6)';
                        break;
                    }
                }
            });
        });
    }
    catch(e) {
        console.log('graph controls problem');
    }
    try {
        Array.prototype.forEach.call(document.getElementsByClassName('tab-bar')[0].getElementsByClassName('tab-button'), function(tb) {
            tb.addEventListener('click', function(e) {
                var buttons = document.getElementsByClassName('tab-bar')[0].getElementsByClassName('tab-button');
                for(var i=0; i<buttons.length; i++) buttons[i].style.borderBottomColor = 'transparent';
                for(var i=0; i<buttons.length; i++) {
                    if(buttons[i] === e.target) {
                        buttons[i].style.borderBottomColor = '#2196F3';
                        document.getElementsByClassName('screen')[0].style.marginLeft = -window.innerWidth*i + 'px';
                        break;
                    }
                }
            });
        });
    }
    catch(e) {
        console.log('tab-bar not available on page');
    }
});

function animMove(obj, endPos) {
    var steps = 20;
    var dur = 300;
    move(dur/steps, obj, parseFloat(getComputedStyle(obj).left), endPos, Math.min(steps-1, Math.round(Math.abs(dx))), steps);
}
function move(delta, obj, start, end, cStep, steps) {
    if(cStep == steps) {
        obj.style.left = end + 'px';
        dx = 0;
        return;
    }
    var curPos = (end-start)*(cStep/steps)*(cStep/steps)+start;
    obj.style.left = curPos + 'px';
    setTimeout(move, delta, delta, obj, start, end, cStep+1, steps);
}

function parseArgs() {
    var i = window.location.href.indexOf('?');
    if(i == -1) return;
    var argStr = window.location.href.substring(i+1);
    var args = {};
    var v;
    while((v = argStr.indexOf('&')) != -1) {
        var es = argStr.indexOf('=');
        var argKey = argStr.substring(0, es);
        var argVal = argStr.substring(es+1, v);
        argStr = argStr.substring(v+1);
        args[argKey] = argVal;
    }
    var es = argStr.indexOf('=');
    var argKey = argStr.substring(0, es);
    var argVal = argStr.substring(es+1);
    args[argKey] = argVal;
    return args;
}