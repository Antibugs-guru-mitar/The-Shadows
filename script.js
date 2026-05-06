const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 450;

// ===== CAMERA =====
let cameraX = 0;

// ===== PLAYER =====
const player = {
    x: 50,
    y: 300,
    w: 30,
    h: 30,
    dx: 0,
    dy: 0,
    speed: 3,
    jumpPower: -11,
    grounded: false,
    health: 5,
    canAttack: true
};

// ===== ATTACK =====
let attackBox = {
    x: 0,
    y: 0,
    w: 40,
    h: 20,
    active: false
};

// ===== GRAVITY =====
const gravity = 0.6;

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

// ===== ATTACK LOGIC =====
document.addEventListener("keydown", e => {
    if (e.code === "KeyZ" && player.canAttack) {
        attack();
    }
});

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

    // Movement
    if (keys["ArrowRight"]) player.x += player.speed;
    if (keys["ArrowLeft"]) player.x -= player.speed;

    // Jump
    if (keys["Space"] && player.grounded) {
        player.dy = player.jumpPower;
        player.grounded = false;
    }

    // Gravity
    player.dy += gravity;
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

    // Enemy logic
    level.enemies.forEach(e => {

        e.x += e.dir * 1.2;

        if (e.x < 500 || e.x > 750) e.dir *= -1;

        // enemy hit by attack
        if (attackBox.active && collide(attackBox, e)) {
            e.health--;
            e.x += 10; // knockback

            if (e.health <= 0) {
                e.dead = true;
            }
        }

        // enemy hits player
        if (collide(player, e)) {
            player.health--;
            player.x -= 20;
        }
    });

    // remove dead enemies
    level.enemies = level.enemies.filter(e => !e.dead);

    cameraX = player.x - 150;
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

    // player
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // attack box
    if (attackBox.active) {
        ctx.fillStyle = "cyan";
        ctx.fillRect(attackBox.x, attackBox.y, attackBox.w, attackBox.h);
    }

    // platforms
    ctx.fillStyle = "green";
    level.platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

    // enemies
    ctx.fillStyle = "black";
    level.enemies.forEach(e => {
        ctx.fillRect(e.x, e.y, e.w, e.h);

        // health bar
        ctx.fillStyle = "red";
        ctx.fillRect(e.x, e.y - 5, e.health * 10, 3);
        ctx.fillStyle = "black";
    });

    ctx.restore();

    // UI
    ctx.fillStyle = "black";
    ctx.fillText("Health: " + player.health, 20, 20);
}

// ===== LOOP =====
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
