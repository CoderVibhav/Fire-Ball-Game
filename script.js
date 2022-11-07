let canvas = document.querySelector('canvas')
let score = document.getElementById('score')
const c = canvas.getContext('2d');
var pts = document.getElementById('pts');
var start_btn = document.getElementById('start_btn');
var modal = document.getElementById('modal');
canvas.height = window.innerHeight
canvas.width = window.innerWidth
var enemies, projection, particles;
var shootingAudio2 = new Audio('shootingAudio2.mp3');
let updateScore;

class Player{
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color
    }
    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.fillStyle = this.color;
        c.fill();
    }   
}

class Projectile{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.fillStyle = this.color;
        c.fill();
        this.update();
    }

    update(){
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

class Enemies{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.fillStyle = this.color;
        c.fill();
        this.update();
    }

    update(){
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

let friction = 0.96;

class Particles{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.opacity = 1;
    }

    draw(){
        c.save();
        c.globalAlpha = this.opacity;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
        this.update();
    }

    update(){
        this.opacity -= 0.01;
        this.velocity.x *= 0.96;
        this.velocity.y *= 0.96;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}


window.addEventListener('click', function(event){
    shootingAudio2.play();
    //for finding the angle we would de destination-current position.
    //another thing to remember is we would always take y first and then x
    let angle = Math.atan2(
        event.clientY-canvas.height/2,
        event.clientX-canvas.width/2
    )
    let velocity = {x:Math.cos(angle)*5, y:Math.sin(angle)*5}
    projection.push(new Projectile(canvas.width/2, canvas.height/2, 5, "white", velocity));
    // shootingAudio2.pause();
})

function generateInRange(mini, maxi){
    return (Math.random()*(maxi-mini)) + mini; 
}

const colorArray =  ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
'#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
'#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
'#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
'#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
'#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
'#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
'#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
'#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
'#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

function spawnEnemies(){
    setInterval(function(){
        let x,y;
        let radius = generateInRange(20, 40);
        let rand = Math.random();
        //Spawning from left or right side
        if(rand <= 0.5){ 
            x = Math.random() >= 0.5 ? 0-radius : canvas.width+radius;
            y = Math.random()*canvas.height;
        }
        //spawning from top or bottom
        else{
            x = Math.random() * canvas.width;
            y = Math.random() >= 0.5 ? 0-radius : canvas.height+radius;
        }

        let color = colorArray[Math.floor(Math.random()*colorArray.length-1)];
        let angle = Math.atan2(canvas.height/2 - y, canvas.width/2 - x);
        let vel = {x:Math.cos(angle)*2, y:Math.sin(angle)*2}
        enemies.push(new Enemies(x,y,radius,color,vel))
    }, 1500)

}

function pythagoras(x1, y1, x2, y2){
    return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
}
let animationID;
function animate(){
    animationID = requestAnimationFrame(animate);
    c.clearRect(0, 0, window.innerWidth, window.innerHeight);
    c.fillStyle = 'rgba(0 ,0 ,0 ,0.8)';
    c.fillRect(0,0,canvas.width,canvas.height)
    var p1 = new Player(canvas.width/2, canvas.height/2, 20, "white");
    p1.draw();
    for(let i=0; i<projection.length; i++){
        projection[i].draw();
        if(projection[i].x < 0 || projection[i].x > canvas.width 
            || projection[i].y < 0 || projection[i].y > canvas.height){
                projection.splice(i, 1);
            }
    }
    for(let k=0; k<particles.length; k++){
        particles[k].draw();
        if(particles[k].opacity <= 0){
            particles.splice(k, 1);
        }
    }
    for(let i=0; i<enemies.length; i++){
        enemies[i].draw();
        for(let j=0; j<projection.length; j++){
            if(pythagoras(enemies[i].x, enemies[i].y, projection[j].x, projection[j].y)
             < enemies[i].radius + projection[i].radius){
                // enemies.splice(i, 1);
                // projection.splice(j, 1);
                if(enemies[i].radius-10 >= 10){
                    // enemies[i].radius -= 10;
                    gsap.to(enemies[i], {
                        radius: enemies[i].radius-10
                    })
                    projection.splice(i, 1);
                    updateScore += 50;
                }
                else{
                    enemies.splice(i, 1);
                    projection.splice(j, 1);
                    updateScore += 100;
                }
                score.innerHTML = updateScore;
                for(let k=0; k<enemies[i].radius*2; k++){
                    particles.push(new Particles(enemies[i].x, enemies[i].y, Math.random()*3, enemies[i].color, 
                    {x:generateInRange(-3,3), y:generateInRange(-3,3)}));
                }
            }
        }
        if(pythagoras(p1.x, p1.y, enemies[i].x, enemies[i].y) < p1.radius + enemies[i].radius)  {
            modal.style.display = 'flex';
            pts.innerText = updateScore;
            cancelAnimationFrame(animationID);
        }
    }
}

function init(){
    enemies = []
    projection = [];
    particles = [];
    updateScore = 0;
    score.innerHTML = 0;
}

start_btn.addEventListener('click', function(){
    init()
    modal.style.display = 'none';
    animate()
    spawnEnemies();
})
