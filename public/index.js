var camera = document.getElementsByClassName('camera')[0];
var image = document.getElementsByClassName('camera-content')[0];
var imageWidth = image.getBoundingClientRect().width;
var imageHeight = image.getBoundingClientRect().height;
var container = document.getElementsByClassName('camera-container')[0];
var containerWidth = container.getBoundingClientRect().width;
var containerHeight = container.getBoundingClientRect().height;

var eventCache = [];
var prevDiff = -1;
var pointA = {};
var currentGestureX = null;

camera.addEventListener('pointerdown', function (event) {
    // Нужно для десктопа чтобы поймать pointerup вне DOM-ноды
    camera.setPointerCapture(event.pointerId);
    eventCache.push(event);
    currentGestureX = event.x;
});

var removeEvent = function (event) {
    for (var i = 0; i < eventCache.length; i++) {
        if (eventCache[i].pointerId === event.pointerId) {
            eventCache.splice(i, 1);
            break;
        }
    }
};

var calculateAngle = function (pointA, poinB) {
    return Math.atan((poinB.y - pointA.y)/(poinB.x - pointA.x));
};

var prevLeft = 0;
var counter = 0;
camera.addEventListener('pointermove', function (event) {
    event.preventDefault();

    imageWidth = image.getBoundingClientRect().width;
    imageHeight = image.getBoundingClientRect().height;


    for (var i = 0; i < eventCache.length; i++) {
        if (event.pointerId === eventCache[i].pointerId) {
            eventCache[i] = event;
            break;
        }
    }

    if (eventCache.length === 1) {
        if (!event.pressure) {
            prevLeft = parseFloat(camera.style.left) || 0;
            return;
        }
        const dx = event.x - currentGestureX;

        var currentLeft = prevLeft + dx;
        if (currentLeft > 0 || currentLeft <  containerWidth - imageWidth) {
            return;
        }
        camera.style.left = currentLeft + 'px';
    } else if (eventCache.length === 2) {
        // Calculate the distance between the two pointers
        var firstPointX = eventCache[0].clientX;
        var firstPointY = eventCache[0].clientY;
        var secondPointX = eventCache[1].clientX;
        var secondPointY = eventCache[1].clientY;

        var curDiff = Math.sqrt(Math.pow(firstPointX - secondPointX, 2) + Math.pow(firstPointY - secondPointY, 2));
        if (prevDiff === -1) {
            prevDiff = curDiff;
            pointA = {
                x: eventCache[0].clientX,
                y: eventCache[0].clientY
            };
        }
        counter++;
        if (counter < 10) {
            return;
        }

        if (Math.abs(prevDiff - curDiff) > 10) {
            var newWidth = imageWidth + (curDiff - prevDiff) * 10;
            var newHeigth = imageHeight * (newWidth/imageWidth);
            if (newWidth >= containerWidth && newHeigth >= containerHeight) {
                image.style.width = newWidth + 'px';
                currentLeft = parseFloat(camera.style.left) || 0;
                if (newWidth < Math.abs(currentLeft) + containerWidth) {
                    camera.style.left = currentLeft + Math.abs(currentLeft - containerWidth + newWidth) + 'px';
                }
            }
            prevDiff = curDiff;
        } else {
            var pointB = {
                x: eventCache[1].clientX,
                y: eventCache[1].clientY
            };
            var angle = calculateAngle(pointA, pointB);
            var opacityValue = 100 - angle * 57.2958 * 100 / 180;
            log('angle', angle);
            image.style.filter = 'opacity(' + (opacityValue > 50 ? opacityValue : 50) + '%)';
            pointA = pointB;
        }
    }
});

camera.addEventListener('pointerup', function (event) {
    removeEvent(event);
    prevLeft = parseFloat(camera.style.left) || 0;
    prevDiff = -1;
    counter = 0;
});

camera.addEventListener('pointercancel', function (event) {
    removeEvent(event);
    currentGestureX = null;
    prevDiff = -1;
    counter = 0;
});

function log(a, b) {
    var o = document.getElementsByClassName('output')[0];
    o.innerHTML += a + ' - ' + b + " <br>";
}

function clearLog(event) {
    var o = document.getElementsByTagName('output')[0];
    o.innerHTML = "";
}
