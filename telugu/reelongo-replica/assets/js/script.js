// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    mainNav.classList.toggle('open');
});

mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mainNav.classList.remove('open');
    });
});

// Animated stat counters
const counters = document.querySelectorAll('.num[data-count]');

function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimal || '0', 10);
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = decimals
            ? value.toFixed(decimals)
            : Math.round(value).toLocaleString('en-IN') + '+';
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
        }
    });
}, { threshold: 0.6 });

counters.forEach(c => statObserver.observe(c));

// Booking form (client-side only)
const form = document.getElementById('bookingForm');
const formMsg = document.getElementById('formMsg');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    formMsg.hidden = false;
    form.reset();
    setTimeout(() => { formMsg.hidden = true; }, 5000);
});
