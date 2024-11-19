// Rocket variables: position, velocity, acceleration, fuel, restart button, start screen, and the condition for landing or crash
let x, y;                             // Rocket position
let vx, vy;                           // Rocket velocity
let ax, ay;                           // Rocket acceleration
let thrust = 0.1;                     // Thrust power
let gravity = 0.01;                   // Gravity
let fuel = 100;                       // Initial fuel amount
let isLanded = false;                 // Flag for successful landing
let isCrashed = false;                // Flag for crash
let showRestartButton = false;        // Flag to display restart button
let showStartScreen = true;           // Flag for start screen
// test
// Flags for movement directions
let thrustingUp = false;
let thrustingDown = false;
let thrustingLeft = false;
let thrustingRight = false;

// Arrays for stars, exhaust particles, smoke particles, and explosion particles
let stars = [];
let particles = [];
let smokeParticles = [];
let groundSmokeParticles = [];
let explosionParticles = [];

function setup() {
  // Set up canvas size and initialize game
  createCanvas(650, 700);
  resetGame();                                // Resetting the game variables
  generateStars();                            // Generating stars for background
}

function draw() {
  // Clear background and draw elements
  background(20);                             // Black background

  if (showStartScreen) {
    drawStartScreen();                        // Draw the start screen
    return;                                   // Stop further drawing until the game starts
  }

  drawStars();                                // Drawing a starry background
  drawTerrain();                              // Drawing terrain
  drawLandingPad();                           // Drawing landing pad

  // Check if the rocket has landed or crashed
  if (isLanded || isCrashed) {
    displayEndMessage();                              // Showing landing or crash message
    if (isCrashed) drawExplosion();                   // Drawing an explosion if crashed
    if (showRestartButton) drawRestartButton();       // Showing a restart button
    return;                                           // Stopping the draw loop when landed or crashed
  }

  // Apply gravity to rocket
  ay = gravity;

  // Thrust in the respective direction if keys are pressed and fuel is available
  if (thrustingUp && fuel > 0) {
    ay -= thrust;
    fuel -= 0.5;
    createExhaustParticle(x, y + 45);                 // Creating exhaust below the rocket
  }
  if (thrustingDown && fuel > 0) {
    ay += thrust;
    fuel -= 0.5;
  }
  if (thrustingLeft && fuel > 0) {
    ax = -thrust;
    fuel -= 0.5;
    createExhaustParticle(x + 10, y + 45);            // Leftward exhaust
  }
  if (thrustingRight && fuel > 0) {
    ax = thrust;
    fuel -= 0.5;
    createExhaustParticle(x - 10, y + 45);            // Rightward exhaust
  }
 
  // Update velocity and position with applied forces
  vy += ay;
  vx += ax;
  y += vy;
  x += vx;

  // Reset horizontal acceleration
  ax = 0;

  // Draw rocket with moving flame effect if thrusting
  drawRocket(x, y, thrustingUp || thrustingDown || thrustingLeft || thrustingRight);        // Movement of the rocket 
  drawParticles();                                                                          // Drawing the exhaust particles

  // Create ground smoke when close to landing
  if (y > height - 130 && !isLanded && abs(vy) < 1.5) createGroundSmoke();

  // Draw ground smoke
  drawGroundSmokeParticles();

  // Check for landing or crash conditions
  checkLandingOrCrash();
  displayInfo();                                   // Display fuel, altitude, and velocity
}

function resetGame() {
  // Reset game variables
  x = width / 2;                // Initial x-position
  y = 50;                       // Initial y-position
  vx = 0;                       // Initial x-velocity
  vy = 0;                       // Initial y-velocity
  ax = 0;                       // Initial x-acceleration
  ay = 0;                       // Initial y-acceleration
  isLanded = false;
  isCrashed = false;
  showRestartButton = false;
  fuel = 100;
  explosionParticles = [];      // Reset explosion particles
  groundSmokeParticles = [];    // Reset ground smoke particles
}

// Start screen functionality
function drawStartScreen() {
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(32);
    text("Rocket Landing Mission", width / 2, height / 2 - 50);
  
    fill(255, 0, 0);
    rect(width / 2 - 100, height / 2, 200, 50, 10);
  
    fill(255);
    textSize(20);
    text("Click to Play", width / 2, height / 2 + 25);
  }

