const canvas = document.getElementById('zeCanvas');
const c = canvas.getContext('2d');
const upgradeGUI = document.getElementById('upgrades');
const firerateUpd = document.getElementById('upgrade1');
const ammoUpd = document.getElementById('upgrade2');
const sniperUpd = document.getElementById('upgrade3');

const abilityImage = document.querySelector('.abilityIMG');
const abilityTxt = document.getElementById('abilityText');
let currentAbility = 0;

const waveReminder = document.getElementById('waveIsDoneText');

const actualUpgradeGUI = document.getElementById('actualUpgradeGooey');
const up1 = document.getElementById('u1');
const up2 = document.getElementById('u2');
const up3 = document.getElementById('u3');
const up4 = document.getElementById('u4');
const up5 = document.getElementById('u5');
let upgradeShow = false;

let health = 100;
let healthTxt = document.getElementById('Health');

const BOOMEY = document.querySelector('.KABLOOEY');

const waveText = document.getElementById('waver');
const upgradeText = document.getElementById('CHOOSE-YOUR-BRAINS');

const bossTime = document.getElementById('bossImg');

const flash = new Image('muzzle.png');

let mouse = { x: 0, y: 0 };
let turret = { x: 1000, y: 780, radius: 50 };

let shooting = new Audio('Shooting.mp3');
shooting.volume = 0.4;
const grenepew = new Audio('Grepew.mp3');
let ricochet = new Audio('RICOCHET.mp3');
const FIRE = new Audio('FIREEEE.mp3');
const TANKFIRE = new Audio('TANKFIRE.mp3');
FIRE.loop = true;

let hit = new Audio('HIT.mp3');

const POOL_SIZE = 3; // number of overlapping shots allowed
let poolIndex = 0;
let hitIndex = 0;
let recoIndex = 0;

const reloading = new Audio('reload.mp3');
const KABOOM = new Audio('EXPLODE.mp3');
const bossKABOOM = new Audio('explosion.ogg');

const wewewew = new Audio('Siren.mp3');

const buy = new Audio('Bought.mp3');
const notEnough = new Audio('NoMoney.mp3');

const jumpscareSound = new Audio('AHHHHHHHHHHHH.mp3');

let musicPlaying = false;
let currentMusic = new Audio();
currentMusic.volume = 1;
currentMusic.loop = false;
let randomMusic = Math.floor(Math.random() * 3) + 1;

let gameOver = false;
let jumpscare = document.getElementById('gayOver')

const finalwaveMusic = new Audio('War Machines Underscore.mp3');
finalwaveMusic.loop = true;
finalwaveMusic.volume = 0.7;

let audioShooting = false;
let isGUIactive = true;

let booletSpeed = 20;
let booletCooldown = 100
let shotgunCooldown = 0;
let spread = 0.008;
let bulletDMG = 0;
let bulletPierceAmt = 0;

let abilityTimeout = 0;

let isStunned = false;

let muzzleFlashTime = 0;        // how many frames left to show the flash
const muzzleFlashDuration = 3;

let fireMode = 1;

let isReloading = false;

let speedNumber = document.getElementById("firerate");
let cooldownNumber = document.getElementById("fireCooldown");
cooldownNumber.textContent = booletSpeed;
speedNumber.textContent = booletCooldown;
let damageNumber = document.getElementById('bulletStrong');
let pierceNumber = document.getElementById('bulletPierce');
let pierceNumberForReal = 0;
let upgradeToken = 0;

let waveStart = false;
let waveIsStillOngoing = false;
let isSpawning = null;
let timer = 3;
let wave = 0;
let finalwaveGOGOGO = false;

let canFireBigAhh = false;
let bossIsDead = false;

let bullets = [];
let grenada = [];
let enemies = [];
let bosses = [];
let bigAhhBullet = [];
let backgroundRect = [];
const audioPool = [];
const hitmarkerPool = [];
const recoPool = [];

for (let i = 0; i < POOL_SIZE; i++) {
    const a = shooting.cloneNode();
    audioPool.push(a);

    const h = hit.cloneNode();
    hitmarkerPool.push(h);

    const r = ricochet.cloneNode();
    recoPool.push(r);
}

