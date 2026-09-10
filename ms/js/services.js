// =====================================
// SERVICES PAGE JAVASCRIPT
// =====================================

console.log('🛠️ Services Page Loaded');

// =====================================
// SCROLL ANIMATIONS FOR SERVICES
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

    document.querySelectorAll('.service-card, .why-item').forEach(el => {
        el.classList.add('hidden');
        observer.observe(el);
    });
});