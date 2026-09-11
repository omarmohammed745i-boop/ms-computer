// =====================================
// SIGNUP PAGE JAVASCRIPT (with Email Verification)
// =====================================

console.log('📝 Signup Page Loaded');

// =====================================
// GET API URL
// =====================================
function getApiUrl() {
    return window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api' 
        : 'https://ms-computer-production.up.railway.app/api';
}

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
            signupSuccess: 'Verification code sent! Check your email.',
            signupError: 'Signup failed. Please try again.',
            emailExists: 'This email is already registered',
            serverError: 'Server error. Please try again later.',
            verifyEmail: 'Verify Your Email',
            verifyEmailText: 'We sent a 6-digit verification code to your email. Please enter it below to activate your account.',
            verificationCode: 'Verification Code',
            verifyAccount: 'Verify Account',
            didntReceiveCode: 'Didn\'t receive the code?',
            resendCode: 'Resend Code',
            backToSignup: 'Back to Sign Up',
            invalidCode: 'Invalid or expired code',
            verifySuccess: 'Account verified! Redirecting to login...',
            codeSent: 'Code sent successfully!',
            pleaseEnterCode: 'Please enter the 6-digit code'
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
            signupSuccess: 'تم إرسال كود التحقق! تحقق من بريدك الإلكتروني.',
            signupError: 'فشل إنشاء الحساب. حاول مرة أخرى.',
            emailExists: 'هذا البريد الإلكتروني مسجل بالفعل',
            serverError: 'خطأ في السيرفر. حاول مرة أخرى لاحقاً.',
            verifyEmail: 'تحقق من بريدك الإلكتروني',
            verifyEmailText: 'أرسلنا كود مكون من 6 أرقام إلى بريدك الإلكتروني. يرجى إدخاله لتفعيل حسابك.',
            verificationCode: 'كود التحقق',
            verifyAccount: 'تفعيل الحساب',
            didntReceiveCode: 'لم تستلم الكود؟',
            resendCode: 'إعادة إرسال الكود',
            backToSignup: 'العودة للتسجيل',
            invalidCode: 'كود غير صحيح أو منتهي الصلاحية',
            verifySuccess: 'تم تفعيل الحساب! جاري التحويل لتسجيل الدخول...',
            codeSent: 'تم إرسال الكود بنجاح!',
            pleaseEnterCode: 'يرجى إدخال الكود المكون من 6 أرقام'
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
        }, 4000);
    } else {
        alert(message);
    }
}

// =====================================
// VARIABLES
// =====================================
let currentEmail = '';

// =====================================
// HANDLE SIGNUP (Step 1)
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

    errorDiv.style.display = 'none';

    // ✅ التحقق من الحقول
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
        const API_URL = getApiUrl();
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, password })
        });

        const data = await response.json();
        console.log('📡 Signup response:', data);

        if (response.ok && data.success) {
            // ✅ نخزن الإيميل ونعرض خطوة التحقق
            currentEmail = email;
            document.getElementById('verify-email-display').textContent = email;
            
            document.getElementById('signup-form').style.display = 'none';
            document.getElementById('verify-form').style.display = 'block';

            showToast('✅ ' + t('signupSuccess'));

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
// HANDLE VERIFY (Step 2)
// =====================================
async function handleVerify(event) {
    event.preventDefault();

    const code = document.getElementById('verify-code').value.trim();
    const errorDiv = document.getElementById('signup-error');
    const errorMessage = document.getElementById('error-message');

    errorDiv.style.display = 'none';

    if (!code || code.length !== 6) {
        errorMessage.textContent = t('pleaseEnterCode');
        errorDiv.style.display = 'flex';
        return;
    }

    try {
        const API_URL = getApiUrl();
        const response = await fetch(`${API_URL}/auth/verify-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: currentEmail, code })
        });

        const data = await response.json();
        console.log('📡 Verify response:', data);

        if (response.ok && data.success) {
            const verifyBtn = document.querySelector('#verify-form .login-btn');
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ' + t('verifySuccess');

            showToast('✅ ' + t('verifySuccess'));

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } else {
            errorMessage.textContent = data.message || t('invalidCode');
            errorDiv.style.display = 'flex';
        }

    } catch (err) {
        console.error('❌ Verify error:', err);
        errorMessage.textContent = t('serverError');
        errorDiv.style.display = 'flex';
    }
}

// =====================================
// RESEND CODE
// =====================================
async function resendCode(event) {
    event.preventDefault();

    try {
        const API_URL = getApiUrl();
        const response = await fetch(`${API_URL}/auth/resend-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: currentEmail })
        });

        const data = await response.json();
        console.log('📡 Resend response:', data);

        if (response.ok && data.success) {
            showToast('✅ ' + t('codeSent'));
        } else {
            showToast('❌ ' + (data.message || 'Failed to resend'));
        }

    } catch (err) {
        console.error('❌ Resend error:', err);
        showToast('❌ Error resending code');
    }
}

// =====================================
// BACK TO SIGNUP
// =====================================
function backToSignup(event) {
    event.preventDefault();
    document.getElementById('verify-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('signup-error').style.display = 'none';
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
window.handleVerify = handleVerify;
window.resendCode = resendCode;
window.backToSignup = backToSignup;
window.togglePassword = togglePassword;
window.showToast = showToast;