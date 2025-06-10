
//Refuel nem mükszik: 274.sor

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

let shipX = 1000;
let shipY = 1000;
let velocityX = 0;
let velocityY = 0;
let angle = 0;

const baseAcceleration = 0.2;
const boostAcceleration = 0.5;
let currentAcceleration = baseAcceleration;
const baseMaxSpeed = 6;
const boostMaxSpeed = 12;
let currentMaxSpeed = baseMaxSpeed;

const rotationSpeed = 0.07;
const friction = 0.98;

let colorBlend = 0;

let hp = 100;
let fuel = 100;
let gameOver = false;
let gameOverReason = "";

let score = 0;

const MAP_MIN_X = -1000;
const MAP_MAX_X = 3000;
const MAP_MIN_Y = -1000;
const MAP_MAX_Y = 3000;

const backgroundStars = Array.from({ length: 10000 }, () => ({
  x: Math.random() * 4000 - 1000,
  y: Math.random() * 4000 - 1000,
  radius: Math.random() * 1.5 + 0.5
}));

function checkGameOver() {
  if (hp <= 0) {
    gameOver = true;
    gameOverReason = "You ran out of HP.";
  } else if (fuel <= 0 && Math.abs(velocityX) < 0.05 && Math.abs(velocityY) < 0.05) {
    gameOver = true;
    gameOverReason = "You ran out of fuel.";
  }
  const allCollected = collectibleStars.every(star => star.collected);
  const nearEarth = Math.hypot(shipX - earth.x, shipY - earth.y) < 150;

  if (allCollected && nearEarth) {
  gameOver = true;
  gameWon = true;
  gameOverReason = "Gratulálok! Összegyűjtöttél minden csillagot és visszatértél a Földre!";
  
  // Mutatjuk a linket
  document.getElementById("winLink").style.display = "block";
}
}

function drawFuelBar() {
  const barWidth = 150;
  const barHeight = 10;
  const x = canvas.width - barWidth - 20;
  const y = 45;

  ctx.fillStyle = "white";
  ctx.strokeRect(x, y, barWidth, barHeight);
  ctx.fillStyle = "yellow";
  ctx.fillRect(x, y, (fuel / 100) * barWidth, barHeight);
}

function drawGameOverMessage() {
  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "36px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${gameOverReason}`, canvas.width / 2, 60);

    
  }
}

const blackHole = {
  x: 0,
  y: 0,
  radius: 150,
  image: new Image()
};
blackHole.image.src = "black-hole.png";

const earth = {
  x: 700,
  y: 1100,
  size: 1000,
  image: new Image()
};
earth.image.src = "earth.png";

const moon = {
  x: 2400,
  y: 800,
  size: 333,
  image: new Image()
};
moon.image.src = "moon.png";

let collectibleStars = [];

