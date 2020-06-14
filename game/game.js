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
  playergrd = context.createRadialGradient(player.pos[0], player.pos[1], 5, player.pos[0], player.pos[1],40);
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

function moveAtPlayer(obj1,obj2){
  let look = Unify(distance(obj1.pos,obj2.pos));
  obj1.vel[0] += look[0];
  obj1.vel[1] += look[1];
}

function distance(pos1,pos2){
  let dx = pos2[0]-pos1[0];
  let dy = pos2[1]-pos1[1];
  return [dx, dy];
}

function clamp(min,max,value){//clamps value to not be lower than min or higher than max
  return Math.max(min, Math.min(max,value));
}

function checkCCCollision(first,second){//checks a circle-circle collision
  return toRadius(distance(first.pos,second.pos)) < (first.props[0] + second.props[0]);
}

function checkRRCollision(first,second){//checks a rectangle-rectangle collision
  return(first.x<second.x+second.props[0] && first.x + first.props[0] > second.x && 
        first.y<second.y+second.props[1] && first.y + first.props[1] > second.y);
}

function checkCRCollision(first,second){//checks a circle-rectangle collision (second is rectangle)
  [dx, dy]  = distance(first.pos,[second.pos[0]+second.props[0]/2, second.pos[1]+second.props[1]/2]);//distance from center of circle to center of rectangle
  dx = clamp(0,second.props[0]/2);
  dy = clamp(0,second.props[1]/2);
  return(toRadius(distance(first.pos,[second.pos[0]+second.props[0]+dx, second.pos[1]+second.props[1]+dy]))<this.props[0]);
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
  checkCollision(other){//checks collision with another object. returns 1 if collided.
    if(this.type == other.type) return 0;
    switch(this.shape){
      case shapes.Circle:
        switch(other.shape){
          case shapes.Circle:
            return checkCCCollision(this,other);
          case shapes.Rectangle:
            return checkCRCollision(this,other);
          default:
            console.log("checkcollision called on object without proper shape")
        }
      case shapes.Rectangle:
        switch(other.shape){
          case shapes.Circle:
            return checkCRCollision(other,this);
          case shapes.Rectangle:
            return checkRRCollision(this,other);
          default:
            console.log("checkcollision called on object without proper shape")
        }
    }
  }
  isOffScreen(){
    switch(this.shape){
      case shapes.Circle:
        return this.pos[0] < 0 || this.pos[0] > width || this.pos[1] < 0 || this.pos[1] > height;
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
  setTimeout(timeout){this.timeout = timeout; return this;}
  checkTimeout(){return this.startTime + this.timeout < time;} 
}

class Entity extends physObj{//entities are for things that aim in a certaian direction and have health
  constructor(){
    super();
    this.aim = [0,0];//aim [ax, ay]
    this.health = 10;
  }
  setAim(aim){this.aim = aim; return this;}
  setHP(health){this.health = health; return this;}
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
      context.beginPath();
      context.strokeStyle = "pink";
      context.moveTo(this.pos[0],this.pos[1]);
      context.lineWidth = 10;
      context.lineTo(this.pos[0]+this.aim[0]*40,this.pos[1]+this.aim[1]*40);
      context.stroke();
      createPlayerGradient(this);
      this.setStyle(playergrd);
    }else if(this.type == 0){
      this.setStyle(getHPStyle(this));
    }
    super.Draw();
  }
  Move(){
    if(this.type == 9999){//player case
      
    }else if(this.type == 0){
      moveAtPlayer(this,player);
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
}

class projectileArray extends objectArray{
  Tick(){
    var deleted = false;
    for (var i = 0; i < this.array.length; i++){
      deleted = false;
      if(this.array[i].checkTimeout()||this.array[i].isOffScreen()){
        this.array.splice(i,1);
        i--;
        deleted = true;
      }else{
        for(var j = 0; j < entArray.array.length; j++){
          if(this.array[i].checkCollision(entArray.array[j])){
            entArray.array[j].damage(this.array[i]).conserveMomentum(this.array[i]);
            this.array.splice(i,1);
            i--;
            deleted = true;
            break;
          }
        }
      if(!deleted) this.array[i].Tick();
      }
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
      //console.log(this.array[i]);
      if(this.array[i].checkHP()){
        this.array.splice(i,1);
        i--;
      }else{
        //console.log(this.array[i]); 
        this.array[i].Tick();
      }
    }
  }
}

function getHPStyle(object){
  let egrd = context.createRadialGradient(object.pos[0], object.pos[1], 2,object.pos[0],object.pos[1],object.props[0]);
  egrd.addColorStop(0, "white");
  egrd.addColorStop(object.health/101, "red");
  egrd.addColorStop(1, "black");
  return egrd;
}

function drawButton(button, index){
  context.fillStyle = "black";
  if(button.value){context.fillStyle = "white";}
  var xval = Math.floor(index/5)*100+20;
  var yval = (index*100+20)%height;
  context.fillRect(xval,yval,60,60);
  
}

function Shoot(obj){
  projArray.add(new Projectile).setType(obj.type).setPosition([obj.pos[0]+obj.aim[0]*40,obj.pos[1]+obj.aim[1]*40]).setVelocity([obj.aim[0]*15,obj.aim[1]*15]).setTimeout(5000).setShape(shapes.Circle).setProperties([10]).setFriction(0);
}

function checkButton(button,index){
  if(button.value){
    switch(index){
      case 7: Shoot(player);//7 = trigger
      default:
    }
  }
}
//start of runtime code
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
let player = entArray.add(new Entity).setPosition([3*width/4,3*height/4]).setShape(shapes.Circle).setType(9999).setMass(1000).setFriction(.05).setProperties([40]).setAim([0,0]).setHP(100);

function loop(){
  d = new Date;
  time = d.getTime();
  height = document.documentElement.clientHeight - 200;
  width = document.documentElement.clientWidth - 20;
  
  context.canvas.height = height;
  context.canvas.width = width;
  context.fillStyle = grd;//"linear-gradient(to bottom right, #afe569 0%, #207cca 78%, #3b5b83 100%)";
  context.fillRect(0,0,width,height);
  
  if(numpads){//gamepad control section
    const gamepads = navigator.getGamepads();
    axes = gamepads[0].axes;
    buttons = gamepads[0].buttons;
    //buttons.forEach(drawButton);
    if(Math.abs(axes[0]) > 0.04 ){player.vel[0] += axes[0];}//controller deadzone
    if(Math.abs(axes[1]) > 0.04 ){player.vel[1] += axes[1];}
    if(Math.abs(axes[2]) > 0.04 ){player.aim[0] = axes[2];}else{player.aim[0] = 0;}
    if(Math.abs(axes[3]) > 0.04 ){player.aim[1] = axes[3];}else{player.aim[1] = 0;}
    //player.Tick();//updates position from velocity and sets friction on velocity
    if( player.pos[0] < 0 ){player.pos[0] += width;}
    if( player.pos[1] < 0 ){player.pos[1] += height;}
    if( player.pos[0] > width ){player.pos[0] -= width;}
    if( player.pos[1] > height ){player.pos[1] -= height;}
    //console.log(axes);
    buttons.forEach(checkButton);
    projArray.Draw();
    entArray.Draw();
    projArray.Tick();
    entArray.Tick();
    if(entArray.array.length < 3){
      entArray.add(new Entity).setType(0).setProperties([70]).setMass(3).setHP(100).setShape(shapes.Circle).setPosition([Math.random()*width,Math.random()*height]);
    }
  }else{
    createPlayerGradient(player);
    player.setStyle(playergrd);
    player.Draw();
}
  
  window.requestAnimationFrame(loop);
  //console.log(numpads[0]);
}

loop();