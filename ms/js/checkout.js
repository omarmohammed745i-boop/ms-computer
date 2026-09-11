// =====================================
// CHECKOUT PAGE JAVASCRIPT
// =====================================

// =====================================
// GET API URL
// =====================================
function getApiUrl() {
    return window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api' 
        : 'https://ms-computer-production.up.railway.app/api';
}

// =====================================
// CHECK LOGIN
// =====================================
const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

if (!loggedInUser) {
    alert('You must be logged in to checkout');
    window.location.href = 'login.html';
}
console.log('💳 Checkout Page Loaded');

// =====================================
// GET USER ID
// =====================================
function getUserId() {
    return localStorage.getItem('userId') || 'guest';
}

// =====================================
// CART (بـ userId)
// =====================================
function getCart() {
    const userId = getUserId();
    return JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];
}

// =====================================
// ORDERS (Fallback - localStorage)
// =====================================
function getOrders() {
    const userId = getUserId();
    return JSON.parse(localStorage.getItem(`orders_${userId}`)) || [];
}

function saveOrders(orders) {
    const userId = getUserId();
    localStorage.setItem(`orders_${userId}`, JSON.stringify(orders));
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
            outOfStock: 'Out of Stock',
            addToCart: 'Add to Cart',
            egp: 'EGP',
            sale: 'SALE',
            free: 'Free 🎉'
        },
        ar: {
            outOfStock: 'غير متوفر',
            addToCart: 'أضف للسلة',
            egp: 'ج.م',
            sale: 'تخفيض',
            free: 'مجاناً 🎉'
        }
    };
    return fallback[lang]?.[key] || key;
}