function spawnCollectibleStars() {
  collectibleStars = [];
  while (collectibleStars.length < 10) {
    const sx = Math.random() * 3000 - 900;
    const sy = Math.random() * 3000 - 900;

    const nearBlackHole = Math.hypot(sx - blackHole.x, sy - blackHole.y) < 550;
    const nearEarth = Math.hypot(sx - earth.x, sy - earth.y) < 1200;
    const nearMoon = Math.hypot(sx - moon.x, sy - moon.y) < 1000;

    if (!nearBlackHole && !nearEarth && !nearMoon) {
      collectibleStars.push({ x: sx, y: sy, collected: false });
    }
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function blendColor(t) {
  const r = 255;
  const g = 255;
  const b = Math.floor(lerp(255, 0, t));
  return `rgb(${r},${g},${b})`;
}

function drawShip() {
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(angle);
  ctx.fillStyle = blendColor(colorBlend);
  ctx.font = "40px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("➤", 0, 0);
  ctx.restore();
}

function drawBlackHole() {
  const size = 100;
  const screenX = canvas.width / 2 + (blackHole.x - shipX);
  const screenY = canvas.height / 2 + (blackHole.y - shipY);
  if (blackHole.image.complete && blackHole.image.naturalWidth !== 0) {
    ctx.drawImage(blackHole.image, screenX - size/2, screenY - size/2, size, size);
  }
}

function drawPlanet(planet) {
  const screenX = canvas.width / 2 + (planet.x - shipX);
  const screenY = canvas.height / 2 + (planet.y - shipY);
  if (planet.image.complete && planet.image.naturalWidth !== 0) {
    ctx.drawImage(planet.image, screenX - planet.size/2, screenY - planet.size/2, planet.size, planet.size);
  }
}

function drawBackgroundStars() {
  ctx.fillStyle = "white";
  for (const star of backgroundStars) {
    const screenX = canvas.width / 2 + (star.x - shipX);
    const screenY = canvas.height / 2 + (star.y - shipY);
    ctx.beginPath();
    ctx.arc(screenX, screenY, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCollectibleStars() {
  ctx.fillStyle = "yellow";
  ctx.font = "30px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const star of collectibleStars) {
    if (!star.collected) {
      const screenX = canvas.width / 2 + (star.x - shipX);
      const screenY = canvas.height / 2 + (star.y - shipY);
      ctx.fillText("★", screenX, screenY);
    }
  }
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "24px monospace";
  ctx.textAlign = "left";
  ctx.fillText(`${score}`, 20, 30);
}

function drawHP() {
  const barWidth = 150;
  const barHeight = 20;
  const x = canvas.width - barWidth - 20;
  const y = 20;

  ctx.fillStyle = "white";
  ctx.strokeRect(x, y, barWidth, barHeight);
  ctx.fillStyle = "red";
  ctx.fillRect(x, y, (hp / 100) * barWidth, barHeight);
  drawFuelBar();
}

function drawArrowToEarth() {
  const dx = earth.x - shipX;
  const dy = earth.y - shipY;
  const angleToEarth = Math.atan2(dy, dx);

  const orbitRadius = 50;
  const offsetX = Math.cos(angleToEarth) * orbitRadius;
  const offsetY = Math.sin(angleToEarth) * orbitRadius;

  ctx.save();
  ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
  ctx.rotate(angleToEarth);
  ctx.fillStyle = "yellow";
  ctx.font = "20px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("➜", 0, 0);
  ctx.restore();
}

function checkCollisions() {
  for (const star of collectibleStars) {
    if (!star.collected) {
      const dx = shipX - star.x;
      const dy = shipY - star.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 30) {
        star.collected = true;
        score += 1;
        fuel = Math.min(fuel + 15, 100); // restore some fuel
      }
    }
  }
}

function applyGravitationalForces() {
  const gravitySources = [
  { x: blackHole.x, y: blackHole.y, radius: blackHole.radius, strength: 0.2, damage: true, type: "blackhole" },
  { x: earth.x, y: earth.y, radius: 180, strength: 0.05, damage: false, type: "earth" },
  { x: moon.x, y: moon.y, radius: 120, strength: 0.03, damage: false, type: "moon" }
];

  for (const source of gravitySources) {
    const dx = source.x - shipX;
    const dy = source.y - shipY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 600) {
      const strength = lerp(0.01, source.strength, 1 - dist / 600);
      const ax = dx / dist * strength;
      const ay = dy / dist * strength;
      velocityX += ax;
      velocityY += ay;
    }

    if (dist < source.radius) {
      if (source.damage) {
        hp -= 0.3;
        if (hp < 0) hp = 0;
      } else if (source === earth) {
        fuel = Math.min(fuel + 0.5, 100); // Earth refuel
      }
    }
  }
}

function clampSpeed() {
  const speed = Math.sqrt(velocityX ** 2 + velocityY ** 2);
  if (speed > currentMaxSpeed) {
    const ratio = currentMaxSpeed / speed;
    velocityX *= ratio;
    velocityY *= ratio;
  }
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);

function update() {
  if (gameOver) return;

  const boosting = keys[" "];
  const tryingToMove = keys["ArrowUp"] && fuel > 0;

  // Smooth transitions
  colorBlend = lerp(colorBlend, boosting ? 1 : 0, 0.1);
  currentAcceleration = lerp(currentAcceleration, boosting ? boostAcceleration : baseAcceleration, 0.1);
  currentMaxSpeed = lerp(currentMaxSpeed, boosting ? boostMaxSpeed : baseMaxSpeed, 0.1);

  // Disable turning during boost
  if (!boosting) {
    if (keys["ArrowLeft"]) angle -= rotationSpeed;
    if (keys["ArrowRight"]) angle += rotationSpeed;
  }

  // Apply movement only if there's fuel
  if (tryingToMove) {
    velocityX += Math.cos(angle) * currentAcceleration;
    velocityY += Math.sin(angle) * currentAcceleration;
    fuel -= boosting ? 0.1 : 0.05;
  } else {
    velocityX *= friction;
    velocityY *= friction;
  }

  // Idle fuel consumption
  if (fuel > 0) fuel -= 0.02;
  if (fuel < 0) fuel = 0;

  applyGravitationalForces();
  clampSpeed();

  // Update ship position
  shipX += velocityX;
  shipY += velocityY;

  // Map edge bouncing
  if (shipX < MAP_MIN_X || shipX > MAP_MAX_X) {
    velocityX *= -1;
    shipX = Math.max(MAP_MIN_X, Math.min(MAP_MAX_X, shipX));
  }
  if (shipY < MAP_MIN_Y || shipY > MAP_MAX_Y) {
    velocityY *= -1;
    shipY = Math.max(MAP_MIN_Y, Math.min(MAP_MAX_Y, shipY));
  }
  checkCollisions();
  checkGameOver();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackgroundStars();
  drawPlanet(earth);
  drawPlanet(moon);
  drawBlackHole();

  drawCollectibleStars();
  drawShip();
  drawScore();
  drawHP();
  drawGameOverMessage();
  drawArrowToEarth();

  requestAnimationFrame(update);
}

resizeCanvas();
spawnCollectibleStars();
update();
