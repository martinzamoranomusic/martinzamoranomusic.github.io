// Game configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const CELL_SIZE = 40;
const CANVAS_SIZE = 600;
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

// Game state
let gameState = {
    level: 1,
    moves: 0,
    startTime: null,
    timerInterval: null,
    player: { x: 1, y: 1 },
    goal: { x: 13, y: 13 },
    maze: []
};

// Generate maze using recursive backtracking
function generateMaze(size, level) {
    const maze = Array(size).fill().map(() => Array(size).fill(1));
    
    function carve(x, y) {
        maze[y][x] = 0;
        const directions = [
            [0, -2], [2, 0], [0, 2], [-2, 0]
        ].sort(() => Math.random() - 0.5);
        
        for (let [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && maze[ny][nx] === 1) {
                maze[y + dy/2][x + dx/2] = 0;
                carve(nx, ny);
            }
        }
    }
    
    carve(1, 1);
    
    // Add some complexity based on level
    const extraPaths = Math.min(level * 3, 20);
    for (let i = 0; i < extraPaths; i++) {
        const x = Math.floor(Math.random() * (size - 2)) + 1;
        const y = Math.floor(Math.random() * (size - 2)) + 1;
        if (x > 0 && x < size - 1 && y > 0 && y < size - 1) {
            maze[y][x] = 0;
        }
    }
    
    return maze;
}

// Initialize game
function initGame() {
    const mazeSize = 15;
    gameState.maze = generateMaze(mazeSize, gameState.level);
    gameState.player = { x: 1, y: 1 };
    gameState.maze[1][1] = 0; // Ensure start is clear
    
    // Find valid goal position
    gameState.goal = { x: mazeSize - 2, y: mazeSize - 2 };
    gameState.maze[gameState.goal.y][gameState.goal.x] = 0;
    
    gameState.moves = 0;
    gameState.startTime = Date.now();
    updateUI();
    
    if (!gameState.timerInterval) {
        gameState.timerInterval = setInterval(updateTimer, 1000);
    }
    
    draw();
}

// Draw game
function draw() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    const mazeSize = gameState.maze.length;
    const cellSize = CANVAS_SIZE / mazeSize;
    
    // Draw maze
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            if (gameState.maze[y][x] === 1) {
                // Wall
                ctx.fillStyle = '#2d2419';
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                ctx.strokeStyle = '#1a1410';
                ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            } else {
                // Path
                ctx.fillStyle = '#0a0806';
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
    
    // Draw goal
    ctx.fillStyle = '#C17A3A';
    ctx.font = `${cellSize * 0.8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎯', 
        gameState.goal.x * cellSize + cellSize / 2, 
        gameState.goal.y * cellSize + cellSize / 2
    );
    
    // Draw player (placeholder - will be replaced with image)
    drawPlayer(cellSize);
}

// Draw player
let playerImage = new Image();
playerImage.src = 'avatar.png';
let imageLoaded = false;

playerImage.onload = function() {
    imageLoaded = true;
    draw();
};

function drawPlayer(cellSize) {
    const x = gameState.player.x * cellSize + cellSize / 2;
    const y = gameState.player.y * cellSize + cellSize / 2;
    
    if (imageLoaded) {
        // Draw the actual avatar image - larger than the cell to account for dead space
        const imgSize = cellSize * 4.4;
        ctx.drawImage(playerImage, x - imgSize/2, y - imgSize/2, imgSize, imgSize);
    } else {
        // Fallback while image loads
        ctx.fillStyle = '#E8A864';
        ctx.beginPath();
        ctx.arc(x, y, cellSize * 0.35, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#1a1410';
        ctx.font = `${cellSize * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('😊', x, y);
    }
}