function playShot() {

    const a = audioPool[poolIndex];
    a.currentTime = 0;
    a.volume = 0.4;
    a.play();

    poolIndex = (poolIndex + 1) % POOL_SIZE;
}

function hitmark() {
    const h = hitmarkerPool[hitIndex];
    h.currentTime = 0;
    h.volume = 1;
    h.play();

    hitIndex = (hitIndex + 1) % POOL_SIZE;
}

function rico() {
    const r = recoPool[recoIndex];
    r.currentTime = 0;
    r.volume = 1;
    r.play();

    recoIndex = (recoIndex + 1) % POOL_SIZE;
}

function stopAllAudio() {
    for (const a of audioPool) {
        a.currentTime = 0;
    }
}

function changeShotSound(funny) {
    for (const a of audioPool) {
        a.src = funny;
        a.load();
    }
}

function fadeOutAudio(audioElement, duration) {
    const fadeInterval = 0.03; // Milliseconds between volume adjustments
    const steps = duration / fadeInterval; // Number of steps to reach 0 volume
    const volumeDecrement = audioElement.volume / steps; // Amount to decrease volume per step

    const fadeOutInterval = setInterval(() => {
        if (audioElement.volume > volumeDecrement) {
            audioElement.volume -= volumeDecrement;
        } else {
            audioElement.volume = 0; // Ensure volume is exactly 0
            audioElement.pause(); // Stop the audio playback
            clearInterval(fadeOutInterval); // Clear the interval
        }
    }, fadeInterval);
}

function musicSystem() {
    if (isAudioPlaying(currentMusic)) {
        console.log('hold');
    } else {
        if (randomMusic === 3) {
            currentMusic.src = 'Hell March (Remastered).mp3';
            currentMusic.load();
        } else if (randomMusic === 2) {
            currentMusic.src = 'In Shadows We Thrive.mp3';
            currentMusic.load();
        } else {
            currentMusic.src = 'Demolition and Destruction.mp3';
            currentMusic.load();
        }
    }
}

currentMusic.addEventListener("ended", () => {
        if (wave <= 9) {
            randomMusic = Math.floor(Math.random() * 3) + 1;
            musicSystem();
            musicPlaying = false;
            currentMusic.play();
        }
    });

