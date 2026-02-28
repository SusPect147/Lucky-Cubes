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
    }, true);

    function initSize() {

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

            this.x = Math.random() * (window.innerWidth || 300);
            this.y = Math.random() * (window.innerHeight || 300);
        }

        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;

            this.size = Math.random() * 0.7 + 0.3;

            this.baseSpeedX = (Math.random() - 0.5) * 0.5;
            this.baseSpeedY = (Math.random() - 0.5) * 0.5;
            this.speedX = this.baseSpeedX;
            this.speedY = this.baseSpeedY;

            this.opacity = Math.random() * 0.15 + 0.05;
        }

        update() {

            let repulsionX = 0;
            let repulsionY = 0;

            const timeSinceClick = Date.now() - clickTime;
            if (timeSinceClick < 300) {
                const dx = this.x - clickX;
                const dy = this.y - clickY;
                const distance = Math.sqrt(dx * dx + dy * dy);


                if (distance < 150 && distance > 0) {
                    const force = (150 - distance) / 150;

                    repulsionX = (dx / distance) * force * 4;
                    repulsionY = (dy / distance) * force * 4;
                }
            }


            this.speedX += (Math.random() - 0.5) * 0.05 + repulsionX;
            this.speedY += (Math.random() - 0.5) * 0.05 + repulsionY;


            this.speedX = this.speedX * 0.95 + this.baseSpeedX * 0.05;
            this.speedY = this.speedY * 0.95 + this.baseSpeedY * 0.05;


            const maxSpeed = 3.0;
            if (this.speedX > maxSpeed) this.speedX = maxSpeed;
            if (this.speedX < -maxSpeed) this.speedX = -maxSpeed;
            if (this.speedY > maxSpeed) this.speedY = maxSpeed;
            if (this.speedY < -maxSpeed) this.speedY = -maxSpeed;


            this.x += this.speedX;
            this.y += this.speedY;


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


    startParticleSystem();
})();
