var strokes = [];
var undoneStrokes = [];

var currentStroke = {points: [], color: 'blue'};

var myCanvas;
var context;
var paddingVertical = 20;
var paddingHorizontal = 20;

var mouse = {x: 0, y: 0, z: 0};
var prevMouse = {x: 0, y: 0, z: 0};
var isStrokeStarted = false;
var cursor;
var cursorIndicator;

var cornerToolRadius = 100; // 0

var undoTicks = 0;
var redoTicks = 0;
var undoTickThreshold = 25;
var undoTickThresholdFirstTime = 100;

var undoDiv;
var redoDiv;
var undoButton;
var redoButton;

var colorBeforeUndo = 'blue';

var smoothingWindow = 15;
var mouseHistory = [];

var cursorWidth;

var colorPickerHeight = 30;

var colors = {
    upperLeft: "black",
    upperRight: "#FFB03B", //"red",
    lowerLeft: "#468966", //"green",
    lowerRight: "#B64926" //"blue"
};

var wasInsideUndoButton = false;
var wasInsideRedoButton = false;

var init = function() {
    myCanvas = document.getElementById("myCanvas");

    paddingVertical = window.innerWidth / 20;
    paddingHorizontal = 4 * paddingVertical;

    myCanvas.style.width = window.innerWidth - paddingHorizontal;
    myCanvas.width = window.innerWidth - paddingHorizontal;
    myCanvas.style.height = window.innerHeight - paddingVertical;
    myCanvas.height = window.innerHeight - paddingVertical;

    myCanvas.style.left = (paddingHorizontal/2) + "px";
    myCanvas.style.top = (paddingVertical/2) + "px";

    context = myCanvas.getContext("2d");
    cursor = document.getElementById("cursor");
    cursorIndicator = document.getElementById("cursorIndicator");

    //cursorWidth = cursor.clientWidth + parseInt(cursor.style.borderWidth); //cursor.style.width;

    undoDiv = document.getElementById("undoIcon");
    redoDiv = document.getElementById("redoIcon");
    undoButton = document.getElementById("undoButton");
    redoButton = document.getElementById("redoButton");

    undoDiv.style.left = paddingHorizontal/2 + myCanvas.clientWidth/2 - 100 + "px";
    redoDiv.style.left = undoDiv.style.left;

    undoDiv.style.top = paddingVertical/2 + myCanvas.clientHeight/2 - 50 + "px";
    redoDiv.style.top = undoDiv.style.top;

    cornerToolRadius = Math.max(100, window.innerHeight/6);

    drawTools();

    drawExtraButtons();

    /* Drawing on Paint App */
    context.lineWidth = 5;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    //setLineColor('blue');

    setLineColor(colors.upperLeft);

    document.body.onkeydown = function(e){
        //if(e.keyCode == 32 && !isStrokeStarted){
        //    console.log("Space down!");
        //    //startStroke();
        //
        //}

        if (e.keyCode == 37) {
            undo();

        } else if (e.keyCode == 39) {
            redo();
        }
    };

    document.body.onkeyup = function(e){
        if(e.keyCode == 32){
            console.log("Space pressed!");
            //endStroke();
            resetCanvas();
        }
    };
};

function getSmoothedPoint(currentMouse) {

    if (mouseHistory.length === smoothingWindow) {
        mouseHistory.shift();
    }
    mouseHistory.push({x: currentMouse.x, y: currentMouse.y});

    var avgX = mouseHistory.map(function(elt){return elt.x;}).reduce(function(a,b){return a+b}) / mouseHistory.length;
    var avgY = mouseHistory.map(function(elt){return elt.y;}).reduce(function(a,b){return a+b}) / mouseHistory.length;

    return {
        x: avgX,
        y: avgY
    };
}

function setLineColor(newColor) {
    console.log("setLineColor " + newColor);
    context.strokeStyle = newColor;
    cursor.style.border = "6px solid " + newColor;
}

function drawCircle(context, centerX, centerY, radius, color) {
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
}

function drawRect(context,left,top,width,height,color) {
    context.beginPath();
    context.rect(left, top, width, height);
    context.fillStyle = color;
    context.fill();
}

function drawTools() {

    drawRect(context,0,0,myCanvas.width/2,colorPickerHeight,colors.upperLeft);
    drawRect(context,myCanvas.width/2,0,myCanvas.width/2,colorPickerHeight,colors.upperRight);
    drawRect(context,0,myCanvas.height-colorPickerHeight,myCanvas.width/2,colorPickerHeight,colors.lowerLeft);
    drawRect(context,myCanvas.width/2,myCanvas.height-colorPickerHeight,myCanvas.width/2,colorPickerHeight,colors.lowerRight);

    //drawCircle(context,0,0,cornerToolRadius,colors.upperLeft);//'black');
    //drawCircle(context,myCanvas.width,0,cornerToolRadius,colors.upperRight);//'red');
    //drawCircle(context,0,myCanvas.height,cornerToolRadius,colors.lowerLeft);//'green');
    //drawCircle(context,myCanvas.width,myCanvas.height,cornerToolRadius,colors.lowerRight);//'blue');
}

