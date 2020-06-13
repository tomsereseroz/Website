console.log('game.js');

let numpads = 0;

function gamepadHandler(event, connecting) {
  var gamepad = event.gamepad;
  console.log(gamepad);

  if (connecting) {
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        event.gamepad.index, event.gamepad.id,
        event.gamepad.buttons.length, event.gamepad.axes.length);      
    numpads++;
  } else {
    numpads--;
  }
}

window.addEventListener("gamepadconnected", function(e) { gamepadHandler(e, true); }, false);
window.addEventListener("gamepaddisconnected", function(e) { gamepadHandler(e, false); }, false);

let context = document.getElementById("gb").getContext("2d");

function createPlayerGradient(player){
  playergrd = context.createRadialGradient(player.x, player.y, 5, player.x, player.y,40);
  playergrd.addColorStop(0, "purple");
  playergrd.addColorStop(.4+.3*Math.sin(2*time*Math.PI/2000), "black");
  playergrd.addColorStop(.8+.1*Math.sin(2*time*Math.PI/3000), "red");
  playergrd.addColorStop(.95+.05*Math.sin(2*time*Math.PI/600), "pink");
}

function Unify([x,y]){
  let h = Math.sqrt(x*x+y*y);
  return [x/h, y/h];
}

function toRadius([dx, dy]){
  return Math.sqrt(dx*dx + dy*dy);
}

function moveAtPlayer(object){
  let look = Unify(distancevec(object.x,object.y,player.x,player.y));
  object.vx += look[0];
  object.vy += look[1];
}

function distancevec(x1,y1,x2,y2){
  let dx = x2-x1;
  let dy = y2-y1;
  return [dx, dy];
}

function drawPlayer(player){
  createPlayerGradient(player);
  //draw circle
  //context.lineWidth = 1;
  context.beginPath();
  context.arc(player.x,player.y,40,0,2*Math.PI);
  context.fillStyle = playergrd;
  context.fill();
  //draw line
  

  context.beginPath();
  context.strokeStyle = "pink";
  context.moveTo(player.x,player.y);
  context.lineWidth = 10;
  context.lineTo(player.x+player.xa*40,player.y+player.ya*40);
  context.stroke();
  //context.lineWidth = 1;
}

class Projectile{
  constructor(intype,xp,yp,xvel,yvel,intimeout){
    if(!intimeout){this.timeout = 1000;}else{this.timeout = intimeout;}
    this.startTime = time;
    this.vx = xvel;
    this.vy = yvel;
    this.x = xp;
    this.y = yp;
    this.type = intype;
    this.radius = 10;
    this.mass = 1;
  }

  Draw(){
    context.beginPath();
    context.arc(this.x,this.y,10,0,2*Math.PI);
    context.fillStyle = "black";
    context.fill();
  }

  checkCollision(){//return 1 to delete 'this'
    //check collision with entities
    for(var i = 0; i < entArray.array.length; i++){
      if(this.type != entArray.array[i].type && circleCollision(entArray.array[i],this)){
        entArray.array[i].damage(this);
        return 1;
      }
    }
    return 0;
  }

  checkTimeoutAndMove(){//return 1 to delete 'this'
    //check if offscreen or expired
    if((time - this.startTime > this.timeout)||this.x < 0||this.y < 0||this.x > width||this.y > height){
      return 1;}
    this.x += this.vx;
    this.y += this.vy;
    return 0;
  }

  tick(){
    this.Draw();
    this.checkCollision();
  }
}

class projectileArray{
  constructor(){
    this.array = [];
  }

  tick(){
    for (var i = 0; i < this.array.length; i++){
      if( this.array[i].checkTimeoutAndMove() || this.array[i].checkCollision()){
        this.array.splice(i,1);
        i--;
        continue;
      }
      this.array[i].Draw();
    }
    
  }

  add(intype,xp,yp,xvel,yvel,timeout){
    this.array[this.array.length] = new Projectile(intype,xp,yp,xvel,yvel,timeout);
  }
}

function circleCollision(one,two){
    let dr = toRadius(distancevec(one.x,one.y,two.x,two.y));
    if (dr < one.radius + two.radius){
      return 1;
    }
    return 0;
}

class Entity{
  constructor(){
    this.x = width/2;
    this.y = height/2;
    this.vx = 0;
    this.vy = 0;
    this.xa = 0;
    this.ya = 0;
    this.radius = undefined;
    this.type = undefined;
    this.mass = undefined;
    this.health = undefined;
    this.move = undefined;
  };
  
  // damage(source){
  //   this.vx = this.vx + source.vx*source.mass/this.mass;
  //   this.vy = this.vy + source.vy*source.mass/this.mass;
  // }

  Draw(){
    context.beginPath();
    context.arc(this.x,this.y,this.radius,0,2*Math.PI);
    context.fillStyle = "yellow";
    context.fill();
  }

