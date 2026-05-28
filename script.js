const game = document.getElementById("game");
const player = document.getElementById("player");

const scoreText = document.getElementById("score");
const levelText = document.getElementById("level");
const livesText = document.getElementById("lives");

const powerText =
document.getElementById("powerText");

const powerFill =
document.getElementById("powerFill");

const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");

const gameOver = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

/* GAME */

let gameRunning = false;

let score = 0;
let level = 1;

let cameraSpeed = 1.5;

let lives = 3;

/* PLAYER */

let playerWidth = 104;
let playerHeight = 104;

let playerX = window.innerWidth / 2 - 52;
let playerY = window.innerHeight - 300;

let velocityY = 0;

let gravity = 0.8;

let jumpForce = -24;

let moveSpeed = 9;

let grounded = false;

let playerDirection = 1;

/* SPRITESHEET */

const frameSize = 104;

let animFrame = 0;
let animTimer = 0;

/* ARRAYS */

let platforms = [];
let rocks = [];
let bullets = [];
let particles = [];

/* INPUT */

let keys = {};

let powerReady = true;

let powerCooldown = 0;

const maxPowerCooldown = 30000;

/* SOM */

const jumpSound =
new Audio("./imagens/pulo.wav");

jumpSound.volume = 0.5;

/* IMAGENS */

const platformImages = [

    "./imagens/plataforma1.png",
    "./imagens/plataforma2.png",
    "./imagens/plataforma3.png",
    "./imagens/plataforma4.png"
];

const asteroidImages = [

    "./imagens/asteroide1.png",
    "./imagens/asteroide2.png"
];

/* CONTROLES */

document.addEventListener("keydown", (e)=>{

    keys[e.code] = true;

    if(e.code === "Space"){

        shoot();
    }

    if(e.code === "ShiftLeft"){

        usePower();
    }
});

document.addEventListener("keyup", (e)=>{

    keys[e.code] = false;
});

/* START */

startBtn.onclick = ()=>{

    menu.style.display = "none";

    startGame();
};

function startGame(){

    gameRunning = true;

    createPlatforms();

    setInterval(spawnRock, 850);

    gameLoop();
}

/* LOOP */

function gameLoop(){

    if(!gameRunning) return;

    updatePlayer();

    updatePlatforms();

    updateRocks();

    updateBullets();

    updateParticles();

    updateDifficulty();

    updateHUD();

    checkGameOver();

    requestAnimationFrame(gameLoop);
}

/* PLAYER */

function updatePlayer(){

    let isMoving = false;

    if(keys["ArrowLeft"]){

        playerX -= moveSpeed;

        playerDirection = -1;

        isMoving = true;
    }

    if(keys["ArrowRight"]){

        playerX += moveSpeed;

        playerDirection = 1;

        isMoving = true;
    }

    if(playerX < 0){

        playerX = 0;
    }

    if(playerX >
    window.innerWidth - playerWidth){

        playerX =
        window.innerWidth - playerWidth;
    }

    velocityY += gravity;

    playerY += velocityY;

    grounded = false;

    platforms.forEach(platform=>{

        if(

            playerX + playerWidth > platform.x &&
            playerX < platform.x + platform.width &&

            playerY + playerHeight > platform.y &&
            playerY + playerHeight < platform.y + 30 &&

            velocityY >= 0

        ){

            playerY =
            platform.y - playerHeight;

            velocityY = 0;

            grounded = true;
        }
    });

    if(keys["ArrowUp"] && grounded){

        velocityY = jumpForce;

        jumpSound.currentTime = 0;

        jumpSound.play();
    }

    animTimer++;

    if(!grounded){

        player.style.backgroundPosition =
        `-${frameSize}px -${frameSize}px`;
    }

    else if(isMoving){

        if(animTimer % 5 === 0){

            animFrame =
            (animFrame + 1) % 8;
        }

        let posX =
        animFrame * -frameSize;

        player.style.backgroundPosition =
        `${posX}px -${frameSize}px`;
    }

    else{

        if(animTimer % 20 === 0){

            animFrame =
            (animFrame + 1) % 2;
        }

        let posX =
        animFrame * -frameSize;

        player.style.backgroundPosition =
        `${posX}px 0px`;
    }

    const cameraTrigger =
    window.innerHeight * 0.35;

    if(playerY < cameraTrigger){

        const moveAmount =
        cameraTrigger - playerY;

        playerY = cameraTrigger;

        platforms.forEach(platform=>{

            platform.y += moveAmount;
        });

        rocks.forEach(rock=>{

            rock.y += moveAmount;
        });

        bullets.forEach(bullet=>{

            bullet.y += moveAmount;
        });

        score += moveAmount * 0.08;
    }

    playerY += cameraSpeed;

    player.style.left =
    playerX + "px";

    player.style.top =
    playerY + "px";

    player.style.transform =
    `scaleX(${playerDirection})`;

    score += 0.03;
}

