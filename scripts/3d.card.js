let cardFrontTexture;
let cardBackTexture;
let overlayImage; // Additional image to overlay on top of the card
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

function preload() {
    // Load the JSON file
    let imageData = loadJSON('data.json', () => {
        // Once the JSON is loaded, randomly select and load the images
        // Randomly select a front texture
        let frontTextures = imageData.cardFrontTextures;
        let randomFrontIndex = floor(random(frontTextures.length));
        cardFrontTexture = loadImage(frontTextures[randomFrontIndex]);

        // Randomly select a back texture
        let backTextures = imageData.cardBackTextures;
        let randomBackIndex = floor(random(backTextures.length));
        cardBackTexture = loadImage(backTextures[randomBackIndex]);
    });
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
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
        specularMaterial(250, 250, 250);
    } else {
        texture(cardBackTexture);
        // Change specular material to simulate holographic shimmer
        specularMaterial(250, 250, 250);
        push();
        rotateY(PI);
    }

    // Draw the card with some shininess to enhance the effect
    shininess(20);
    box(cardWidth, cardHeight, cardDepth);

    if (cos(rotationY) < 0) {
        pop(); // Correct the orientation for the back texture
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