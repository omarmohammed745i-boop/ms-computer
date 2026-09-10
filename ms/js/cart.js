// =====================================
// CART PAGE JAVASCRIPT
// =====================================

console.log('🛒 Cart Page Loaded');

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

function saveCart(cart) {
    const userId = getUserId();
    localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
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
// RENDER CART
// =====================================
function renderCart() {
    const cart = getCart();
    const cartItems = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const cartContent = document.querySelector('.cart-content');
    const cartSummary = document.getElementById('cart-summary');

    console.log('🛒 Rendering cart, items:', cart.length);

    if (!cartItems) {
        console.error('❌ cart-items element not found');
        return;
    }

    if (cart.length === 0) {
        cartItems.innerHTML = '';
        if (emptyCart) emptyCart.style.display = 'block';
        if (cartContent) cartContent.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'none';
        updateSummary();
        return;
    }

    if (emptyCart) emptyCart.style.display = 'none';
    if (cartContent) cartContent.style.display = 'grid';
    if (cartSummary) cartSummary.style.display = 'block';

    const egpText = t('egp');

    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item" data-index="${index}">
            <img src="${item.image || 'photos/default-product.png'}" alt="${item.name}" onerror="this.src='photos/default-product.png'">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <div class="item-price">
                    ${item.price.toLocaleString()} ${egpText}
                    ${item.oldPrice ? `<span class="old">${item.oldPrice.toLocaleString()} ${egpText}</span>` : ''}
                </div>
                <div class="quantity-control">
                    <button onclick="updateQuantity(${index}, -1)">−</button>
                    <span>${item.quantity || 1}</span>
                    <button onclick="updateQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeItem(${index})">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    `).join('');

    updateSummary();
}

// =====================================
// UPDATE QUANTITY
// =====================================
function updateQuantity(index, change) {
    let cart = getCart();
    if (!cart[index]) return;

    const newQuantity = (cart[index].quantity || 1) + change;
    if (newQuantity <= 0) {
        cart.splice(index, 1);
    } else {
        cart[index].quantity = newQuantity;
    }

    saveCart(cart);
    renderCart();
    updateCartCount();
}

// =====================================
// REMOVE ITEM
// =====================================
function removeItem(index) {
    if (!confirm('Remove this item from cart?')) return;

    let cart = getCart();
    const itemName = cart[index]?.name || 'Item';
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
    updateCartCount();
    showToast(`🗑️ ${itemName} removed from cart`);
}

// =====================================
// UPDATE SUMMARY
// =====================================
function updateSummary() {
    const cart = getCart();
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const discountEl = document.getElementById('discount');
    const discountRow = document.getElementById('discount-row');
    const totalEl = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkout-btn');

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

    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
        checkoutBtn.style.opacity = cart.length === 0 ? '0.5' : '1';
        checkoutBtn.style.cursor = cart.length === 0 ? 'not-allowed' : 'pointer';
    }
}

// =====================================
// PROMO CODE
// =====================================
document.addEventListener('DOMContentLoaded', function() {
    const applyBtn = document.getElementById('apply-promo');
    const promoInput = document.getElementById('promo-input');

    if (applyBtn && promoInput) {
        applyBtn.addEventListener('click', function() {
            const code = promoInput.value.trim().toUpperCase();
            if (code === 'SAVE10') {
                localStorage.setItem('promo_code', code);
                showToast('🎉 Promo code applied! 10% discount');
                updateSummary();
                promoInput.value = '';
            } else if (code === '') {
                localStorage.removeItem('promo_code');
                showToast('ℹ️ Promo code removed');
                updateSummary();
            } else {
                showToast('❌ Invalid promo code');
            }
        });
    }
});

// =====================================
function updateCartCount() {
    const cart = getCart();
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        countEl.textContent = total;
    }
}

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
    console.log('🛒 Cart page initialized');
    renderCart();
    updateCartCount();
    updateWishlistCount();
});