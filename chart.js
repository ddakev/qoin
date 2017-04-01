var WIDTH = null;
var HEIGHT = null;
var color = '#67C8FF';
var axisColor = '#666666';
var stroke = 1;
var padding = 10;
var randPoints = [{x: 2, y: 5}, {x: 5, y: 20}, {x: 8, y: 23}, {x: 12, y: 12}, {x: 15, y: 30}, {x: 20, y: 45}, {x: 23, y: 60}, {x: 25, y: 55}, {x: 28, y: 40}];
var xBounds = null;
var yBounds = null;
window.addEventListener('load', function() {
    var canvas = document.getElementsByTagName('canvas')[0];
    var ctx = canvas.getContext('2d');
    WIDTH = canvas.width - 2 * padding;
    HEIGHT = canvas.height - 2 * padding;
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
    ctx.strokeStyle = color;
    ctx.lineWidth = stroke;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
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
    
    ctx.strokeStyle = axisColor;
    ctx.beginPath();
    var origin = getCoords({x: xBounds.low, y: yBounds.low});
    ctx.moveTo(padding/2, origin.y + padding);
    ctx.lineTo(WIDTH+3*padding/2, origin.y + padding);
    ctx.stroke();
}

function getCoords(p) {
    var leftThres = 0; // WIDTH/10
    var bottomThres = HEIGHT / 10;
    var xCoord = ((p.x-xBounds.low)/(xBounds.high-xBounds.low)) * (WIDTH-leftThres) + leftThres;
    var yCoord = (HEIGHT-bottomThres) - ((p.y-yBounds.low)/(yBounds.high-yBounds.low)) * (HEIGHT-bottomThres);
    xCoord += padding;
    yCoord += padding;
    return {x: xCoord, y: yCoord};
}