function isAudioPlaying(template) {
    return !template.paused;
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

document.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

function boolets() {
    const dx = mouse.x - turret.x;
    const dy = mouse.y - turret.y;

    const baseAngle = Math.atan2(dy, dx);

    const randomOffset = (Math.random() - 0.5) * 2 * spread;

    const angle = baseAngle + randomOffset;

    const barrelLength = turret.radius;
    const spawnX = turret.x + Math.cos(angle) * barrelLength;
    const spawnY = turret.y + Math.sin(angle) * barrelLength;

    const speed = booletSpeed;

    bullets.push({
        x: spawnX,
        y: spawnY,
        radius: 5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        pierce: bulletPierceAmt
    });

    muzzleFlashTime = muzzleFlashDuration;
}

function grenade() {
    const dx = mouse.x - turret.x;
    const dy = mouse.y - turret.y;

    const baseAngle = Math.atan2(dy, dx);

    const angle = baseAngle;

    const barrelLength = turret.radius;
    const spawnX = turret.x + Math.cos(angle) * barrelLength;
    const spawnY = turret.y + Math.sin(angle) * barrelLength;

    const speed = 8;

    grenada.push({
        x: spawnX,
        y: spawnY,
        radius: 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed
    });

    muzzleFlashTime = muzzleFlashDuration;
}

let enemyChancer = 0;
let numberChancer = 15;


function spawnEnemy() {
    const x = Math.random() * (canvas.width - 100) + 100;
    const y = -20;
        
    enemyChancer = Math.floor(Math.random() * numberChancer) + 1;

    if (enemyChancer > 33) {
        enemies.push({ x, y, 
            radius: 22, 
            vy: 0.25, 
            vx: 0, 
            color: "rgba(40, 63, 3, 0.8)", 
            hitmarkcolor: "rgba(63, 99, 6, 0.8)", 
            OGcolor: "rgba(40, 63, 3, 0.8)", 
            canDefelct: 0, 
            canExplode: 1, 
            canShield: 0,
            hp: 30});
    } else if (enemyChancer > 27) {
        enemies.push({ x, y, 
            radius: 22, 
            vy: 0.25, 
            vx: 0, 
            color: "rgba(40, 63, 3, 0.8)", 
            hitmarkcolor: "rgba(63, 99, 6, 0.8)", 
            OGcolor: "rgba(40, 63, 3, 0.8)", 
            canDefelct: 0, 
            canExplode: 1, 
            hp: 30});
    } else if (enemyChancer > 23) {
        enemies.push({ x, y, 
            radius: 15, 
            vy: 0.3, 
            vx: 0, 
            color: "rgba(31, 27, 27, 0.8)", 
            hitmarkcolor: "rgba(90, 74, 74, 0.8)", 
            OGcolor: "rgba(31, 27, 27, 0.8)", 
            canDefelct: 1, 
            canExplode: 0, 
            hp: 20});
    } else if (enemyChancer > 19) {
        enemies.push({ x, y, 
            radius: 13, 
            vy: 0.4, 
            vx: 10, 
            color: "rgba(122, 0, 0, 0.8)", 
            hitmarkcolor: "rgba(199, 38, 38, 0.8)", 
            OGcolor: "rgba(122, 0, 0, 0.8)", 
            canExplode: 0, 
            canDefelct: 0, 
            hp: 12});
    } else if (enemyChancer > 14) {
        enemies.push({ x, y, 
            radius: 12, 
            vy: 0.35, 
            vx: 0, 
            color: "rgba(51, 27, 27, 0.8)", 
            hitmarkcolor: "rgba(107, 60, 60, 0.8)", 
            OGcolor: "rgba(51, 27, 27, 0.8)", 
            canDefelct: 0, 
            canExplode: 0, 
            hp: 14});
    } else if (enemyChancer > 7) {
        enemies.push({ x, y, 
            radius: 7, 
            vy: 0.7, 
            vx: 0, 
            color: "rgba(236, 82, 11, 0.8)", 
            hitmarkcolor: "rgba(255, 173, 79, 0.8)", 
            OGcolor: "rgba(236, 82, 11, 0.8)", 
            canDefelct: 0, 
            canExplode: 0, 
            hp: 1});
    } else {
        enemies.push({ x, y, 
            radius: 10, 
            vy: 0.5, 
            vx: 0, 
            color: "rgba(255, 0, 0, 0.8)", 
            hitmarkcolor: "rgba(255, 116, 116, 0.8)", 
            OGcolor: "rgba(255, 0, 0, 0.8)",  
            canDefelct: 0, 
            canExplode: 0, 
            hp: 8});
    }
}

function spawnBoss() {
    const x = 700;
    const y = -100;

    bosses.push({ x, y, 
        radius: 80, 
        vy: 0.25, 
        vx: 0, 
        color: "rgba(126, 126, 126, 0)", 
        hitmarkcolor: "rgba(80, 80, 80, 0)", 
        OGcolor: "rgba(126, 126, 126, 0)", 
        hp: 500
    });
}

function spawnBigAssBullet() {
    const x = 700;
    const y = 300;

    bigAhhBullet.push({ x, y, 
        radius: 15, 
        vy: 1.45, 
        vx: 0, 
        color: "rgba(26, 15, 15, 0.8)", 
        hitmarkcolor: "rgba(26, 15, 15, 0.8)", 
        OGcolor: "rgba(26, 15, 15, 0.8)", 
        hp: 20
    });
}

function background() {
    const x = 800;
    const y = 300;

    let randomWidth = Math.floor(Math.random() * 400) + 200;
    let randomHeight = Math.floor(Math.random() * 400) + 200;

    backgroundRect.push({ x, y,
        width: randomWidth,
        height: randomHeight,
        color: "rgba(202, 202, 202, 0.2)",
        vx: -10
    })
}

function healthDmg() {
    health -=10;
    health = Math.max(health, 0)

    healthTxt.classList.add('HealthbutOUCH');
    healthTxt.style.display = "block";
    healthTxt.style.color = "red";
    healthTxt.offsetHeight;
    healthTxt.classList.remove('HealthbutOUCH');
    healthTxt.style.color = "white";
}

function bossDeath() {
    bossKABOOM.play();
    bossTime.src = "TACTICAL TANK IS DYING.png";
    BOOMEY.classList.add('KABLOW');
    BOOMEY.style.display = "block";
    BOOMEY.style.opacity = "0.5";
    BOOMEY.offsetHeight;
    BOOMEY.classList.remove('KABLOW')
    BOOMEY.style.opacity = "0";

    setTimeout(() => {
        bossKABOOM.play();
        bossTime.src = "TACTICAL TANK IS DYING 2.png";
        BOOMEY.classList.add('KABLOW');
        BOOMEY.style.display = "block";
        BOOMEY.style.opacity = "0.5";
        BOOMEY.offsetHeight;
        BOOMEY.classList.remove('KABLOW')
        BOOMEY.style.opacity = "0";

        setTimeout(() => {
            bossKABOOM.play();
            bossTime.style.display = "none";
            BOOMEY.classList.add('KABLOW');
            BOOMEY.style.display = "block";
            BOOMEY.style.opacity = "1";
            BOOMEY.offsetHeight;
            BOOMEY.classList.remove('KABLOW')
            BOOMEY.style.opacity = "0";
        }, 1600);
    }, 1200);
}

function animate() {
    c.clearRect(0, 0, canvas.width, canvas.height);

    const dx = mouse.x - turret.x;
    const dy = mouse.y - turret.y;
    const angle = Math.atan2(dy, dx);

    c.beginPath();
    c.arc(turret.x, turret.y, turret.radius, 0, Math.PI * 2);
    c.strokeStyle = 'white';
    c.lineWidth = 3;
    c.stroke();

    c.save();
    c.translate(turret.x, turret.y);
    c.rotate(angle);
    c.beginPath();
    c.rect(turret.radius - 1, -10, 10, 20);
    c.strokeStyle = 'white';
    c.lineWidth = 2;
    c.stroke();
    c.restore();

    if (muzzleFlashTime > 0) {
        c.save();
        c.translate(turret.x, turret.y);
        c.rotate(angle);

        c.shadowBlur = 35;
        c.shadowColor = "white";
        c.fillStyle = "white";

        c.beginPath();
        c.arc(turret.radius + 12, 0, 10, -0.1, 0.1); // arc slice
        c.lineTo(turret.radius + 5, 0);
        c.closePath();
        c.fill();

        c.restore();
        muzzleFlashTime--;
    }

    bullets.forEach(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        c.beginPath();
        c.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        c.fillStyle = "white";
        c.fill();
    });

    grenada.forEach(grenad => {
        grenad.x += grenad.vx;
        grenad.y += grenad.vy;

        c.beginPath();
        c.arc(grenad.x, grenad.y, grenad.radius, 0, Math.PI * 2);
        c.fillStyle = "darkgreen";
        c.fill();
    });

    enemies.forEach((enemy, e) => {
        let newX = (Math.random() - 0.5) * 2 * 2;
        if (enemy.y <= 720) {
            enemy.y += enemy.vy;
        } else {
            enemy.y += enemy.vy;
            enemies.splice(e, 1);
            healthDmg();
        }

        enemy.x += enemy.vx * newX;

        enemy.kulay = enemy.color;

        c.beginPath();
        c.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2)
        c.fillStyle = enemy.kulay;

        c.fill();
    })

    bosses.forEach(boss => {
        let newX = (Math.random() - 0.5) * 2 * 2;

        if (boss.y <= 100) {
            boss.y += boss.vy
        }

        boss.x += boss.vx * newX;

        boss.kulay = boss.color;

        c.beginPath();
        c.arc(boss.x, boss.y, boss.radius, 0, Math.PI * 2)
        c.fillStyle = boss.kulay;

        c.fill();
    })

    bigAhhBullet.forEach((biggie, j) => {
        let newX = (Math.random() - 0.5) * 2 * 2;

        if (biggie.y <= 490) {
            biggie.y += biggie.vy
        } else {
            bigAhhBullet.splice(j, 1)
            BOOMEY.classList.add('KABLOW');
            BOOMEY.style.display = "block";
            BOOMEY.style.opacity = "1";
            BOOMEY.style.backgroundColor = "Red";
            BOOMEY.offsetHeight;
            BOOMEY.classList.remove('KABLOW')
            BOOMEY.style.opacity = "0";
            isStunned = true;
            clearInterval(bulletInterval);
            bossKABOOM.play();
            setTimeout(() => {
                BOOMEY.style.backgroundColor = "White";
            }, 1200);
            setTimeout(() => {
                isStunned = false;
            }, 4000);
        }

        biggie.x += biggie.vx * newX;

        biggie.kulay = biggie.color;

        c.beginPath();
        c.arc(biggie.x, biggie.y, biggie.radius, 0, Math.PI * 2)
        c.fillStyle = biggie.kulay;

        c.fill();
    })

    backgroundRect.forEach((rect, r) => {
        if (rect.x <= 10) {
            rect.x += rect.vx;
        } else {
            console.log("good to go")
            backgroundRect.splice(r, 1);
        } // fix this okay thx

        c.beginPath();
        c.fillRect(rect.x, rect.y, rect.width, rect.height);
        c.fillStyle = rect.color;
    })

    bullets.forEach((b, i) => {
        enemies.forEach((e, j) => {
            const dx = b.x - e.x;
            const dy = b.y - e.y;
            const dist = Math.hypot(dx, dy);
            if (dist < b.radius + e.radius) {
                if (e.canDefelct === 1 && b.pierce <= 1) {
                    rico();
                    b.vx += Math.floor(Math.random() * -20) + 20;
                    b.vy += Math.floor(Math.random() * -20) + 40;
                } else if (e.canDefelct === 1 && b.pierce > 1) {
                    bullets.splice(i, 1);
                    e.hp -= bulletDMG;
                } else if (e.canDefelct === 0) {
                    if (b.pierce > 0) {
                        b.pierce -= 1;
                        e.hp -= bulletDMG;
                    } else if (b.pierce === 0) {
                        bullets.splice(i, 1);
                        e.hp -= bulletDMG;
                    }

                    if (e.hp <= 0 && e.canExplode === 1) {
                        enemyChancer = 8;
                    }
                }
                e.color = e.hitmarkcolor;
                hitmark();

                setTimeout(() => {
                    e.color = e.OGcolor;
                }, 50);

                if (e.hp <= 0) {
                    enemies.splice(j, 1);
                }
            }
        });
    });

    bullets.forEach((b, i) => {
        bosses.forEach((bo, j) => {
            const dx = b.x - bo.x;
            const dy = b.y - bo.y;
            const dist = Math.hypot(dx, dy);
            if (dist < b.radius + bo.radius) {
                bo.hp -= bulletDMG;
                bullets.splice(i, 1);
                hitmark();

                bo.color = bo.hitmarkcolor;

                setTimeout(() => {
                    bo.color = bo.OGcolor;
                }, 50);

                if (bo.hp <= 0) {
                    bosses.splice(j, 1);
                    bossDeath();
                    bossIsDead = true;
                }
            }
        });
    });

    bullets.forEach((b, i) => {
        bigAhhBullet.forEach((bAB, j) => {
            const dx = b.x - bAB.x;
            const dy = b.y - bAB.y;
            const dist = Math.hypot(dx, dy);
            if (dist < b.radius + bAB.radius) {
                bAB.hp -= bulletDMG;
                bullets.splice(i, 1);
                hitmark();

                bAB.color = bAB.hitmarkcolor;

                setTimeout(() => {
                    bAB.color = bAB.OGcolor;
                }, 50);

                if (bAB.hp <= 0) {
                    bigAhhBullet.splice(j, 1);
                }
            }
        });
    });

    grenada.forEach((b, i) => {
        enemies.forEach((e, j) => {
            const dx = b.x - e.x;
            const dy = b.y - e.y;
            const dist = Math.hypot(dx, dy);

            if (dist < b.radius + e.radius) {

                grenada.splice(i, 1);
                KABOOM.play();
                BOOMEY.classList.add('KABLOW');
                BOOMEY.style.display = "block";
                BOOMEY.style.opacity = "1";
                BOOMEY.offsetHeight;
                BOOMEY.classList.remove('KABLOW')
                BOOMEY.style.opacity = "0";

                const explosionRadius = 300;
                enemies = enemies.filter(enemy => {
                    const ex = b.x - enemy.x;
                    const ey = b.y - enemy.y;
                    const d = Math.hypot(ex, ey);
                    return d > explosionRadius + enemy.radius;
                });
            }
        });
    });

    // Remove bullets off the screen
    bullets = bullets.filter(b => 
        b.x > -50 && b.x < canvas.width + 50 &&
        b.y > -50 && b.y < canvas.height + 50
    );

    grenada = grenada.filter(g => 
        g.x > -50 && g.x < canvas.width + 50 &&
        g.y > -50 && g.y < canvas.height + 50
    );

    requestAnimationFrame(animate);
}

