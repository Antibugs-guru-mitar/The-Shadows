const canvas = document.createElement("canvas");
document.querySelector(".game-container").appendChild(canvas);
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 450;

// ===== UI ELEMENTS =====
const startScreen = document.querySelector(".start-screen");
const gameOverScreen = document.querySelector(".game-over");
const hud = document.querySelector(".hud");

// ===== GAME STATE =====
let gameRunning = false;

// ===== CAMERA =====
let cameraX = 0;

// ===== PLAYER =====
const player = {
    x: 50,
    y: 300,
    w: 30,
    h: 30,
    dy: 0,
    speed: 3,
    jumpPower: -11,
    grounded: false,
    health: 5,
    canAttack: true
};

// ===== LEVEL =====
const level = {
    platforms: [
        { x: 0, y: 400, w: 1200, h: 50 },
        { x: 250, y: 330, w: 120, h: 10 },
        { x: 500, y: 280, w: 120, h: 10 }
    ],
    enemies: [
        { x: 600, y: 370, w: 30, h: 30, dir: -1, health: 3 }
    ]
};

// ===== INPUT =====
let keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// ===== START GAME =====
function startGame() {
    startScreen.style.display = "none";
    gameRunning = true;
    loop();
}

// ===== GAME OVER =====
function endGame() {
    gameRunning = false;
    gameOverScreen.style.display = "flex";
}

// ===== RESTART =====
function restartGame() {
    location.reload();
}

// ===== ATTACH BUTTONS =====
document.querySelector(".start-btn").addEventListener("click", startGame);
document.querySelector(".restart-btn").addEventListener("click", restartGame);

// ===== ATTACK =====
document.addEventListener("keydown", e => {
    if (e.code === "KeyZ" && gameRunning && player.canAttack) {
        attack();
    }
});

let attackBox = { x: 0, y: 0, w: 40, h: 20, active: false };

function attack() {
    player.canAttack = false;
    attackBox.active = true;

    attackBox.x = player.x + 20;
    attackBox.y = player.y + 10;

    setTimeout(() => attackBox.active = false, 150);
    setTimeout(() => player.canAttack = true, 400);
}

// ===== UPDATE =====
function update() {

    if (!gameRunning) return;

    // Movement
    if (keys["ArrowRight"]) player.x += player.speed;
    if (keys["ArrowLeft"]) player.x -= player.speed;

    // Jump
    if (keys["Space"] && player.grounded) {
        player.dy = player.jumpPower;
        player.grounded = false;
    }

    // Gravity
    player.dy += 0.6;
    player.y += player.dy;

    player.grounded = false;

    // Platforms
    level.platforms.forEach(p => {
        if (collide(player, p)) {
            player.y = p.y - player.h;
            player.dy = 0;
            player.grounded = true;
        }
    });

    // Enemies
    level.enemies.forEach(e => {

        e.x += e.dir * 1.2;

        if (e.x < 500 || e.x > 750) e.dir *= -1;

        if (attackBox.active && collide(attackBox, e)) {
            e.health--;
            e.x += 10;
        }

        if (collide(player, e)) {
            player.health--;
            player.x -= 20;
        }

        if (player.health <= 0) {
            endGame();
        }
    });

    level.enemies = level.enemies.filter(e => e.health > 0);

    cameraX = player.x - 150;

    // HUD update
    hud.innerHTML = `Health: ${player.health}`;
}

// ===== COLLISION =====
function collide(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

// ===== DRAW =====
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-cameraX, 0);

    // Player
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // Attack
    if (attackBox.active) {
        ctx.fillStyle = "cyan";
        ctx.fillRect(attackBox.x, attackBox.y, attackBox.w, attackBox.h);
    }

    // Platforms
    ctx.fillStyle = "green";
    level.platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

    // Enemies
    ctx.fillStyle = "black";
    level.enemies.forEach(e => ctx.fillRect(e.x, e.y, e.w, e.h));

    ctx.restore();
}

// ===== LOOP =====
function loop() {
    if (!gameRunning) return;
    update();
    draw();
    requestAnimationFrame(loop);
}
