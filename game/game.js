import d2 from './2DUtils.js';
import utils from './gameUtils.js';

console.log('game.js');

let numpads = 0;

function gamepadConnect(event) {
  var gamepad = event.gamepad;
  console.log(gamepad);
  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
      event.gamepad.index, event.gamepad.id,
      event.gamepad.buttons.length, event.gamepad.axes.length);      
  numpads++;
}

window.addEventListener("gamepadconnected", function(e) { gamepadConnect(e); });
window.addEventListener("gamepaddisconnected", function() { numpads-- });
document.onkeydown = keyDownHandler;
document.onkeyup = keyUpHandler;
document.onmousemove = function(e){
mouseX = e.clientX - canvasRect.x;
mouseY = e.clientY - canvasRect.y;
};
document.onmousedown = function() { mousedown = 1; };
document.onmouseup =   function() { mousedown = 0; };

function keyDownHandler(event){
  if(event.keyCode >= 37 && event.keyCode <= 40){
    keysdown[event.keyCode-37] = 1;
  }else
    switch(event.keyCode){
      case 65:
        keysdown[0] = 1;
        break;
      case 87:
        keysdown[1] = 1;
        break;
      case 68:
        keysdown[2] = 1;
        break;
      case 83:
        keysdown[3] = 1;
        break;
      default:
        break;
    }
}

function keyUpHandler(event){
  if(event.keyCode >= 37 && event.keyCode <= 40){
    keysdown[event.keyCode-37] = 0;
  }else
    switch(event.keyCode){
      case 65:
        keysdown[0] = 0;
        break;
      case 87:
        keysdown[1] = 0;
        break;
      case 68:
        keysdown[2] = 0;
        break;
      case 83:
        keysdown[3] = 0;
        break;
      default:
        break;
    }
}

const shapes = {
  Undefined: 0,
  Circle: 1,
  Rectangle: 2
  //rotated rectangle? arc?
}

class Object{
  constructor(){
    this.pos = [0,0];//position [x,y]
    this.shape = shapes.Circle;//enumerated shape
    this.props = [];//array of shape properties (width, radius, etc).
    this.style = "black";//fillStyle
  }
  setStyle(style){this.style = style; return this;}
  setShape(shape){this.shape = shape; return this;}
  setPosition([x,y]){this.pos = [x,y]; return this;}
  setProperties(props){this.props = props; return this;}
  Draw(){
    switch(this.shape){
      case shapes.Circle:
        context.beginPath();
        context.arc(this.pos[0],this.pos[1],this.props[0],0,2*Math.PI);
        context.fillStyle = this.style;
        context.fill();
        break;
      case shapes.Rectangle:
        context.fillStyle = this.style;
        context.fillRect(0,0,this.props[0],this.props[1]);
        break;
      default:
    }
  }
}

class physObj extends Object{
  constructor(){//maybe add acceleration to this later
    super();//calls Object()
    this.vel = [0,0];//velocity [vx, vy]
    this.type = 0;//type for collisions(collisions are ignored for similar types)
    this.mass = 1;//mass
    this.friction = .1;//friction constant should be 0 to 1.
  }
  setVelocity(vel){this.vel = vel; return this;}
  setType(type){this.type = type; return this;}
  setMass(mass){this.mass = mass; return this;}
  setFriction(friction){this.friction = friction; return this;}
  Tick(){//updates position based on velocity and applies a damping to velocity
    this.pos[0] = this.pos[0] + this.vel[0];
    this.pos[1] = this.pos[1] + this.vel[1];
    this.vel[0] *= 1 - this.friction;
    this.vel[1] *= 1 - this.friction;
  }
  collidesWith(other){//checks collision with another object. returns 1 if collided.
    switch(this.shape){
      case shapes.Circle:
        switch(other.shape){
          case shapes.Circle:
            return d2.isCCCollision(this,other);
          case shapes.Rectangle:
            return d2.isCRCollision(this,other);
          default:
            console.log("checkcollision called on object without proper shape")
        }
      case shapes.Rectangle:
        switch(other.shape){
          case shapes.Circle:
            return d2.isCRCollision(other,this);
          case shapes.Rectangle:
            return d2.isRRCollision(this,other);
          default:
            console.log("checkcollision called on object without proper shape")
        }
    }
  }
  isOffScreen(){
    switch(this.shape){
      case shapes.Circle:
        return this.pos[0]+this.props[0] < 0 || this.pos[0]-this.props[0] > width || this.pos[1]+this.props[0] < 0 || this.pos[1]-this.props[0] > height;
      case shapes.Rectangle:
        return this.pos[0]+this.props[0] < 0 || this.pos[0] > width || this.pos[1] + this.props[1] < 0 || this.pos[1] > height;
    }
  }
  Draw(){
    if(!this.isOffScreen()) super.Draw();
  }
}

