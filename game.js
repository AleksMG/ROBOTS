// Настройки
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 500;

// Игроки
const players = [
    { x: 200, y: 350, speed: 4, color: "#00f7ff", health: 100, direction: 1, state: "run", attackCooldown: 0, isJumping: false },
    { x: 800, y: 350, speed: 4, color: "#ff2a6d", health: 100, direction: -1, state: "run", attackCooldown: 0, isJumping: false }
];

// Оружие и эффекты
const swords = [];
const bullets = [];
const blood = [];

// Анимации
let frameCount = 0;

// ИИ
function updateAI() {
    players.forEach((p, i) => {
        const enemy = players[i === 0 ? 1 : 0];
        const distance = Math.abs(p.x - enemy.x);

        // Преследование или отступ
        if (distance > 150 || (p.health < 50 && distance < 100)) {
            p.state = "run";
            p.direction = p.x < enemy.x ? 1 : -1;
            p.x += p.direction * p.speed;
        } 
        // Атака мечом
        else if (distance < 80 && p.attackCooldown === 0) {
            p.state = "attack";
            p.attackCooldown = 30;
            swords.push({ x: p.x, y: p.y, direction: p.direction, frame: 0 });
            enemy.health -= 10;
            // Кровь
            for (let j = 0; j < 8; j++) {
                blood.push({ x: enemy.x + Math.random() * 30, y: enemy.y + 20, alpha: 1 });
            }
        }
        // Прыжок
        else if (!p.isJumping && Math.random() < 0.02) {
            p.state = "jump";
            p.isJumping = true;
            p.y -= 80;
        }

        // Гравитация
        if (p.y < 350) p.y += 5;
        else {
            p.y = 350;
            p.isJumping = false;
        }

        // Кулдаун
        if (p.attackCooldown > 0) p.attackCooldown--;
    });
}

// Отрисовка
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Стикмены
    players.forEach(p => {
        // Ноги (анимация бега)
        const legFrame = Math.sin(frameCount * 0.2) * 10;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - 10, p.y + 50, 15, 5); // Левая
        ctx.fillRect(p.x + 15, p.y + 50 + legFrame, 15, 5); // Правая

        // Тело
        ctx.fillRect(p.x, p.y, 20, 50);

        // Голова
        ctx.beginPath();
        ctx.arc(p.x + 10, p.y - 10, 12, 0, Math.PI * 2);
        ctx.fill();

        // Руки
        ctx.fillRect(p.x - 10, p.y + 10, 15, 5); // Левая
        ctx.fillRect(p.x + 15, p.y + 10, 15, 5); // Правая

        // HP-бар
        ctx.fillStyle = "red";
        ctx.fillRect(p.x - 10, p.y - 30, 40, 3);
        ctx.fillStyle = "lime";
        ctx.fillRect(p.x - 10, p.y - 30, (p.health / 100) * 40, 3);
    });

    // Мечи
    swords.forEach((sword, i) => {
        ctx.fillStyle = "#fff";
        ctx.fillRect(
            sword.x + (sword.direction * (20 + sword.frame * 5)),
            sword.y + 10,
            30 * sword.direction,
            5
        );
        sword.frame++;
        if (sword.frame > 5) swords.splice(i, 1);
    });

    // Кровь
    blood.forEach((b, i) => {
        ctx.fillStyle = `rgba(255, 0, 0, ${b.alpha})`;
        ctx.fillRect(b.x, b.y, 5, 5);
        b.alpha -= 0.02;
        if (b.alpha <= 0) blood.splice(i, 1);
    });
}

// Игровой цикл
function gameLoop() {
    updateAI();
    draw();
    frameCount++;
    requestAnimationFrame(gameLoop);
}

gameLoop();
