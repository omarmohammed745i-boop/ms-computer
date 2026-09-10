// =====================================
// WISHLIST PAGE JAVASCRIPT
// =====================================

console.log('❤️ Wishlist Page Loaded');

// =====================================
// GET USER ID
// =====================================
function getUserId() {
    return localStorage.getItem('userId') || 'guest';
}

// =====================================
// WISHLIST (بـ userId)
// =====================================
function getWishlist() {
    const userId = getUserId();
    return JSON.parse(localStorage.getItem(`wishlist_${userId}`)) || [];
}

function saveWishlist(wishlist) {
    const userId = getUserId();
    localStorage.setItem(`wishlist_${userId}`, JSON.stringify(wishlist));
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
            sale: 'SALE'
        },
        ar: {
            outOfStock: 'غير متوفر',
            addToCart: 'أضف للسلة',
            egp: 'ج.م',
            sale: 'تخفيض'
        }
    };
    return fallback[lang]?.[key] || key;
}

// =====================================
// RENDER WISHLIST
// =====================================
function renderWishlist() {
    const wishlist = getWishlist();
    const container = document.getElementById('wishlist-items');
    const empty = document.getElementById('empty-wishlist');

    if (!container) return;

    if (wishlist.length === 0) {
        container.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }

    if (empty) empty.style.display = 'none';

    const outOfStockText = t('outOfStock');
    const addToCartText = t('addToCart');
    const egpText = t('egp');
    const saleText = t('sale');

    container.innerHTML = wishlist.map((item, index) => {
        const inStock = item.stock !== undefined ? item.stock > 0 : true;
        
        return `
            <div class="wishlist-card" data-id="${item.id || item._id}" data-index="${index}">
                ${item.sale ? `<span class="sale-badge">🔥 ${saleText}</span>` : ''}
                <img src="${item.image || 'photos/default-product.png'}" alt="${item.name}" onerror="this.src='photos/default-product.png'">
                <div class="card-info">
                    <h3>${item.name}</h3>
                    <div class="price">
                        ${(item.price || 0).toLocaleString()} ${egpText}
                        ${item.oldPrice ? `<span class="old">${item.oldPrice.toLocaleString()} ${egpText}</span>` : ''}
                    </div>
                    <div class="card-actions">
                        <button class="add-to-cart-btn" onclick="addToCartFromWishlist(${index})">
                            <i class="fa-solid fa-cart-plus"></i> ${addToCartText}
                        </button>
                        <button class="remove-btn" onclick="removeFromWishlist(${index})">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// =====================================
// ADD TO CART FROM WISHLIST
// =====================================
function addToCartFromWishlist(index) {
    const wishlist = getWishlist();
    const product = wishlist[index];
    
    if (!product) {
        showToast('❌ Product not found');
        return;
    }

    const inStock = product.stock !== undefined ? product.stock > 0 : true;
    if (!inStock) {
        showToast('❌ Product out of stock');
        return;
    }

    let cart = JSON.parse(localStorage.getItem(`cart_${getUserId()}`)) || [];
    const productId = product.id || product._id;
    const existing = cart.find(item => (item.id || item._id) == productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: productId,
            _id: productId,
            name: product.name,
            price: product.price,
            image: product.image || 'photos/default-product.png',
            quantity: 1
        });
    }

    localStorage.setItem(`cart_${getUserId()}`, JSON.stringify(cart));
    
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        countEl.textContent = total;
    }

    // Remove from wishlist after adding to cart
    wishlist.splice(index, 1);
    saveWishlist(wishlist);
    renderWishlist();
    updateWishlistCount();

    showToast(`✅ ${product.name} added to cart`);
}

// =====================================
// REMOVE FROM WISHLIST
// =====================================
function removeFromWishlist(index) {
    if (!confirm('Remove this item from wishlist?')) return;

    const wishlist = getWishlist();
    const itemName = wishlist[index]?.name || 'Item';
    wishlist.splice(index, 1);
    saveWishlist(wishlist);
    renderWishlist();
    updateWishlistCount();
    showToast(`🗑️ ${itemName} removed from wishlist`);
}

// =====================================
function updateWishlistCount() {
    const wishlist = getWishlist();
    const countEl = document.getElementById('wishlist-count');
    if (countEl) {
        countEl.textContent = wishlist.length;
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
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem(`cart_${getUserId()}`)) || [];
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        countEl.textContent = total;
    }
}

// =====================================
// INITIALIZE
// =====================================
document.addEventListener('DOMContentLoaded', () => {
    renderWishlist();
    updateCartCount();
    updateWishlistCount();
});