document.addEventListener('keydown', e => {
    if (e.ctrlKey && (e.key === '=' || e.key === '-' || e.key === '0')) e.preventDefault();
    if (e.ctrlKey && e.shiftKey && e.key === 'I') e.preventDefault();
});
document.addEventListener('wheel', e => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
['gesturestart', 'gesturechange', 'gestureend'].forEach(evt =>
    document.addEventListener(evt, e => e.preventDefault(), { passive: false })
);

function format(n) {
    if (n >= 1e12) return (n / 1e12).toFixed(2) + 't';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'b';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'm';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + 'k';
    return n.toFixed(2).replace(/\.?0+$/, '');
}

const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let w = canvas.width = innerWidth;
let h = canvas.height = innerHeight;
window.addEventListener('resize', () => {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
});

const particles = [];
class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = 0.3 + Math.random() * 0.9;
        this.speedX = (0.05 + Math.random() * 0.25) * (Math.random() > 0.5 ? 1 : -1);
        this.speedY = (0.05 + Math.random() * 0.25) * (Math.random() > 0.5 ? 1 : -1);
        this.opacity = 0.05 + Math.random() * 0.2;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.02;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.angle += this.spin;
        if (this.x < -50) this.x = w + 50;
        if (this.x > w + 50) this.x = -50;
        if (this.y < -50) this.y = h + 50;
        if (this.y > h + 50) this.y = -50;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        const pts = 5, out = this.size, inn = this.size * 0.4, step = Math.PI / pts;
        ctx.moveTo(out, 0);
        for (let i = 1; i < pts * 2; i++) {
            const r = i % 2 === 0 ? out : inn;
            ctx.lineTo(r * Math.cos(i * step), r * Math.sin(i * step));
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}
for (let i = 0; i < CONFIG.particleCount; i++) particles.push(new Particle());

function startParticleLoop() {
    (function loop() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(loop);
    })();
}
startParticleLoop();
