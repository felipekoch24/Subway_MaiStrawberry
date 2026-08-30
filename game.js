const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Carregando as imagens (incluindo o skate!)
const imgPista = new Image(); imgPista.src = "pista.png";
const imgMaiara = new Image(); imgMaiara.src = "maiara.png";
const imgMorango = new Image(); imgMorango.src = "morango.png";
const imgMoeda = new Image(); imgMoeda.src = "moeda.png";
const imgObstaculo = new Image(); imgObstaculo.src = "obstaculo.png";
const imgSkate = new Image(); imgSkate.src = "skate1.png";

// Variáveis do Jogo
let score = 0;
let coins = 0;
let isGameOver = false;
let gameSpeed = 4; // Velocidade que os itens vêm em direção à Maiara

// Posições das 3 pistas (X central de cada faixa)
const lanes = [110, 200, 290];
let currentLane = 1; // Começa na pista do meio

let maiaraX = lanes[currentLane];
let maiaraY = 440;

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

// Função para gerar obstáculos e moedas na parte superior vindo para baixo
function spawnItens() {
    frameCount++;
    if (frameCount % 85 === 0) {
        let laneAleatoria = Math.floor(Math.random() * 3);
        
        if (Math.random() > 0.35) {
            // Obstáculo começa lá no fundo (y menor) e vem crescendo/vindo pra frente
            obstaculos.push({ x: lanes[laneAleatoria], y: 180, width: 30, height: 30, lane: laneAleatoria, speed: 3 });
        } else {
            moedas.push({ x: lanes[laneAleatoria], y: 180, width: 25, height: 25, lane: laneAleatoria, speed: 3 });
        }
    }
}

function update() {
    if (isGameOver) return;

    // Movimentação suave da Maiara para a pista escolhida
    let targetX = lanes[currentLane];
    maiaraX += (targetX - maiaraX) * 0.25;

    // Aumenta a pontuação de distância
    score += 0.2;
    document.getElementById("score").innerText = `🏆 ${Math.floor(score)} m`;
    document.getElementById("coins").innerText = `🪙 ${coins}`;

    // Gera novos itens
    spawnItens();

    // Atualiza obstáculos (eles vêm do fundo em direção à Maiara)
    for (let i = obstaculos.length - 1; i >= 0; i--) {
        // Conforme o obstáculo desce na tela, ele aumenta levemente de tamanho simulando profundidade 3D
        obstaculos[i].y += obstaculos[i].speed;
        obstaculos[i].speed += 0.03; // Acelera conforme se aproxima
        obstaculos[i].width += 0.4;
        obstaculos[i].height += 0.4;

        // Colisão com o obstáculo (A Maiara bateu!)
        if (
            obstaculos[i].lane === currentLane &&
            obstaculos[i].y >= 400 && obstaculos[i].y <= 480
        ) {
            triggerGameOver();
        }

        // Remove obstáculo que passou da tela
        if (obstaculos[i].y > canvas.height) {
            obstaculos.splice(i, 1);
        }
    }

    // Atualiza moedas estáticas vindo na direção dela
    for (let i = moedas.length - 1; i >= 0; i--) {
        moedas[i].y += moedas[i].speed;
        moedas[i].speed += 0.03;
        moedas[i].width += 0.3;
        moedas[i].height += 0.3;

        // Coleta de moeda (se estiver na mesma pista e na altura da Maiara)
        if (
            moedas[i].lane === currentLane &&
            moedas[i].y >= 410 && moedas[i].y <= 470
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

    // 1. O CENÁRIO FICA FIXO (A pista não roda, fica estática parecendo uma foto de fundo linda)
    ctx.drawImage(imgPista, 0, 0, canvas.width, canvas.height);

    // 2. Desenha os Obstáculos vindo do fundo
    obstaculos.forEach(obs => {
        ctx.drawImage(imgObstaculo, obs.x - obs.width / 2, obs.y, obs.width, obs.height);
    });

    // 3. Desenha as Moedas paradas vindo na direção da tela
    moedas.forEach(m => {
        ctx.drawImage(imgMoeda, m.x - m.width / 2, m.y, m.width, m.height);
    });

    // 4. Efeito leve de movimento nos pés da Maiara
    let maiaraBounce = Math.sin(Date.now() / 60) * 3;

    // 5. Desenha o Skate e a Maiara fixos na parte de baixo correndo
    ctx.drawImage(imgSkate, maiaraX - 25, maiaraY + 35 + maiaraBounce, 50, 32);
    ctx.drawImage(imgMaiara, maiaraX - 25, maiaraY + maiaraBounce, 50, 65);

    // 6. Desenha o Super Morango colado atrás esperando ela errar
    let morangoBounce = Math.sin(Date.now() / 60) * 4;
    ctx.drawImage(imgMorango, maiaraX - 28, maiaraY + 60 + morangoBounce, 55, 65);
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

// Inicia o jogo quando as imagens carregarem (total de 6 imagens agora)
let imagensCarregadas = 0;
const totalImagens = 6;

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
imgSkate.onload = checarCarregamento;
                                
