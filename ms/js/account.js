// =====================================
// ACCOUNT PAGE JAVASCRIPT
// =====================================

console.log('👤 Account Page Loaded');

// =====================================
// API BASE URL
// =====================================
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://ms-computer-production.up.railway.app/api';

// =====================================
// GET USER ID
// =====================================
function getUserId() {
    return localStorage.getItem('userId') || 'guest';
}

// =====================================
// ORDERS (بـ userId)
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
// WISHLIST (بـ userId)
// =====================================
function getWishlist() {
    const userId = getUserId();
    return JSON.parse(localStorage.getItem(`wishlist_${userId}`)) || [];
}

// =====================================
// CART (بـ userId)
// =====================================
function getCart() {
    const userId = getUserId();
    return JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];
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
            free: 'Free 🎉',
            pending: 'Pending',
            confirmed: 'Confirmed',
            shipped: 'Shipped',
            delivered: 'Delivered',
            cancelled: 'Cancelled',
            customer: 'Customer',
            phone: 'Phone',
            address: 'Address',
            payment: 'Payment',
            notes: 'Notes',
            hideDetails: 'Hide Details',
            showDetails: 'Show Details',
            cancelOrder: 'Cancel Order',
            orderCancelled: 'Cancelled',
            orderDelivered: 'Delivered',
            profileUpdated: 'Profile updated successfully',
            addressAdded: 'Address added successfully',
            addressRemoved: 'Address removed'
        },
        ar: {
            outOfStock: 'غير متوفر',
            addToCart: 'أضف للسلة',
            egp: 'ج.م',
            sale: 'تخفيض',
            free: 'مجاناً 🎉',
            pending: 'قيد الانتظار',
            confirmed: 'تم التأكيد',
            shipped: 'تم الشحن',
            delivered: 'تم التوصيل',
            cancelled: 'ملغي',
            customer: 'العميل',
            phone: 'الهاتف',
            address: 'العنوان',
            payment: 'الدفع',
            notes: 'ملاحظات',
            hideDetails: 'إخفاء التفاصيل',
            showDetails: 'عرض التفاصيل',
            cancelOrder: 'إلغاء الطلب',
            orderCancelled: 'ملغي',
            orderDelivered: 'تم التوصيل',
            profileUpdated: 'تم تحديث الملف الشخصي بنجاح',
            addressAdded: 'تم إضافة العنوان بنجاح',
            addressRemoved: 'تم حذف العنوان'
        }
    };
    return fallback[lang]?.[key] || key;
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

function updateCartCount() {
    const cart = getCart();
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        countEl.textContent = total;
    }
}

function updateWishlistCount() {
    const wishlist = getWishlist();
    const countEl = document.getElementById('wishlist-count');
    if (countEl) {
        countEl.textContent = wishlist.length;
    }
}

// =====================================
// CHECK LOGIN STATUS
// =====================================
const user = JSON.parse(localStorage.getItem('loggedInUser'));

if (!user) {
    window.location.href = 'login.html';
}

// =====================================
// TAB SWITCHING
// =====================================
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.account-nav a[data-tab]').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();

            document.querySelectorAll('.account-nav a').forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

            const tabId = this.dataset.tab;
            const target = document.getElementById(`tab-${tabId}`);
            if (target) {
                target.classList.add('active');
                console.log('✅ Tab switched to:', tabId);
            }
        });
    });

    loadUserData();
    updateCartCount();
    updateWishlistCount();
});

// =====================================
// GET STATUS ORDER
// =====================================
function getOrderStatusIndex(status) {
    const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
    const index = statuses.indexOf(status);
    return index === -1 ? 0 : index;
}

function getStatusIcon(status) {
    const icons = {
        pending: 'fa-clock',
        confirmed: 'fa-check-circle',
        shipped: 'fa-truck',
        delivered: 'fa-circle-check',
        cancelled: 'fa-times-circle'
    };
    return icons[status] || 'fa-clock';
}

// =====================================
// LOAD USER DATA
// =====================================
async function loadUserData() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    displayUserData(user);
}

