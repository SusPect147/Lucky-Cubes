(() => {
    const canvas = document.getElementById('particles');
    const ctx = canvas ? canvas.getContext('2d') : null;

    let w, h;
    let particles = [];
    let clickX = -1000;
    let clickY = -1000;
    let clickTime = 0;

    window.addEventListener('click', (e) => {
        clickX = e.clientX;
        clickY = e.clientY;
        clickTime = Date.now();
    });

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
            // Very small size
            this.size = Math.random() * 0.8 + 0.3;
            // Slower movement
            this.speedX = (Math.random() - 0.5) * 0.8;
            this.speedY = (Math.random() - 0.5) * 0.8;
            // Much more transparent
            this.opacity = Math.random() * 0.15 + 0.05;
        }

        update() {
            // Apply repulsion force if a recent click happened near the particle
            let repulsionX = 0;
            let repulsionY = 0;

            const timeSinceClick = Date.now() - clickTime;
            if (timeSinceClick < 300) {
                const dx = this.x - clickX;
                const dy = this.y - clickY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Repulsion radius = 150px
                if (distance < 150 && distance > 0) {
                    const force = (150 - distance) / 150; // 0 to 1
                    // Add velocity outwards from the click center
                    repulsionX = (dx / distance) * force * 5;
                    repulsionY = (dy / distance) * force * 5;
                }
            }

            // Chaotic Brownian-like motion + Repulsion
            this.speedX += (Math.random() - 0.5) * 0.2 + repulsionX;
            this.speedY += (Math.random() - 0.5) * 0.2 + repulsionY;

            // Apply friction to slowly return to normal speeds after a burst
            this.speedX *= 0.95;
            this.speedY *= 0.95;

            // Base max speed, but allow temporary spikes from clicks
            const baseSpeed = 1.0;
            if (timeSinceClick > 500) {
                if (this.speedX > baseSpeed) this.speedX = baseSpeed;
                if (this.speedX < -baseSpeed) this.speedX = -baseSpeed;
                if (this.speedY > baseSpeed) this.speedY = baseSpeed;
                if (this.speedY < -baseSpeed) this.speedY = -baseSpeed;
            }


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
})();
