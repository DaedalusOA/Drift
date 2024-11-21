var canvas = document.querySelector('canvas');
import { resizeCanvas, randomF, randomInt, Vec2, distance, circle, drawLine,drawRectangle} from './functions.js';

  

function lerpVectors(A, B, t) {
    let x = A.x + (B.x - A.x) * t;
    let y =  A.y + (B.y - A.y) * t;
    return new Vec2(x, y);
}

class DriftCar {
    constructor(x, y, initialAngle=0, scale=0.1) {
       this.carPos = new Vec2(x,y)
       this.moveForce = new Vec2(0,0)
       this.facingAngle = initialAngle;
       this.moveSpeed = 0;
       this.Drag = 0.97;
       this.maxSpeed = 19.;
       this.steerAngle = 0.01;
       this.Traction = 0.01
       this.scale = scale;
       this.trail = [[],[],[],[]]
       
    }

   update(instructions,  imW, imH){
    this.moveSpeed =  Math.pow(this.moveForce.magnitude(), 1.3)*0.04 + 0.1 //nonlinar speed

    if (instructions[1]){
        this.moveForce.x += Math.sin(this.facingAngle) * this.moveSpeed;
        this.moveForce.y -= Math.cos(this.facingAngle)* this.moveSpeed;
    }
    else if (instructions[0]){
        this.moveForce.x -= Math.sin(this.facingAngle) * this.moveSpeed;
        this.moveForce.y += Math.cos(this.facingAngle)* this.moveSpeed;
    }

    //steering
    let value = 0;
    if (instructions[3])value = 1;
    if (instructions[2])value = -1;
    this.facingAngle += value * this.moveForce.magnitude() * this.steerAngle;


    this.carPos.x += this.moveForce.x;
    this.carPos.y += this.moveForce.y;

    this.moveForce.x *= this.Drag;
    this.moveForce.y *= this.Drag;

    
    //maxspeed
   this.moveForce.clampMagnitude(this.maxSpeed);

    //Traction
   let newTraction =  this.Traction*this.moveForce.magnitude()*0.1;
   let moveForceV = lerpVectors(this.moveForce.normalize(), new Vec2(-Math.sin(this.facingAngle),  Math.cos(this.facingAngle)), newTraction)
   let mag =this.moveForce.magnitude()
   this.moveForce.x =moveForceV.x *mag
   this.moveForce.y =moveForceV.y *mag

    
   if (this.carPos.x < -imH*this.scale/2){this.carPos.x = canvas.width+this.scale*imH/2}
   if (this.carPos.y < -imH*this.scale/2){this.carPos.y = canvas.height+this.scale*imH/2}
   if (this.carPos.y > canvas.height+this.scale*imH/2){this.carPos.y = -imH*this.scale/2}
   if (this.carPos.x > canvas.width+this.scale*imH/2){this.carPos.x = -imH*this.scale/2}
  




   //drawing stuff
   
    if (newTraction > 0.006){
        this.trail[2].push([this.carPos.x - Math.sin(this.facingAngle - 0.4)*40,this.carPos.y + Math.cos(this.facingAngle -0.4)*40])
        this.trail[3].push([this.carPos.x - Math.sin(this.facingAngle + 0.4)*40,this.carPos.y + Math.cos(this.facingAngle +0.4)*40])
     
    }

    this.trail[0].push([this.carPos.x - Math.sin(this.facingAngle+10)*30,this.carPos.y + Math.cos(this.facingAngle+10)*30])
    this.trail[1].push([this.carPos.x - Math.sin(this.facingAngle-10)*30,this.carPos.y + Math.cos(this.facingAngle-10)*30])
    

    
    if (this.trail[0].length > 200){
        this.trail[0].shift()
    }
    if (this.trail[1].length > 200){
        this.trail[1].shift()
    }
    if (this.trail[2].length > 200){
        this.trail[2].shift()
    }
    if (this.trail[3].length > 200){
        this.trail[3].shift()
    }
    
    
  

   }
   draw(img, imW, imH,  showVect = false){
    c.save(); // Save canvas state
    c.translate(this.carPos.x, this.carPos.y); // Move origin to the center of the rectangle
    c.rotate(this.facingAngle-1.571); // Rotate canvas
    c.scale(this.scale,this.scale)
    c.translate(-imW / 2, -imH / 2); // Adjust for rectangle's top-left corner
    c.drawImage(img, 0, 0, imW, imH); // Draw image
    c.restore(); // Restore canvas state

    if (showVect){
        drawLine(c, this.carPos.x,this.carPos.y,  this.carPos.x - Math.sin(this.facingAngle)*60,  this.carPos.y + Math.cos(this.facingAngle)*60, 3)
    
        drawLine(c, this.carPos.x,this.carPos.y,  this.carPos.x +this.moveForce.x*10,  this.carPos.y + this.moveForce.y*10, 3, 'red')
   
    }
   }
   drawTrail(){
    let opp = 0;
    let dist = 0;
    for (let t of this.trail){
        if (t.length > 0){
        opp = 0;
       
        for (let i = 0; i < t.length - 1; i++) {
           
            // Get the current and next points
            let currentPoint = t[i];
            let nextPoint = t[i + 1];
           
            dist = distance( currentPoint[0],currentPoint[1], nextPoint[0], nextPoint[1])
            if (dist > 21 ){
               
            }else{
                drawLine(c,currentPoint[0],currentPoint[1], nextPoint[0], nextPoint[1], 5, `rgba(0,0,0,${opp})`, 'butt')
            }
             opp+= 0.0005;
           
        }
      

        }
        
    
        

    }
    
   }

   
}

  