function collisionSystem(bullet, enemy) {
    const dx = bullet.x - enemy.x
    const dy = bullet.y - enemy.y

    const distance = Math.hypot(dx, dy)

    return distance < bullet.radius - enemy.radius;
}

function Wavesystem() {
    wave += 1;
    numberChancer += 2;

    let waveCooldown = 1000;
    gameloopOnce1 = true;

    waveIsStillOngoing = true;

    if (wave === 1) {
        timer = 30;
        waveText.textContent = "WAVE 1";
    } else if (wave === 2) {
        timer = 40;
        waveText.textContent = "WAVE 2";
    } else if (wave === 3) {
        timer = 55
        waveText.textContent = "WAVE 3";
    } else if (wave === 4) {
        timer = 65
        waveText.textContent = "WAVE 4";
        waveCooldown -= 50;
        enemies.forEach(e => {
            e.hp += 1;
        })
    } else if (wave === 5) {
        timer = 70
        waveText.textContent = "WAVE 5";
        enemies.forEach(e => {
            e.hp += 1;
        })
    } else if (wave === 6) {
        timer = 70
        waveText.textContent = "WAVE 6";
        waveCooldown -= 50;
        enemies.forEach(e => {
            e.hp += 2;
        })
        waveCooldown -= 100;
    } else if (wave === 7) {
        timer = 85
        waveText.textContent = "WAVE 7";
        waveCooldown -= 50;
        enemies.forEach(e => {
            e.hp += 3;
            e.vy += 0.1;
        })
    } else if (wave === 8) {
        timer = 85
        waveText.textContent = "WAVE 8";
        waveCooldown -= 100;
        enemies.forEach(e => {
            e.hp += 3;
            e.vy += 0.15;
        })
        waveCooldown -= 100;
    } else if (wave === 9) {
        timer = 100;
        waveText.textContent = "WAVE 9";
        waveCooldown -= 100;
        enemies.forEach(e => {
            e.hp += 4;
            e.vy += 0.2;
        })
    } else if (wave === 10) {
        timer = 300;
        waveText.textContent = "FINAL WAVE";
        waveText.style.color = "red";
        waveText.style.fontSize = "3rem"
        waveText.style.left = "38%"
        waveCooldown -= 400;
        enemies.forEach(e => {
            e.hp += 7;
            e.vy += 0.2;
        })
        spawnBoss();
        bossTime.style.display = "block"
        setTimeout(() => {
            bossTime.style.top = "330px"
        }, 50);
        setTimeout(() => {
            bossTime.style.transition = "top 0.2s ease-out"
            canFireBigAhh = true;
        }, 17000);
    }
    wewewew.play();
    waveText.style.transform = "translateY(0.2rem)"

    setTimeout(() => {
        waveText.style.transform = "translateY(-5rem)"
    }, 5000);
    if (waveStart === true) {
        isSpawning = setInterval(() => {
            if (gameOver === false) {
                spawnEnemy();
                timer -= 1;
                console.log(timer)
            }
        }, waveCooldown);
    }

    setInterval(() => {
        if (timer < 1) {
            clearInterval(isSpawning);
            waveStart = false;
        }
    }, 1000);
}

