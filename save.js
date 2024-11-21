var canvas = document.querySelector('canvas');
import { resizeCanvas, randomF, randomInt, Vec2, distance, circle, drawLine,drawRectangle} from './functions.js';

  

function lerpVectors(A, B, t) {
    let x = A.x + (B.x - A.x) * t;
    let y =  A.y + (B.y - A.y) * t;
    return new Vec2(x, y);
}

class DriftCar {
    constructor(x, y, initialAngle=0) {
       this.carPos = new Vec2(x,y)
       this.moveForce = new Vec2(0,0)
       this.facingAngle = initialAngle;
       this.moveSpeed = 0;
       this.Drag = 0.96;
       this.maxSpeed = 16.;
       this.steerAngle = 0.01;
       this.Traction = 0.01
       this.trail = [[],[],[],[]]
       
    }

   update(instructions){
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

    

   this.moveForce.clampMagnitude(maxSpeed);
   let newTraction =  this.Traction*this.moveForce.magnitude()*0.1;
   let moveForceV = lerpVectors(this.moveForce.normalize(), new Vec2(-Math.sin(this.facingAngle),  Math.cos(this.facingAngle)), newTraction)
   let mag =this.moveForce.magnitude()
   this.moveForce.x =moveForceV.x *mag
   this.moveForce.y =moveForceV.y *mag

    this.trail[0].push([this.carPos.x - Math.sin(this.facingAngle+10)*30,this.carPos.y + Math.cos(this.facingAngle+10)*30])
    this.trail[1].push([this.carPos.x - Math.sin(this.facingAngle-10)*30,this.carPos.y + Math.cos(this.facingAngle-10)*30])
    
    if (newTraction > 0.006){
        this.trail[2].push([this.carPos.x - Math.sin(this.facingAngle - 0.4)*40,this.carPos.y + Math.cos(this.facingAngle -0.4)*40])
        this.trail[3].push([this.carPos.x - Math.sin(this.facingAngle + 0.4)*40,this.carPos.y + Math.cos(this.facingAngle +0.4)*40])
    }

    
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
    
    
   
    if (this.carPos.x < 0){this.carPos.x = canvas.width}
    if (this.carPos.y < 0){this.carPos.y = canvas.height}
    if (this.carPos.x > canvas.width){this.carPos.x =  0}
    if (this.carPos.y > canvas.height){this.carPos.y = 0}

   }
   draw(img, scale){
    c.save(); // Save canvas state
    c.translate(this.carPos.x, this.carPos.y); // Move origin to the center of the rectangle
    c.rotate(this.facingAngle-1.571); // Rotate canvas
    c.scale(scale,scale)
    c.translate(-imgWidth / 2, -imgHeight / 2); // Adjust for rectangle's top-left corner
    c.drawImage(img, 0, 0, imgWidth, imgHeight); // Draw image
    c.restore(); // Restore canvas state
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

  


const park = new Image();
park.src = "park.jpeg"; // Replace with the path to your image
const parkW = park.naturalWidth; // Use the image's natural dimensions
const parkH = park.naturalHeight;
// Image setup
const img = new Image();
img.src = "p911.png"; // Replace with the path to your image
const imgWidth = img.naturalWidth; // Use the image's natural dimensions
const imgHeight = img.naturalHeight;
let carscale = 0.1;
let parkscale = 1.6;
let arrows = [false,false,false,false]
let MouseX = 0;
let mouseY = 0;
let LeftClick = false;
let RightClick = false;
let SpacePressed = false;

let car = new DriftCar(295,440, 0.48);

img.onload = () => {
    console.log("Image loaded!");
};


function setupKeys() {
    document.addEventListener('mousemove', function(event) {
        mouseX = event.clientX; // X position relative to the viewport
        mouseY = event.clientY; // Y position relative to the viewport
    });

    // Handle keydown events
    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowUp' || event.key === 'w') arrows[0] = true;
        if (event.key === 'ArrowDown'|| event.key === 's') arrows[1] = true;
        if (event.key === 'ArrowLeft'|| event.key === 'a') arrows[2] = true;
        if (event.key === 'ArrowRight'|| event.key === 'd') arrows[3] = true;
        if (event.key === ' ') SpacePressed = true;
    });

