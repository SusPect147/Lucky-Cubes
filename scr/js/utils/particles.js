(() => {
    const canvas = document.getElementById('particles');
    const ctx = canvas ? canvas.getContext('2d') : null;

    let w, h;
    let particles = [];
    let clickX = -1000;
    let clickY = -1000;
    let clickTime = 0;

    // Use capturing phase so it triggers even if other elements call stopPropagation
    window.addEventListener('click', (e) => {
        clickX = e.clientX;
        clickY = e.clientY;
        clickTime = Date.now();
    }, true);

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
            this.size = Math.random() * 0.7 + 0.3;
            // Give them a constant drifting direction
            this.baseSpeedX = (Math.random() - 0.5) * 0.5;
            this.baseSpeedY = (Math.random() - 0.5) * 0.5;
            this.speedX = this.baseSpeedX;
            this.speedY = this.baseSpeedY;
            // Transparent
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
                    repulsionX = (dx / distance) * force * 4;
                    repulsionY = (dy / distance) * force * 4;
                }
            }

            // Drift with slight brownian motion + Repulsion
            this.speedX += (Math.random() - 0.5) * 0.05 + repulsionX;
            this.speedY += (Math.random() - 0.5) * 0.05 + repulsionY;

            // Apply friction towards their base drift speed
            this.speedX = this.speedX * 0.95 + this.baseSpeedX * 0.05;
            this.speedY = this.speedY * 0.95 + this.baseSpeedY * 0.05;

            // Optional cap if repulsion throws them too fast
            const maxSpeed = 3.0;
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
