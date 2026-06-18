const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// unlock audio on first click (browser requirement)
document.addEventListener("click", () => {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
});

// ================= SOUND FUNCTION =================
function playSound(type) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  let freq = 300;

  if (type === "jump") freq = 350;
  if (type === "coin") freq = 700;
  if (type === "hit") freq = 120;

  osc.frequency.value = freq;
  osc.type = "square";

  gain.gain.value = 0.15;

  osc.start();
  osc.stop(audioCtx.currentTime + 0.12);
}
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ================== CREATE SIMPLE SPRITES ==================
function createSprite(color) {
  const c = document.createElement("canvas");
  c.width = 32;
  c.height = 32;
  const x = c.getContext("2d");

  x.fillStyle = color;

  // pixel style block character
  x.fillRect(8, 8, 16, 16);
  x.fillRect(4, 12, 4, 8);
  x.fillRect(24, 12, 4, 8);
  x.fillRect(10, 24, 4, 6);
  x.fillRect(18, 24, 4, 6);

  return c;
}

// player animation frames
const playerFrames = [
  createSprite("red"),
  createSprite("darkred")
];

const enemySprite = createSprite("purple");

// coin sprite
function createCoin() {
  const c = document.createElement("canvas");
  c.width = 20;
  c.height = 20;
  const x = c.getContext("2d");

  x.fillStyle = "gold";
  x.beginPath();
  x.arc(10, 10, 8, 0, Math.PI * 2);
  x.fill();

  return c;
}
const coinSprite = createCoin();

// ================= PLAYER =================
const player = {
  x: 50,
  y: 350,
  w: 32,
  h: 32,
  vx: 0,
  vy: 0,
  frame: 0,
  jump: false
};

const gravity = 0.8;

// ================= WORLD =================
const platforms = [
  {x: 0, y: 420, w: 900, h: 30},
  {x: 150, y: 340, w: 120, h: 10},
  {x: 320, y: 290, w: 120, h: 10},
  {x: 500, y: 250, w: 120, h: 10},
  {x: 680, y: 300, w: 120, h: 10}
];

let coins = [
  {x: 160, y: 310, taken: false},
  {x: 340, y: 260, taken: false},
  {x: 520, y: 220, taken: false}
];

const enemy = {
  x: 400,
  y: 390,
  w: 32,
  h: 32,
  dir: 1
};

// ================= INPUT =================
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// ================= GAME LOOP =================
function update() {

  // movement
  if (keys["ArrowLeft"]) player.vx = -4;
  else if (keys["ArrowRight"]) player.vx = 4;
  else player.vx = 0;

  // animation
  if (player.vx !== 0) {
    player.frame += 0.2;
  }

  // jump
  if ((keys["ArrowUp"] || keys[" "]) && !player.jump) {
    player.vy = -13;
    player.jump = true;
  }

  // physics
  player.vy += gravity;
  player.x += player.vx;
  player.y += player.vy;

  // platform collision
  player.jump = true;
  for (let p of platforms) {
    if (
      player.x < p.x + p.w &&
      player.x + player.w > p.x &&
      player.y < p.y + p.h &&
      player.y + player.h > p.y
    ) {
      if (player.vy > 0) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.jump = false;
      }
    }
  }

  // enemy movement
  enemy.x += enemy.dir * 2;
  if (enemy.x < 300 || enemy.x > 600) enemy.dir *= -1;

  // enemy collision reset
  if (
    player.x < enemy.x + enemy.w &&
    player.x + player.w > enemy.x &&
    player.y < enemy.y + enemy.h &&
    player.y + player.h > enemy.y
  ) {
    player.x = 50;
    player.y = 350;
  }

  draw();
  requestAnimationFrame(update);
}

// ================= DRAW =================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background hills
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.beginPath();
  ctx.arc(200, 450, 100, 0, Math.PI * 2);
  ctx.fill();

  // player sprite
  ctx.drawImage(
    playerFrames[Math.floor(player.frame) % 2],
    player.x,
    player.y,
    player.w,
    player.h
  );

  // platforms
  ctx.fillStyle = "#8B4513";
  for (let p of platforms) {
    ctx.fillRect(p.x, p.y, p.w, p.h);
  }

  // coins
  for (let c of coins) {
    if (!c.taken) {
      ctx.drawImage(coinSprite, c.x, c.y, 18, 18);
    }
  }

  // enemy
  ctx.drawImage(enemySprite, enemy.x, enemy.y, enemy.w, enemy.h);

  // goal
  ctx.fillStyle = "green";
  ctx.fillRect(850, 380, 20, 40);
}

update();