    // Handle keyup events
    document.addEventListener('keyup', function(event) {
        if (event.key === 'ArrowUp' || event.key === 'w') arrows[0] = false;
        if (event.key === 'ArrowDown'|| event.key === 's') arrows[1] = false;
        if (event.key === 'ArrowLeft'|| event.key === 'a') arrows[2] = false;
        if (event.key === 'ArrowRight'|| event.key === 'd') arrows[3] = false;
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
let carPos = new Vec2(295, 440);
let facingAngle = 0.48;
let Moveforce =  new Vec2(0, 0)
let moveSpeed = 0.7;
let Drag = 0.96;
let maxSpeed = 16.;
let steerAngle = 0.01;
let Traction = 0.01
let trail = [[],[],[],[]]




function draw() {

    c.save();
    c.scale(parkscale,parkscale)

    c.drawImage(park, 0, 0, imgWidth, imgHeight); // Draw image
    c.restore(); // Restore canvas state
    let dist = 0;


    //c.strokeStyle = 'rgba(0,0,0,0.1)';
    //c.lineWidth = 5;
    //c.lineCap = 'round';
    // Draw the main line (shaft of the arrow)
    //c.beginPath();
    //c.moveTo(trail[0][0][0], trail[0][0][1]);
    
    let opp = 0;
    for (let t of trail){
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
   
    
    
   if (SpacePressed){
     drawLine(c, carPos.x,carPos.y,  carPos.x - Math.sin(facingAngle)*60,  carPos.y + Math.cos(facingAngle)*60, 3)
    
     drawLine(c, carPos.x,carPos.y,  carPos.x +Moveforce.x*10,  carPos.y + Moveforce.y*10, 3, 'red')

   }
   
    c.save(); // Save canvas state
    c.translate(carPos.x, carPos.y); // Move origin to the center of the rectangle
    c.rotate(facingAngle-1.571); // Rotate canvas
    c.scale(carscale,carscale)
    c.translate(-imgWidth / 2, -imgHeight / 2); // Adjust for rectangle's top-left corner
    c.drawImage(img, 0, 0, imgWidth, imgHeight); // Draw image
    c.restore(); // Restore canvas state

    car.draw(img, 0.1)
    car.drawTrail()
    car.update(arrows)
  
    
   

    
}

let lastFrameTime = performance.now();

function update() {
    const currentFrameTime = performance.now();
    const delta = currentFrameTime - lastFrameTime;
    const fpss = (1000 / delta).toFixed(2); // Calculate and format FPS
    lastFrameTime = currentFrameTime;
    fps.textContent = 'fps: ' + Math.floor(fpss);

    moveSpeed =  Math.pow(Moveforce.magnitude(), 1.3)*0.04 +0.1 //nonlinar speed

    if (arrows[1]){
        Moveforce.x += Math.sin(facingAngle) * moveSpeed;
        Moveforce.y -= Math.cos(facingAngle)* moveSpeed;
    }
    else if (arrows[0]){
        Moveforce.x -= Math.sin(facingAngle) * moveSpeed;
        Moveforce.y += Math.cos(facingAngle)* moveSpeed;
    }

    //steering
    let value = 0;
    if (arrows[3])value = 1;
    if (arrows[2])value = -1;
    facingAngle += value * Moveforce.magnitude() * steerAngle;


    carPos.x += Moveforce.x;
    carPos.y += Moveforce.y;

    Moveforce.x *= Drag;
    Moveforce.y *= Drag;

    

    Moveforce.clampMagnitude(maxSpeed);
    let newTraction =  Traction*Moveforce.magnitude()*0.1;
    let MoveForceV = lerpVectors(Moveforce.normalize(), new Vec2(-Math.sin(facingAngle),  Math.cos(facingAngle)), newTraction)
    let mag = Moveforce.magnitude()
    Moveforce.x = MoveForceV.x *mag
    Moveforce.y = MoveForceV.y *mag

    trail[0].push([carPos.x - Math.sin(facingAngle+10)*30,carPos.y + Math.cos(facingAngle+10)*30])
    trail[1].push([carPos.x - Math.sin(facingAngle-10)*30,carPos.y + Math.cos(facingAngle-10)*30])
    
    if (newTraction > 0.006){
        trail[2].push([carPos.x - Math.sin(facingAngle - 0.4)*40,carPos.y + Math.cos(facingAngle -0.4)*40])
        trail[3].push([carPos.x - Math.sin(facingAngle + 0.4)*40,carPos.y + Math.cos(facingAngle +0.4)*40])
    
    }

    
    if (trail[0].length > 200){
        trail[0].shift()
    }
    if (trail[1].length > 200){
        trail[1].shift()
    }
    if (trail[2].length > 200){
        trail[2].shift()
    }
    if (trail[3].length > 200){
        trail[3].shift()
    }
    
    
   

    
    
    

   
    if (carPos.x < 0){carPos.x = canvas.width}
    if (carPos.y < 0){carPos.y = canvas.height}
    if (carPos.x > canvas.width){carPos.x =  0}
    if (carPos.y > canvas.height){carPos.y = 0}
    count.textContent = `${Math.floor(Moveforce.magnitude()*30)/10} km/h`;

   

 
}

function animate() {
    requestAnimationFrame(animate);
    resizeCanvas(canvas);
    c.fillStyle = "rgba(20, 23, 50, 1)";
    c.fillRect(0, 0, innerWidth, innerHeight);
    update();
   
    draw();
   
    
}

animate(); // Start the animation loop
