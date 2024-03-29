// Card
let selectedCard;
let cardFrontTexture;
let cardBackTexture;
let viewportSize = Math.min(window.innerWidth, window.innerHeight); // Find the smaller dimension
let cardWidth = viewportSize * 0.7; //
let cardHeight = cardWidth; // Maintain aspect ratio
let cardDepth = 12; // Simulate a bit of depth

// Movement
let isDragging = false; // Tracks whether the card is being dragged
let lastMouseX; // Last mouse X position, for calculating rotation speed
let rotationY = 0; // Current rotation around the Y axis, adjusted for user interaction
let autoRotateSpeed = 0.01; // Initial automatic rotation speed
let userHasClicked = false; // New flag to track if the user has clicked
let interactionTimeout;
let isTouchDevice = false;

// Lighting
let directionalLightDirection;
let pointLight1Position;
let pointLight2Position;
let directionalLightColor;
let pointLight1Color;
let pointLight2Color;

// Text
let textGraphics;
let customFont;
let selectedCardDescription;
let descriptionDiv;

function preload() {
  let data = loadJSON('data.json', () => {
    // Select a front texture and store its information
    let frontTextures = data.cardFrontTextures;
    let randomFrontIndex = floor(random(frontTextures.length));
    selectedCard = frontTextures[randomFrontIndex]; // This now includes the name and URL
    cardFrontTexture = loadImage(selectedCard.url);
    selectedCardDescription = selectedCard.description;

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
    directionalLightDirection = {x: random(-0.5, 0.5), y: random(-0.5, 0), z: random(-1, -0.5)};

    // Position the point lights relative to the card's size and presumed location
    pointLight1Position = {
        x: cardWidth * random(-0.5, 0.5),
        y: cardHeight * random(-0.5, 0.5),
        z: 300 // Adjust the Z position as needed
    };

    pointLight2Position = {
        x: cardWidth * random(-0.5, 0.5),
        y: cardHeight * random(-0.5, 0.5),
        z: 300 // Adjust similarly
    };

    // Define minimum and maximum RGB values
    let minColor = 60; // Avoids too dark colors
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

    // Determine the base font size of the document
    let baseFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

    // Front Card Text 
    textGraphics = createGraphics(cardWidth, cardHeight); // Adjust size as needed
    textGraphics.background(0, 0, 0, 0); // Make background transparent
    textGraphics.fill(255); // Set text color
    textGraphics.noStroke(); // Ensure no stroke is applied to text or the graphics object
    textGraphics.textFont(customFont); // Set the custom font
    textGraphics.textSize(baseFontSize * 2);
    textGraphics.textAlign(RIGHT, BOTTOM);
    textGraphics.text(selectedCard.name, textGraphics.width - 20, textGraphics.height - 10); // Adjust padding as needed

    // Back Card Text
    backtextGraphics = createGraphics(cardWidth, cardHeight); // Adjust size as needed
    backtextGraphics.background(0, 0, 0, 0); // Make background transparent
    backtextGraphics.fill(255); // Set text color
    backtextGraphics.noStroke(); // Ensure no stroke is applied to text or the graphics object
    backtextGraphics.textFont(customFont); // Set the custom font
    backtextGraphics.textSize(baseFontSize * 1);
    backtextGraphics.textAlign(RIGHT, BOTTOM);
    backtextGraphics.text('Created by Digital Altar', backtextGraphics.width - 20, backtextGraphics.height - 10); // Adjust padding as needed

    // Screenshot and Export Features
    let screenshotButton = select('#screenshot');
    let exportButton = select('#export');
    let learnButton = select('#learn');
    descriptionDiv = select('#description');

    learnButton.html('Learn more about ' + selectedCard.name);
    descriptionDiv.html(selectedCardDescription);

    // For desktop
    screenshotButton.mousePressed(screenshotCard);
    exportButton.mousePressed(exportCard);
    learnButton.mousePressed(toggleDescription);

    // For mobile touch events
    screenshotButton.elt.addEventListener('touchend', screenshotCard);
    exportButton.elt.addEventListener('touchend', exportCard);
    learnButton.elt.addEventListener('touchend', toggleDescription);
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


    // Position the text plane at the bottom right of the card
    let planeWidth = cardFrontTexture.width;
    let planeHeight = cardFrontTexture.height;
    // Calculate scale to fit within cardWidth while maintaining aspect ratio
    let scale = min(cardWidth / planeWidth, cardHeight / planeHeight);
    planeWidth *= scale;
    planeHeight *= scale;

    if (cos(rotationY) > 0) { // Condition to display the text with the front texture
        // Ensure text is updated if dynamic, or do this once in setup if static
        push();
        noStroke(); // Add this before drawing the plane
        translate(cardWidth / 2 - planeWidth / 2, cardHeight / 2 - planeHeight / 2, cardDepth / 2 + 1);
        texture(textGraphics); // Use the graphics buffer as texture
        plane(planeWidth, planeHeight); // Use scaled dimensions
        pop();
    } else {
        // Ensure text is updated if dynamic, or do this once in setup if static
        push();
        noStroke(); // Add this before drawing the plane
        translate(cardWidth / 2 - planeWidth / 2, cardHeight / 2 - planeHeight / 2, cardDepth / 2 + 1);
        texture(backtextGraphics); // Use the graphics buffers as texture
        plane(planeWidth, planeHeight); // Use scaled dimensions
        pop();
    }
}

// Toggle Content Functions
function toggleDescription() {
    let currentDisplay = window.getComputedStyle(descriptionDiv.elt).display;
    descriptionDiv.style('display', currentDisplay === 'none' ? 'block' : 'none');
}

// Mouse Functions
function mousePressed() {
    if (!isTouchDevice) {
        userHasClicked = true;
        lastMouseX = mouseX;
        isDragging = true;

        // Clear any existing timeout to ensure it doesn't restart spinning while the user is interacting
        clearTimeout(interactionTimeout);
    }
}

function mouseDragged() {
    if (!isTouchDevice) {
        if (userHasClicked) { // Check if this condition is necessary based on your interaction design
            let deltaX = mouseX - lastMouseX;
            rotationY += radians(deltaX * 0.5);
            lastMouseX = mouseX;
        }
    }
}

function mouseReleased() {
    if (!isTouchDevice) {
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
}

// Touch Functions
function touchStarted() {
    isTouchDevice = true;
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

    // Set a new timeout
    interactionTimeout = setTimeout(() => {
        // Only start auto-rotating if there's no user interaction
        if (!isDragging) {
            userHasClicked = false; // Allow the card to start spinning again
            autoRotateSpeed = 0.01; // Reset the rotation speed if needed
        }
    }, 3000);
    return false; // Prevent default
}

// Save Functions
function exportCard() {
    if (cardFrontTexture) {
        save(cardFrontTexture, 'cyberpunk-screenshot.png');
    }
}

function screenshotCard() {
    // Saves the current canvas to a file
    saveCanvas('cyberpunk-card', 'png');
}

// Window Resized Function
function windowResized() {
    // Resize the canvas to fill the browser window
    resizeCanvas(windowWidth, windowHeight);
    viewportSize = Math.min(window.innerWidth, window.innerHeight); // Find the smaller dimension
    cardWidth = viewportSize * 0.7; // Update card size
    cardHeight = cardWidth; // Maintain aspect ratio

    let baseFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

     // Front Card Text 
    textGraphics = createGraphics(cardWidth, cardHeight); // Adjust size as needed
    textGraphics.background(0, 0, 0, 0); // Make background transparent
    textGraphics.fill(255); // Set text color
    textGraphics.noStroke(); // Ensure no stroke is applied to text or the graphics object
    textGraphics.textFont(customFont); // Set the custom font
    textGraphics.textSize(baseFontSize * 2);
    textGraphics.textAlign(RIGHT, BOTTOM);
    textGraphics.text(selectedCard.name, textGraphics.width - 20, textGraphics.height - 10); // Adjust padding as needed

    // Back Card Text
    backtextGraphics = createGraphics(cardWidth, cardHeight); // Adjust size as needed
    backtextGraphics.background(0, 0, 0, 0); // Make background transparent
    backtextGraphics.fill(255); // Set text color
    backtextGraphics.noStroke(); // Ensure no stroke is applied to text or the graphics object
    backtextGraphics.textFont(customFont); // Set the custom font
    backtextGraphics.textSize(baseFontSize * 1);
    backtextGraphics.textAlign(RIGHT, BOTTOM);
    backtextGraphics.text('Created by Digital Altar', backtextGraphics.width - 20, backtextGraphics.height - 10); // Adjust padding as needed

    // Note: If you have other elements or graphics that depend on window size, update and redraw them here as well
}
