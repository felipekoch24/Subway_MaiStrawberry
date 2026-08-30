const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Carregando as imagens da pasta
const imgPista = new Image(); imgPista.src = "pista.png";
const imgMaiara = new Image(); imgMaiara.src = "maiara.png";
const imgMorango = new Image(); imgMorango.src = "morango.png";
const imgMoeda = new Image(); imgMoeda.src = "moeda.png";
const imgObstaculo = new Image(); imgObstaculo.src = "obstaculo.png";

let score = 0;
let coins = 0;
let isGameOver = false;

// Posições das 3 pistas (Esquerda, Centro, Direita)
const lanes = [75, 200, 325];
let currentLane = 1; // Começa no centro

let maiaraX = lanes[currentLane];
let maiaraY = 480;

// Controles de toque/teclado simples para teste inicial
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && currentLane > 0) {
        currentLane--;
    } else if (e.key === "ArrowRight" && currentLane < 2) {
        currentLane++;
    }
});

// Suporte a toque na tela (arrastar ou tocar dos lados)
let touchStartX = 0;
document.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
});

document.addEventListener("touchend", (e) => {
    let touchEndX = e.changedTouches[0].clientX;
    if (touchEndX < touchStartX - 30 && currentLane > 0) {
        currentLane--; // Desliza pra esquerda
    } else if (touchEndX > touchStartX + 30 && currentLane < 2) {
        currentLane++; // Desliza pra direita
    }
});

function update() {
    if (isGameOver) return;

    // Suaviza a movimentação para a pista escolhida
    let targetX = lanes[currentLane];
    maiaraX += (targetX - maiaraX) * 0.2;

    score += 1;
    document.getElementById("score").innerText = `🏆 ${score} m`;
    document.getElementById("coins").innerText = `🪙 ${coins}`;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha a pista
    ctx.drawImage(imgPista, 0, 0, canvas.width, canvas.height);

    // Desenha a Maiara
    ctx.drawImage(imgMaiara, maiaraX - 30, maiaraY, 60, 80);

    // Desenha o Super Morango perseguindo atrás
    ctx.drawImage(imgMorango, 170, 510, 60, 70);
}

function loop() {
    update();
    draw();
    if (!isGameOver) {
        requestAnimationFrame(loop);
    }
}

function reiniciarJogo() {
    score = 0;
    coins = 0;
    currentLane = 1;
    isGameOver = false;
    document.getElementById("game-over-screen").classList.add("hidden");
    loop();
}

// Inicia o loop do jogo assim que as imagens carregarem
imgPista.onload = () => {
    loop();
};