// Help from Garrit's tutorial (lines: 134-153)
// Generating random stars in the sky
function generateStars() {
  // Create stars for background
  for (let i = 0; i < 500; i++) {
    stars.push({
      x: random(width),               // Random x-position
      y: random(height / 2),          // Random y-position in upper half
      size: random(1, 3)              // Random size
    });
  }
}

function drawStars() {
  // Draw each star
  fill(255);
  noStroke();
  for (let star of stars) {
    ellipse(star.x, star.y, star.size, star.size);
  }
}

function drawRocket(x, y, isThrusting) {
  // Draw rocket with position (x, y)
  push();
  translate(x, y);

  // Rocket dimensions and colors
  let rocketWidth = 40;
  let rocketHeight = 100;
  let finHeight = 30;
  let redColor = color(255, 0, 0);
  let whiteColor = color(255);

  // Draw rocket body
  noStroke();
  fill(redColor);
  rect(-rocketWidth / 2, -rocketHeight, rocketWidth, rocketHeight / 2);           // Bottom half
  fill(whiteColor);
  rect(-rocketWidth / 2, -rocketHeight / 2, rocketWidth, rocketHeight / 2);       // Top half
  fill(redColor);
  arc(0, -rocketHeight, rocketWidth, rocketWidth, PI, TWO_PI, CHORD);             // Nose cone

  // Rocket fins
  fill(redColor);
  arc(-rocketWidth / 2, 0, 20, finHeight, 0, PI, CHORD);
  arc(rocketWidth / 2, 0, 20, finHeight, 0, PI, CHORD);

  // Window
  fill(200, 200, 255);
  ellipse(0, -rocketHeight / 2, 15, 15);

  // Drawing the flame if thrusting with slight flicker
  if (isThrusting) {
    let flameOffset = random(-3, 3);              // Flickering effect
    let innerFlameOffset = random(-1, 1);

    fill(255, 140, 0, 150); // Outer flame
    beginShape();
    curveVertex(-10 + flameOffset, 10);
    curveVertex(-15 + flameOffset, 15);
    curveVertex(0, 35 + flameOffset);
    curveVertex(15 + flameOffset, 15);
    curveVertex(10 + flameOffset, 10);
    endShape(CLOSE);

    fill(255, 223, 0, 180); // Inner flame
    beginShape();
    curveVertex(-5 + innerFlameOffset, 10);
    curveVertex(-8 + innerFlameOffset, 15);
    curveVertex(0, 25 + innerFlameOffset);
    curveVertex(8 + innerFlameOffset, 15);
    curveVertex(5 + innerFlameOffset, 10);
    endShape(CLOSE);
  }

  pop();
}

function drawTerrain() {
  // Draw the terrain with height adjustment
  fill(50, 50, 50);
  noStroke();
  beginShape();
  vertex(0, height);
  vertex(0, height - 100);
  vertex(60, height - 80);
  vertex(50, height - 70);
  vertex(250, height - 90);
  vertex(350, height - 80);
  vertex(400, height - 100);
  vertex(450, height - 80);
  vertex(500, height - 90);
  vertex(550, height - 100);
  vertex(600, height - 90);
  vertex(650, height - 90);
  endShape(CLOSE);
}

function drawLandingPad() {
  // Draw the landing pad below the terrain
  fill(120);
  rect(300, height - 50, 100, 10);      // Main pad

  // Decorative pad lines
  fill(200);
  rect(300, height - 70, 5, 20);
  rect(395, height - 70, 5, 20);
  rect(335, height - 80, 5, 20);
  rect(360, height - 80, 5, 20);
}

function createExhaustParticle(px, py) {
  // Create exhaust particle below the rocket
  particles.push({ 
    x: px,                  // Horizontal position of the particle
    y: py,                  // Vertical position of the particle
    size: random(3, 6),     // Giving a random size to make it realistic
    life: 30                // Life starting at 30
  });
}

function drawParticles() {
  // Draw exhaust particles and animate
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    fill(255, random(150, 200), 0, p.life * 8);
    noStroke();
    ellipse(p.x, p.y, p.size);
    p.y += random(1, 2);                                  // Moving down
    p.life--;                                             // Decreasing the life
    if (p.life <= 0) particles.splice(i, 1);              // Removing particle when life ends
  }
}