class Projectile extends physObj{//projectiles handle collision with entities
  constructor(){
    super();
    this.damage = 1;
    this.startTime = time;
    this.timeout = 1000;
  }
  setDamage(damage){this.damage = damage; return this;}
  setTimeout(timeout){this.timeout = timeout; return this;}
  checkTimeout(){return this.startTime + this.timeout < time;} 
}

class Entity extends physObj{//entities are for things that aim in a certaian direction and have health
  constructor(){
    super();
    this.aim = [0,0];//aim [ax, ay]
    this.health = 10;
    this.gun = 0;//delay in ms between shots
  }
  setAim(aim){this.aim = aim; return this;}
  setHP(health){this.health = health; return this;}
  setGun(gun){this.gun = gun; return this;}
  shootGun(vel){this.gun.Shoot(this.pos,vel); return this;}
  Tick(){
    this.Move();
    super.Tick();
  }
  conserveMomentum(source){
    let mtot = this.mass+source.mass;
    this.vel[0] = this.mass*this.vel[0]/mtot + source.vel[0]*source.mass/mtot;
    this.vel[1] = this.mass*this.vel[1]/mtot + source.vel[1]*source.mass/mtot;
    return this;
  }
  damage(source){this.health-=source.damage; return this;}
  checkHP(){return this.health < 1;}
  Draw(){
    if(this.type == 9999){//player case, draw extra marker for aim 
      this.setStyle(utils.createPlayerGradient(this,context,time));
      super.Draw();
      utils.drawAimIndicator(this,context);
    }else if(this.type == 0){
      this.setStyle(utils.getHPStyle(this,context));
      super.Draw();
    }else
    super.Draw();
  }
  Move(){//sets velocity
    if(this.type == 9999){//player case
      
    }else if(this.type == 0 && d2.toRadius(d2.distance(this.pos,player.pos)) < 500 ){//enemy case
      utils.aMoveAtB(this,player);
    }
  }
}

class gun{
  constructor(){
    this.type = 0;
    this.delay = 100;
    this.lastShotTime = time;
    this.damage = 10;
    this.shotSpeed = 100;
    this.shotSize = 10;
    this.shotMass = 5;
    this.shotFriction = 0;
    this.timeout = 3000;
  }
  setType(type){this.type = type; return this;}
  Shoot(pos, vel){
    if(time - this.lastShotTime > this.delay){
      this.lastShotTime = time;
      projArray.add(new Projectile).setType(this.type).setDamage(this.damage).setFriction(this.shotFriction).setMass(this.shotMass).setPosition(pos).setVelocity(vel).setTimeout(this.timeout).setShape(shapes.Circle).setProperties([this.shotSize]);
      //projArray.Display();
    }
  }
}

class objectArray{
  constructor(){
    this.array = [];
  }
  Tick(){
    for (var i = 0; i < this.array.length; i++){
      this.array[i].Tick();
    } 
  }
  Draw(){
    for (var i = 0; i < this.array.length; i++){
      this.array[i].Draw();
    }
  }
  add(object){
    this.array[this.array.length] = object;
    return object;
  }
  remove(index){
    this.array.splice(index,1);
    return this;
  }
  Display(){
    console.log("displaying Array");
    for(let i = 0; i<this.array.length; i++){
      console.log(this.array[i]);
    }
  }
}

class projectileArray extends objectArray{
  Tick(){
    var deleted = false;
    for (var i = 0; i < this.array.length; i++){
      deleted = false;
      if(this.array[i].checkTimeout()||this.array[i].isOffScreen()){
        deleted = true;
      }else{
        for(var j = 0; j < entArray.array.length; j++){
          if(this.array[i].collidesWith(entArray.array[j])&&this.array[i].type!=entArray.array[j].type){
            entArray.array[j].damage(this.array[i]).conserveMomentum(this.array[i]);
            if(entArray.array[j].checkHP()){
              entArray.array.splice(j,1);
              j--
            }
            deleted = true;
            break;
          }
        }
      }
      if(deleted){
        this.array.splice(i,1);
        i--;
      }else this.array[i].Tick();
    }
  }
  Draw(){
    for (var i = 0; i < this.array.length; i++){
      this.array[i].Draw();
    }
  }
}

