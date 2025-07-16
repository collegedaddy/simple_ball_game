// Get references to DOM elements
const character = document.getElementById("character");
const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");

let moveInterval; // For character movement
let isMoving = false; // Prevents multiple intervals
let score = 0; // Player's score
let blockCounter = 0; // Counts blocks for unique IDs
let currentBlocks = []; // Tracks active blocks
let gameActive = true; // Game state

// Move the character left
function moveLeft() {
    const left = parseInt(window.getComputedStyle(character).getPropertyValue("left"));
    if (left > 0) character.style.left = (left - 3) + "px";
}

// Move the character right
function moveRight() {
    const left = parseInt(window.getComputedStyle(character).getPropertyValue("left"));
    if (left < 380) character.style.left = (left + 3) + "px";
}

// Listen for keydown events to start moving
// Only allow one movement interval at a time
// ArrowLeft = move left, ArrowRight = move right
document.addEventListener("keydown", event => {
    if (!isMoving && gameActive) {
        isMoving = true;
        if (event.key === "ArrowLeft") moveInterval = setInterval(moveLeft, 8);
        if (event.key === "ArrowRight") moveInterval = setInterval(moveRight, 8);
    }
});

// Stop moving when key is released
document.addEventListener("keyup", () => {
    clearInterval(moveInterval);
    isMoving = false;
});

// Function to end the game
function endGame() {
    gameActive = false;
    alert(`Game over!\nYour score: ${score}`);
    restartBtn.style.display = "inline-block";
}

// Restart the game
restartBtn.onclick = () => window.location.reload();

// Main game loop: creates blocks and handles collision/score
const gameLoop = setInterval(() => {
    if (!gameActive) return;

    // Get last block and hole positions
    let blockLast = document.getElementById("block" + (blockCounter - 1));
    let holeLast = document.getElementById("hole" + (blockCounter - 1));
    let blockLastTop = blockLast ? parseInt(window.getComputedStyle(blockLast).getPropertyValue("top")) : 0;
    let holeLastTop = holeLast ? parseInt(window.getComputedStyle(holeLast).getPropertyValue("top")) : 0;

    // Add new block and hole if needed
    if (blockLastTop < 400 || blockCounter === 0) {
        const block = document.createElement("div");
        const hole = document.createElement("div");
        block.className = "block";
        hole.className = "hole";
        block.id = "block" + blockCounter;
        hole.id = "hole" + blockCounter;
        block.style.top = (blockLastTop + 100) + "px";
        hole.style.top = (holeLastTop + 100) + "px";
        // Randomize hole position
        const randomLeft = Math.floor(Math.random() * 360);
        hole.style.left = randomLeft + "px";
        game.appendChild(block);
        game.appendChild(hole);
        currentBlocks.push(blockCounter);
        blockCounter++;
    }

    // Get character's current position
    const characterTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));
    const characterLeft = parseInt(window.getComputedStyle(character).getPropertyValue("left"));
    let isFalling = true;

    // End game if character falls off the top
    if (characterTop <= 0) {
        clearInterval(gameLoop);
        endGame();
        return;
    }

    // Move blocks and check for collisions
    for (let i = 0; i < currentBlocks.length; i++) {
        const current = currentBlocks[i];
        const iblock = document.getElementById("block" + current);
        const ihole = document.getElementById("hole" + current);
        let iblockTop = parseFloat(window.getComputedStyle(iblock).getPropertyValue("top"));
        let iholeLeft = parseFloat(window.getComputedStyle(ihole).getPropertyValue("left"));
        // Move block and hole upward
        iblock.style.top = (iblockTop - 0.7) + "px";
        ihole.style.top = (iblockTop - 0.7) + "px";
        // Remove blocks that have moved out of view
        if (iblockTop < -20) {
            currentBlocks.shift();
            iblock.remove();
            ihole.remove();
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
        }
        // Check if character is on a block (not over a hole)
        if (iblockTop - 20 < characterTop && iblockTop > characterTop) {
            if (iholeLeft <= characterLeft && iholeLeft + 40 >= characterLeft) {
                // Character is over the hole, keep falling
                isFalling = true;
            } else {
                // Character is on the block, don't fall
                isFalling = false;
            }
        }
    }

    // Move character down if not on a block, else move up slightly
    if (isFalling) {
        if (characterTop < 480) character.style.top = (characterTop + 2) + "px";
    } else {
        character.style.top = (characterTop - 0.7) + "px";
    }
}, 10); // Run every 10ms for smooth animation
