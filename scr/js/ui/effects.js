const dust = document.querySelector('.cosmic-dust-layer');
function dustCycle() {
    dust.classList.add('active');
    const dur = 28000 + Math.random() * 15000;
    setTimeout(() => {
        dust.classList.remove('active');
        setTimeout(dustCycle, 5000 + Math.random() * 8000);
    }, dur);
}
dustCycle();