function createGroundSmoke() {
  // Create ground smoke near the landing pad
  let groundSmokeX = random(300, 400);                    // Random horizontal position near landing pad
  let groundSmokeY = height - 60;                         // Vertical position just above the ground
  groundSmokeParticles.push({
    x: groundSmokeX,
    y: groundSmokeY,
    size: random(10, 20),                                 // Random size for the smoke particles
    life: 60                                              // Life starting at 60
  });
}
function drawGroundSmokeParticles() {
  // Draw ground smoke particles and animate
  for (let i = groundSmokeParticles.length - 1; i >= 0; i--) {
    let p = groundSmokeParticles[i];
    fill(200, 200, 200, p.life * 3);
    noStroke();
    ellipse(p.x, p.y, p.size);
    p.size += 0.5;                                                // Increasing the size for expansion effect
    p.life--;                                                     // Decreasing the life of the smoke
    if (p.life <= 0) groundSmokeParticles.splice(i, 1);           // Removing particle when life ends
  }
}

function checkLandingOrCrash() {
  // Check if rocket is at or below the pad and conditions for landing or crash
  if (y > height - 90) {
    if (abs(vy) < 2 && abs(vx) < 2) {
      isLanded = true;                                     // Successful landing
    } else {
      isCrashed = true;                                    // Crash
      createExplosion();                                   // Trigger explosion
    }
    vy = 0;
    vx = 0;
    showRestartButton = true;                              // Show restart button
  }
}

// Helo taken from Garrit's lecture of "Exlosion and particles" (Line 308-334)
function createExplosion() {
  // Create particles for explosion effect
  for (let i = 0; i < 100; i++) {
    explosionParticles.push({
      x: x,
      y: y,
      vx: random(-2, 2),
      vy: random(-2, 2),
      size: random(4, 8),
      life: 60
    });
  }
}

function drawExplosion() {
  // Draw explosion particles and animate
  for (let i = explosionParticles.length - 1; i >= 0; i--) {
    let p = explosionParticles[i];
    fill(255, 100, 0, p.life * 4);
    noStroke();
    ellipse(p.x, p.y, p.size);
    p.x += p.vx;
    p.y += p.vy;
    p.life--; // Decrease life
    if (p.life <= 0) explosionParticles.splice(i, 1);               // Remove particle when life ends
  }
}

function displayEndMessage() {
  // Display end message based on landing or crash
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(255);
  if (isLanded) text("Landing Successful!", width / 2, height / 2 - 50);
  if (isCrashed) text("Rocket Crashed!", width / 2, height / 2 - 50);
}

function displayInfo() {
  // Display fuel, altitude, and velocity on screen
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text("Fuel: " + fuel.toFixed(1), 10, 10);
  text("Altitude: " + (height - y).toFixed(1), 10, 30);
  text("Velocity: " + vy.toFixed(1), 10, 50);
}

function keyPressed() {
  // Update thrusting flags based on key presses
  if (keyCode === UP_ARROW) thrustingUp = true;
  if (keyCode === DOWN_ARROW) thrustingDown = true;
  if (keyCode === LEFT_ARROW) thrustingLeft = true;
  if (keyCode === RIGHT_ARROW) thrustingRight = true;
}

function keyReleased() {
  // Reset thrusting flags when keys are released
  if (keyCode === UP_ARROW) thrustingUp = false;
  if (keyCode === DOWN_ARROW) thrustingDown = false;
  if (keyCode === LEFT_ARROW) thrustingLeft = false;
  if (keyCode === RIGHT_ARROW) thrustingRight = false;
}

function drawRestartButton() {
  // Draw restart button to reset game
  fill(255, 0, 0);
  rect(width / 2 - 50, height / 2 + 40, 100, 40, 10);
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text("Restart", width / 2, height / 2 + 60);
}

function mousePressed() {
  // Start game if start button is clicked
  if (showStartScreen) {
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
        mouseY > height / 2 && mouseY < height / 2 + 50) {
      showStartScreen = false;         // Hide start screen and start game
    }
  }
  // Reset game if restart button is clicked
  if (showRestartButton && mouseX > width / 2 - 50 && mouseX < width / 2 + 50 &&
      mouseY > height / 2 + 40 && mouseY < height / 2 + 80) {
    resetGame();
  }
}