function drawExtraButtons() {
    //var ctx = bottomPanel.getContext('2d');
    //drawCircle(ctx, bottomPanelHeight/2, bottomPanelHeight/2, bottomPanelHeight/2, '#BBBBBB');
    //drawCircle(ctx, bottomPanelHeight*3/2+50, bottomPanelHeight/2, bottomPanelHeight/2, '#BBBBBB');

    undoButton.style.left = 0 + "px"; //(padding/2) + bottomPanelHeight/6 + "px";
    undoButton.style.top = paddingVertical/2 + "px"; //myCanvas.height + (padding*3/4) + bottomPanelHeight/3 + "px";
    undoButton.style.width = paddingHorizontal/2 + "px";
    undoButton.style.height = myCanvas.height + "px";

    redoButton.style.left = myCanvas.width + paddingHorizontal/2 + 'px'; //(padding/2) + bottomPanelHeight + 50 + bottomPanelHeight/6 + "px";
    redoButton.style.top = paddingVertical/2 + "px"; //myCanvas.height + (padding*3/4) + bottomPanelHeight/3 + "px";
    redoButton.style.width = paddingHorizontal/2 + "px";
    redoButton.style.height = myCanvas.height + "px";
}

function startStroke() {
    currentStroke = {points:[], color: context.strokeStyle};
    isStrokeStarted = true;
    context.beginPath();
    context.moveTo(mouse.x, mouse.y);
}

function endStroke() {
    strokes.push({points:currentStroke.points.slice(0), color:currentStroke.color});
    isStrokeStarted = false;
    //context.beginPath();
    //context.moveTo(mouse.x, mouse.y);
    console.log(strokes);
}

// TODO: visualize the undo with an animation or icon
// TODO: define function on upper level so its visible to everything
function undo() {
    console.log(mouse);
    colorBeforeUndo = context.strokeStyle;
    if (strokes.length > 0) {
        var strokeToUndo = strokes.pop();
        undoneStrokes.push(strokeToUndo);

        redrawStrokes();
    }
    context.strokeStyle = colorBeforeUndo;
}

// TODO: visualize the redo with an animation or icon
function redo() {
    colorBeforeUndo = context.strokeStyle;
    if (undoneStrokes.length > 0) {
        var strokeToRedo = undoneStrokes.pop();
        strokes.push(strokeToRedo);

        drawStroke(strokeToRedo);
    }
    context.strokeStyle = colorBeforeUndo;
}

function redrawStrokes() {
    context.clearRect(0, 0, myCanvas.width, myCanvas.height);
    drawTools();

    strokes.forEach(function(stroke) {
        drawStroke(stroke);
    });
}

function drawStroke(stroke) {
    context.beginPath();

    context.strokeStyle = stroke.color; //"6px solid " + stroke.color;

    stroke.points.forEach(function(point, i) {
        context.beginPath();
        context.lineWidth = point[2];
        if (i == 0) {
            context.moveTo(point[0], point[1]);
        } else {
            context.moveTo(stroke.points[i-1][0], stroke.points[i-1][1]);
            context.lineTo(point[0], point[1]);
            context.stroke();
        }
    });

    //context.closePath();
    //context.fill();
}

//function drawAndFillStroke(stroke) {
//    context.beginPath();
//
//    context.strokeStyle = stroke.color; //"6px solid " + stroke.color;
//
//    stroke.points.forEach(function(point, i) {
//        context.beginPath();
//        context.lineWidth = point[2];
//        if (i == 0) {
//            context.moveTo(point[0], point[1]);
//        } else {
//            context.moveTo(stroke.points[i-1][0], stroke.points[i-1][1]);
//            context.lineTo(point[0], point[1]);
//            context.stroke();
//        }
//    });
//}

function isWithinCanvas(mouseObject) {
    return mouseObject.x > 0 && mouseObject.y > 0 && mouseObject.x < myCanvas.clientWidth && mouseObject.y < myCanvas.clientHeight;
}

function isWithinUndoButton(mouseObject) {
    return mouseObject.x < 0 && mouseObject.y > 0 && mouseObject.y < myCanvas.clientHeight;
}

function isWithinRedoButton(mouseObject) {
    return mouseObject.x > myCanvas.clientWidth && mouseObject.y > 0 && mouseObject.y < myCanvas.clientHeight;;
}

