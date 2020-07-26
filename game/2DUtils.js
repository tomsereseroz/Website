export default {

distance(pos1,pos2){
  let dx = pos2[0]-pos1[0];
  let dy = pos2[1]-pos1[1];
  return [dx, dy];
},

toRadius([dx, dy]){
  return Math.sqrt(dx*dx + dy*dy);
},

makeUnitVector([x,y]){
  let h = Math.sqrt(x*x+y*y);
  return [x/h, y/h];
},

isCCCollision(first,second){//checks a circle-circle collision
  return this.toRadius(this.distance(first.pos,second.pos)) < (first.props[0] + second.props[0]);
},
  
isRRCollision(first,second){//checks a rectangle-rectangle collision
return(first.x<second.x+second.props[0] && first.x + first.props[0] > second.x && 
        first.y<second.y+second.props[1] && first.y + first.props[1] > second.y);
},

isCRCollision(first,second){//checks a circle-rectangle collision (second is rectangle)
  let [cx, cy] = [second.pos[0]+second.props[0]/2, second.pos[1]+second.props[1]/2];
  let [dx, dy] = distance(first.pos,[cx,cy]);//distance from center of circle to center of rectangle
  dx = Math.abs(dx);
  dy = Math.abs(dy);
  dx = clamp(0,second.props[0]/2,dx);
  dy = clamp(0,second.props[1]/2,dy);
  return(this.toRadius(this.distance(first.pos,[cx+dx,cy+dy]<first.props[0])));
},

}

function clamp(min,max,value){//clamps value to not be lower than min or higher than max
  return Math.max(min, Math.min(max,value));
}