// =====================================
// DISPLAY USER DATA
// =====================================
function displayUserData(user) {
    if (!user) return;

    console.log('👤 Displaying user data:', user);

    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    const avatarEl = document.getElementById('profile-avatar');
    const formName = document.getElementById('profile-full-name');
    const formEmail = document.getElementById('profile-email-input');
    const formPhone = document.getElementById('profile-phone-input');

    if (nameEl) nameEl.textContent = user.name || 'User';
    if (emailEl) emailEl.textContent = user.email || 'user@example.com';

    if (avatarEl) {
        let imageUrl = user.image || '/photos/default-avatar.png';
        
        // ✅ لو الصورة مسار نسبي (uploads)، ضيف الـ API URL
        if (imageUrl.startsWith('/uploads/')) {
            imageUrl = `https://ms-computer-production.up.railway.app${imageUrl}`;
        }
        
        avatarEl.src = imageUrl;
        
        // ✅ لو الصورة فشلت، استخدم صورة افتراضية من النت
        avatarEl.onerror = function() {
            this.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User') + '&background=00d4b4&color=fff&size=128';
        };
        
        console.log('🖼️ Avatar URL:', imageUrl);
    }

    if (formName) formName.value = user.name || '';
    if (formEmail) formEmail.value = user.email || '';
    if (formPhone) formPhone.value = user.phone || '';

    const wishlist = getWishlist();
    const cart = getCart();
    const orders = getOrders();

    const wishlistStat = document.getElementById('wishlist-count-stat');
    const cartStat = document.getElementById('cart-count-stat');
    const orderStat = document.getElementById('order-count');

    if (wishlistStat) wishlistStat.textContent = wishlist.length;
    if (cartStat) cartStat.textContent = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    if (orderStat) orderStat.textContent = orders.length;

    renderOrders(orders);
    renderRecentOrders(orders);
    renderWishlistItems(wishlist);
    renderAddresses(user.addresses || []);
}

