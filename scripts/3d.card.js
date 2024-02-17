let selectedCard;
let cardFrontTexture;
let cardBackTexture;
let viewportSize = Math.min(window.innerWidth, window.innerHeight); // Find the smaller dimension
let cardWidth = viewportSize * 0.7; //
let cardHeight = cardWidth; // Maintain aspect ratio
let cardDepth = 12; // Simulate a bit of depth
let isDragging = false; // Tracks whether the card is being dragged
let lastMouseX; // Last mouse X position, for calculating rotation speed
let rotationY = 0; // Current rotation around the Y axis, adjusted for user interaction
let autoRotateSpeed = 0.01; // Initial automatic rotation speed
let userHasClicked = false; // New flag to track if the user has clicked
let interactionTimeout;
let directionalLightDirection;
let pointLight1Position;
let pointLight2Position;
let directionalLightColor;
let pointLight1Color;
let pointLight2Color;
let textGraphics;
let customFont;

function preload() {
  let data = loadJSON('data.json', () => {
    // Select a front texture and store its information
    let frontTextures = data.cardFrontTextures;
    let randomFrontIndex = floor(random(frontTextures.length));
    selectedCard = frontTextures[randomFrontIndex]; // This now includes the name and URL
    cardFrontTexture = loadImage(selectedCard.url);

    // Randomly select a back texture
    let backTextures = data.cardBackTextures;
    let randomBackIndex = floor(random(backTextures.length));
    cardBackTexture = loadImage(backTextures[randomBackIndex]);
  });

    customFont = loadFont('PixelifySans.ttf');
}

function setup() {
    let cnv = createCanvas(windowWidth, windowHeight, WEBGL);
    cnv.id('card'); // Setting an ID for easy reference

    // Directly attach event listeners to the canvas element
    document.getElementById('card').addEventListener('touchstart', function(e) {
        e.preventDefault();
    }, { passive: false });
    document.getElementById('card').addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
    document.getElementById('card').addEventListener('touchend', function(e) {
        e.preventDefault();
    }, { passive: false });

    textureMode(NORMAL);
    let imgAspect = cardFrontTexture.width / cardFrontTexture.height;

    // Randomizing the direction for the directional light
    directionalLightDirection = {x: random(-1, 1), y: random(-1, 1), z: random(-1, 1)};

    // Randomize position for the first point light
    pointLight1Position = {
        x: random(-width / 2, width / 2),
        y: random(-height / 2, height / 2),
        z: 300 // Keeping Z constant, but you could randomize this too
    };

    // Randomize position for the second point light
    pointLight2Position = {
        x: random(-width / 2, width / 2),
        y: random(-height / 2, height / 2),
        z: 300 // Again, Z is constant here
    };

    // Define minimum and maximum RGB values
    let minColor = 100; // Avoids too dark colors
    let maxColor = 200; // Avoids too bright colors

    // Randomize RGB values for the directional light within a good range
    directionalLightColor = {
        r: random(minColor, maxColor),
        g: random(minColor, maxColor),
        b: random(minColor, maxColor)
    };

    // Randomize RGB values for the first point light within a good range
    pointLight1Color = {
        r: random(minColor, maxColor),
        g: random(minColor, maxColor),
        b: random(minColor, maxColor)
    };

    // Randomize RGB values for the second point light within a good range
    pointLight2Color = {
        r: random(minColor, maxColor),
        g: random(minColor, maxColor),
        b: random(minColor, maxColor)
    };

    textGraphics = createGraphics(cardWidth, cardHeight); // Adjust size as needed

    textGraphics.background(0, 0, 0, 0); // Make background transparent
    textGraphics.fill(255); // Set text color
    textGraphics.noStroke(); // Ensure no stroke is applied to text or the graphics object
    textGraphics.textFont(customFont); // Set the custom font
    textGraphics.textSize(32);
    textGraphics.textAlign(RIGHT, BOTTOM);
    textGraphics.text(selectedCard.name, textGraphics.width - 20, textGraphics.height - 10); // Adjust padding as needed

    // Setup button click listener
    select('#screenshot').mousePressed(screenshotCard);
    select('#export').mousePressed(exportCard);
}

