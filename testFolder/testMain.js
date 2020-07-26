import inputHandler from './testLib.js';
let mousedown = 0;
let i = 0;

let IH = new inputHandler();

function loop(){
  console.log(IH.mousedown);
  if(++i>500)
    return;
  window.requestAnimationFrame(loop);
}

loop();