  Move(){}//do nothing
}

class Enemy extends Entity{
  damage(source){
    this.health-=1;
    let mtot = this.mass+source.mass;
    this.vx = this.mass*this.vx/mtot + source.vx*source.mass/mtot;
    this.vy = this.mass*this.vy/mtot + source.vy*source.mass/mtot;
  }

  Move(){
    moveAtPlayer(this);
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= .9;
    this.vy *= .9;
  }
  Draw(){
    let egrd = context.createRadialGradient(this.x, this.y, 2,this.x,this.y,this.radius);
    egrd.addColorStop(0, "white");
    egrd.addColorStop(this.health/101, "red");
    egrd.addColorStop(1, "black");
    context.beginPath();
    context.arc(this.x,this.y,this.radius,0,2*Math.PI);
    context.fillStyle = egrd;
    context.fill();
  }
}

class entityArray{
  constructor(){
    this.array = [];
  }

  tick(){
    for (var i = 0; i < this.array.length; i++){
      for (var j = 0; j < this.array.length; j++){
        // if( i != j && this.array[i].checkEntityCollision(this.array[j])){
        // }
      }
      //console.log(i,this.array);
      if(this.checkHealth(this.array[i])){
        this.array.splice(i,1);
        i--;
      }else{
        this.array[i].Draw();
        this.array[i].Move();
      }
    }
    
  }

  checkHealth(object){
    return object.health < 1;
  }

  add(object){//returns index of object created;
    this.array[this.array.length] = object;
    return this.array.length-1;
  }
}

function drawButton(button, index){
  context.fillStyle = "black";
  if(button.value){context.fillStyle = "white";}
  var xval = Math.floor(index/5)*100+20;
  var yval = (index*100+20)%height;
  context.fillRect(xval,yval,60,60);
  
}

function Shoot(obj){
  projArray.add(obj.type,obj.x+obj.xa*40,obj.y+obj.ya*40,obj.xa*15,obj.ya*15,5000);
}

function checkButton(button,index){
  if(button.value){
    switch(index){
      case 7: Shoot(player);//7 = trigger
      default:
    }
  }
}

let height = document.documentElement.clientHeight - 200;
let width = document.documentElement.clientWidth - 20;
let grd = context.createLinearGradient(0, 0, width, 0);
  grd.addColorStop(0, "#afe569");
  grd.addColorStop(.8, "#207cca");
  grd.addColorStop(1, "#3b5b83");
let playergrd = context.createRadialGradient(width/2, height/2,5,width/2, height/2,40);

let d = new Date;
let time = d.getTime();
let axes = [];
let buttons = {};
let projArray = new projectileArray;
let entArray = new entityArray;

let player = entArray.array[entArray.add(new Entity)];

player.x = 3*width/4;
player.y = 3*height/4;
player.mass = 1000;
player.type = 9999;

let enemy = entArray.array[entArray.add(new Enemy)];
enemy.type = 0;
enemy.radius = 70;
enemy.mass = 10;
enemy.health = 100;

function loop(){
  d = new Date;
  time = d.getTime();
  height = document.documentElement.clientHeight - 200;
  width = document.documentElement.clientWidth - 20;

  context.canvas.height = height;
  context.canvas.width = width;
  context.fillStyle = grd;//"linear-gradient(to bottom right, #afe569 0%, #207cca 78%, #3b5b83 100%)";
  context.fillRect(0,0,width,height);

  drawPlayer(player);
  if(numpads){//gamepad control section
    const gamepads = navigator.getGamepads();
    axes = gamepads[0].axes;
    buttons = gamepads[0].buttons;
    //buttons.forEach(drawButton);
    if(Math.abs(axes[0]) > 0.08 ){player.vx += axes[0];}//controller deadzone
    if(Math.abs(axes[1]) > 0.08 ){player.vy += axes[1];}
    player.vx*=.95;
    player.vy*=.95;
    if(Math.abs(axes[2]) > 0.08 ){player.xa = axes[2];}else{player.xa = 0;}
    if(Math.abs(axes[3]) > 0.08 ){player.ya = axes[3];}else{player.ya = 0;}
    player.x = (player.x+player.vx)%width;
    player.y = (player.y+player.vy)%height;
    if( player.x < 0 ){player.x += width;}
    if( player.y < 0 ){player.y += height;}
    //console.log(axes);
    buttons.forEach(checkButton);
    projArray.tick();
    entArray.tick();
    if(entArray.array.length < 3){
      let newEnemy = entArray.array[entArray.add(new Enemy)];
      newEnemy.type = 0;
      newEnemy.radius = 70;
      newEnemy.mass = 10;
      newEnemy.health = 100;
      newEnemy.x = Math.random()*width;
      newEnemy.y = Math.random()*height;
    }
  }
  
  window.requestAnimationFrame(loop);
  //console.log(numpads[0]);
}

loop();