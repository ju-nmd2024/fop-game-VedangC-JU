// Variables for rocket position, velocity, acceleration, and fuel
let x, y;
let vx, vy;
let ax, ay;
let thrust = 0.1;                           // Thrust applied in any direction
let gravity = 0.01;                         // Gravity pulling downwards
let fuel = 100;                             // Fuel limit
let isLanded = false;
let isCrashed = false;
let showRestartButton = false;

// Movement flags for thrusting directions
let thrustingUp = false;
let thrustingDown = false;
let thrustingLeft = false;
let thrustingRight = false;

// Array for stars, smoke particles
let stars = [];

function setup() {
  createCanvas(700, 700);
  resetGame();
  generateStars();                          // Generating the stars for background
}

function draw() {
  background(20);
  drawStars();                              // Drawing a starry background
  drawTerrain();                            // Drawaing a terrain
  drawLandingPad();                         // Drawing a landing pad


  // Check if the game is over (either landed or crashed)
  if (isLanded || isCrashed) {
    displayEndMessage();
    if (showRestartButton) drawRestartButton();     // Showing the restart button
    return;                                         // Breaking the draw loop when landed or crashed
  }

  // Apply gravity to the rocket
  ay = gravity;

  // Apply thrust based on the arrow keys pressed and reduce fuel accordingly
  if (thrustingUp && fuel > 0) {
    ay -= thrust;
    fuel -= 0.5;
  }
  if (thrustingDown && fuel > 0) {
    ay += thrust;
    fuel -= 0.5;
  }
  if (thrustingLeft && fuel > 0) {
    ax = -thrust;
    fuel -= 0.5;
  }
  if (thrustingRight && fuel > 0) {
    ax = thrust;
    fuel -= 0.5;
  }

  // Update velocity and position
  vy += ay;
  vx += ax;
  y += vy;
  x += vx;

  // Reset horizontal acceleration to zero after movement
  ax = 0;

  // Draw the rocket with flame animation
  drawRocket(x, y, thrustingUp || thrustingDown || thrustingLeft || thrustingRight);

  // Check if the rocket has landed or crashed
  checkLandingOrCrash();

  // Display fuel and velocity information
  displayInfo();
}

function resetGame() {
  x = width / 2;                                  // Centered initial x-position
  y = 50;                                         // Initial y-position near the top of the canvas
  vx = 0;                                         // Initial horizontal velocity
  vy = 0;                                         // Initial vertical velocity
  ax = 0;                                         // Initial horizontal acceleration
  ay = 0;                                         // Initial vertical acceleration
  isLanded = false;
  isCrashed = false;
  fuel = 100;                                     // Reset fuel
}

function generateStars() {
  // Create stars for background
  for (let i = 0; i < 500; i++) {
    stars.push({
      x: random(width),                           // Random x-position
      y: random(height / 2),                      // Random y-position in upper half
      size: random(1, 3)                          // Random size
    });
  }
}

function drawStars() {
  // Draw each star
  fill(255);
  noStroke();
  for (let star of stars) {
    ellipse(star.x, star.y, star.size);
  }
}

function drawRocket(x, y, isThrusting) {
  // Rocket Body
  fill(255, 0, 0);
  stroke(255);
  rect(x - 10, y - 30, 20, 60, 5);                                // Main rocket body

  // Rocket Tip
  fill(255, 150, 150);
  triangle(x - 10, y - 30, x + 10, y - 30, x, y - 50);            // Rocket top

  // Rocket Fins
  fill(0, 0, 255);
  rect(x - 12, y + 30, 6, 12);                                    // Left fin
  rect(x + 6, y + 30, 6, 12);                                     // Right fin
  
  // Rocket Flame
  if (isThrusting) {
    let flameLength = map(abs(vy), 0, 5, 10, 30);                 // Flame length based on velocity
    fill(255, 165, 0);
    ellipse(x, y + 45, 10, flameLength);                          // Flame
    
    fill(255, 100, 0);
    ellipse(x, y + 45 + flameLength / 2, 6, flameLength / 2);     // Inner flame
  }
}

function drawTerrain() {
  // Draw the terrain with height adjustment
  fill(50, 50, 50);
  noStroke();
  beginShape();
  vertex(0, height);
  vertex(0, height - 70);
  vertex(60, height - 50);
  vertex(50, height - 40);
  vertex(250, height - 60);
  vertex(350, height - 10);
  vertex(400, height - 40);
  vertex(450, height - 20);
  vertex(500, height - 50);
  vertex(550, height - 30);
  vertex(600, height - 20);
  vertex(650, height);
  endShape(CLOSE);
}

// Draw a landing pad with supports and connectors
function drawLandingPad() {
  fill(120);
  rect(150, height - 10, 100, 10);                        // Main platform

  // Draw support structures
  fill(200);
  rect(160, height - 30, 5, 20);                          // Left support
  rect(235, height - 30, 5, 20);                          // Right support
  rect(185, height - 40, 5, 20);                          // Center-left support
  rect(210, height - 40, 5, 20);                          // Center-right support
}

function checkLandingOrCrash() {
  // Check if the rocket touches the ground
  if (y + 30 >= height - 20) {
    if (x > 150 && x < 250 && abs(vy) < 1 && abs(vx) < 1) {
      isLanded = true;                                          // Safe landing
    } else {
      isCrashed = true;                                         // Rocket crashed
    }
    showRestartButton = true;                                   // Button appears after landing or crashing
  }
}

function displayEndMessage() {
  textAlign(CENTER);
  fill(255);
  textSize(32);
  if (isLanded) {
    text("Landed Safely!", width / 2, height / 2);
  } else {
    text("Crash!", width / 2, height / 2);
  }
}

// Displaying fuel and vertical speed information
function displayInfo() {
  fill(255);
  textSize(16);
  text("Fuel: " + fuel, 10, 20);
  text("Vertical Speed: " + nf(vy, 1, 2), 10, 40);
  text("Horizontal Speed: " + nf(vx, 1, 2), 10, 60);
}

// Detecting key pressing for movement
function keyPressed() {
  if (keyCode === UP_ARROW) thrustingUp = true;
  if (keyCode === DOWN_ARROW) thrustingDown = true;
  if (keyCode === LEFT_ARROW) thrustingLeft = true;
  if (keyCode === RIGHT_ARROW) thrustingRight = true;
}

// Detecting key releases for stopping thrust
function keyReleased() {
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
  // Reset game if restart button is clicked
  if (showRestartButton && mouseX > width / 2 - 50 && mouseX < width / 2 + 50 &&
      mouseY > height / 2 + 40 && mouseY < height / 2 + 80) {
    resetGame();
    showRestartButton = false;          // To Hide the button after restarting
  }
}