function upgradeSystem() {
    if (upgradeShow === false) {
        isGUIactive = true;
        upgradeShow = true;
        actualUpgradeGUI.style.display = "flex";
        setTimeout(() => {
            actualUpgradeGUI.style.transform = "translateY(1px)";
        }, 100);
    } else {
        isGUIactive = false;
        actualUpgradeGUI.style.transform = "translateY(700px)";
        upgradeShow = false;
        setTimeout(() => {
            actualUpgradeGUI.style.display = "none";
        }, 1100);
    }
}

let gameloopOnce1 = true;
let gameloopOnce2 = true;

function gameLoop() {
    if (enemies.length === 0 && timer < 1 && waveStart === false && gameloopOnce1 === true) {
        gameloopOnce1 = false;
        waveReminder.style.display = "block";

        setTimeout(() => {
            waveReminder.style.opacity = "1";
        }, 100);
        upgradeToken += 1;
        waveIsStillOngoing = false;
    }

    if (abilityTimeout < 1) {
        abilityImage.style.opacity = "1";
    } else {
        abilityImage.style.opacity = "0.2";
    }

    if (shotgunCooldown > 0) {
        shotgunCooldown -= 1;
    }

    if (abilityIntervalCooldown > 0) {
        abilityIntervalCooldown -= 1;
    }

    if (abilityIntervalCooldown === 0 && currentAbility === 2) {
        clearInterval(abilityInterval);
        FIRE.pause();
        FIRE.currentTime = 0;
    } else if (abilityIntervalCooldown === 0 && currentAbility === 3) {
        clearInterval(abilityInterval);
    }

    let isExecuted = false;

    if (finalwaveGOGOGO === true) {
            if (isExecuted === false) {
                isExecuted = true;
                fadeOutAudio(currentMusic, 5000);
            }

            setTimeout(() => {
                finalwaveMusic.play();
            }, 7000);
        }

    if (canFireBigAhh === true && bossIsDead === false) {
        canFireBigAhh = false;
        spawnBigAssBullet();
        TANKFIRE.play();

        bossTime.style.top = "300px";

        bossTime.src = "OH SHOOT TACTICAL TANK FIRING.png"

        setTimeout(() => {
            bossTime.src = "OH SHOOT TACTICAL TANK.png"
        }, 15);

        setTimeout(() => {
            bossTime.style.top = "330px";
        }, 170);
        setTimeout(() => {
            canFireBigAhh = true
        }, 10000);
    }

    healthTxt.textContent = health;

    if (health <= 0) {
        gameOver = true;
        wave = 0;
        timer = 0;
        jumpscare.style.display = "block";
        currentMusic.pause();
        jumpscareSound.play();
    }
}

