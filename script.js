const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const heartsElement = document.getElementById('hearts');

const startScreen = document.getElementById('start-screen');
const pauseScreen = document.getElementById('pause-screen');
const winScreen = document.getElementById('win-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const screenTitle = document.getElementById('screen-title');
const finalScore = document.getElementById('final-score');

const introMusic = document.getElementById('intro-music');
const bgMusic = document.getElementById('bg-music');
const jumpSound = document.getElementById('jump-sound');
const scoreSound = document.getElementById('score-sound');
const heartLossSound = document.getElementById('heartloss-sound');
const insulinSound = document.getElementById('insulin-sound');
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
let gameOverSoundTimeout;

let scale = 1;

function fitScale() {
    scale = Math.min(
        1,
        (window.innerWidth - 16) / 808,
        (window.innerHeight - 100) / 408
    );
    document.documentElement.style.setProperty('--scale', scale);
}

fitScale();
window.addEventListener('resize', fitScale);
window.addEventListener('orientationchange', fitScale);

document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
});

gameContainer.addEventListener('pointerdown', function(event) {
    if (event.target.closest('button')) return;

    if (isGameRunning && !isPaused && !isJumping) {
        event.preventDefault();
        jump();
    }
});

function toggleTheme() {
    const celestial = document.getElementById('celestial-body');
    const themeBtn = document.getElementById('theme-toggle-btn');
    
    if (gameContainer.classList.contains('night')) {
        gameContainer.classList.remove('night');
        gameContainer.classList.add('day');
        
        if (celestial) {
            celestial.classList.remove('moon');
            celestial.classList.add('sun');
        }
        if (themeBtn) themeBtn.textContent = '🌙 ليل';
    } else {
        gameContainer.classList.remove('day');
        gameContainer.classList.add('night');
        
        if (celestial) {
            celestial.classList.remove('sun');
            celestial.classList.add('moon');
        }
        if (themeBtn) themeBtn.textContent = '☀️ نهار';
    }
}

function playScoreSound() {
    if (scoreSound) {
        scoreSound.currentTime = 0;
        scoreSound.play().catch(error => console.log(error));
    }
}

function playChickenSound() {
    if (heartLossSound) {
        heartLossSound.currentTime = 0;
        heartLossSound.play().catch(error => console.log(error));
    }
}

function playInsulinSound() {
    if (insulinSound) {
        insulinSound.currentTime = 0;
        insulinSound.play().catch(error => console.log(error));
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
    if (introMusic) {
        introMusic.currentTime = 0;
        introMusic.play().catch(e => console.log("خطأ تشغيل صوت البداية: ", e));
    }

    clearTimeout(gameOverSoundTimeout);
    if (gameOverSound) {
        gameOverSound.pause();
        gameOverSound.currentTime = 0;
    }

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

    if (rand < 0.35) {
        type = 'chicken';
        obj.classList.add('chicken');
        obj.innerHTML = '🐔';
    } else if (rand < 0.7) {
        type = 'cigarette';
        obj.classList.add('cigarette');
        obj.innerHTML = '🚬';
    } else {
        type = 'insulin';
        obj.classList.add('insulin');
        obj.innerHTML = `<span class="insulin-icon">💉</span><span class="insulin-label">حقنة أنسولين</span>`;
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
            playerRect.left < itemRect.right - 15 * scale &&
            playerRect.right > itemRect.left + 15 * scale;

        const isCollidingVertical =
            playerRect.bottom > itemRect.top + 20 * scale;

        if (isCollidingHorizontal && isCollidingVertical) {
            if (item.type === 'cigarette') {
                score += 10;
                scoreElement.textContent = score;
                playScoreSound();
            }
            else if (item.type === 'chicken') {
                score = Math.max(0, score - 10);
                scoreElement.textContent = score;
                playChickenSound();
            }
            else if (item.type === 'insulin') {
                lives--;
                updateHeartsDisplay();
                playInsulinSound();

                if (lives <= 0) {
                    item.element.remove();
                    elements.splice(i, 1);
                    endGame("ما انت خلاص خدت هتاخد فين تاني");
                    return;
                }
            }

            item.element.remove();
            elements.splice(i, 1);
        }

        if (item.x < -50) {
            item.element.remove();
            elements.splice(i, 1);
        }
    }
}

function endGame(customMessage = "انتهت اللعبة!") {
    isGameRunning = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    
    if (bgMusic) bgMusic.pause();

    clearTimeout(gameOverSoundTimeout);
    gameOverSoundTimeout = setTimeout(() => {
        if (gameOverSound && !isGameRunning) {
            gameOverSound.currentTime = 0;
            gameOverSound.play().catch(e => console.log("خطأ تشغيل صوت الخسارة: ", e));
        }
    }, 1000);

    screenTitle.textContent = customMessage;
    finalScore.textContent = `النقاط الإجمالية: ${score}`;
    gameOverScreen.classList.remove('hidden');
}
