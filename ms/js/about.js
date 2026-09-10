// =====================================
// ABOUT PAGE JAVASCRIPT
// =====================================

console.log('📖 About Page Loaded');

// =====================================
// SCROLL ANIMATIONS
// =====================================
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                entry.target.classList.remove('hidden');
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.about-text, .about-image, .mission-card, .vision-card, .value-item, .team-member')
        .forEach(el => {
            el.classList.add('hidden');
            observer.observe(el);
        });

    // =====================================
    // COUNTER ANIMATION
    // =====================================
    const statNumbers = document.querySelectorAll('.stat-number');
    let animated = false;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.dataset.target);
                    let count = 0;
                    const increment = Math.ceil(target / 40);
                    const interval = setInterval(() => {
                        count += increment;
                        if (count >= target) {
                            stat.textContent = target;
                            clearInterval(interval);
                        } else {
                            stat.textContent = count;
                        }
                    }, 30);
                });
            }
        });
    }, { threshold: 0.5 });

    const statsContainer = document.querySelector('.about-stats');
    if (statsContainer) {
        counterObserver.observe(statsContainer);
    }
});