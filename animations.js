var touchX = null;
var dir = 0;
var moveSide = false;
var animation = null;
window.addEventListener('load', function() {
    document.addEventListener('touchstart', function(e) {
        touchX = e.touches[0].clientX;
        if(touchX < window.innerWidth/5 || parseFloat(getComputedStyle(document.getElementById('sidebar')).left) > -parseFloat(getComputedStyle(document.getElementById('sidebar')).width)) {
            moveSide = true;
        }
    });
    document.addEventListener('touchmove', function(e) {
        if(!touchX) {
            touchX = e.touches[0].clientX;
            return;
        }
        var newX = e.touches[0].clientX;
        var dx = newX - touchX;
        if (dx>0) dir = 1;
        else dir = -1;
        if(moveSide) {
            var newPos = parseFloat(getComputedStyle(document.getElementById('sidebar')).left) + dx;
            var sideWidth = parseFloat(getComputedStyle(document.getElementById('sidebar')).width);
            if(newPos >= -sideWidth && newPos <= 0)
                document.getElementById('sidebar').style.left = newPos + 'px';
            else if (newPos < -sideWidth)
                document.getElementById('sidebar').style.left = -sideWidth + 'px';
            else
                document.getElementById('sidebar').style.left = 0 + 'px';
        }
        touchX = newX;
    });
    document.addEventListener('touchend', function(e) {
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
    document.getElementById('sidebar').addEventListener('scroll', function(e) {
        moveSide = false;
        document.getElementById('sidebar').style.left = '0px';
    });
});

function animMove(obj, endPos) {
    var steps = 20;
    var dur = 300;
    move(dur/steps, obj, parseFloat(getComputedStyle(obj).left), endPos, 0, steps);
}
function move(delta, obj, start, end, cStep, steps) {
    if(cStep == steps) {
        obj.style.left = end + 'px';
        return;
    }
    var curPos = (end-start)*(cStep/steps)*(cStep/steps)+start;
    obj.style.left = curPos + 'px';
    setTimeout(move, delta, delta, obj, start, end, cStep+1, steps);
}