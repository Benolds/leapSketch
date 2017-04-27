// GAME SETUP
// var initialState = SKIPSETUP ? "playing" : "setup";
// var gameState = new GameState({state: initialState});
// var cpuBoard = new Board({autoDeploy: true, name: "cpu"});
// var playerBoard = new Board({autoDeploy: SKIPSETUP, name: "player"});
// var cursor = new Cursor();

// var GRAB_THRESHOLD =.8;

// // UI SETUP
// setupUserInterface();

// // selectedTile: The tile that the player is currently hovering above
// var selectedTile = false;

// // grabbedShip/Offset: The ship and offset if player is currently manipulating a ship
// var grabbedShip = false;
// var grabbedShipLast = false;
// var grabbedOffset = [0, 0];
// var rollOffset = 0;

// // isGrabbing: Is the player's hand currently in a grabbing pose
// var isGrabbing = false;

var strokes = [];
var undoneStrokes = [];

var currentStroke = {points: []};

var myCanvas;
var context;
var mouse = {x: 0, y: 0, z: 0};
var prevMouse = {x: 0, y: 0, z: 0};
var isStrokeStarted = false;
var cursor;
var cursorIndicator;

var init = function() {
    myCanvas = document.getElementById("myCanvas");

    var padding = 20;
    myCanvas.style.width = window.innerWidth - padding;
    myCanvas.width = window.innerWidth - padding;
    myCanvas.style.height = window.innerHeight - padding;
    myCanvas.height = window.innerHeight - padding;

    context = myCanvas.getContext("2d");
    cursor = document.getElementById("cursor");
    cursorIndicator = document.getElementById("cursorIndicator");

    drawTools();

    /* Mouse Capturing Work */
    // myCanvas.addEventListener('mousemove', function(e) {
    //   mouse.x = e.pageX - this.offsetLeft;
    //   mouse.y = e.pageY - this.offsetTop;
    // }, false);

    /* Drawing on Paint App */
    context.lineWidth = 5;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    setLineColor('blue');

};
   
   //myCanvas.addEventListener('mousedown', function(e) {
   //    startStroke();
   //    isStrokeStarted = true;
   //    myCanvas.addEventListener('mousemove', onPaint, false);
   //}, false);
   //
   //myCanvas.addEventListener('mouseup', function(e) {
   //    isStrokeStarted = false;
   //    endStroke();
   //    myCanvas.removeEventListener('mousemove', onPaint, false);
   //}, false);

   myCanvas.addEventListener('mousemove', function(e) {
       mouse.x = e.pageX - this.offsetLeft;
       mouse.y = e.pageY - this.offsetTop;
       if (isStrokeStarted) {
           context.lineTo(mouse.x, mouse.y);
           context.stroke();
           currentStroke.points.push([mouse.x, mouse.y]);

       } else {

           var cornerToolRadius = 50; // 0
           if (mouse.x < cornerToolRadius) {
               //console.log("left");
               if (mouse.y < cornerToolRadius) {
                   //console.log("top");
                   setLineColor('black');
               } else if (mouse.y > myCanvas.height - cornerToolRadius) {
                   setLineColor('green');
               }
           } else if (mouse.x > myCanvas.width - cornerToolRadius) {
               //console.log("right");
               if (mouse.y < cornerToolRadius) {
                   //console.log("top");
                   setLineColor('red');
               } else if (mouse.y > myCanvas.height - cornerToolRadius) {
                   setLineColor('blue');
               }
           }

       }


   });

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
   
  var onPaint = function() {
      context.lineTo(mouse.x, mouse.y);
      context.stroke();
  };

  document.body.onkeydown = function(e){
      if(e.keyCode == 32 && !isStrokeStarted){
          console.log("Space down!");
          //startStroke();

          resetCanvas();
      }


      else if (e.keyCode == 37) {
          undo();

      } else if (e.keyCode == 39) {
          redo();
      }
  };

  document.body.onkeyup = function(e){
      if(e.keyCode == 32){
          console.log("Space pressed!");
          endStroke();
      }
  };

    function startStroke() {
        currentStroke = {points:[]};
        isStrokeStarted = true;
        context.beginPath();
        context.moveTo(mouse.x, mouse.y);
        // myCanvas.addEventListener('mousemove', onPaint, false);
    }

    function drawTools() {
        drawCircle(context,0,0,50,'black');
        drawCircle(context,myCanvas.width,0,50,'red');
        drawCircle(context,0,myCanvas.height,50,'green');
        drawCircle(context,myCanvas.width,myCanvas.height,50,'blue');
    }

    function endStroke() {
        strokes.push({points:currentStroke.points.slice(0)});
        isStrokeStarted = false;
        context.beginPath();
        context.moveTo(mouse.x, mouse.y);
        // myCanvas.removeEventListener('mousemove', onPaint, false);
    }

// TODO: visualize the undo with an animation or icon
    // TODO: define function on upper level so its visible to everything
    function undo() {
        if (strokes.length > 0) {
            var strokeToUndo = strokes.pop();
            undoneStrokes.push(strokeToUndo);

            redrawStrokes();
        }
    }

