
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let frames = 0;
const DEGREE = Math.PI/180;

// Load sprite image
const sprite = new Image();
sprite.src = "https://i.imgur.com/9YjGZ4T.png"; // bird, pipes, background

// Game state
const state = {
    current : 0,
    getReady : 0,
    game : 1,
    over : 2
};

// Control
canvas.addEventListener("click", function(){
    switch(state.current){
        case state.getReady:
            state.current = state.game;
            break;
        case state.game:
            bird.flap();
            break;
        case state.over:
            state.current = state.getReady;
            bird.speed = 0;
            pipes.reset();
            score.reset();
            break;
    }
});

// Bird
const bird = {
    animation : [
        {sX: 276, sY: 112},
        {sX: 276, sY: 139},
        {sX: 276, sY: 164},
        {sX: 276, sY: 139}
    ],
    x : 50,
    y : 150,
    w : 34,
    h : 26,
    frame : 0,
    gravity : 0.25,
    jump : 4.6,
    speed : 0,
    rotation : 0,

    draw : function(){
        let birdFrame = this.animation[this.frame];
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, birdFrame.sX, birdFrame.sY, this.w, this.h, - this.w/2, - this.h/2, this.w, this.h);
        ctx.restore();
    },

    flap : function(){
        this.speed = - this.jump;
    },

    update: function(){
        this.period = state.current == state.getReady ? 10 : 5;
        this.frame += frames % this.period == 0 ? 1 : 0;
        this.frame = this.frame % this.animation.length;

        if(state.current == state.getReady){
            this.y = 150;
            this.rotation = 0 * DEGREE;
        } else {
            this.speed += this.gravity;
            this.y += this.speed;

            if(this.y + this.h/2 >= canvas.height - 112){
                this.y = canvas.height - 112 - this.h/2;
                if(state.current == state.game){
                    state.current = state.over;
                }
            }

            if(this.speed >= this.jump){
                this.rotation = 90 * DEGREE;
                this.frame = 1;
            } else {
                this.rotation = -25 * DEGREE;
            }
        }
    }
};

// Pipes
const pipes = {
    position: [],
    top: { sX: 553, sY: 0 },
    bottom: { sX: 502, sY: 0 },
    w: 53,
    h: 400,
    gap: 85,
    maxYPos: -150,
    dx: 2,

    draw: function(){
        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i];

            let topYPos = p.y;
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);

            let bottomYPos = p.y + this.h + this.gap;
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);
        }
    },

    update: function(){
        if(state.current !== state.game) return;

        if(frames % 100 == 0){
            this.position.push({
                x : canvas.width,
                y : this.maxYPos * (Math.random() + 1)
            });
        }
        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i];
            p.x -= this.dx;

            if(p.x + this.w <= 0){
                this.position.shift();
                score.value += 1;
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
        }
    },

    reset : function(){
        this.position = [];
    }
};

// Score
const score = {
    best : parseInt(localStorage.getItem("best")) || 0,
    value : 0,

    draw : function(){
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";

        if(state.current == state.game){
            ctx.lineWidth = 2;
            ctx.font = "35px Arial";
            ctx.fillText(this.value, canvas.width/2, 50);
            ctx.strokeText(this.value, canvas.width/2, 50);
        } else if(state.current == state.over){
            ctx.font = "25px Arial";
            ctx.fillText("Best: " + this.best, canvas.width/2 - 40, canvas.height/2);
            ctx.strokeText("Best: " + this.best, canvas.width/2 - 40, canvas.height/2);
        }
    },

    reset : function(){
        this.value = 0;
    }
};

function draw(){
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    pipes.draw();
    bird.draw();
    score.draw();
}

function update(){
    bird.update();
    pipes.update();
}

function loop(){
    update();
    draw();
    frames++;
    requestAnimationFrame(loop);
}

loop();
