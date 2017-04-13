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

var myCanvas;
var context;
var mouse = {x: 0, y: 0};
var isStrokeStarted = false;
var cursor;
var cursorIndicator;

var init = function() {
  myCanvas = document.getElementById("myCanvas");

  var padding = 20;
  myCanvas.style.width = window.innerWidth-padding;
  myCanvas.width = window.innerWidth-padding;
  myCanvas.style.height = window.innerHeight-padding;
  myCanvas.height = window.innerHeight-padding;


  context = myCanvas.getContext("2d");
  cursor = document.getElementById("cursor");
  cursorIndicator = document.getElementById("cursorIndicator");
 
  /* Mouse Capturing Work */
  // myCanvas.addEventListener('mousemove', function(e) {
  //   mouse.x = e.pageX - this.offsetLeft;
  //   mouse.y = e.pageY - this.offsetTop;
  // }, false);

  /* Drawing on Paint App */
  context.lineWidth = 5;
  context.lineJoin = 'round';
  context.lineCap = 'round';
  context.strokeStyle = 'blue';
   
  // myCanvas.addEventListener('mousedown', function(e) {
  //     context.beginPath();
  //     context.moveTo(mouse.x, mouse.y);
   
  //     myCanvas.addEventListener('mousemove', onPaint, false);
  // }, false);
   
  // myCanvas.addEventListener('mouseup', function() {
  //     myCanvas.removeEventListener('mousemove', onPaint, false);
  // }, false);
   
  var onPaint = function() {
      context.lineTo(mouse.x, mouse.y);
      context.stroke();
  };

  document.body.onkeydown = function(e){
      if(e.keyCode == 32 && !isStrokeStarted){
          console.log("Space down!");
          startStroke();
      }
  }

  document.body.onkeyup = function(e){
      if(e.keyCode == 32){
          console.log("Space pressed!");
          endStroke();
      }
  }

}

function startStroke() {
    isStrokeStarted = true;
    context.beginPath();
    context.moveTo(mouse.x, mouse.y);
    // myCanvas.addEventListener('mousemove', onPaint, false);
}

function endStroke() {
    isStrokeStarted = false;
    context.beginPath();
    context.moveTo(mouse.x, mouse.y);
    // myCanvas.removeEventListener('mousemove', onPaint, false);
}

// MAIN GAME LOOP
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

    // console.log("X: " + position[0] + " Y: " + position[1] + " D: " + distance);
    // mouse.x = position[0];
    // mouse.y = position[1];

    // console.log(distance);

    mouse.x = hand.screenPosition()[0]; //TODO: map between screenWidth/height to canvasWidth/height
    mouse.y = hand.screenPosition()[1] + window.innerHeight; 

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
      // console.log(mouse);
    }


  }
}).use('screenPosition'); //, {scale: LEAPSCALE});


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
    console.log("reset canvas");
    context.clearRect(0, 0, myCanvas.width, myCanvas.height);
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