// Handle movement
function movePlayer(dx, dy) {
    const newX = gameState.player.x + dx;
    const newY = gameState.player.y + dy;
    
    // Check bounds and walls
    if (newX >= 0 && newX < gameState.maze.length &&
        newY >= 0 && newY < gameState.maze.length &&
        gameState.maze[newY][newX] === 0) {
        
        gameState.player.x = newX;
        gameState.player.y = newY;
        gameState.moves++;
        updateUI();
        draw();
        
        // Check win condition
        if (gameState.player.x === gameState.goal.x && 
            gameState.player.y === gameState.goal.y) {
            winLevel();
        }
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            e.preventDefault();
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
            e.preventDefault();
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
            e.preventDefault();
            movePlayer(1, 0);
            break;
    }
});

// Mobile touch controls
document.getElementById('btnUp').addEventListener('click', () => movePlayer(0, -1));
document.getElementById('btnDown').addEventListener('click', () => movePlayer(0, 1));
document.getElementById('btnLeft').addEventListener('click', () => movePlayer(-1, 0));
document.getElementById('btnRight').addEventListener('click', () => movePlayer(1, 0));

// Tilt controls for mobile devices
let tiltEnabled = false;
let lastMoveTime = 0;
const moveDelay = 200; // milliseconds between moves

document.getElementById('tiltToggle').addEventListener('change', async (e) => {
    tiltEnabled = e.target.checked;
    
    if (tiltEnabled) {
        // Request permission for iOS 13+
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission !== 'granted') {
                    tiltEnabled = false;
                    e.target.checked = false;
                    alert('Permission to access device orientation was denied');
                    return;
                }
            } catch (error) {
                console.error('Error requesting device orientation permission:', error);
                tiltEnabled = false;
                e.target.checked = false;
                return;
            }
        }
        
        // Start listening to device orientation
        window.addEventListener('deviceorientation', handleTilt);
    } else {
        window.removeEventListener('deviceorientation', handleTilt);
    }
});

function handleTilt(event) {
    if (!tiltEnabled) return;
    
    const now = Date.now();
    if (now - lastMoveTime < moveDelay) return;
    
    // beta: front-to-back tilt (negative when tilting forward, positive when backward)
    // gamma: left-to-right tilt (negative when tilting left, positive when right)
    const beta = event.beta;   // -180 to 180
    const gamma = event.gamma;  // -90 to 90
    
    const threshold = 15; // degrees of tilt needed to move
    
    // Determine which direction has the strongest tilt
    if (Math.abs(beta) > Math.abs(gamma)) {
        // Up/Down movement
        if (beta < -threshold) {
            movePlayer(0, -1); // Tilt forward = move up
            lastMoveTime = now;
        } else if (beta > threshold) {
            movePlayer(0, 1); // Tilt backward = move down
            lastMoveTime = now;
        }
    } else {
        // Left/Right movement
        if (gamma < -threshold) {
            movePlayer(-1, 0); // Tilt left = move left
            lastMoveTime = now;
        } else if (gamma > threshold) {
            movePlayer(1, 0); // Tilt right = move right
            lastMoveTime = now;
        }
    }
}

// Update UI
function updateUI() {
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('moves').textContent = gameState.moves;
}

function updateTimer() {
    if (gameState.startTime) {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('timer').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Win level
function winLevel() {
    clearInterval(gameState.timerInterval);
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    document.getElementById('winStats').textContent = 
        `Completed in ${minutes}:${seconds.toString().padStart(2, '0')} with ${gameState.moves} moves!`;
    document.getElementById('winMessage').classList.remove('hidden');
}

// Next level
document.getElementById('nextLevelBtn').addEventListener('click', () => {
    gameState.level++;
    document.getElementById('winMessage').classList.add('hidden');
    gameState.timerInterval = null;
    initGame();
});

// Reset level
document.getElementById('resetBtn').addEventListener('click', () => {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
    initGame();
});

// New game
document.getElementById('newGameBtn').addEventListener('click', () => {
    clearInterval(gameState.timerInterval);
    gameState.level = 1;
    gameState.timerInterval = null;
    initGame();
});

// Start game
initGame();
