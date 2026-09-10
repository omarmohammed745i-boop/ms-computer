// =====================================
// CONTACT PAGE JAVASCRIPT
// =====================================

console.log('📞 Contact Page Loaded');

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

    document.querySelectorAll('.contact-info, .contact-form').forEach(el => {
        el.classList.add('hidden');
        observer.observe(el);
    });
});

// =====================================
// CONTACT FORM HANDLER
// =====================================
function handleContactForm(event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value.trim();

    // Validation
    if (!name || !email || !subject || !message) {
        showToast('⚠️ Please fill in all fields');
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        showToast('⚠️ Please enter a valid email address');
        return;
    }

    // Prepare email data
    const emailData = {
        name: name,
        email: email,
        subject: subject,
        message: message
    };

    console.log('📨 Form Data:', emailData);

    // Disable button
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

    // Simulate sending (replace with actual API call)
    setTimeout(() => {

        // Show success message
        showToast('✅ Your message has been sent successfully!');

        // Reset form
        document.getElementById('contact-form').reset();

        // Enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';

        // Here you would send to your backend:
        // fetch('http://localhost:5000/api/contact', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(emailData)
        // })
        // .then(response => response.json())
        // .then(data => {
        //     showToast('✅ Message sent!');
        //     form.reset();
        // })
        // .catch(err => {
        //     showToast('❌ Error sending message. Try again.');
        // });

    }, 1500);
}

// =====================================
// SHOW TOAST
// =====================================
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}