/* PLATAFORMAS */

function createPlatforms(){

    const startPlatform =
    createPlatform(
        window.innerWidth / 2 - 115,
        window.innerHeight - 180,
        0
    );

    platforms.push(startPlatform);

    for(let i = 1; i < 20; i++){

        const x =
        Math.random() *
        (window.innerWidth - 250);

        const y =
        window.innerHeight - (i * 170);

        const platform =
        createPlatform(x, y, i);

        platforms.push(platform);
    }
}

function createPlatform(x, y, index){

    const platform =
    document.createElement("div");

    platform.classList.add("platform");

    platform.style.left =
    x + "px";

    platform.style.top =
    y + "px";

    platform.style.backgroundImage =
    `url('${platformImages[index % 4]}')`;

    game.appendChild(platform);

    return {

        element:platform,

        x:x,
        y:y,

        width:230,
        height:60
    };
}

function updatePlatforms(){

    platforms.forEach(platform=>{

        platform.y += cameraSpeed;

        if(platform.y >
        window.innerHeight + 80){

            platform.y = -60;

            platform.x =
            Math.random() *
            (window.innerWidth - 250);
        }

        platform.element.style.left =
        platform.x + "px";

        platform.element.style.top =
        platform.y + "px";
    });
}

/* ASTEROIDES */

function spawnRock(){

    if(!gameRunning) return;

    const rock =
    document.createElement("div");

    rock.classList.add("rock");

    const big =
    Math.random() > 0.5;

    const size =
    big ? 90 : 55;

    rock.style.width =
    size + "px";

    rock.style.height =
    size + "px";

    rock.style.backgroundImage =
    big
    ? `url('${asteroidImages[0]}')`
    : `url('${asteroidImages[1]}')`;

    const x =
    Math.random() *
    (window.innerWidth - size);

    rock.style.left =
    x + "px";

    rock.style.top =
    "-100px";

    game.appendChild(rock);

    rocks.push({

        element:rock,

        x:x,
        y:-100,

        width:size,
        height:size,

        speed:4 + (level * 0.5)
    });
}

function updateRocks(){

    rocks.forEach((rock,index)=>{

        rock.y += rock.speed;

        rock.element.style.left =
        rock.x + "px";

        rock.element.style.top =
        rock.y + "px";

        if(checkCollision(

            playerX,
            playerY,

            playerWidth,
            playerHeight,

            rock.x,
            rock.y,

            rock.width,
            rock.height

        )){

            rock.element.remove();

            rocks.splice(index,1);

            damagePlayer();
        }

        bullets.forEach((bullet,bIndex)=>{

            if(checkCollision(

                bullet.x,
                bullet.y,

                bullet.width,
                bullet.height,

                rock.x,
                rock.y,

                rock.width,
                rock.height

            )){

                createExplosion(
                    rock.x,
                    rock.y
                );

                rock.element.remove();

                bullet.element.remove();

                rocks.splice(index,1);

                bullets.splice(bIndex,1);

                score += 10;
            }
        });

        if(rock.y >
        window.innerHeight + 100){

            rock.element.remove();

            rocks.splice(index,1);
        }
    });
}

/* VIDA */

function damagePlayer(){

    lives--;

    livesText.innerText =
    lives;

    player.style.filter =
    "brightness(2)";

    setTimeout(()=>{

        player.style.filter =
        "none";

    },200);

    if(lives <= 0){

        endGame();
    }
}

