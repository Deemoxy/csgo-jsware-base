/*
hack.js

This project is structered in (currently) 3 folders, each representing something different
util/ contains utility code that for the most part does little to interact with csgo
csgo/ wraps csgo functionality with javascript code. items in there provide an interface 
  for the game, opening it to the rest of the codebAse
hacks/ contains actual "hacks" such as aimbot and wallhacks. items in there manipulate the game
  to give an unfair advantage over non-hackers

hack.js merges these 3 items and is the entry point for the project. hack.js interfaces the codebase
  with the user. hack.js does little in the way of logic beyond small snippets.
*/

const Vec3 = require('./util/vec.js').Vec3;
const keys = require('./util/keys.js');

const entities = require('./csgo/entities.js');
const glow = require('./csgo/glow.js');
const local = require('./csgo/localplayer.js');

const walls = require('./hacks/walls.js');
const aimbot = require('./hacks/aimbot.js');

const fs = require('fs');

const entLoop = new entities.readLoop();
const localLoop = new local.readLoop();
const inputLoop = new keys.inputLoop();

setTimeout(()=> {
  setInterval(() => {
    local.player.maxFlashAlpha(0);

    if(local.player.shotsFired >= 1) {
      let punch = local.player.getAimPunch();
      // console.log(punch);
      local.player.compensateAimPunch(0.8);
    } else {
      local.player.resetAimPunchCompensation();
    }
  }, 10);

  // wallhacks in 1 line
  walls.enableWalls();

  let ws = fs.createWriteStream('aim.csv');
  // triggerbot
  // here we bind caps lock to call triggerbot code
  // really this code should be moved to the "hacks" folder, but it is so simple I'll let it live here 
  keys.bind(0x14, ()=>{
    if(local.player.inCross && local.player.inCross.team != local.player.team) { // whats in my crosshair and is it an enemy?
      local.player.shootOnce(); // f em up
      // local.player.aimAt(local.player.inCross.head); <--- life is ez
    }
    // let ms = new Date().getTime();
    // ws.write(`\n${ms}, ${local.player.viewAngles.y}, ${local.player.viewAngles.x}`)
  }, true);

  // bhop
  keys.bind(0x20, ()=>{ // space held
    if(local.player.onGround) { // if we're on the ground
      local.player.jump(); // jump
    }
  }, true);

  // aimbot
  // here we bind v to call aimbot code
  keys.bind(0x56, ()=>{ // v pressed
    aimbot.findTarget(-1);
    aimbot.aimAtTarget();
  }, true, ()=>{ // v released
    aimbot.resetTarget();
  });
  
  let aimPressed = () => {
    aimbot.findTarget(10);
    aimbot.aimAtTargetBezier();
  }
  let aimReleased = () => {
    aimbot.resetTarget();
  }
  // bind "1" to bezier aimbot (temporary)
  keys.bind(0x31, aimPressed, true, aimReleased);
  // bind "2" to bezier aimbot (temporary)
  keys.bind(0x32, aimPressed, true, aimReleased);
}, 100);
