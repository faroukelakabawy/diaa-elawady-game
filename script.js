const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const heartsElement = document.getElementById('hearts');

const startScreen = document.getElementById('start-screen');
const pauseScreen = document.getElementById('pause-screen');
const winScreen = document.getElementById('win-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScore = document.getElementById('final-score');

const jumpSound = document.getElementById('jump-sound');
const scoreSound = document.getElementById('score-sound');
const heartLossSound = document.getElementById('heartloss-sound');
const gameOverSound = document.getElementById('gameover-sound');
const winSound = document.getElementById('win-sound');

player.style.backgroundImage = "url('https://i.imgur.com/MYZKe2c.png')";

let isJumping = false;
let score = 0;
let lives = 3;

let gameInterval;
let spawnInterval;

let isGameRunning = false;
let isPaused = false;

let elements = [];

function playScoreSound() {
    if (scoreSound) {
        scoreSound.currentTime = 0;
        scoreSound.play().catch(error => console.log(error));
    }
}

function playHeartLossSound() {
    if (heartLossSound) {
        heartLossSound.currentTime = 0;
        heartLossSound.play().catch(error => console.log(error));
    }
}

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && !isJumping && isGameRunning && !isPaused) {
        event.preventDefault();
        jump();
    }
    if (event.code === 'KeyP' && isGameRunning) {
        togglePause();
    }
});

gameContainer.addEventListener('touchstart', function(e) {
    if (e.target.id === 'pause-btn') return; 
    if (!isJumping && isGameRunning && !isPaused) {
        jump();
    }
});

function jump() {
    isJumping = true;
    player.classList.add('jump');

    if (jumpSound) {
        jumpSound.currentTime = 0;
        jumpSound.play().catch(e => console.log(e));
    }

    setTimeout(() => {
        player.classList.remove('jump');
        isJumping = false;
    }, 650);
}

function startGame() {
    score = 0;
    lives = 3;

    isGameRunning = true;
    isPaused = false;

    scoreElement.textContent = score;
    updateHeartsDisplay();

    elements.forEach(item => {
        if (item.element) item.element.remove();
    });
    elements = [];

    startScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    winScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    clearInterval(gameInterval);
    clearInterval(spawnInterval);

    gameInterval = setInterval(updateGame, 20);
    spawnInterval = setInterval(spawnObject, 1800);
}

function togglePause() {
    if (!isGameRunning) return;

    if (!isPaused) {
        isPaused = true;
        clearInterval(gameInterval);
        clearInterval(spawnInterval);
        pauseScreen.classList.remove('hidden');
    } else {
        isPaused = false;
        pauseScreen.classList.add('hidden');
        gameInterval = setInterval(updateGame, 20);
        spawnInterval = setInterval(spawnObject, 1800);
    }
}

function updateHeartsDisplay() {
    heartsElement.textContent = '❤️'.repeat(lives);
}

function spawnObject() {
    if (!isGameRunning || isPaused) return;

    const rand = Math.random();
    const obj = document.createElement('div');
    let type = '';

    if (rand < 0.5) {
        type = 'chicken';
        obj.classList.add('chicken');
        obj.innerHTML = '🐔';
    } else {
        type = 'cigarette';
        obj.classList.add('cigarette');
        obj.innerHTML = '🚬';
    }

    const containerWidth = gameContainer.offsetWidth; 
    obj.style.left = containerWidth + 'px';
    gameContainer.appendChild(obj);

    elements.push({
        element: obj,
        type: type,
        x: containerWidth
    });
}

function updateGame() {
    if (isPaused) return;

    const playerRect = player.getBoundingClientRect();

    for (let i = elements.length - 1; i >= 0; i--) {
        let item = elements[i];
        
        item.x -= 5;
        item.element.style.left = item.x + 'px';

        const itemRect = item.element.getBoundingClientRect();

        const isCollidingHorizontal =
            playerRect.left < itemRect.right - 15 &&
            playerRect.right > itemRect.left + 15;

        const isCollidingVertical =
            playerRect.bottom > itemRect.top + 20;

        if (isCollidingHorizontal && isCollidingVertical) {
            if (item.type === 'cigarette') {
                score += 10;
                scoreElement.textContent = score;
                playScoreSound();
                item.element.remove();
                elements.splice(i, 1);
            }
            else if (item.type === 'chicken') {
                lives--;
                updateHeartsDisplay();
                playHeartLossSound();

                if (lives <= 0) {
                    item.element.remove();
                    elements.splice(i, 1);
                    endGame();
                    return;
                }

                item.element.remove();
                elements.splice(i, 1);
            }

            if (score >= 100) {
                winGame();
                return;
            }
        }

        if (item.x < -50) {
            item.element.remove();
            elements.splice(i, 1);
        }
    }
}

function winGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);

    if (winSound) {
        winSound.currentTime = 0;
        winSound.play().catch(e => console.log(e));
    }

    winScreen.classList.remove('hidden');
}

function endGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);

    if (gameOverSound) {
        gameOverSound.currentTime = 0;
        gameOverSound.play().catch(e => console.log(e));
    }

    finalScore.textContent = `جمعت ${score} نووقطه`;
    gameOverScreen.classList.remove('hidden');
}