const drifting_sound = new Audio('nyom.mp3');
const park = new Image();
park.src = "newpark.jpg"; // Replace with the path to your image
const parkW = park.naturalWidth; // Use the image's natural dimensions
const parkH = park.naturalHeight;
// Image setup
const img = new Image();
img.src = "p911.png"; // Replace with the path to your image
const imgWidth = img.naturalWidth; // Use the image's natural dimensions
const imgHeight = img.naturalHeight;

let parkscale = 1.1;
let arrows = [false,false,false,false]
let wasd = [false,false,false,false]
let mouseX = 0;
let mouseY = 0;
let LeftClick = false;
let RightClick = false;
let SpacePressed = false;

let car = new DriftCar(295,440, 0.48, 0.08);


img.onload = () => {
    console.log("Image loaded!");
    
};

park.onload = () =>{
    animate();
    

}


function setupKeys() {
    document.addEventListener('mousemove', function(event) {
        mouseX = event.clientX; // X position relative to the viewport
        mouseY = event.clientY; // Y position relative to the viewport
    });

    // Handle keydown events
    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowUp' ) arrows[0] = true;
        if (event.key === 'ArrowDown') arrows[1] = true;
        if (event.key === 'ArrowLeft') arrows[2] = true;
        if (event.key === 'ArrowRight') arrows[3] = true;
        if ( event.key === 'w') wasd[0] = true;
        if (event.key === 's') wasd[1] = true;
        if ( event.key === 'a') wasd[2] = true;
        if ( event.key === 'd') wasd[3] = true;
        if (event.key === ' ') SpacePressed = true;
       
    });

    // Handle keyup events
    document.addEventListener('keyup', function(event) {
        if (event.key === 'ArrowUp' ) arrows[0] = false;
        if (event.key === 'ArrowDown') arrows[1] = false;
        if (event.key === 'ArrowLeft') arrows[2] = false;
        if (event.key === 'ArrowRight') arrows[3] = false;
        if ( event.key === 'w') wasd[0] = false;
        if (event.key === 's') wasd[1] = false;
        if ( event.key === 'a') wasd[2] = false;
        if ( event.key === 'd') wasd[3] = false;
        if (event.key === ' ') SpacePressed = false;
    });

    // Mouse down event listener to detect mouse press
    document.addEventListener('mousedown', function(event) {
        if (event.button === 2) {
            // Right-click detected
            RightClick = true;
        } else if (event.button === 0) {
            // Left-click detected
            LeftClick = true;
        }
    });

    // Mouse up event listener to detect mouse release
    document.addEventListener('mouseup', function(event) {
        if (event.button === 2) {
            RightClick = false;
        } else if (event.button === 0) {
            LeftClick = false;
        }
    });
}


setupKeys()

var c = canvas.getContext('2d');
resizeCanvas(canvas);
instructions.textContent = 'Drifing Cars';



function draw() {
    c.save();
    c.scale(parkscale,parkscale)
    c.drawImage(park, -100, -340, parkW, parkH); // Draw image
    c.restore(); // Restore canvas state
    
    car.drawTrail()

    car.draw(img, imgWidth, imgHeight, SpacePressed)
    
}

let lastFrameTime = performance.now();
let vol = 0;

function update() {
    const currentFrameTime = performance.now();
    const delta = currentFrameTime - lastFrameTime;
    const fpss = (1000 / delta).toFixed(2); // Calculate and format FPS
    lastFrameTime = currentFrameTime;
    fps.textContent = 'fps: ' + Math.floor(fpss);

    car.update(wasd, imgWidth, imgHeight)
    count.textContent = 'porche 911';

    drifting_sound.play()

    let l = 1/(Math.abs(car.moveForce.x) + Math.abs(car.moveForce.y))

    if (l > 1) l = 1
    //console.log(1-l)
    drifting_sound.volume = 1-l;

   
    if (1-l < 0.2 || drifting_sound.currentTime > 19){
        drifting_sound.pause();
        drifting_sound.currentTime = 0;
    }
  

 
}


function animate() {
    requestAnimationFrame(animate);
    resizeCanvas(canvas);
    c.fillStyle = "rgba(12, 12, 12, 1)";
    c.fillRect(0, 0, innerWidth, innerHeight);
    update();
   
    draw();
   
    
}