/* TIRO */

function shoot(){

    if(!gameRunning) return;

    const bullet =
    document.createElement("div");

    bullet.classList.add("bullet");

    const bulletX =
    playerX + (playerWidth / 2) - 5;

    bullet.style.left =
    bulletX + "px";

    bullet.style.top =
    playerY + 10 + "px";

    game.appendChild(bullet);

    bullets.push({

        element:bullet,

        x:bulletX,

        y:playerY + 10,

        width:10,
        height:30
    });
}

function updateBullets(){

    bullets.forEach((bullet,index)=>{

        bullet.y -= 14;

        bullet.element.style.left =
        bullet.x + "px";

        bullet.element.style.top =
        bullet.y + "px";

        if(bullet.y < -100){

            bullet.element.remove();

            bullets.splice(index,1);
        }
    });
}

/* PARTÍCULAS */

function createExplosion(x, y){

    for(let i = 0; i < 15; i++){

        const particle =
        document.createElement("div");

        particle.classList.add("particle");

        game.appendChild(particle);

        particles.push({

            element:particle,

            x:x,
            y:y,

            vx:(Math.random() - 0.5) * 8,

            vy:(Math.random() - 0.5) * 8,

            life:40
        });
    }
}

function updateParticles(){

    particles.forEach((particle,index)=>{

        particle.x += particle.vx;

        particle.y += particle.vy;

        particle.life--;

        particle.element.style.left =
        particle.x + "px";

        particle.element.style.top =
        particle.y + "px";

        particle.element.style.opacity =
        particle.life / 40;

        if(particle.life <= 0){

            particle.element.remove();

            particles.splice(index,1);
        }
    });
}

/* PODER */

function usePower(){

    if(!powerReady) return;

    powerReady = false;

    powerCooldown = maxPowerCooldown;

    powerText.innerText =
    "30s";

    powerFill.style.width =
    "0%";

    const blast =
    document.createElement("div");

    blast.classList.add("power-blast");

    blast.style.left =
    (playerX + playerWidth / 2) + "px";

    blast.style.top =
    (playerY + playerHeight / 2) + "px";

    game.appendChild(blast);

    setTimeout(()=>{

        blast.remove();

    },700);

    rocks.forEach(rock=>{

        createExplosion(
            rock.x,
            rock.y
        );

        rock.element.remove();
    });

    rocks = [];

    const cooldownStart =
    Date.now();

    const cooldownInterval =
    setInterval(()=>{

        const elapsed =
        Date.now() - cooldownStart;

        const percent =
        (elapsed / maxPowerCooldown) * 100;

        powerFill.style.width =
        percent + "%";

        const secondsLeft =
        Math.ceil(
            (maxPowerCooldown - elapsed) / 1000
        );

        powerText.innerText =
        secondsLeft + "s";

        if(elapsed >= maxPowerCooldown){

            clearInterval(cooldownInterval);

            powerReady = true;

            powerText.innerText =
            "PRONTO";

            powerFill.style.width =
            "100%";
        }

    },100);
}

/* SISTEMAS */

function updateDifficulty(){

    level =
    Math.floor(score / 800) + 1;

    cameraSpeed =
    1.5 + (level * 0.04);
}

function updateHUD(){

    scoreText.innerText =
    Math.floor(score);

    levelText.innerText =
    level;
}

/* GAME OVER */

function checkGameOver(){

    if(playerY >
    window.innerHeight + 120){

        endGame();
    }
}

function endGame(){

    gameRunning = false;

    gameOver.style.display =
    "flex";

    finalScore.innerText =
    "PONTUAÇÃO: " +
    Math.floor(score);
}

function restartGame(){

    location.reload();
}

/* COLISÃO */

function checkCollision(

    ax, ay, aw, ah,
    bx, by, bw, bh

){

    const paddingX = 28;
    const paddingY = 18;

    ax += paddingX;
    ay += paddingY;

    aw -= paddingX * 2;
    ah -= paddingY * 2;

    return (

        ax < bx + bw &&
        ax + aw > bx &&

        ay < by + bh &&
        ay + ah > by
    );
}