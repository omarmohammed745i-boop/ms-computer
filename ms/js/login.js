// =====================================
// LOGIN PAGE JAVASCRIPT
// =====================================

console.log('🔐 Login Page Loaded');

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
            welcomeBack: 'Welcome Back!',
            loginSubtitle: 'Sign in to your account to continue',
            emailAddress: 'Email Address',
            emailPlaceholder: 'Enter your email',
            password: 'Password',
            passwordPlaceholder: 'Enter your password',
            rememberMe: 'Remember Me',
            forgotPassword: 'Forgot Password?',
            login: 'Login',
            noAccount: 'Don\'t have an account?',
            signup: 'Sign Up',
            invalidCredentials: 'Invalid email or password',
            loginSuccess: 'Login successful! Redirecting...',
            loginError: 'Login failed. Please try again.',
            fillAllFields: 'Please fill in all fields',
            validEmail: 'Please enter a valid email address'
        },
        ar: {
            welcomeBack: 'مرحباً بعودتك!',
            loginSubtitle: 'تسجيل الدخول إلى حسابك للمتابعة',
            emailAddress: 'البريد الإلكتروني',
            emailPlaceholder: 'أدخل بريدك الإلكتروني',
            password: 'كلمة المرور',
            passwordPlaceholder: 'أدخل كلمة المرور',
            rememberMe: 'تذكرني',
            forgotPassword: 'نسيت كلمة المرور؟',
            login: 'تسجيل الدخول',
            noAccount: 'ليس لديك حساب؟',
            signup: 'إنشاء حساب',
            invalidCredentials: 'بريد إلكتروني أو كلمة مرور غير صحيحة',
            loginSuccess: 'تم تسجيل الدخول بنجاح! جاري التحويل...',
            loginError: 'فشل تسجيل الدخول. حاول مرة أخرى.',
            fillAllFields: 'يرجى ملء جميع الحقول',
            validEmail: 'يرجى إدخال بريد إلكتروني صحيح'
        }
    };
    return fallback[lang]?.[key] || key;
}

// =====================================
// TOGGLE PASSWORD VISIBILITY
// =====================================
function togglePassword() {
    const passwordInput = document.getElementById('login-password');
    const icon = document.getElementById('password-icon');

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
// HANDLE LOGIN (API ONLY)
// =====================================
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const rememberMe = document.getElementById('remember-me').checked;
    const errorDiv = document.getElementById('login-error');
    const errorMessage = document.getElementById('error-message');

    // إخفاء أي رسائل سابقة
    errorDiv.style.display = 'none';
    
    const toast = document.getElementById('toast');
    if (toast) toast.style.display = 'none';

    if (!email || !password) {
        errorMessage.textContent = t('fillAllFields');
        errorDiv.style.display = 'flex';
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        errorMessage.textContent = t('validEmail');
        errorDiv.style.display = 'flex';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('📡 Login response:', data);

        if (response.ok && data.success) {
            const user = data.user;

            // حفظ بيانات المستخدم في localStorage
            const loginData = {
                id: user.id || user._id,
                name: user.name,
                email: user.email,
                image: user.image || '/photos/default-avatar.png',
                role: user.role || 'user'
            };

            localStorage.setItem('loggedInUser', JSON.stringify(loginData));
            localStorage.setItem('userId', user.id || user._id);

            if (data.token) {
                localStorage.setItem('token', data.token);
            }

            // نقل بيانات الزائر
            const guestCart = JSON.parse(localStorage.getItem('cart_guest')) || [];
            const guestWishlist = JSON.parse(localStorage.getItem('wishlist_guest')) || [];
            const guestOrders = JSON.parse(localStorage.getItem('orders_guest')) || [];

            const userId = user.id || user._id;

            if (guestCart.length > 0) {
                localStorage.setItem(`cart_${userId}`, JSON.stringify(guestCart));
                localStorage.removeItem('cart_guest');
            }
            if (guestWishlist.length > 0) {
                localStorage.setItem(`wishlist_${userId}`, JSON.stringify(guestWishlist));
                localStorage.removeItem('wishlist_guest');
            }
            if (guestOrders.length > 0) {
                localStorage.setItem(`orders_${userId}`, JSON.stringify(guestOrders));
                localStorage.removeItem('orders_guest');
            }

            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('rememberedEmail');
            }

            const loginBtn = document.querySelector('.login-btn');
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ' + t('loginSuccess');

            showToast('✅ ' + t('loginSuccess'));

            setTimeout(() => {
                const redirectUrl = user.role === 'admin' ? 'admin.html' : 'ms.html';
                window.location.href = redirectUrl;
            }, 1500);

        } else {
            errorMessage.textContent = data.message || t('invalidCredentials');
            errorDiv.style.display = 'flex';
        }

    } catch (err) {
        console.error('❌ Login error:', err);
        errorMessage.textContent = t('loginError');
        errorDiv.style.display = 'flex';
    }
}

// =====================================
// CHECK REMEMBER ME
// =====================================
function checkRememberMe() {
    const rememberMe = localStorage.getItem('rememberMe');
    const rememberedEmail = localStorage.getItem('rememberedEmail');

    if (rememberMe === 'true' && rememberedEmail) {
        document.getElementById('login-email').value = rememberedEmail;
        document.getElementById('remember-me').checked = true;
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
// TRANSLATE PAGE
// =====================================
function translateLoginPage() {
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
    console.log('🔐 Login page initialized');
    translateLoginPage();
    checkRememberMe();

    document.getElementById('login-password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('login-form').dispatchEvent(new Event('submit'));
        }
    });
});

// =====================================
// EXPOSE GLOBALS
// =====================================
window.handleLogin = handleLogin;
window.togglePassword = togglePassword;
window.showToast = showToast;