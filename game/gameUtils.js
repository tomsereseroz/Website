let Utils = {

}

export default Utils;

function createPlayerGradient(player){
  playergrd = context.createRadialGradient(player.pos[0], player.pos[1], 5, player.pos[0], player.pos[1],40);
  playergrd.addColorStop(0, "purple");
  playergrd.addColorStop(.4+.3*Math.sin(2*time*Math.PI/2000), "black");
  playergrd.addColorStop(.8+.1*Math.sin(2*time*Math.PI/3000), "red");
  playergrd.addColorStop(.95+.05*Math.sin(2*time*Math.PI/600), "pink");
}

function aimAtMouse(){
  let dist = d2.distance(player.pos,[mouseX,mouseY]);
  let factor = d2.toRadius(dist);
  factor = Math.min(factor/500, 1);
  dist = d2.makeUnitVector(dist);
  player.aim = dist.map(x => x*factor);
}

function moveAtPlayer(obj1,obj2){
  let look = d2.makeUnitVector(d2.distance(obj1.pos,obj2.pos));
  obj1.vel[0] += look[0];
  obj1.vel[1] += look[1];
}

function moveApart(first, second){
  let dist = d2.distance(first.pos,second.pos);
  let distrad = d2.toRadius(dist);
  let diff = (first.props[0] + second.props[0]) - distrad;
  if(diff > 0){
    let factor = diff/distrad;
    dist = dist.map(x => x*factor);
    second.pos[0] += dist[0];
    second.pos[1] += dist[1];
  }
}

function getHPStyle(object){
  let egrd = context.createRadialGradient(object.pos[0], object.pos[1], 2,object.pos[0],object.pos[1],object.props[0]);
  egrd.addColorStop(0, "white");
  egrd.addColorStop(object.health/101, "red");
  egrd.addColorStop(1, "black");
  return egrd;
}

function createBGgradient(){
  grd = context.createLinearGradient(0, 0, width, 0);
  grd.addColorStop(0, "#afe569");
  grd.addColorStop(.8, "#207cca");
  grd.addColorStop(1, "#3b5b83");
}