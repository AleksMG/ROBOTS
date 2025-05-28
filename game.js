// Конфиг
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 500;

// Текстуры (упрощённые)
const textures = {
    sword: { width: 30, height: 5, color: "#aaa" },
    bullet: { radius: 3, color: "#ff0" },
    blood: { particles: [] }
};

// Игроки
const players = [
    {
        x: 300, y: 350, width: 15, height: 40,
        color: "#00f7ff", health: 200,
        state: "idle", direction: 1,
        speed: 3, jumpPower: 15,
        weapons: ["sword", "gun"],
        cooldowns: { attack: 0, shoot: 0, dash: 0 },
        combo: 0,
        ai: { aggression: 0.7, defense: 0.3 }
    },
    {
        x: 700, y: 350, width: 15, height: 40,
        color: "#ff2a6d", health: 200,
        state: "idle", direction: -1,
        speed: 3, jumpPower: 15,
        weapons: ["sword", "gun"],
        cooldowns: { attack: 0, shoot: 0, dash: 0 },
        combo: 0,
        ai: { aggression: 0.6, defense: 0.4 }
    }
];

// Пули
const bullets = [];

// Анимации
const states = {
    idle: { frame: 0, maxFrames: 4, speed: 0.1 },
    run: { frame: 0, maxFrames: 6, speed: 0.2 },
    attack: { frame: 0, maxFrames: 5, speed: 0.25, damageFrame: 2 },
    shoot: { frame: 0, maxFrames: 3, speed: 0.3 },
    jump: { frame: 0, maxFrames: 2, speed: 0.1 },
    dash: { frame: 0, maxFrames: 4, speed: 0.3 }
};

// ИИ-логика
function updateAI(player, enemy) {
    const DISTANCE = Math.abs(player.x - enemy.x);
    const RAND = Math.random();

    // Кулдауны
    if (player.cooldowns.attack > 0) player.cooldowns.attack--;
    if (player.cooldowns.shoot > 0) player.cooldowns.shoot--;
    if (player.cooldowns.dash > 0) player.cooldowns.dash--;

    // Решения ИИ
    if (DISTANCE > 200) {
        // Бег к врагу
        player.state = "run";
        player.direction = (player.x < enemy.x) ? 1 : -1;
        player.x += player.direction * player.speed;
    } 
    else if (DISTANCE < 50 && player.cooldowns.dash === 0) {
        // Уворот
        player.state = "dash";
        player.x += (player.direction * -1) * 50;
        player.cooldowns.dash = 60;
    }
    else if (DISTANCE < 100 && player.cooldowns.attack === 0) {
        // Атака мечом
        player.state = "attack";
        player.cooldowns.attack = 30;
        player.combo++;
    }
    else if (DISTANCE < 300 && player.cooldowns.shoot === 0 && RAND < 0.3) {
        // Стрельба
        player.state = "shoot";
        bullets.push({
            x: player.x + (player.direction * 30),
            y: player.y - 10,
            direction: player.direction,
            speed: 10,
            damage: 5
        });
        player.cooldowns.shoot = 40;
    }
    else if (player.y === 350 && RAND < 0.05) {
        // Прыжок с сальто
        player.state = "jump";
        player.y -= player.jumpPower;
    }
    else {
        player.state = "idle";
    }

    // Гравитация
    if (player.y < 350) player.y += 2;
    else player.y = 350;
}

// Отрисовка
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Игроки
    players.forEach(player => {
        // Тело
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Голова
        ctx.beginPath();
        ctx.arc(player.x + player.width/2, player.y - 10, 12, 0, Math.PI * 2);
        ctx.fill();

        // Меч
        if (player.state === "attack") {
            ctx.fillStyle = textures.sword.color;
            ctx.fillRect(
                player.x + (player.direction * 25),
                player.y - 5,
                textures.sword.width * player.direction,
                textures.sword.height
            );
        }

        // HP-бар
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fillRect(player.x - 20, player.y - 30, 60, 5);
        ctx.fillStyle = "lime";
        ctx.fillRect(player.x - 20, player.y - 30, (player.health / 200) * 60, 5);
    });

    // Пули
    bullets.forEach(bullet => {
        ctx.fillStyle = textures.bullet.color;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, textures.bullet.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Физика
function update() {
    // Пули
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.direction * bullet.speed;

        // Проверка попадания
        players.forEach(player => {
            if (
                bullet.x > player.x && bullet.x < player.x + player.width &&
                bullet.y > player.y && bullet.y < player.y + player.height
            ) {
                player.health -= bullet.damage;
                bullets.splice(index, 1);
            }
        });

        // Удаление за пределами экрана
        if (bullet.x < 0 || bullet.x > canvas.width) {
            bullets.splice(index, 1);
        }
    });

    // ИИ
    updateAI(players[0], players[1]);
    updateAI(players[1], players[0]);

    // Анимации
    players.forEach(player => {
        if (states[player.state]) {
            states[player.state].frame += states[player.state].speed;
            if (states[player.state].frame >= states[player.state].maxFrames) {
                player.state = "idle";
                states[player.state].frame = 0;
            }
        }
    });
}

// Игровой цикл
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Старт
gameLoop();

// Ускорение времени
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        canvas.style.animation = "flash 0.3s";
        setTimeout(() => { canvas.style.animation = ""; }, 300);
    }
});
