// =====================================
// SIGNUP PAGE JAVASCRIPT
// =====================================

console.log('📝 Signup Page Loaded');

// =====================================
// API BASE URL
// =====================================
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://ms-computer-production.up.railway.app/api';

// =====================================
// GET CURRENT LANGUAGE
// =====================================
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'en';
}

function t(key) {
    const lang = getCurrentLanguage();
    if (typeof dictionary !== 'undefined' && dictionary[lang] && dictionary[lang][key]) {
        return dictionary[lang][key];
    }
    const fallback = {
        en: {
            createAccount: 'Create Account',
            registerSubtitle: 'Join us and start shopping!',
            fullName: 'Full Name',
            fullNamePlaceholder: 'Enter your full name',
            emailAddress: 'Email Address',
            emailPlaceholder: 'Enter your email',
            phoneNumber: 'Phone Number',
            phonePlaceholder: 'Enter your phone number',
            password: 'Password',
            passwordPlaceholder: 'Enter your password',
            confirmPassword: 'Confirm Password',
            confirmPasswordPlaceholder: 'Confirm your password',
            signup: 'Sign Up',
            haveAccount: 'Already have an account?',
            login: 'Login',
            fillAllFields: 'Please fill in all fields',
            validEmail: 'Please enter a valid email address',
            passwordMismatch: 'Passwords do not match',
            passwordLength: 'Password must be at least 6 characters',
            signupSuccess: 'Account created successfully! Redirecting to login...',
            signupError: 'Signup failed. Please try again.',
            emailExists: 'This email is already registered',
            serverError: 'Server error. Please try again later.'
        },
        ar: {
            createAccount: 'إنشاء حساب',
            registerSubtitle: 'انضم إلينا وابدأ التسوق!',
            fullName: 'الاسم الكامل',
            fullNamePlaceholder: 'أدخل اسمك الكامل',
            emailAddress: 'البريد الإلكتروني',
            emailPlaceholder: 'أدخل بريدك الإلكتروني',
            phoneNumber: 'رقم الهاتف',
            phonePlaceholder: 'أدخل رقم هاتفك',
            password: 'كلمة المرور',
            passwordPlaceholder: 'أدخل كلمة المرور',
            confirmPassword: 'تأكيد كلمة المرور',
            confirmPasswordPlaceholder: 'أكد كلمة المرور',
            signup: 'إنشاء حساب',
            haveAccount: 'لديك حساب بالفعل؟',
            login: 'تسجيل الدخول',
            fillAllFields: 'يرجى ملء جميع الحقول',
            validEmail: 'يرجى إدخال بريد إلكتروني صحيح',
            passwordMismatch: 'كلمة المرور غير متطابقة',
            passwordLength: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
            signupSuccess: 'تم إنشاء الحساب بنجاح! جاري التحويل إلى تسجيل الدخول...',
            signupError: 'فشل إنشاء الحساب. حاول مرة أخرى.',
            emailExists: 'هذا البريد الإلكتروني مسجل بالفعل',
            serverError: 'خطأ في السيرفر. حاول مرة أخرى لاحقاً.'
        }
    };
    return fallback[lang]?.[key] || key;
}

// =====================================
// TOGGLE PASSWORD
// =====================================
function togglePassword(inputId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// =====================================
// SHOW TOAST
// =====================================
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    if (toast && toastText) {
        toastText.textContent = message;
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    } else {
        alert(message);
    }
}

// =====================================
// HANDLE SIGNUP (API ONLY)
// =====================================
async function handleSignup(event) {
    event.preventDefault();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const errorDiv = document.getElementById('signup-error');
    const errorMessage = document.getElementById('error-message');

    // إخفاء أي رسائل سابقة
    errorDiv.style.display = 'none';
    
    const toast = document.getElementById('toast');
    if (toast) toast.style.display = 'none';

    // التحقق من الحقول
    if (!name || !email || !password || !confirmPassword) {
        errorMessage.textContent = t('fillAllFields');
        errorDiv.style.display = 'flex';
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        errorMessage.textContent = t('validEmail');
        errorDiv.style.display = 'flex';
        return;
    }

    if (password.length < 6) {
        errorMessage.textContent = t('passwordLength');
        errorDiv.style.display = 'flex';
        return;
    }

    if (password !== confirmPassword) {
        errorMessage.textContent = t('passwordMismatch');
        errorDiv.style.display = 'flex';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, password })
        });

        const data = await response.json();
        console.log('📡 Signup response:', data);

        if (response.ok && data.success) {
            const signupBtn = document.querySelector('.login-btn');
            signupBtn.disabled = true;
            signupBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ' + t('signupSuccess');

            showToast('✅ ' + t('signupSuccess'));

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } else {
            errorMessage.textContent = data.message || t('signupError');
            errorDiv.style.display = 'flex';
        }

    } catch (err) {
        console.error('❌ Signup error:', err);
        errorMessage.textContent = t('serverError');
        errorDiv.style.display = 'flex';
    }
}

// =====================================
// TRANSLATE PAGE
// =====================================
function translateSignupPage() {
    const elements = document.querySelectorAll('[data-lang]');
    elements.forEach(el => {
        const key = el.dataset.lang;
        const translation = t(key);
        if (translation !== key) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.placeholder !== undefined) {
                    el.placeholder = translation;
                }
            } else {
                el.textContent = translation;
            }
        }
    });
}

// =====================================
// INITIALIZE
// =====================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📝 Signup page initialized');
    translateSignupPage();

    document.getElementById('signup-confirm-password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('signup-form').dispatchEvent(new Event('submit'));
        }
    });
});

// =====================================
// EXPOSE GLOBALS
// =====================================
window.handleSignup = handleSignup;
window.togglePassword = togglePassword;
window.showToast = showToast;