// TODO: visualize the redo with an animation or icon
    function redo() {
        if (undoneStrokes.length > 0) {
            var strokeToRedo = undoneStrokes.pop();
            strokes.push(strokeToRedo);

            drawStroke(strokeToRedo);
        }
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

        stroke.points.forEach(function(point, i) {
            if (i == 0) {
                context.moveTo(point[0], point[1]);
            } else {
                context.lineTo(point[0], point[1]);
                context.stroke();
            }
        });
    }

// Called every time the Leap provides a new frame of data
Leap.loop (function(frame) {

  var hand;
  if (frame.hands.length === 0) {
    return;
  }
  hand = frame.hands[0];

  if (frame.pointables.length > 0) {
    // console.log(frame);
    // var position = frame.pointables[0].tipPosition;
    // var position = frame.pointables[0].stabilizedTipPosition;
    var distance = frame.pointables[0].touchDistance;

    // cursorIndicator.style.border = '1px solid black';
    cursorIndicator.style.opacity = Math.min(1.0, Math.max(0.0, 1.0 - distance));

    cursorIndicator.style.border = Math.ceil(Math.max(1.0,  -10.0 * distance)) + "px solid " + context.strokeStyle;
    console.log(cursorIndicator.style.border);
      // border: 1px solid black;


    // console.log("X: " + position[0] + " Y: " + position[1] + " D: " + distance);
    // mouse.x = position[0];
    // mouse.y = position[1];

    // console.log(distance);

    mouse.x = hand.screenPosition()[0]; //TODO: map between screenWidth/height to canvasWidth/height
    mouse.y = hand.screenPosition()[1] + window.innerHeight;
    mouse.z = hand.screenPosition()[2];

    if (mouse.x < 0) {
      if (mouse.y < 0) {
        setLineColor('black');
      } else if (mouse.y > myCanvas.height) {
        setLineColor('green');
      }
    } else if (mouse.x > myCanvas.width) {
      if (mouse.y < 0) {
        setLineColor('red');
      } else if (mouse.y > myCanvas.height) {
        setLineColor('blue');
      }
    }

    cursor.style.left = (mouse.x) + 'px';
    cursor.style.top = (mouse.y) + 'px';

    if (distance < -0.1 && !isStrokeStarted) {
       startStroke();
    }

    if (distance > 0.1 && isStrokeStarted) {
       endStroke();
    }

    if (isStrokeStarted) {
      context.lineTo(mouse.x, mouse.y);
      context.stroke();
      currentStroke.points.push([mouse.x, mouse.y]);
      // console.log(mouse);

    } else {

      var cornerToolRadius = 50; // 0
      if (mouse.x < cornerToolRadius) {
          //console.log("left");
          if (mouse.y < cornerToolRadius) {
              //console.log("top");
              setLineColor('black');
          } else if (mouse.y > myCanvas.height - cornerToolRadius) {
              setLineColor('green');
          }
      } else if (mouse.x > myCanvas.width - cornerToolRadius) {
          //console.log("right");
          if (mouse.y < cornerToolRadius) {
              //console.log("top");
              setLineColor('red');
          } else if (mouse.y > myCanvas.height - cornerToolRadius) {
              setLineColor('blue');
          }
      }

  }

  }

  if(frame.valid && frame.gestures.length > 0){
    frame.gestures.forEach(function(gesture){
        switch (gesture.type){
          case "circle":
              console.log("Circle Gesture");
              redo();
              break;
          case "keyTap":
              console.log("Key Tap Gesture");
              break;
          case "screenTap":
              console.log("Screen Tap Gesture");
              break;
          case "swipe":
              console.log("Swipe Gesture");
              if (gesture.direction === 'left') {
                  undo();
              } else if (gesture.direction === 'right') {
                  redo();
              }
              break;
        }
    });
  }

}).use('screenPosition'); //, {scale: LEAPSCALE});

function resetCanvas() {
    console.log("reset canvas");
    context.clearRect(0, 0, myCanvas.width, myCanvas.height);

    for (var i = 0; i < strokes.length; i++) {
        undo();
    }

    drawTools();
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
  }

  // if (gameState.get('state') == 'setup') {
  //   // TODO: 4.3, Starting the game with speech
  //   // Detect the 'start' command, and start the game if it was said
  //   if (userSaid(transcript,["start"])) {
  //     console.log("STARTING_GAME");
  //     gameState.startGame();
  //     processed = true;
  //   }
  // }

  // else if (gameState.get('state') == 'playing') {
  //   if (gameState.isPlayerTurn()) {
  //     // TODO: 4.4, Player's turn
  //     // Detect the 'fire' command, and register the shot if it was said
  //     if (userSaid(transcript,["fire", "tire", "ire"])) {
  //       registerPlayerShot();

  //       processed = true;
  //     }
  //   }

  //   else if (gameState.isCpuTurn() && gameState.waitingForPlayer()) {
  //     // TODO: 4.5, CPU's turn
  //     // Detect the player's response to the CPU's shot: hit, miss, you sunk my ..., game over
  //     // and register the CPU's shot if it was said
  //     response = userSaid(transcript,["hit", "miss", "sunk", "game over"]);
  //     if (response) {
  //       console.log("RESPONSE: " + response);
  //       registerCpuShot(response);
  //       processed = true;
  //     }
  //   }
  // }

  return processed;
};
