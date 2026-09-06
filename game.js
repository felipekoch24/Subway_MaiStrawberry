const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const imgPista = new Image(); imgPista.src = "pista.png";
const imgMaiara = new Image(); imgMaiara.src = "maiara.png";
const imgMorango = new Image(); imgMorango.src = "morango.png";
const imgMoeda = new Image(); imgMoeda.src = "moeda.png";
const imgObstaculo = new Image(); imgObstaculo.src = "obstaculo.png";
const imgSkate = new Image(); imgSkate.src = "skate1.png";
const imgCapa = new Image(); imgCapa.src = "capa1.png";

let score = 0;
let coins = 0;
let highScore = localStorage.getItem("subway_highScore") ? parseInt(localStorage.getItem("subway_highScore")) : 0;
let totalCoins = localStorage.getItem("subway_totalCoins") ? parseInt(localStorage.getItem("subway_totalCoins")) : 0;

let isGameOver = false;
let gameStarted = false;

function getLanesX() {
    let centerX = canvas.width / 2;
    let spacing = canvas.width * 0.18;
    return [centerX - spacing, centerX, centerX + spacing];
}

let currentLane = 1;
let maiaraY = 0;
let maiaraBaseY = 0;
let isJumping = false;
let jumpVelocity = 0;
const gravity = 0.6;

let obstaculos = [];
let moedas = [];
let frameCount = 0;

function atualizarPosicoesBase() {
    maiaraBaseY = canvas.height * 0.72;
    if (!isJumping) maiaraY = maiaraBaseY;
}
atualizarPosicoesBase();

document.addEventListener("keydown", (e) => {
    if (isGameOver || !gameStarted) return;
    if (e.key === "ArrowLeft" && currentLane > 0) {
        currentLane--;
    } else if (e.key === "ArrowRight" && currentLane < 2) {
        currentLane++;
    } else if ((e.key === " " || e.key === "ArrowUp") && !isJumping) {
        isJumping = true;
        jumpVelocity = -12;
    }
});

let touchStartX = 0;
let touchStartY = 0;
document.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener("touchend", (e) => {
    if (isGameOver || !gameStarted) return;
    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;
    
    let diffX = touchEndX - touchStartX;
    let diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < -30 && currentLane > 0) {
            currentLane--;
        } else if (diffX > 30 && currentLane < 2) {
            currentLane++;
        }
    } else {
        if (diffY < -30 && !isJumping) {
            isJumping = true;
            jumpVelocity = -12;
        }
    }
});

function spawnItens() {
    frameCount++;
    let lanesX = getLanesX();
    
    if (frameCount % 90 === 0) {
        let laneAleatoria = Math.floor(Math.random() * 3);
        let horizonY = canvas.height * 0.38;
        
        if (Math.random() > 0.4) {
            obstaculos.push({ lane: laneAleatoria, x: lanesX[laneAleatoria], y: horizonY, size: 20, speed: 2.2 });
        } else {
            for (let j = 0; j < 4; j++) {
                moedas.push({ 
                    lane: laneAleatoria, 
                    x: lanesX[laneAleatoria], 
                    y: horizonY - (j * 25), 
                    size: 15, 
                    speed: 2.2 
                });
            }
        }
    }
}