// =====================================
// LOAD ORDER ITEMS
// =====================================
function loadOrderItems() {
    const cart = getCart();
    const container = document.getElementById('order-items');
    if (!container) return;

    const egpText = t('egp');

    console.log('🛒 Checkout cart items:', cart.length);

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:20px; color:var(--text2);">
                <p>Your cart is empty.</p>
                <a href="products.html" style="color:var(--primary);">Continue Shopping</a>
            </div>
        `;
        const placeOrderBtn = document.querySelector('.place-order-btn');
        if (placeOrderBtn) placeOrderBtn.disabled = true;
        return;
    }

    container.innerHTML = cart.map(item => {
        const quantity = item.quantity || 1;
        const total = item.price * quantity;
        return `
            <div class="order-item">
                <img src="${item.image || '/photos/default-product.png'}" alt="${item.name}" onerror="this.src='/photos/default-product.png'">
                <div class="order-item-info">
                    <h4>${item.name}</h4>
                    <div class="item-meta">
                        ${quantity} × <span>${item.price.toLocaleString()} ${egpText}</span>
                    </div>
                </div>
                <div style="font-weight:700;color:var(--primary);">
                    ${total.toLocaleString()} ${egpText}
                </div>
            </div>
        `;
    }).join('');

    const placeOrderBtn = document.querySelector('.place-order-btn');
    if (placeOrderBtn) placeOrderBtn.disabled = false;

    updateCheckoutSummary();
}

// =====================================
// UPDATE CHECKOUT SUMMARY
// =====================================
function updateCheckoutSummary() {
    const cart = getCart();
    const subtotalEl = document.getElementById('checkout-subtotal');
    const shippingEl = document.getElementById('checkout-shipping');
    const discountEl = document.getElementById('checkout-discount');
    const discountRow = document.getElementById('checkout-discount-row');
    const totalEl = document.getElementById('checkout-total');

    if (!subtotalEl) return;

    const egpText = t('egp');
    const freeText = t('free');

    let subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    let shipping = subtotal >= 2000 ? 0 : 50;
    let discount = 0;

    const promoApplied = localStorage.getItem('promo_code');
    if (promoApplied === 'SAVE10') {
        discount = subtotal * 0.10;
    }

    let total = subtotal + shipping - discount;

    subtotalEl.textContent = subtotal.toLocaleString() + ' ' + egpText;
    shippingEl.textContent = shipping === 0 ? freeText : shipping + ' ' + egpText;

    if (discount > 0) {
        discountRow.style.display = 'flex';
        discountEl.textContent = '-' + discount.toLocaleString() + ' ' + egpText;
    } else {
        discountRow.style.display = 'none';
    }

    totalEl.textContent = total.toLocaleString() + ' ' + egpText;
}

// =====================================
// HANDLE CHECKOUT
// =====================================
async function handleCheckout(event) {
    event.preventDefault();

    const cart = getCart();

    if (cart.length === 0) {
        showToast('❌ Your cart is empty');
        return;
    }

    const fullName = document.getElementById('full-name')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const address = document.getElementById('address')?.value.trim();
    const city = document.getElementById('city')?.value.trim();
    const governorate = document.getElementById('governorate')?.value;
    const notes = document.getElementById('notes')?.value.trim() || '';
    const payment = document.querySelector('input[name="payment"]:checked')?.value || 'cash';

    const screenshotFile = document.getElementById('transfer-screenshot')?.files[0];
    let screenshotBase64 = null;

    if (screenshotFile) {
        screenshotBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            reader.readAsDataURL(screenshotFile);
        });
    }

    if (!fullName || !phone || !email || !address || !city || !governorate) {
        showToast('⚠️ Please fill in all required fields');
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        showToast('⚠️ Please enter a valid email address');
        return;
    }

    if (phone.length < 10) {
        showToast('⚠️ Please enter a valid phone number');
        return;
    }

    if (payment === 'vodafone' || payment === 'instapay') {
        if (!screenshotFile) {
            showToast('⚠️ Please upload the transfer screenshot');
            return;
        }
    }

    let subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    let shipping = subtotal >= 2000 ? 0 : 50;
    let discount = 0;
    const promoApplied = localStorage.getItem('promo_code');
    if (promoApplied === 'SAVE10') {
        discount = subtotal * 0.10;
    }
    let total = subtotal + shipping - discount;

    // ✅ بيانات الأوردر
    const orderData = {
        id: 'ORD-' + Date.now(),
        user: loggedInUser.id || loggedInUser._id,
        customer: {
            name: fullName,
            phone: phone,
            email: email,
            address: address,
            city: city,
            governorate: governorate,
            notes: notes
        },
        items: cart.map(item => ({
            id: item.id || item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            image: item.image
        })),
        payment: payment,
        screenshot: screenshotBase64,
        subtotal: subtotal,
        shipping: shipping,
        discount: discount,
        total: total,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    console.log('📦 Order Data:', orderData);

    const submitBtn = document.querySelector('.place-order-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    }

    try {
        // ✅ نرفع الأوردر على MongoDB
        const API_URL = getApiUrl();
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();
        console.log('📡 Order response:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to place order');
        }

        // ✅ كمان نحفظ في localStorage (للـ Fallback)
        const orders = getOrders();
        orders.push(orderData);
        saveOrders(orders);

        // ✅ نمسح السلة
        localStorage.removeItem(`cart_${getUserId()}`);
        localStorage.removeItem('promo_code');

        const countEl = document.getElementById('cart-count');
        if (countEl) countEl.textContent = '0';

        showToast('✅ Order placed successfully!');

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Place Order';
        }

        setTimeout(() => {
            window.location.href = 'thank-you.html';
        }, 1500);

    } catch (err) {
        console.error('❌ Error placing order:', err);
        showToast('❌ ' + (err.message || 'Failed to place order'));

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Place Order';
        }
    }
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
    }, 2500);
}

// =====================================
function updateCartCount() {
    const cart = getCart();
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        countEl.textContent = total;
    }
}

function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem(`wishlist_${getUserId()}`)) || [];
    const wishlistEl = document.getElementById('wishlist-count');
    if (wishlistEl) {
        wishlistEl.textContent = wishlist.length;
    }
}

// =====================================
// INITIALIZE
// =====================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('💳 Checkout page initialized');
    loadOrderItems();
    updateCartCount();
    updateWishlistCount();
});

// =====================================
// EXPOSE GLOBALS
// =====================================
window.handleCheckout = handleCheckout;
window.showToast = showToast;