//function isWithinUndoButton(mouseObject) {
//    var undoCenterX = (padding/2) + bottomPanelHeight/2;
//    var undoCenterY = myCanvas.height + (padding/4) + bottomPanelHeight/2;
//    var dx = mouseObject.x - undoCenterX;
//    var dy = mouseObject.y - undoCenterY;
//    var dist = Math.sqrt((dx * dx + dy * dy));
//    console.log(dist);
//    return dist < (bottomPanelHeight/2);
//}
//
//function isWithinRedoButton(mouseObject) {
//    var redoCenterX = (padding/2) + bottomPanelHeight* 3/2 + 50;
//    var redoCenterY = myCanvas.height + (padding/4) + bottomPanelHeight/2;
//    var dx = mouseObject.x - redoCenterX;
//    var dy = mouseObject.y - redoCenterY;
//    return (dx * dx + dy * dy) < (bottomPanelHeight/2)*(bottomPanelHeight/2);
//}

// Called every time the Leap provides a new frame of data
Leap.loop (function(frame) {

    var hand;
    if (frame.hands.length === 0) {
        return;
    }
    hand = frame.hands[0];

    //if (!isGrabbing) {
    //    if (hand.pinchStrength >= GRAB_THRESHOLD) {
    //        isGrabbing = true;
    //    }
    //} else {
    //    if (hand.pinchStrength < GRAB_THRESHOLD) {
    //        isGrabbing = false;
    //    }
    //}

    //console.log(hand.pinchStrength);

    if (frame.pointables.length > 0) {

        prevMouse = {x: mouse.x, y: mouse.y, z: mouse.z};

        mouse.x = hand.screenPosition()[0] - paddingHorizontal/2; //TODO: map between screenWidth/height to canvasWidth/height
        mouse.y = hand.screenPosition()[1] + 550; //myCanvas.height;
        mouse.z = hand.screenPosition()[2];

        var smoothedMouse = getSmoothedPoint(mouse);
        mouse.x = smoothedMouse.x;
        mouse.y = smoothedMouse.y;

        cursorWidth = cursor.clientWidth + parseInt(cursor.style.borderWidth);

        cursor.style.left = (mouse.x+paddingHorizontal/2-cursorWidth/2) + 'px';
        cursor.style.top = (mouse.y+paddingVertical/2-cursorWidth/2) + 'px';

        var normalizedZ = (mouse.z) / 250;

        cursorIndicator.style.opacity = Math.min(1.0, Math.max(0.0, - normalizedZ));
        cursorIndicator.style.border = Math.ceil(Math.max(1.0,  -10.0 * normalizedZ)) + "px solid " + context.strokeStyle;
        cursorIndicator.style.left = (-49 - parseInt(cursorIndicator.style.borderWidth)) + "px";
        cursorIndicator.style.top = (-49 - parseInt(cursorIndicator.style.borderWidth)) + "px";

        context.lineWidth = 2 + 15 * Math.max(0, -1*normalizedZ)*Math.max(0, -1*normalizedZ);
        //console.log(context.lineWidth);

        if (mouse.z < 0 && !isStrokeStarted) { // && hand.pinchStrength > GRAB_THRESHOLD) {
            startStroke();
        }

        if ( (mouse.z > 0 /*|| hand.pinchStrength < GRAB_THRESHOLD*/) && isStrokeStarted ) {
            endStroke();
        }

        undoDiv.style.display = "none";
        redoDiv.style.display = "none";
        undoButton.className = "instructions";
        redoButton.className = "instructions";

        if (isStrokeStarted) {

            context.beginPath();
            context.moveTo(prevMouse.x, prevMouse.y);
            context.lineTo(mouse.x, mouse.y);
            context.stroke();
            currentStroke.points.push([mouse.x, mouse.y, context.lineWidth]);
            //console.log(mouse.z);

        } else {

            if (mouse.x < myCanvas.clientWidth/2) {
                if (mouse.y < colorPickerHeight) {
                    setLineColor(colors.upperLeft);
                } else if (mouse.y > myCanvas.clientHeight - colorPickerHeight) {
                    setLineColor(colors.lowerLeft);
                }

            } else if (mouse.x > myCanvas.clientWidth/2) {
                //console.log("right");
                if (mouse.y < colorPickerHeight) {
                    //console.log("top");
                    setLineColor(colors.upperRight);
                } else if (mouse.y > myCanvas.clientHeight - colorPickerHeight) {
                    setLineColor(colors.lowerRight);
                }
            }

            if (isWithinUndoButton(mouse)) {
                tickUndo(wasInsideUndoButton);
                wasInsideUndoButton = true;
            } else {
                stopUndo();
                wasInsideUndoButton = false;
            }

            if (isWithinRedoButton(mouse)) {
                tickRedo(wasInsideRedoButton);
                wasInsideRedoButton = true;
            } else {
                stopRedo();
                wasInsideRedoButton = false;
            }

        }

    }

}).use('screenPosition'); //, {scale: LEAPSCALE});

