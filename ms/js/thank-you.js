// =====================================
// THANK YOU PAGE JAVASCRIPT
// =====================================

console.log('🎉 Thank You Page Loaded');

// =====================================
// GET LAST ORDER
// =====================================
function getLastOrder() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    return orders[orders.length - 1] || null;
}

// =====================================
// LOAD ORDER DATA
// =====================================
function loadOrderData() {
    const order = getLastOrder();

    if (!order) {
        // لو مفيش طلب، روح للصفحة الرئيسية
        window.location.href = 'ms.html';
        return;
    }

    console.log('📦 Last Order:', order);

    // Order Number
    document.getElementById('order-number').textContent = order.id || '#ORD-' + Date.now();

    // Order Date
    const date = new Date(order.createdAt);
    document.getElementById('order-date').textContent = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Payment Method
    const paymentMethods = {
        cash: 'Cash on Delivery',
        card: 'Credit Card',
        instapay: 'InstaPay'
    };
    document.getElementById('payment-method').textContent = paymentMethods[order.payment] || 'Cash on Delivery';

    // Order Status
    const statusEl = document.getElementById('order-status');
    statusEl.textContent = order.status || 'Pending';
    statusEl.className = 'value ' + (order.status === 'confirmed' ? 'status-confirmed' : 'status-pending');

    // Total
    document.getElementById('order-total').textContent = (order.total || 0).toLocaleString() + ' EGP';

    // Order Items
    const container = document.getElementById('order-items-summary');
    if (container && order.items) {
        container.innerHTML = order.items.map(item => {
            const quantity = item.quantity || 1;
            const total = item.price * quantity;
            return `
                <div class="order-summary-item">
                    <span class="item-name">
                        ${item.name}
                        <span>× ${quantity}</span>
                    </span>
                    <span class="item-total">${total.toLocaleString()} EGP</span>
                </div>
            `;
        }).join('');
    }
}

// =====================================
// UPDATE CART COUNT
// =====================================
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        countEl.textContent = total;
    }
}

function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistEl = document.getElementById('wishlist-count');
    if (wishlistEl) {
        wishlistEl.textContent = wishlist.length;
    }
}

// =====================================
// INITIALIZE
// =====================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 Thank You page initialized');
    loadOrderData();
    updateCartCount();
    updateWishlistCount();
});