const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Carregando as imagens
const imgPista = new Image(); imgPista.src = "pista.png";
const imgMaiara = new Image(); imgMaiara.src = "maiara.png";
const imgMorango = new Image(); imgMorango.src = "morango.png";
const imgMoeda = new Image(); imgMoeda.src = "moeda.png";
const imgObstaculo = new Image(); imgObstaculo.src = "obstaculo.png";

// Variáveis do Jogo
let score = 0;
let coins = 0;
let isGameOver = false;
let gameSpeed = 5;

// Posição de rolagem da pista para dar efeito de movimento contínuo
let pistaY = 0;

// Posições das 3 pistas (X central de cada faixa)
const lanes = [110, 200, 290];
let currentLane = 1; // Começa na pista do meio

let maiaraX = lanes[currentLane];
let maiaraY = 420;

// Listas de itens no cenário
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
    }
});

// Controles de Toque (Celular)
let touchStartX = 0;
document.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
});

document.addEventListener("touchend", (e) => {
    if (isGameOver) return;
    let touchEndX = e.changedTouches[0].clientX;
    if (touchEndX < touchStartX - 30 && currentLane > 0) {
        currentLane--; // Desliza esquerda
    } else if (touchEndX > touchStartX + 30 && currentLane < 2) {
        currentLane++; // Desliza direita
    }
});

// Função para gerar obstáculos e moedas
function spawnItens() {
    frameCount++;
    if (frameCount % 75 === 0) {
        let laneAleatoria = Math.floor(Math.random() * 3);
        
        if (Math.random() > 0.3) {
            obstaculos.push({ x: lanes[laneAleatoria], y: -100, width: 45, height: 45, lane: laneAleatoria });
        } else {
            moedas.push({ x: lanes[laneAleatoria], y: -100, width: 32, height: 32, lane: laneAleatoria });
        }
    }
}

function update() {
    if (isGameOver) return;

    // Faz a pista se mover para baixo dando a impressão de corrida
    pistaY += gameSpeed;
    if (pistaY >= canvas.height) {
        pistaY = 0;
    }

    // Movimentação suave da Maiara para a pista escolhida
    let targetX = lanes[currentLane];
    maiaraX += (targetX - maiaraX) * 0.25;

    // Aumenta a pontuação de distância
    score += 0.2;
    document.getElementById("score").innerText = `🏆 ${Math.floor(score)} m`;
    document.getElementById("coins").innerText = `🪙 ${coins}`;

    // Gera novos itens
    spawnItens();

    // Atualiza obstáculos
    for (let i = obstaculos.length - 1; i >= 0; i--) {
        obstaculos[i].y += gameSpeed;

        // Colisão com o obstáculo (A Maiara bateu!)
        if (
            obstaculos[i].lane === currentLane &&
            maiaraY < obstaculos[i].y + obstaculos[i].height &&
            maiaraY + 65 > obstaculos[i].y
        ) {
            triggerGameOver();
        }

        if (obstaculos[i].y > canvas.height) {
            obstaculos.splice(i, 1);
        }
    }

    // Atualiza moedas
    for (let i = moedas.length - 1; i >= 0; i--) {
        moedas[i].y += gameSpeed;

        // Coleta de moeda
        if (
            moedas[i].lane === currentLane &&
            maiaraY < moedas[i].y + moedas[i].height &&
            maiaraY + 65 > moedas[i].y
        ) {
            coins += 1;
            moedas.splice(i, 1);
        }

        if (moedas[i].y > canvas.height) {
            moedas.splice(i, 1);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Desenha a Pista em movimento contínuo (dupla para criar o looping perfeito)
    ctx.drawImage(imgPista, 0, pistaY, canvas.width, canvas.height);
    ctx.drawImage(imgPista, 0, pistaY - canvas.height, canvas.width, canvas.height);

    // 2. Desenha os Obstáculos
    obstaculos.forEach(obs => {
        ctx.drawImage(imgObstaculo, obs.x - 22, obs.y, obs.width, obs.height);
    });

    // 3. Desenha as Moedas
    moedas.forEach(m => {
        ctx.drawImage(imgMoeda, m.x - 16, m.y, m.width, m.height);
    });

    // 4. Efeito de leve corrida (subindo e descendo os pés com o tempo)
    let maiaraBounce = Math.sin(Date.now() / 60) * 3;

    // 5. Desenha a Maiara correndo embaixo
    ctx.drawImage(imgMaiara, maiaraX - 25, maiaraY + maiaraBounce, 50, 65);

    // 6. Desenha o Super Morango um pouco mais atrás na perseguição
    let morangoBounce = Math.sin(Date.now() / 60) * 4;
    ctx.drawImage(imgMorango, maiaraX - 28, maiaraY + 55 + morangoBounce, 55, 65);
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
    document.getElementById("final-score").innerText = `Distância percorrida: ${Math.floor(score)} m | Moedas: ${coins}`;
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

// Inicia o jogo quando as imagens carregarem
let imagensCarregadas = 0;
const totalImagens = 5;

function checarCarregamento() {
    imagensCarregadas++;
    if (imagensCarregadas === totalImagens) {
        loop();
    }
}

imgPista.onload = checarCarregamento;
imgMaiara.onload = checarCarregamento;
imgMorango.onload = checarCarregamento;
imgMoeda.onload = checarCarregamento;
imgObstaculo.onload = checarCarregamento;
            