function tickUndo(wasInside) {
    console.log("tick undo");

    if (!wasInside) {
        undo();
        undoTicks = undoTickThreshold; // for visual effect

    } else {
        undoTicks += 1;
        if (undoTicks >= undoTickThreshold) {
            undoTicks = 0;
            undo();
        }
    }

    undoDiv.style.display = "inline";
    undoButton.className = "instructions highlightInstructions";

    var brightness = 75 + Math.max(0,(undoTicks/undoTickThreshold)) * 75;
    undoButton.style.backgroundColor = "rgb(" + brightness + "," + brightness + "," + brightness + ")";

    if (!wasInside) {
        undoTicks = undoTickThreshold - undoTickThresholdFirstTime;
    }
}

function tickRedo(wasInside) {
    console.log("tick redo");

    if (!wasInside) {
        redo();
        redoTicks = undoTickThreshold; // for visual effect

    } else {
        redoTicks += 1;
        if (redoTicks >= undoTickThreshold) {
            redoTicks = 0;
            redo();
        }
    }

    redoDiv.style.display = "inline";
    redoButton.className = "instructions highlightInstructions";

    var brightness = 75 + (redoTicks/undoTickThreshold) * 75;
    redoButton.style.backgroundColor = "rgb(" + brightness + "," + brightness + "," + brightness + ")";

    if (!wasInside) {
        redoTicks = undoTickThreshold - undoTickThresholdFirstTime;
    }
}

function stopUndo() {
    undoTicks = 0;
    var brightness = 75 + (undoTicks/undoTickThreshold) * 75;
    undoButton.style.backgroundColor = "rgb(" + brightness + "," + brightness + "," + brightness + ")";
}

function stopRedo() {
    redoTicks = 0;
    var brightness = 75 + (redoTicks/undoTickThreshold) * 75;
    redoButton.style.backgroundColor = "rgb(" + brightness + "," + brightness + "," + brightness + ")";
}

function resetCanvas() {
    console.log("reset canvas");
    //context.clearRect(0, 0, myCanvas.width, myCanvas.height);
    //
    //for (var i = 0; i < strokes.length; i++) {
    //    undo();
    //}

    while (strokes.length > 0) {
        undo();
    }

    drawTools();
}

function fillPreviousStroke() {

    //var lastStroke =

    var strokeToUndo = strokes.pop();
    undoneStrokes.push(strokeToUndo);
    redrawStrokes();



}

//   ({ hand: function(hand) {

//   mouse.x = hand.screenPosition()[0]; //TODO: map between screenWidth/height to canvasWidth/height
//   mouse.y = hand.screenPosition()[1];

//   cursor.style.left = (mouse.x) + 'px';
//   cursor.style.top = (mouse.y) + 'px';

//   if (isStrokeStarted) {
//     console.log(mouse);
//     context.lineTo(mouse.x, mouse.y);
//     context.stroke();
//   }

// }}).use('screenPosition', {scale: LEAPSCALE});

// processSpeech(transcript)
//  Is called anytime speech is recognized by the Web Speech API
// Input:
//    transcript, a string of possibly multiple words that were recognized
// Output:
//    processed, a boolean indicating whether the system reacted to the speech or not
var processSpeech = function(transcript) {
    // console.log(transcript);
    // Helper function to detect if any commands appear in a string
    var userSaid = function(str, commands) {
        str = str.toLowerCase();
        for (var i = 0; i < commands.length; i++) {
            if (str.indexOf(commands[i]) > -1)
                return commands[i];
        }
        return false;
    };

    var processed = false;

    if (userSaid(transcript,["clear", "reset", "erase", "new"])) {
        processed = true;
        resetCanvas();
    } else if (userSaid(transcript, ["undo", "and"])) {
        processed = true;
        undo();
    } else if (userSaid(transcript, ["redo", "free", "read"])) {
        processed = true;
        redo();
    }

    else if (userSaid(transcript, ["black"])) {
        processed = true;
        setLineColor("black");

    } else if (userSaid(transcript, ["yellow"])) {
        processed = true;
        setLineColor(colors.upperRight);

    } else if (userSaid(transcript, ["green"])) {
        processed = true;
        setLineColor(colors.lowerLeft);

    } else if (userSaid(transcript, ["orange", "brown", "red"])) {
        processed = true;
        setLineColor(colors.lowerRight);
    }

    //else if (userSaid(transcript, ["fill"])) {
    //    processed = true;
    //    fillPreviousStroke();
    //}

    return processed;
};
