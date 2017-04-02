var WIDTH = null;
var HEIGHT = null;
var color = '#2196F3';
var axisColor = '#999999';
var scaleLinesColor = '#999999';
var stroke = 1;
var scaleLines = 5;
var paddingX = 30;
var paddingY = 10;
var randPoints = [{x: 2, y: 5}, {x: 5, y: 20}, {x: 8, y: 23}, {x: 12, y: 12}, {x: 15, y: 60}, {x: 20, y: 45}, {x: 23, y: -20}, {x: 25, y: -5}, {x: 28, y: 10}];
var xBounds = null;
var yBounds = null;
var canvas = null;
var ctx = null;
var points = null;
var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
window.addEventListener('load', function() {
    canvas = document.getElementsByTagName('canvas')[0];
    canvas.width = parseInt(getComputedStyle(canvas).width);
    canvas.height = parseInt(getComputedStyle(canvas).height);
    ctx = canvas.getContext('2d');
    WIDTH = canvas.width - paddingX;
    HEIGHT = canvas.height - 2 * paddingY;
    //setChartingPoints(randPoints);
});

function setChartingPoints(chPoints) {
    points = chPoints;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawChart(ctx, points);
    return;
}

function drawChart(ctx, pts, tPos) {
    xBounds = {low: pts[0].x, high: pts[0].x};
    yBounds = {low: pts[0].y, high: pts[0].y};
    for(var i=1; i<pts.length; i++) {
        if(pts[i].x<xBounds.low) xBounds.low = pts[i].x;
        if(pts[i].x>xBounds.high) xBounds.high = pts[i].x;
        if(pts[i].y<yBounds.low) yBounds.low = pts[i].y;
        if(pts[i].y>yBounds.high) yBounds.high = pts[i].y;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.font = 'auto Roboto';
    
    // draw x-axis
    ctx.strokeStyle = axisColor;
    ctx.strokeWidth = 2;
    ctx.beginPath();
    var origin = getCoords({x: xBounds.low, y: yBounds.low});
    ctx.moveTo(paddingX/2, HEIGHT + paddingY);
    ctx.lineTo(WIDTH+paddingX*2, HEIGHT + paddingY);
    ctx.stroke();
    
    // draw scale lines
    ctx.font = '12px Roboto';
    ctx.strokeWidth = 1;
    var diff = yBounds.high - yBounds.low;
    var scaleDiff = diff/scaleLines;
    var gDiff = 1;
    var dir = 0;
    if(gDiff * scaleLines > diff) dir = 0;
    else dir = 1;
    while(1) {
        if(gDiff*scaleLines > diff && dir == 0) {
            gDiff /= 2;
        }
        if(gDiff*scaleLines<=diff && dir == 0) {
            gDiff *= 2;
            break;
        }
        if(gDiff*scaleLines > diff && dir == 0) {
            gDiff /= 5;
        }
        if(gDiff*scaleLines<=diff && dir == 0) {
            gDiff *= 5;
            break;
        }
        if(gDiff*(scaleLines-1) < diff && dir == 1) {
            gDiff *= 5;
        }
        if(gDiff*(scaleLines-1) >= diff && dir == 1) {
            gDiff /= 5;
            break;
        }
        if(gDiff*(scaleLines-1) < diff && dir == 1) {
            gDiff *= 2;
        }
        if(gDiff*(scaleLines-1) >= diff && dir == 1) {
            gDiff /= 2;
            break;
        }
    }
    scaleDiff = gDiff;
    var sLine = Math.ceil(yBounds.low/scaleDiff)*scaleDiff;
    for(var i=sLine; i<=yBounds.high; i+=scaleDiff) {
        var p = getCoords({x: xBounds.low, y: i});
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.strokeWidth = 1;
        ctx.strokeStyle = scaleLinesColor;
        if(Math.abs(i) < 0.0001) {
            ctx.globalAlpha = 1.0;
            ctx.strokeStyle = '#EF5350';
        }
        ctx.moveTo(paddingX, p.y);
        ctx.lineTo(WIDTH+paddingX, p.y);
        ctx.stroke();
        ctx.fillStyle = scaleLinesColor;
        ctx.globalAlpha = 0.5;
        if(Math.abs(i) < 0.0001) {
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#EF5350';
        }
        ctx.fillText('$' + toStr(i.toFixed(2)), 0, p.y+3, paddingX*4/5);
    }
    
    //draw track line
    if(typeof tPos !== 'undefined') {
        ctx.fillStyle = '#666666';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(tPos, 0);
        ctx.lineTo(tPos, canvas.height);
        ctx.stroke();
    }
    
    // draw graph line
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = stroke;
    ctx.beginPath();
    var p = getCoords(pts[0]);
    var minDist = canvas.width;
    var minP = null;
    ctx.moveTo(p.x, p.y);
    if(typeof tPos !== 'undefined') {
        if(Math.abs(tPos - p.x) < minDist) {
            minDist = Math.abs(tPos - p.x);
            minP = pts[0];
        }
    }
    for(var i=1; i<pts.length; i++) {
        var p = getCoords(pts[i]);
        if(typeof tPos !== 'undefined') {
            if(Math.abs(tPos - p.x) < minDist) {
                minDist = Math.abs(tPos - p.x);
                minP = pts[i];
            }
        }
        ctx.lineTo(p.x, p.y);
    }
    var glowStroke = stroke*6;
    var alpha = 0.125;
    for(var i=1; i<=4; i++) {
        ctx.globalAlpha = alpha;
        ctx.lineWidth = glowStroke;
        ctx.stroke();
        alpha *= 2;
        glowStroke = 5*stroke*(4-i)*(4-i)/16 + stroke;
    }
    if(typeof tPos !== 'undefined') {
        ctx.beginPath();
        ctx.fillStyle = color;
        var p = getCoords(minP);
        var rad = 5;
        ctx.arc(p.x,p.y,rad,0,2*Math.PI);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.globalAlpha = 0.5;
        var xPos = p.x+5;
        var yPos = p.y-5;
        if(xPos + 130 > canvas.width) {
            xPos = xPos - 140;
        }
        ctx.fillRect(xPos, yPos, 130, 20);
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 1.0;
        ctx.font="15px Roboto";
        ctx.fillText(dateStr(minP.x, xBounds) + ", $" + minP.y.toFixed(2), xPos+5, yPos+15, 130);
    }
    
    //label x-axis
    
}

function getCoords(p) {
    var leftThres = WIDTH / 20; // WIDTH/10
    var bottomThres = HEIGHT / 10;
    var xCoord = ((p.x-xBounds.low)/(xBounds.high-xBounds.low)) * (WIDTH-leftThres) + leftThres;
    var yCoord = (HEIGHT-bottomThres) - ((p.y-yBounds.low)/(yBounds.high-yBounds.low)) * (HEIGHT-bottomThres);
    xCoord += paddingX;
    yCoord += paddingY;
    return {x: xCoord, y: yCoord};
}

function toStr(n) {
    n = n.toString();
    var i = n.indexOf('e+');
    if(i == -1) return n;
    n = parseInt(n) * pow(10, parseInt(n.substring(i+2)));
    return n.toString();
}

function pow(n, k) {
    if(k == 0) return 1;
    if(k == 1) return n;
    return n*pow(n, k-1);
}

function track(pos) {
    if(!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawChart(ctx, points, pos);
}

function dateStr(xVal, xBounds) {
    var newD = new Date(xVal * 1000);
    var diffD = new Date((xBounds.high - xBounds.low) * 1000);
    if(diffD.getTime() >=0 && diffD.getTime() <= 2*60*60*1000) {    // 1 hour graph
        var hrs = newD.getHours();
        var ampm;
        if(hrs >= 12 ) ampm = 'pm';
        else ampm = 'am';
        if(hrs > 12) hrs -= 12;
        if(hrs == 0) hrs = 12;
        var mins = newD.getMinutes();
        if(mins >= 10) mins = mins.toString();
        else mins = "0" + mins.toString();
        return hrs + ":" + mins + ampm;
    }
    else if(diffD.getTime() <= 2*24*60*60*1000) {                   // 1 day graph
        var hrs = newD.getHours();
        var ampm;
        if(hrs >= 12 ) ampm = 'pm';
        else ampm = 'am';
        if(hrs > 12) hrs -= 12;
        if(hrs == 0) hrs = 12;
        return hrs + ":00" + ampm;
    }
    else if(diffD.getTime() <= 2*7*24*60*60*1000) {                 // 1 week graph
        return newD.getDate() + " " + monthNames[newD.getMonth()];
    }
    else if(diffD.getTime() <= 2*30*24*60*60*1000) {                // 1 month graph
        return newD.getDate() + " " + monthNames[newD.getMonth()];
    }
    else if(diffD.getTime() <= 1.5*365*24*60*60*1000) {             // 1 year graph
        return newD.getDate() + " " + monthNames[newD.getMonth()] + " " + newD.getFullYear();
    }
    else {                                                          // all time graph
        return newD.getDate() + " " + monthNames[newD.getMonth()] + " " + newD.getFullYear();
    }
}