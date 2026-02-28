const canvas = document.getElementById('particles');
const ctx = canvas ? canvas.getContext('2d') : null;

let w, h;
let particles = [];

function initSize() {
    // Only resize if the canvas exists and dimensions have changed (to prevent unnecessary clears)
    const newW = window.innerWidth;
    const newH = window.innerHeight;
    if (w !== newW || h !== newH) {
        w = newW || 300;
        h = newH || 300;
        if (canvas) {
            canvas.width = w;
            canvas.height = h;
        }
    }
}

class Particle {
    constructor() {
        this.reset();
        // Randomize initial position fully across screen
        this.x = Math.random() * (window.innerWidth || 300);
        this.y = Math.random() * (window.innerHeight || 300);
    }

    reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 2 + 1; // 1px to 3px radius
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.speedY = (Math.random() - 0.5) * 1.5;
        this.opacity = Math.random() * 0.4 + 0.15; // 0.15 to 0.55 opacity
    }

    update() {
        // Chaotic Brownian-like motion
        this.speedX += (Math.random() - 0.5) * 0.2;
        this.speedY += (Math.random() - 0.5) * 0.2;

        const maxSpeed = 1.2;
        if (this.speedX > maxSpeed) this.speedX = maxSpeed;
        if (this.speedX < -maxSpeed) this.speedX = -maxSpeed;
        if (this.speedY > maxSpeed) this.speedY = maxSpeed;
        if (this.speedY < -maxSpeed) this.speedY = -maxSpeed;

        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen edges smoothly
        if (this.x < -10) this.x = w + 10;
        if (this.x > w + 10) this.x = -10;
        if (this.y < -10) this.y = h + 10;
        if (this.y > h + 10) this.y = -10;
    }

    draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#ffffff';
        // Optional slight glow for better visibility on dark backgrounds
        ctx.shadowBlur = 3;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function startParticleSystem() {
    if (!canvas || !ctx) return;

    initSize();
    window.addEventListener('resize', initSize);

    const count = (typeof CONFIG !== 'undefined' && CONFIG.particleCount) ? CONFIG.particleCount : 120;
    particles = [];
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }

    function animate() {
        // Ensure accurate w/h every frame to avoid stretching on rotate
        initSize();
        ctx.clearRect(0, 0, w, h);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

// Start immediately. The display:none state won't break requestAnimationFrame, 
// and when the element is shown, it will start rendering properly.
startParticleSystem();