// =====================================
// RENDER ORDERS
// =====================================
function renderOrders(orders) {
    const container = document.getElementById('orders-list');
    if (!container) {
        console.error('❌ orders-list not found');
        return;
    }

    if (!orders || orders.length === 0) {
        container.innerHTML = '<p style="color:var(--text2);">' + t('noOrdersPlaced') + '</p>';
        return;
    }

    const egpText = t('egp');
    const statusMap = {
        pending: t('pending'),
        confirmed: t('confirmed'),
        shipped: t('shipped'),
        delivered: t('delivered'),
        cancelled: t('cancelled')
    };

    container.innerHTML = orders.map((order, index) => {
        const status = order.status || 'pending';
        const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
        const currentStep = getOrderStatusIndex(status);
        const displayStatus = statusMap[status] || status.toUpperCase();
        
        return `
            <div class="order-card" data-order="${index}">
                <div class="order-card-header" onclick="toggleOrderDetails(${index})">
                    <span class="order-id">#${order.id || 'ORD-' + (index + 1)}</span>
                    <span class="order-date">${new Date(order.createdAt).toLocaleDateString()}</span>
                    <span class="order-total">${(order.total || 0).toLocaleString()} ${egpText}</span>
                    <span class="order-status ${status}">${displayStatus}</span>
                </div>

                <div class="order-details-expand" id="order-details-${index}">
                    <div class="detail-row">
                        <span class="label">${t('customer')}</span>
                        <span class="value">${order.customer?.name || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">${t('phone')}</span>
                        <span class="value">${order.customer?.phone || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">${t('address')}</span>
                        <span class="value">${order.customer?.address || 'N/A'}, ${order.customer?.city || ''}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">${t('payment')}</span>
                        <span class="value">${order.payment === 'cash' ? t('cashOnDelivery') : order.payment || 'N/A'}</span>
                    </div>
                    ${order.customer?.notes ? `
                        <div class="detail-row">
                            <span class="label">${t('notes')}</span>
                            <span class="value">${order.customer.notes}</span>
                        </div>
                    ` : ''}

                    <div class="order-items-list">
                        ${(order.items || []).map(item => `
                            <div class="item-row">
                                <span class="item-name">${item.name}</span>
                                <span class="item-qty">× ${item.quantity || 1}</span>
                                <span class="item-price">${(item.price * (item.quantity || 1)).toLocaleString()} ${egpText}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="order-progress">
                        <div class="progress-line" style="width: ${(currentStep / (statuses.length - 1)) * 100}%;"></div>
                        ${statuses.map((s, i) => {
                            const label = statusMap[s] || s.toUpperCase();
                            let circleClass = '';
                            let labelClass = '';
                            let content = '';
                            
                            if (i < currentStep) {
                                circleClass = 'done';
                                labelClass = 'done';
                                content = '<i class="fa-solid fa-check"></i>';
                            } else if (i === currentStep) {
                                circleClass = 'active';
                                labelClass = 'active';
                                content = `<i class="fa-solid ${getStatusIcon(s)}"></i>`;
                            } else {
                                circleClass = '';
                                labelClass = '';
                                content = i + 1;
                            }
                            
                            return `
                                <div class="step">
                                    <div class="circle ${circleClass}">${content}</div>
                                    <span class="label ${labelClass}">${label}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <div class="order-actions-btns">
                        <button class="btn-toggle" onclick="toggleOrderDetails(${index})">
                            <i class="fa-solid fa-chevron-up"></i> ${t('hideDetails')}
                        </button>
                        ${status !== 'cancelled' && status !== 'delivered' ? `
                            <button class="btn-cancel" onclick="cancelOrder(${index})">
                                <i class="fa-solid fa-xmark"></i> ${t('cancelOrder')}
                            </button>
                        ` : ''}
                        ${status === 'cancelled' ? `
                            <button class="btn-cancel" disabled style="opacity:0.5;cursor:not-allowed;">
                                <i class="fa-solid fa-xmark"></i> ${t('orderCancelled')}
                            </button>
                        ` : ''}
                        ${status === 'delivered' ? `
                            <button class="btn-cancel" disabled style="opacity:0.5;cursor:not-allowed;background:rgba(34,197,94,0.12);color:#22c55e;">
                                <i class="fa-solid fa-circle-check"></i> ${t('orderDelivered')}
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// =====================================
// TOGGLE ORDER DETAILS
// =====================================
function toggleOrderDetails(index) {
    const details = document.getElementById(`order-details-${index}`);
    if (details) {
        details.classList.toggle('active');
        
        const btn = details.parentElement.querySelector('.btn-toggle');
        if (btn) {
            if (details.classList.contains('active')) {
                btn.innerHTML = '<i class="fa-solid fa-chevron-up"></i> ' + t('hideDetails');
            } else {
                btn.innerHTML = '<i class="fa-solid fa-chevron-down"></i> ' + t('showDetails');
            }
        }
    }
}

// =====================================
// CANCEL ORDER
// =====================================
function cancelOrder(index) {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    const orders = getOrders();
    if (!orders[index]) return;

    if (orders[index].status === 'delivered' || orders[index].status === 'cancelled') {
        showToast('⚠️ This order cannot be cancelled');
        return;
    }

    orders[index].status = 'cancelled';
    saveOrders(orders);

    showToast('🗑️ Order cancelled successfully');
    
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    displayUserData(user);
}

// =====================================
// RENDER RECENT ORDERS
// =====================================
function renderRecentOrders(orders) {
    const container = document.getElementById('recent-orders-list');
    if (!container) return;

    const recent = orders.slice(-3).reverse();

    if (recent.length === 0) {
        container.innerHTML = '<p style="color:var(--text2);">' + t('noOrders') + '</p>';
        return;
    }

    const egpText = t('egp');
    const statusMap = {
        pending: t('pending'),
        confirmed: t('confirmed'),
        shipped: t('shipped'),
        delivered: t('delivered'),
        cancelled: t('cancelled')
    };

    container.innerHTML = recent.map((order, idx) => {
        const status = order.status || 'pending';
        const displayStatus = statusMap[status] || status.toUpperCase();
        return `
            <div class="order-item-preview" onclick="document.querySelector('[data-order="${orders.length - idx - 1}"]')?.click();">
                <span class="order-id">#${order.id || 'ORD-' + (orders.length - idx)}</span>
                <span class="order-date">${new Date(order.createdAt).toLocaleDateString()}</span>
                <span class="order-total">${(order.total || 0).toLocaleString()} ${egpText}</span>
                <span class="order-status ${status}" style="font-size:12px;padding:2px 10px;border-radius:20px;">${displayStatus}</span>
            </div>
        `;
    }).join('');
}

// =====================================
// RENDER WISHLIST
// =====================================
function renderWishlistItems(wishlist) {
    const container = document.getElementById('wishlist-list');
    if (!container) return;

    if (!wishlist || wishlist.length === 0) {
        container.innerHTML = '<p style="color:var(--text2);">' + t('noWishlist') + '</p>';
        return;
    }

    const egpText = t('egp');

    container.innerHTML = wishlist.map(item => `
        <div class="order-item-preview">
            <span>${item.name}</span>
            <span>${item.price ? item.price.toLocaleString() : '0'} ${egpText}</span>
            <span><button onclick="removeFromWishlist(${item.id})" style="background:none;border:none;color:#ff2e63;cursor:pointer;"><i class="fa-solid fa-trash-can"></i></button></span>
        </div>
    `).join('');
}

// =====================================
// RENDER ADDRESSES
// =====================================
function renderAddresses(addresses) {
    const container = document.getElementById('addresses-list');
    if (!container) return;

    if (!addresses || addresses.length === 0) {
        container.innerHTML = '<p style="color:var(--text2);">' + t('noAddresses') + '</p>';
        return;
    }

    container.innerHTML = addresses.map((addr, index) => `
        <div class="address-item">
            <span class="address-text">${addr}</span>
            <div class="address-actions">
                <button onclick="removeAddress(${index})"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        </div>
    `).join('');
}

// =====================================
// ADD ADDRESS
// =====================================
function addAddress() {
    const address = prompt('Enter your address:');
    if (!address || address.trim() === '') return;

    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) return;

    if (!user.addresses) user.addresses = [];
    user.addresses.push(address.trim());
    localStorage.setItem('loggedInUser', JSON.stringify(user));

    renderAddresses(user.addresses);
    showToast('✅ ' + t('addressAdded'));
}

// =====================================
// REMOVE ADDRESS
// =====================================
function removeAddress(index) {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) return;

    if (!confirm('Remove this address?')) return;

    user.addresses.splice(index, 1);
    localStorage.setItem('loggedInUser', JSON.stringify(user));

    renderAddresses(user.addresses);
    showToast('🗑️ ' + t('addressRemoved'));
}

// =====================================
// UPDATE PROFILE
// =====================================
function updateProfile(event) {
    event.preventDefault();

    const name = document.getElementById('profile-full-name').value.trim();
    const email = document.getElementById('profile-email-input').value.trim();
    const phone = document.getElementById('profile-phone-input').value.trim();

    if (!name || !email) {
        showToast('⚠️ Name and email are required');
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        showToast('⚠️ Please enter a valid email');
        return;
    }

    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) return;

    user.name = name;
    user.email = email;
    user.phone = phone;

    localStorage.setItem('loggedInUser', JSON.stringify(user));

    document.getElementById('profile-name').textContent = name;
    document.getElementById('profile-email').textContent = email;

    showToast('✅ ' + t('profileUpdated'));
}

// =====================================
// ✅ UPLOAD PROFILE IMAGE (API)
// =====================================
document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('profile-image-input');
    if (imageInput) {
        imageInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                showToast('⚠️ Please select an image file');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                showToast('⚠️ Image size must be less than 2MB');
                return;
            }

            const spinner = document.getElementById('imageLoadingSpinner');
            if (spinner) spinner.style.display = 'flex';

            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            if (!loggedInUser) {
                if (spinner) spinner.style.display = 'none';
                return;
            }

            try {
                const formData = new FormData();
                formData.append('avatar', file);

                const response = await fetch(`${API_BASE_URL}/auth/upload-avatar/${loggedInUser.id}`, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                console.log('📡 Upload response:', data);

                if (response.ok && data.success) {
                    loggedInUser.image = data.image;
                    localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));

                    const fullImageUrl = `https://ms-computer-production.up.railway.app${data.image}`;
                    document.getElementById('profile-avatar').src = fullImageUrl;

                    if (spinner) spinner.style.display = 'none';
                    showToast('✅ ' + t('profileUpdated'));
                } else {
                    if (spinner) spinner.style.display = 'none';
                    showToast('❌ ' + (data.message || 'Upload failed'));
                }

            } catch (err) {
                console.error('❌ Upload error:', err);
                if (spinner) spinner.style.display = 'none';
                showToast('❌ Upload failed');
            }
        });
    }

    const container = document.getElementById('profileImageContainer');
    if (container) {
        container.addEventListener('click', function() {
            const input = document.getElementById('profile-image-input');
            if (input) input.click();
        });
    }
});

// =====================================
// LOGOUT
// =====================================
const accountLogoutBtn = document.getElementById('account-logout');
if (accountLogoutBtn) {
    accountLogoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('userId');
            window.location.href = 'login.html';
        }
    });
}

// =====================================
// REMOVE FROM WISHLIST
// =====================================
function removeFromWishlist(productId) {
    let wishlist = getWishlist();
    wishlist = wishlist.filter(item => item.id != productId);
    localStorage.setItem(`wishlist_${getUserId()}`, JSON.stringify(wishlist));
    renderWishlistItems(wishlist);
    updateWishlistCount();
    showToast('🗑️ Removed from wishlist');
}