function abilityUpdate() {
    setInterval(() => {
        if (abilityTimeout > 0) {
            abilityTimeout -= 1;
        }
    }, 1000);
}

let bulletInterval = null;
let abilityInterval = null;
let abilityIntervalCooldown = 0;

ammoUpd.addEventListener("click", () => {
    upgradeGUI.style.display = "none";
    isGUIactive = false;
    waveStart = true;
    bulletDMG += 1;
    currentAbility = 1;
    abilityImage.src = "grenada.png";
    abilityTxt.textContent = "Press G To launch a grenade"
    damageNumber.textContent = bulletDMG;
    Wavesystem();
    musicSystem();
    currentMusic.play();
});

firerateUpd.addEventListener("click", () => {
    upgradeGUI.style.display = "none";
    isGUIactive = false;
    waveStart = true;
    booletSpeed = 16;
    booletCooldown -= 30;
    bulletDMG += 0.5;
    currentAbility = 2;
    abilityImage.src = "Rapid.png";
    abilityTxt.textContent = "Press G To activate Rapid fire"
    damageNumber.textContent = bulletDMG;
    spread = 0.08;
    /*changeShotSound('SMG.mp3');*/
    cooldownNumber.textContent = booletSpeed;
    Wavesystem();
    musicSystem();
    currentMusic.play();
})

