var WIDTH = null;
var HEIGHT = null;
var color = '#67C8FF';
var axisColor = '#999999';
var scaleLinesColor = '#999999';
var stroke = 1;
var scaleLines = 5;
var paddingX = 30;
var paddingY = 10;
var randPoints = [{x: 2, y: 5}, {x: 5, y: 20}, {x: 8, y: 23}, {x: 12, y: 12}, {x: 15, y: 30}, {x: 20, y: 45}, {x: 23, y: 60}, {x: 25, y: 55}, {x: 28, y: 40}];
var xBounds = null;
var yBounds = null;
window.addEventListener('load', function() {
    var canvas = document.getElementsByTagName('canvas')[0];
    var ctx = canvas.getContext('2d');
    WIDTH = canvas.width - paddingX;
    HEIGHT = canvas.height - 2 * paddingY;
    drawChart(ctx, randPoints);
});

function drawChart(ctx, pts) {
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
    ctx.moveTo(paddingX, HEIGHT + paddingY);
    ctx.lineTo(WIDTH+paddingX, HEIGHT + paddingY);
    ctx.stroke();
    
    // draw scale lines
    ctx.globalAlpha = 0.5;
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
        if(gDiff*scaleLines < diff && dir == 1) {
            gDiff *= 5;
        }
        if(gDiff*scaleLines >= diff && dir == 1) {
            gDiff /= 5;
            break;
        }
        if(gDiff*scaleLines < diff && dir == 1) {
            gDiff *= 2;
        }
        if(gDiff*scaleLines >= diff && dir == 1) {
            gDiff /= 2;
            break;
        }
    }
    scaleDiff = gDiff;
    var sLine = Math.ceil(yBounds.low/scaleDiff)*scaleDiff;
    for(var i=sLine; i<=yBounds.high; i+=scaleDiff) {
        var p = getCoords({x: xBounds.low, y: i});
        ctx.beginPath();
        ctx.strokeWidth = 1;
        ctx.strokeStyle = scaleLinesColor;
        ctx.moveTo(paddingX, p.y);
        ctx.lineTo(WIDTH+paddingX, p.y);
        ctx.stroke();
        ctx.fillStyle = scaleLinesColor;
        ctx.fillText('$' + i.toPrecision(2), 0, p.y+3, paddingX*4/5);
    }
    
    // draw graph line
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = stroke;
    ctx.beginPath();
    var p = getCoords(pts[0]);
    ctx.moveTo(p.x, p.y);
    for(var i=1; i<pts.length; i++) {
        var p = getCoords(pts[i]);
        ctx.lineTo(p.x, p.y);
    }
    var glowStroke = stroke*5;
    var alpha = 0.125;
    for(var i=1; i<=4; i++) {
        ctx.globalAlpha = alpha;
        ctx.lineWidth = glowStroke;
        ctx.stroke();
        alpha *= 2;
        glowStroke = 4*stroke*(4-i)*(4-i)/16 + stroke;
    }
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