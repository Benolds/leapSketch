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

var init = function() {
  myCanvas = document.getElementById("myCanvas");

  myCanvas.style.width = window.innerWidth;
  myCanvas.width = window.innerWidth;
  myCanvas.style.height = window.innerHeight;
  myCanvas.height = window.innerHeight;


  context = myCanvas.getContext("2d");
  cursor = document.getElementById("cursor");
 
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
    console.log(frame);
    // var position = frame.pointables[0].tipPosition;
    // var position = frame.pointables[0].stabilizedTipPosition;
    var distance = frame.pointables[0].touchDistance;
    // console.log("X: " + position[0] + " Y: " + position[1] + " D: " + distance);
    // mouse.x = position[0];
    // mouse.y = position[1];

    mouse.x = hand.screenPosition()[0]; //TODO: map between screenWidth/height to canvasWidth/height
    mouse.y = hand.screenPosition()[1]; 

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
    }


  }
}).use('screenPosition', {scale: LEAPSCALE});


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
