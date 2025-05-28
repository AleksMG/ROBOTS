// Настройки
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 500;

// Текстуры
const textures = {
    sword: { width: 40, height: 5, color: "#fff" },
    bullet: { width: 10, height: 3, color: "#ff0" },
    blood: { particles: [] }
};

// Игроки
const players = [
    {
        x: 200, y: 350, width: 20, height: 60,
        color: "#00f7ff", health: 200,
        state: "run", direction: 1,
        speed: 4, jumpPower: 15,
        weapons: ["sword", "gun"],
        cooldowns: { attack: 0, shoot: 0 },
        combo: 0,
        isJumping: false
    },
    {
        x: 800, y: 350, width: 20, height: 60,
        color: "#ff2a6d", health: 200,
        state: "run", direction: -1,
        speed: 4, jumpPower: 15,
        weapons: ["sword", "gun"],
        cooldowns: { attack: 0, shoot: 0 },
        combo: 0,
        isJumping: false
    }
];

// Пули и кровь
const bullets = [];
const bloodParticles = [];

// Анимации
const states = {
    idle: { frame: 0, maxFrames: 4 },
    run: { frame: 0, maxFrames: 6 },
    attack: { frame: 0, maxFrames: 5, damageFrame: 2 },
    shoot: { frame: 0, maxFrames: 3 },
    jump: { frame: 0, maxFrames: 4 },
    death: { frame: 0, maxFrames: 7 }
};

// ИИ-логика
function updateAI() {
    players.forEach((player, index) => {
        const enemy = players[index === 0 ? 1 : 0];
        const distance = Math.abs(player.x - enemy.x);

        // Преследование или отступление
        if (distance > 150) {
            player.state = "run";
            player.direction = (player.x < enemy.x) ? 1 : -1;
            player.x += player.direction * player.speed;
        } 
        // Атака мечом
        else if (distance < 80 && player.cooldowns.attack === 0) {
            player.state = "attack";
            player.cooldowns.attack = 30;
        }
        // Прыжок с сальто
        else if (Math.random() < 0.02 && !player.isJumping) {
            player.state = "jump";
            player.isJumping = true;
            player.y -= player.jumpPower;
        }
        // Стрельба
        else if (distance > 100 && player.cooldowns.shoot === 0) {
            player.state = "shoot";
            bullets.push({
                x: player.x + (player.direction * 40),
                y: player.y - 10,
                direction: player.direction,
                speed: 8,
                damage: 10
            });
            player.cooldowns.shoot = 40;
        }

        // Гравитация
        if (player.y < 350) {
            player.y += 2;
        } else {
            player.y = 350;
            player.isJumping = false;
        }

        // Кулдауны
        if (player.cooldowns.attack > 0) player.cooldowns.attack--;
        if (player.cooldowns.shoot > 0) player.cooldowns.shoot--;
    });
}

// Отрисовка
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Игроки
    players.forEach(player => {
        // Ноги (анимация бега)
        const legFrame = Math.floor(states.run.frame) % 2 === 0 ? -10 : 10;
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x - 15, player.y + 50, 15, 5); // Левая нога
        ctx.fillRect(player.x + 20, player.y + 50 + legFrame, 15, 5); // Правая нога

        // Тело
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Голова
        ctx.beginPath();
        ctx.arc(player.x + 10, player.y - 15, 15, 0, Math.PI * 2);
        ctx.fill();

        // Руки (анимация атаки/стрельбы)
        if (player.state === "attack") {
            // Меч
            ctx.fillStyle = textures.sword.color;
            ctx.fillRect(
                player.x + (player.direction * 30),
                player.y + 10,
                textures.sword.width * player.direction,
                textures.sword.height
            );
            // Руки с мечом
            ctx.fillStyle = player.color;
            ctx.fillRect(player.x + (player.direction * 25), player.y + 10, 10, 5);
        } else if (player.state === "shoot") {
            // Автомат
            ctx.fillStyle = "#555";
            ctx.fillRect(player.x + (player.direction * 30), player.y + 5, 25, 5);
        } else {
            // Обычные руки
            ctx.fillRect(player.x - 15, player.y + 10, 15, 5);
            ctx.fillRect(player.x + 20, player.y + 10, 15, 5);
        }

        // HP-бар
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fillRect(player.x - 20, player.y - 40, 60, 5);
        ctx.fillStyle = "lime";
        ctx.fillRect(player.x - 20, player.y - 40, (player.health / 200) * 60, 5);
    });

    // Пули
    bullets.forEach(bullet => {
        ctx.fillStyle = textures.bullet.color;
        ctx.fillRect(bullet.x, bullet.y, textures.bullet.width, textures.bullet.height);
    });

    // Кровь
    bloodParticles.forEach(particle => {
        ctx.fillStyle = `rgba(255, 0, 0, ${particle.opacity})`;
        ctx.fillRect(particle.x, particle.y, 3, 3);
    });
}

// Физика
function update() {
    updateAI();

    // Пули
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.direction * bullet.speed;

        // Попадание
        players.forEach(player => {
            if (
                bullet.x > player.x && bullet.x < player.x + player.width &&
                bullet.y > player.y && bullet.y < player.y + player.height
            ) {
                player.health -= bullet.damage;
                bullets.splice(index, 1);
                
                // Кровь
                for (let i = 0; i < 10; i++) {
                    bloodParticles.push({
                        x: player.x + Math.random() * 30,
                        y: player.y + Math.random() * 40,
                        opacity: 1
                    });
                }
            }
        });

        // Удаление пуль
        if (bullet.x < 0 || bullet.x > canvas.width) {
            bullets.splice(index, 1);
        }
    });

    // Кровь (исчезает)
    bloodParticles.forEach((particle, index) => {
        particle.opacity -= 0.01;
        if (particle.opacity <= 0) bloodParticles.splice(index, 1);
    });

    // Анимации
    Object.keys(states).forEach(state => {
        if (states[state].frame < states[state].maxFrames) {
            states[state].frame += 0.1;
        } else {
            states[state].frame = 0;
        }
    });
}

// Игровой цикл
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
