const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const heartsElement = document.getElementById('hearts');

const startScreen = document.getElementById('start-screen');
const pauseScreen = document.getElementById('pause-screen');
const winScreen = document.getElementById('win-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScore = document.getElementById('final-score');

const bgMusic = document.getElementById('bg-music');
const jumpSound = document.getElementById('jump-sound');
const scoreSound = document.getElementById('score-sound');
const heartLossSound = document.getElementById('heartloss-sound');
const gameOverSound = document.getElementById('gameover-sound');
const winSound = document.getElementById('win-sound');

player.style.backgroundImage = "url('https://cdn.phototourl.com/free/2026-09-11-6e2edf1f-2b3c-48c2-9d19-6d7bb73e7e09.png')";

let isJumping = false;
let score = 0;
let lives = 3;

let gameInterval;
let spawnInterval;

let isGameRunning = false;
let isPaused = false;

let elements = [];

// دالة تشغيل صوت النقاط عند لمس السيجارة
function playScoreSound() {
    if (scoreSound) {
        scoreSound.currentTime = 0;
        scoreSound.play().catch(error => {
            console.log("تعذر تشغيل صوت النقاط:", error);
        });
    }
}

// دالة تشغيل صوت خسارة القلب عند لمس الفرخة
function playHeartLossSound() {
    if (heartLossSound) {
        heartLossSound.currentTime = 0;
        heartLossSound.play().catch(error => {
            console.log("تعذر تشغيل صوت خسارة القلب:", error);
        });
    }
}

document.addEventListener('keydown', function(event) {
    if (
        event.code === 'Space' &&
        !isJumping &&
        isGameRunning &&
        !isPaused
    ) {
        event.preventDefault();
        jump();
    }

    if (event.code === 'KeyP' && isGameRunning) {
        togglePause();
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

    if (bgMusic) {
        bgMusic.currentTime = 0;
        bgMusic.play().catch(e => console.log(e));
    }

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
        if (bgMusic) bgMusic.pause();
        pauseScreen.classList.remove('hidden');
    } else {
        isPaused = false;
        pauseScreen.classList.add('hidden');
        if (bgMusic) bgMusic.play().catch(e => console.log(e));
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

    obj.style.left = '800px';
    gameContainer.appendChild(obj);

    elements.push({
        element: obj,
        type: type,
        x: 800
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
            // لمس السيجارة -> زيادة النقاط وتشغيل صوت النقاط
            if (item.type === 'cigarette') {
                score += 10;
                scoreElement.textContent = score;

                playScoreSound();

                item.element.remove();
                elements.splice(i, 1);
            }
            // لمس الفرخة -> خسارة قلب وتشغيل صوت الخسارة
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
    if (bgMusic) bgMusic.pause();

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
    if (bgMusic) bgMusic.pause();

    if (gameOverSound) {
        gameOverSound.currentTime = 0;
        gameOverSound.play().catch(e => console.log(e));
    }

    finalScore.textContent = `النقاط الإجمالية: ${score}`;
    gameOverScreen.classList.remove('hidden');
}