sniperUpd.addEventListener("click", () => {
    upgradeGUI.style.display = "none";
    isGUIactive = false;
    waveStart = true;
    booletSpeed = 13;
    bulletDMG += 3;
    bulletPierceAmt += 2;
    pierceNumberForReal += 2;
    currentAbility = 3;
    abilityImage.src = "tracker.png";
    abilityTxt.textContent = "Press G To activate Speedy buckshots"
    pierceNumber.textContent = pierceNumberForReal;
    damageNumber.textContent = bulletDMG;
    spread = 0.2;
    changeShotSound('shotgun.mp3');
    fireMode = 2;
    cooldownNumber.textContent = booletSpeed;
    Wavesystem();
    musicSystem();
    currentMusic.play();
})

up1.addEventListener("click", () => {
    if (upgradeToken > 0) {
        booletSpeed += 2;
        cooldownNumber.textContent = booletSpeed;
        buy.play();
        upgradeToken -= 1;
    } else {
        notEnough.play();
    }
});

up2.addEventListener("click", () => {
    if (upgradeToken > 0) {
        booletCooldown -= 10;
        speedNumber.textContent = booletCooldown;
        buy.play();
        upgradeToken -= 1;
    } else {
        notEnough.play();
    }
});

up3.addEventListener("click", () => {
    if (upgradeToken > 0) {
        bulletDMG += 0.5;
        damageNumber.textContent = bulletDMG;
        buy.play();
        upgradeToken -= 1;
    } else {
        notEnough.play();
    }
});