function draw() {
    background(200);

    // Apply a directional light with a fixed red color and randomized direction from setup
    directionalLight(directionalLightColor.r, directionalLightColor.g, directionalLightColor.b, directionalLightDirection.x, directionalLightDirection.y, directionalLightDirection.z);

    // Apply the first point light with a fixed color and randomized position from setup
    pointLight(pointLight1Color.r, pointLight1Color.g, pointLight1Color.b, pointLight1Position.x, pointLight1Position.y, pointLight1Position.z);

    // Apply the second point light with a fixed color and randomized position from setup
    pointLight(pointLight2Color.r, pointLight2Color.g, pointLight2Color.b, pointLight2Position.x, pointLight2Position.y, pointLight2Position.z);

    // Continue auto-rotating the card until the user clicks
    if (!userHasClicked) {
        rotationY += autoRotateSpeed;
        // Optionally, you can still add code here to gradually decrease autoRotateSpeed if desired
    }

    // Update rotation based on user interaction
    rotateY(rotationY);

    // Dynamically change material properties for holographic effect
    if (cos(rotationY) > 0) {
        texture(cardFrontTexture);
        // Change specular material to simulate holographic shimmer
        specularMaterial(255, 255, 255);
    } else {
        texture(cardBackTexture);
        // Change specular material to simulate holographic shimmer
        specularMaterial(255, 255, 255);
        push();
        rotateY(PI);
    }

    // Draw the card with some shininess to enhance the effect
    shininess(20);
    box(cardWidth, cardHeight, cardDepth);

    if (cos(rotationY) > 0) { // Condition to display the text with the front texture
        // Ensure text is updated if dynamic, or do this once in setup if static
        push();

        // Position the text plane at the bottom right of the card
        let planeWidth = cardFrontTexture.width;
        let planeHeight = cardFrontTexture.height;
        // Calculate scale to fit within cardWidth while maintaining aspect ratio
        let scale = min(cardWidth / planeWidth, cardHeight / planeHeight);
        planeWidth *= scale;
        planeHeight *= scale;

        noStroke(); // Add this before drawing the plane
        translate(cardWidth / 2 - planeWidth / 2, cardHeight / 2 - planeHeight / 2, cardDepth / 2 + 1);
        texture(textGraphics); // Use the graphics buffer as texture
        plane(planeWidth, planeHeight); // Use scaled dimensions
        pop();
    }
}

function mousePressed() {
    userHasClicked = true;
    lastMouseX = mouseX;
    isDragging = true;

    // Clear any existing timeout to ensure it doesn't restart spinning while the user is interacting
    clearTimeout(interactionTimeout);
}

function mouseDragged() {
    if (userHasClicked) { // Check if this condition is necessary based on your interaction design
        let deltaX = mouseX - lastMouseX;
        rotationY += radians(deltaX * 0.5);
        lastMouseX = mouseX;
    }
}

function mouseReleased() {
    isDragging = false;

    // Clear any existing timeout to prevent multiple timeouts from starting
    clearTimeout(interactionTimeout);

    // Set a new timeout
    interactionTimeout = setTimeout(() => {
        // Only start auto-rotating if there's no user interaction
        if (!isDragging) {
            userHasClicked = false; // Allow the card to start spinning again
            autoRotateSpeed = 0.01; // Reset the rotation speed if needed
        }
    }, 3000);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    viewportSize = Math.min(window.innerWidth, window.innerHeight); // Find the smaller dimension
    cardWidth = viewportSize * 0.7; //
    cardHeight = cardWidth; // Maintain aspect ratio
}

function touchStarted() {
    userHasClicked = true;
    lastTouchX = touches[0].x; // Get the x position of the first touch
    isDragging = true;

    return false; // Prevent default
}

function touchMoved() {
    if (userHasClicked && isDragging) {
        let deltaX = touches[0].x - lastTouchX;
        rotationY += radians(deltaX * 0.5); // Adjust rotation based on touch move
        lastTouchX = touches[0].x; // Update lastTouchX for continuous movement
    }
    
    return false; // Prevent default
}

function touchEnded() {
    isDragging = false;

    return false; // Prevent default
}

// Function to save the card texture
function screenshotCard() {
    if (cardFrontTexture) {
        save(cardFrontTexture, 'cyberpunk.png');
    } else {
        console.error("Card is not loaded or available.");
    }
}

function exportCard() {
    // Saves the current canvas to a file
    saveCanvas('cyberpunk-card', 'png');
}