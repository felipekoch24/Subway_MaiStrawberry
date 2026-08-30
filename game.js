const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Carregando as imagens
const imgPista = new Image(); imgPista.src = "pista.png";
const imgMaiara = new Image(); imgMaiara.src = "maiara.png";
const imgMorango = new Image(); imgMorango.src = "morango.png";
const imgMoeda = new Image(); imgMoeda.src = "moeda.png";
const imgObstaculo = new Image(); imgObstaculo.src = "obstaculo.png";
const imgSkate = new Image(); imgSkate.src = "skate1.png";
const imgCapa = new Image(); imgCapa.src = "capa1.png";

// Variáveis do Jogo
let score = 0;
let coins = 0;
let isGameOver = false;
let gameSpeed = 3.5;

// Posições das 3 pistas no chão
const lanesX = [130, 200, 270];
let currentLane = 1;

let maiaraBaseY = 440;
let maiaraY = maiaraBaseY;
let isJumping = false;
let jumpVelocity = 0;
const gravity = 0.6;

let obstaculos = [];
let moedas = [];
let frameCount = 0;

// Controles de Teclado
document.addEventListener("keydown", (e) => {
    if (isGameOver) return;
    if (e.key === "ArrowLeft" && currentLane > 0) {
        currentLane--;
    } else if (e.key === "ArrowRight" && currentLane < 2) {
        currentLane++;
    } else if ((e.key === " " || e.key === "ArrowUp") && !isJumping) {
        isJumping = true;
        jumpVelocity = -11;
    }
});

// Controles de Toque (Celular)
let touchStartX = 0;
let touchStartY = 0;
document.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener("touchend", (e) => {
    if (isGameOver) return;
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
            jumpVelocity = -11;
        }
    }
});

function spawnItens() {
    frameCount++;
    if (frameCount % 90 === 0) {
        let laneAleatoria = Math.floor(Math.random() * 3);
        
        if (Math.random() > 0.3) {
            obstaculos.push({ lane: laneAleatoria, x: lanesX[laneAleatoria], y: 260, size: 20, speed: 2.5 });
        } else {
            moedas.push({ lane: laneAleatoria, x: lanesX[laneAleatoria], y: 260, size: 18, speed: 2.5 });
        }
    }
}

function update() {
    if (isGameOver) return;

    if (isJumping) {
        maiaraY += jumpVelocity;
        jumpVelocity += gravity;
        if (maiaraY >= maiaraBaseY) {
            maiaraY = maiaraBaseY;
            isJumping = false;
        }
    }

    score += 0.2;
    document.getElementById("score").innerText = `🏆 ${Math.floor(score)} m`;
    document.getElementById("coins").innerText = `🪙 ${coins}`;

    spawnItens();

    for (let i = obstaculos.length - 1; i >= 0; i--) {
        let obs = obstaculos[i];
        obs.y += obs.speed;
        obs.speed += 0.04;
        obs.size += 0.8;

        let targetX = lanesX[obs.lane];
        obs.x += (targetX - obs.x) * 0.1;

        if (
            obs.lane === currentLane &&
            obs.y >= 400 && obs.y <= 460 &&
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
        m.speed += 0.04;
        m.size += 0.7;

        let targetX = lanesX[m.lane];
        m.x += (targetX - m.x) * 0.1;

        if (
            m.lane === currentLane &&
            m.y >= 405 && m.y <= 465
        ) {
            coins += 1;
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
        ctx.drawImage(imgObstaculo, obs.x - obs.size / 2, obs.y, obs.size, obs.size);
    });

    moedas.forEach(m => {
        ctx.drawImage(imgMoeda, m.x - m.size / 2, m.y, m.size, m.size);
    });

    let targetX = lanesX[currentLane];
    let bounce = !isJumping ? Math.sin(Date.now() / 50) * 3 : 0;

    if (!isJumping) {
        ctx.drawImage(imgSkate, targetX - 25, maiaraY + 35 + bounce, 50, 30);
    }
    ctx.drawImage(imgMaiara, targetX - 25, maiaraY + bounce, 50, 65);

    let morangoBounce = Math.sin(Date.now() / 50) * 4;
    ctx.drawImage(imgMorango, targetX - 28, maiaraBaseY + 55 + morangoBounce, 55, 65);
}

function loop() {
    update();
    draw();
    if (!isGameOver) {
        requestAnimationFrame(loop);
    }
}

function triggerGameOver() {
    isGameOver = true;
    document.getElementById("final-score").innerText = `Distância: ${Math.floor(score)} m | Moedas: ${coins}`;
    document.getElementById("game-over-screen").classList.remove("hidden");
}

function reiniciarJogo() {
    score = 0;
    coins = 0;
    currentLane = 1;
    obstaculos = [];
    moedas = [];
    isGameOver = false;
    document.getElementById("game-over-screen").classList.add("hidden");
    loop();
}

function iniciarJogoDoMenu() {
    document.getElementById("menu-screen").classList.add("hidden");
    document.getElementById("hud").classList.remove("hidden");
    loop();
}

let imagensCarregadas = 0;
const totalImagens = 7;

function checarCarregamento() {
    imagensCarregadas++;
    if (imagensCarregadas === totalImagens) {
        console.log("Tudo pronto para rodar!");
    }
}

imgPista.onload = checarCarregamento;
imgMaiara.onload = checarCarregamento;
imgMorango.onload = checarCarregamento;
imgMoeda.onload = checarCarregamento;
imgObstaculo.onload = checarCarregamento;
imgSkate.onload = checarCarregamento;
imgCapa.onload = checarCarregamento;
        
