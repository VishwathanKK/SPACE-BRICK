let tileSize = 32;
let rows = 16;
let columns = 16;

let board, context;
let ship, shipImg;
let alienArray = [];
let bulletArray = [];

let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;
let alienVelocityX = 1;

let bulletVelocityY = -10;
let shipVelocityX = tileSize;

let score = 0;
let level = 1;
let maxLevel = 5;
let gameOver = false;
let gamePaused = false;

document.addEventListener("DOMContentLoaded", () => {
    // Element references
    const homePage = document.getElementById('home-page');
    const gamePage = document.getElementById('game-page');
    const endPage = document.getElementById('end-page');
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const homeButton = document.getElementById('home-button');
    const restartButton = document.getElementById('restart-button');
    const homeButtonEnd = document.getElementById('home-button-end');
    const scoreDisplay = document.getElementById('score');
    const finalScoreDisplay = document.getElementById('final-score');
    const levelDisplay = document.getElementById('level');
    const finalLevelDisplay = document.getElementById('final-level');

    // Initialize Game Elements
    function initGame() {
        board = document.getElementById("board");
        board.width = tileSize * columns;
        board.height = tileSize * rows;
        context = board.getContext("2d");

        ship = {
            x: shipX,
            y: shipY,
            width: shipWidth,
            height: shipHeight
        };

        shipImg = new Image();
        shipImg.src = "./ship.png";

        const alienImg = new Image();
        alienImg.src = "./alien.png";

        createAliens(alienImg);
        gameOver = false;
        gamePaused = false;
        score = 0;
        level = 1;
        scoreDisplay.textContent = score;
        levelDisplay.textContent = level;

        requestAnimationFrame(update);
    }

    // Start Game Button
    startButton.addEventListener('click', () => {
        homePage.style.display = 'none';
        gamePage.style.display = 'block';
        initGame();
    });

    // Pause/Resume Button
    pauseButton.addEventListener('click', () => {
        gamePaused = !gamePaused;
        pauseButton.textContent = gamePaused ? 'Resume' : 'Pause';
    });

    // Home Button
    homeButton.addEventListener('click', () => {
        gameOver = true;
        gamePage.style.display = 'none';
        homePage.style.display = 'block';
    });

    homeButtonEnd.addEventListener('click', () => {
        endPage.style.display = 'none';
        homePage.style.display = 'block';
    });

    // Restart Game Button
    restartButton.addEventListener('click', () => {
        endPage.style.display = 'none';
        homePage.style.display = 'block';
    });

    // Main Game Loop
    function update() {
        if (!gameOver && !gamePaused) {
            requestAnimationFrame(update);
            context.clearRect(0, 0, board.width, board.height);
            context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

            // Update Aliens and Bullets
            updateAliens();
            updateBullets();

            // Draw Score and Level
            scoreDisplay.textContent = score;
            levelDisplay.textContent = level;
        }

        if (gameOver) {
            gamePage.style.display = 'none';
            endPage.style.display = 'block';
            finalScoreDisplay.textContent = score;
            finalLevelDisplay.textContent = level;
        }
    }

    // Move Ship
    document.addEventListener("keydown", (e) => {
        if (!gameOver && !gamePaused) {
            if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
                ship.x -= shipVelocityX;
            } else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
                ship.x += shipVelocityX;
            }
        }
    });

    // Shoot Bullet
    document.addEventListener("keyup", (e) => {
        if (!gameOver && !gamePaused && e.code == "Space") {
            shootBullet();
        }
    });

    // Create Aliens
    function createAliens(alienImg) {
        alienArray = [];
        for (let c = 0; c < alienColumns; c++) {
            for (let r = 0; r < alienRows; r++) {
                let alien = {
                    img: alienImg,
                    x: alienX + c * alienWidth,
                    y: alienY + r * alienHeight,
                    width: alienWidth,
                    height: alienHeight,
                    alive: true
                };
                alienArray.push(alien);
            }
        }
        alienCount = alienArray.length;
    }

    // Update Aliens
    function updateAliens() {
        alienArray.forEach((alien, index) => {
            if (alien.alive) {
                alien.x += alienVelocityX;
                if (alien.x + alien.width >= board.width || alien.x <= 0) {
                    alienVelocityX *= -1;
                    alienArray.forEach((a) => {
                        a.y += alienHeight;
                    });
                }
                context.drawImage(alien.img, alien.x, alien.y, alien.width, alien.height);

                if (alien.y >= ship.y) {
                    gameOver = true;
                }
            }
        });

        if (alienCount === 0 && level < maxLevel) {
            level++;
            score += 500;
            alienRows++;
            alienColumns++;
            createAliens(alienArray[0].img);
        } else if (alienCount === 0 && level === maxLevel) {
            gameOver = true;
        }
    }

    // Update Bullets
    function updateBullets() {
        bulletArray.forEach((bullet, index) => {
            bullet.y += bulletVelocityY;
            context.fillStyle = "white";
            context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

            alienArray.forEach((alien, alienIndex) => {
                if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                    bullet.used = true;
                    alien.alive = false;
                    alienCount--;
                    score += 100;
                }
            });

            if (bullet.y < 0) {
                bulletArray.splice(index, 1);
            }
        });
    }

    // Shoot Bullet
    function shootBullet() {
        bulletArray.push({
            x: ship.x + shipWidth * 15 / 32,
            y: ship.y,
            width: tileSize / 8,
            height: tileSize / 2,
            used: false
        });
    }

    // Collision Detection
    function detectCollision(a, b) {
        return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
    }
});