class entityArray extends objectArray{
  Tick(){
    for (var i = 0; i < this.array.length; i++){
      for(var j = i+1; j < this.array.length; j++){
        if(this.array[i].collidesWith(this.array[j])){
          //console.log(this.array[i].type,this.array[j].type);
          if(this.array[i].type == this.array[j].type){
            utils.moveApart(this.array[i],this.array[j]);
          }
        }
      }
      this.array[i].Tick();
    }
  }
}

function drawButton(button, index){
  context.fillStyle = "black";
  if(button.value){context.fillStyle = "white";}
  var xval = Math.floor(index/5)*100+20;
  var yval = (index*100+20)%height;
  context.fillRect(xval,yval,60,60);
  
}

function checkButton(button,index){
  if(button.value){
    switch(index){
      case 7: player.shootGun(player.aim.map(x => x*15));//7 = trigger
      default:
    }
  }
}

function loop(){
  d = new Date;
  time = d.getTime();
  height = document.documentElement.clientHeight - 200;
  width = document.documentElement.clientWidth - 20;
  if(lastheight!= height || lastwidth != width)
    grd = utils.createBGgradient(context,width);
  lastheight = height;
  lastwidth = width;
  context.canvas.height = height;
  context.canvas.width = width;
  context.fillStyle = grd;//"linear-gradient(to bottom right, #afe569 0%, #207cca 78%, #3b5b83 100%)";
  context.fillRect(0,0,width,height);
  
  if(numpads){//gamepad control section
    const gamepads = navigator.getGamepads();
    axes = gamepads[0].axes.slice();
    buttons = gamepads[0].buttons.slice();
    //buttons.forEach(drawButton);
    for(let i = 0; i<4; i++)
      if(Math.abs(axes[i]) < 0.04)
        axes[i] = 0;//adds a deadzone to the controller
    player.vel[0] += axes[0];
    player.vel[1] += axes[1];
    player.aim[0] = axes[2];
    player.aim[1] = axes[3];

    buttons.forEach(checkButton);

  }else{//mouse and keyboard
    //move
    if(keysdown != [0,0,0,0]){
      player.vel[0] += keysdown[2] - keysdown[0];
      player.vel[1] += keysdown[3] - keysdown[1];
    }
    //aim
    utils.aimAtCoords(player,[mouseX, mouseY]);
    if(mousedown){
      player.shootGun(player.aim.map(x => x*15));
    }
  }
  entArray.Draw();
  projArray.Draw();
  projArray.Tick();   
  entArray.Tick();
  utils.screenWrap(player,width,height);
  if(entArray.array.length < 15){
    let enemy = entArray.add(new Entity).setType(0).setProperties([70]).setMass(30).setHP(100).setShape(shapes.Circle).setPosition([Math.random()*width,Math.random()*height]);
    while(d2.toRadius(d2.distance(player.pos, enemy.pos))<300){
      enemy.setPosition([Math.random()*width,Math.random()*height]);
    };
  }
  context.drawImage(heartImg, 10, 10);
  context.drawImage(heartImg, 55, 10);
  context.drawImage(emptyheartImg, 100, 10);
  window.requestAnimationFrame(loop);
}

//start of runtime code

let context = document.getElementById("gb").getContext("2d");
let height = document.documentElement.clientHeight - 200;
let lastheight = height;
let width = document.documentElement.clientWidth - 20;
let lastwidth = width;
let grd = utils.createBGgradient(context,width);
let canvasRect = document.getElementById("gb").getBoundingClientRect();
let mouseX = 0;
let mouseY = 0;
let cutoff = 0.04;
let keysdown = [0,0,0,0];
let mousedown = 0;
let d = new Date;
let time = d.getTime();
let axes = [];
let buttons = {};
let projArray = new projectileArray;
let entArray = new entityArray;
let player = entArray.add(new Entity).setPosition([3*width/4,3*height/4]).setShape(shapes.Circle).setType(9999).setMass(1000).setFriction(.05).setProperties([40]).setAim([0,0]).setHP(60);
let playergrd = utils.createPlayerGradient(player,context,time);
let heartImg = document.getElementById("heart");
let emptyheartImg = document.getElementById("emptyheart");
let playergun = new gun;
playergun.setType(9999);
player.setGun(playergun);

loop();