up4.addEventListener("click", () => {
    if (upgradeToken > 0) {
        bulletPierceAmt += 1;
        pierceNumberForReal += 1;
        pierceNumber.textContent = pierceNumberForReal;
        buy.play();
        upgradeToken -= 1;
    } else {
        notEnough.play();
    }
});

document.addEventListener("mousedown", () => {
    audioShooting = true;
    if (fireMode === 1 && isGUIactive === false && isStunned === false) {
            boolets();
            playShot();
            bulletInterval = setInterval(() => {
                boolets()
                playShot();
            }, booletCooldown);
        } else if (fireMode === 2 && shotgunCooldown < 1 && isGUIactive === false && isStunned === false) {
            boolets();
            boolets();
            boolets();
            boolets();
            setTimeout(() => {
                boolets();
                boolets();
                boolets();
                boolets();
            }, 15);
            setTimeout(() => {
                boolets();
                boolets();
                boolets();
                boolets();
            }, 30);
            playShot();

            shotgunCooldown += 200;
        }
});

document.addEventListener("mouseup", () => {
    audioShooting = false;
    clearInterval(bulletInterval);
});

document.addEventListener("keydown", (e) => {
    if (e.key === "g") {
        if (abilityTimeout < 1) {
            if (currentAbility === 1) {
                grenade();
                grenepew.play();

                abilityTimeout += 25;
            } else if (currentAbility === 2) {
                abilityIntervalCooldown += 1800;
                abilityTimeout += 40;
                abilityInterval = setInterval(() => {
                    boolets()
                    FIRE.play();
                }, 20);
            } else if (currentAbility === 3) {
                abilityIntervalCooldown += 800;
                abilityInterval = setInterval(() => {
                    booletSpeed = 30;
                    spread = 0.2;
                }, 25);

                abilityTimeout += 40;
            }
        }
    }

    if (e.key === "e") {
        upgradeSystem()
    }

    if (e.key === "Enter") {
        if (waveIsStillOngoing === true) return;
        setTimeout(() => {
            if (wave === 9 ) {
                waveReminder.style.opacity = "0";
                waveReminder.style.transition = "opacity 4s linear";
                finalwaveGOGOGO = true;
                setTimeout(() => {
                    waveReminder.style.display = "none";
                    waveStart = true;
                    Wavesystem();
                }, 7000);
            } else {
                waveReminder.style.opacity = "0";
                setTimeout(() => {
                    waveReminder.style.display = "none";
                    waveStart = true;
                    Wavesystem();
                }, 500);
            }
        }, 100);
    }
})

setInterval(() => {
    gameLoop()
}, 1);

/*setInterval(() => {
    background()
}, 1200);*/

setTimeout(() => {
    if (gameOver === false) {
        health += 10;
    }
}, 30000);

abilityUpdate();

resizeCanvas();

animate();


