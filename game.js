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
let gameSpeed = 2.8; // Velocidade inicial calibrada

// Posições X das pistas no chão e no horizonte
const lanesX = [140, 200, 260];
let currentLane = 1;

let maiaraBaseY = 440;
let maiaraY = maiaraBaseY;
let isJumping = false;
let jumpVelocity = 0;
const gravity = 0.55;

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
        jumpVelocity = -10;
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
            jumpVelocity = -10;
        }
    }
});

function spawnItens() {
    frameCount++;
    if (frameCount % 100 === 0) {
        let laneAleatoria = Math.floor(Math.random() * 3);
        
        // AGORA SIM: Nascem bem lá no fundo do horizonte (y = 210) e bem pequenininhos (size = 10)
        if (Math.random() > 0.35) {
            obstaculos.push({ lane: laneAleatoria, x: lanesX[laneAleatoria], y: 210, size: 10, speed: 2.0 });
        } else {
            moedas.push({ lane: laneAleatoria, x: lanesX[laneAleatoria], y: 210, size: 10, speed: 2.0 });
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

    // Atualiza obstáculos vindo do horizonte
    for (let i = obstaculos.length - 1; i >= 0; i--) {
        let obs = obstaculos[i];
        obs.y += obs.speed;
        obs.speed += 0.025; // Aceleração suave conforme se aproxima
        obs.size += 0.55;   // Cresce gradualmente dando efeito 3D perfeito

        let targetX = lanesX[obs.lane];
        obs.x += (targetX - obs.x) * 0.1;

        // Colisão (Só bate se estiver na pista certa, na altura da Maiara e NÃO estiver pulando)
        if (
            obs.lane === currentLane &&
            obs.y >= 410 && obs.y <= 460 &&
            maiaraY >= maiaraBaseY - 5
        ) {
            triggerGameOver();
        }

        if (obs.y > canvas.height) {
            obstaculos.splice(i, 1);
        }
    }

    // Atualiza moedas vindo do horizonte
    for (let i = moedas.length - 1; i >= 0; i--) {
        let m = moedas[i];
        m.y += m.speed;
        m.speed += 0.025;
        m.size += 0.5;

        let targetX = lanesX[m.lane];
        m.x += (targetX - m.x) * 0.1;

        // Coleta de moeda
        if (
            m.lane === currentLane &&
            m.y >= 415 && m.y <= 465
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

    // 1. Cenário fixo
    ctx.drawImage(imgPista, 0, 0, canvas.width, canvas.height);

    // 2. Desenha os Obstáculos crescendo em perspectiva
    obstaculos.forEach(obs => {
        ctx.drawImage(imgObstaculo, obs.x - obs.size / 2, obs.y, obs.size, obs.size);
    });

    // 3. Desenha as Moedas crescendo em perspectiva
    moedas.forEach(m => {
        ctx.drawImage(imgMoeda, m.x - m.size / 2, m.y, m.size, m.size);
    });

    let targetX = lanesX[currentLane];
    let bounce = !isJumping ? Math.sin(Date.now() / 50) * 3 : 0;

    // 4. Desenha Skate e Maiara
    if (!isJumping) {
        ctx.drawImage(imgSkate, targetX - 22, maiaraY + 35 + bounce, 45, 28);
    }
    ctx.drawImage(imgMaiara, targetX - 25, maiaraY + bounce, 50, 65);

    // 5. Super Morango na cola
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
        console.log("Tudo pronto!");
    }
}

imgPista.onload = checarCarregamento;
imgMaiara.onload = checarCarregamento;
imgMorango.onload = checarCarregamento;
imgMoeda.onload = checarCarregamento;
imgObstaculo.onload = checarCarregamento;
imgSkate.onload = checarCarregamento;
imgCapa.onload = checarCarregamento;
