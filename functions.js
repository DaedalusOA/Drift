

export function resizeCanvas(canvas) {
    canvas.width = window.innerWidth ;
    canvas.height = window.innerHeight ;
}

export function distance(ax,ay,bx,by){
    let dx = ax - bx;
    let dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);  // Pythagorean theorem
}

// Detect if the device is mobile
export function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

export function randomInt(num){
    num = Math.floor(Math.random() * num);
    return num;
}
export function randomF(num){
    num = Math.random() * num;
    return num;
}

export function drawLine(ctx,x1, y1, x2, y2, width, color='white', cap='round') {
    // Set styles for smooth drawing
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = cap;
    // Draw the main line (shaft of the arrow)
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

export class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    // Subtract another vector from this one
    subtract(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }
    clampMagnitude(maxMagnitude){
        const magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
        if (magnitude > maxMagnitude) {
            let scale = maxMagnitude / magnitude;
            this.x *= scale;
            this.y *= scale;
        }
    


    }
    magnitude(){
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize(){
        const magnitude = Math.sqrt(this.x * this.x + this.y * this.y );
        let x = 0;
        let y = 0;
        if (magnitude === 0)  {
            y = 0 
            x = 0 
       }else{
        x = this.x / magnitude
        y = this.y / magnitude
       }

       
       return new Vec2(x,y)

    }
   

    
      
}

export function circle(c,r,g,b,a,x,y,size){
    let rgbaColor = `rgba(${r}, ${g}, ${b}, ${a})`;
    c.beginPath();
    c.arc(x, y, size, 0, Math.PI * 2);
    c.fillStyle = rgbaColor;
    c.fill();
    c.closePath();
}

export function drawRectangle(c, color, x, y, rectWidth, rectHeight) {
    c.fillStyle = color;

    // Draw the rectangle at specified position and size
    c.fillRect(x, y, rectWidth, rectHeight);
}