function update() {
    if (isGameOver || !gameStarted) return;

    if (isJumping) {
        maiaraY += jumpVelocity;
        jumpVelocity += gravity;
        if (maiaraY >= maiaraBaseY) {
            maiaraY = maiaraBaseY;
            isJumping = false;
        }
    }

    score += 0.15;
    document.getElementById("score").innerText = `🏆 ${Math.floor(score)} m`;
    document.getElementById("coins").innerText = `🪙 ${totalCoins}`;
    document.getElementById("high-score").innerText = `⭐ Recorde: ${highScore} m`;

    spawnItens();
    let lanesX = getLanesX();

    for (let i = obstaculos.length - 1; i >= 0; i--) {
        let obs = obstaculos[i];
        obs.y += obs.speed;
        obs.speed += 0.03; 
        obs.size += 0.8;

        let targetX = lanesX[obs.lane];
        obs.x += (targetX - obs.x) * 0.15;

        let hitZoneY = canvas.height * 0.70;
        if (
            obs.lane === currentLane &&
            obs.y >= hitZoneY - 30 && obs.y <= hitZoneY + 20 &&
            maiaraY >= maiaraBaseY - 10
        ) {
            triggerGameOver();
        }

        if (obs.y > canvas.height) {
            obstaculos.splice(i, 1);
        }
    }

    for (let i = moedas.length - 1; i >= 0; i--) {
        let m = moedas[i];
        m.y += m.speed;
        m.speed += 0.03;
        m.size += 0.6;

        let targetX = lanesX[m.lane];
        m.x += (targetX - m.x) * 0.15;

        let hitZoneY = canvas.height * 0.70;
        if (
            m.lane === currentLane &&
            m.y >= hitZoneY - 40 && m.y <= hitZoneY + 30
        ) {
            totalCoins += 1;
            localStorage.setItem("subway_totalCoins", totalCoins);
            moedas.splice(i, 1);
        }

        if (m.y > canvas.height) {
            moedas.splice(i, 1);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(imgPista, 0, 0, canvas.width, canvas.height);

    obstaculos.forEach(obs => {
        ctx.drawImage(imgObstaculo, obs.x - obs.size / 2, obs.y - obs.size, obs.size, obs.size);
    });

    moedas.forEach(m => {
        ctx.drawImage(imgMoeda, m.x - m.size / 2, m.y - m.size, m.size, m.size);
    });

    let lanesX = getLanesX();
    let targetX = lanesX[currentLane];
    let bounce = !isJumping ? Math.sin(Date.now() / 60) * 4 : 0;

    let charWidth = canvas.width * 0.14;
    let charHeight = charWidth * 1.3;

    if (!isJumping) {
        ctx.drawImage(imgSkate, targetX - (charWidth * 0.45), maiaraY + (charHeight * 0.55) + bounce, charWidth * 0.9, charHeight * 0.4);
    }
    ctx.drawImage(imgMaiara, targetX - (charWidth / 2), maiaraY + bounce, charWidth, charHeight);

    let morangoWidth = charWidth * 0.95;
    let morangoHeight = charHeight * 0.95;
    let morangoBounce = Math.sin(Date.now() / 60) * 5;
    ctx.drawImage(imgMorango, targetX - (morangoWidth / 2), maiaraBaseY + (charHeight * 0.45) + morangoBounce, morangoWidth, morangoHeight);
}

function loop() {
    update();
    draw();
    if (!isGameOver && gameStarted) {
        requestAnimationFrame(loop);
    }
}

function triggerGameOver() {
    isGameOver = true;
    
    let currentScoreFinal = Math.floor(score);
    if (currentScoreFinal > highScore) {
        highScore = currentScoreFinal;
        localStorage.setItem("subway_highScore", highScore);
    }

    document.getElementById("final-score").innerText = `${currentScoreFinal} m`;
    document.getElementById("final-coins").innerText = `${totalCoins}`;
    document.getElementById("game-over-screen").classList.remove("hidden");
}

function voltarAoMenu() {
    document.getElementById("game-over-screen").classList.add("hidden");
    document.getElementById("hud").classList.add("hidden");
    document.getElementById("menu-screen").classList.remove("hidden");
    gameStarted = false;
}

function reiniciarJogo() {
    score = 0;
    currentLane = 1;
    obstaculos = [];
    moedas = [];
    isGameOver = false;
    atualizarPosicoesBase();
    document.getElementById("game-over-screen").classList.add("hidden");
    loop();
}

function iniciarJogoDoMenu() {
    gameStarted = true;
    document.getElementById("menu-screen").classList.add("hidden");
    document.getElementById("hud").classList.remove("hidden");
    atualizarPosicoesBase();
    loop();
        }
