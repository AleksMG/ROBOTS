const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 400;

// Конфиг стикменов
const players = [
    {
        x: 200, y: 300, width: 20, height: 60, 
        color: "#3498db", health: 100, 
        state: "idle", direction: 1, 
        attackCooldown: 0, jumpPower: 15
    },
    {
        x: 600, y: 300, width: 20, height: 60, 
        color: "#e74c3c", health: 100, 
        state: "idle", direction: -1, 
        attackCooldown: 0, jumpPower: 15
    }
];

// Анимации
const states = {
    idle: { frames: 1, speed: 0 },
    walk: { frames: 4, speed: 5 },
    attack: { frames: 3, speed: 0, duration: 20 },
    jump: { frames: 2, speed: 0, loop: false }
};

// ИИ-логика для обоих стикменов
function updateAI(player, enemy) {
    // Случайное решение
    const decision = Math.random();

    // Преследование
    if (Math.abs(player.x - enemy.x) > 100) {
        player.state = "walk";
        player.direction = (player.x < enemy.x) ? 1 : -1;
        player.x += player.direction * states.walk.speed;
    } 
    
    // Атака
    else if (decision < 0.02 && player.attackCooldown === 0) {
        player.state = "attack";
        player.attackCooldown = 30;
    }
    
    // Прыжок
    else if (decision < 0.01 && player.y === 300) {
        player.state = "jump";
        player.y -= player.jumpPower;
    }

    // Гравитация
    if (player.y < 300) player.y += 3;
    else player.y = 300;

    // Кулдаун атаки
    if (player.attackCooldown > 0) player.attackCooldown--;
}

// Проверка ударов
function checkHit(attacker, defender) {
    if (attacker.state !== "attack") return;
    
    const hitArea = {
        x: attacker.x + (attacker.direction * 40),
        y: attacker.y - 20,
        width: 40,
        height: 30
    };

    if (
        defender.x < hitArea.x + hitArea.width &&
        defender.x + defender.width > hitArea.x &&
        defender.y < hitArea.y + hitArea.height &&
        defender.y + defender.height > hitArea.y
    ) {
        defender.health -= 1;
    }
}

// Отрисовка стикмена с анимацией
function drawStickman(player) {
    ctx.fillStyle = player.color;
    
    // Тело
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Голова
    ctx.beginPath();
    ctx.arc(player.x + 10, player.y - 15, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Ноги
    ctx.fillRect(player.x - 10, player.y + 60, 15, 5);
    ctx.fillRect(player.x + 15, player.y + 60, 15, 5);
    
    // Руки (анимация атаки)
    if (player.state === "attack") {
        ctx.fillRect(
            player.x + (player.direction * 30), 
            player.y + 10, 
            30, 
            5
        );
    } else {
        ctx.fillRect(player.x - 15, player.y + 10, 15, 5);
        ctx.fillRect(player.x + 20, player.y + 10, 15, 5);
    }
    
    // HP-бар
    ctx.fillStyle = "red";
    ctx.fillRect(player.x - 10, player.y - 40, 40, 5);
    ctx.fillStyle = "lime";
    ctx.fillRect(player.x - 10, player.y - 40, (player.health / 100) * 40, 5);
}

// Игровой цикл
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Обновление ИИ
    updateAI(players[0], players[1]);
    updateAI(players[1], players[0]);
    
    // Проверка ударов
    checkHit(players[0], players[1]);
    checkHit(players[1], players[0]);
    
    // Отрисовка
    players.forEach(drawStickman);
    
    requestAnimationFrame(gameLoop);
}

// Старт
gameLoop();
