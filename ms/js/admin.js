// =====================================
// ADMIN PANEL JAVASCRIPT
// =====================================

console.log('🛠️ Admin Panel Loaded');

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
// BASE URL (API)
// =====================================
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://ms-computer-production.up.railway.app/api';

// =====================================
// CHECK ADMIN LOGIN
// =====================================
const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

if (!loggedInUser || loggedInUser.role !== 'admin') {
    window.location.href = 'login.html';
}

// =====================================
// TAB SWITCHING
// =====================================
document.querySelectorAll('.admin-nav a[data-tab]').forEach(tab => {
    tab.addEventListener('click', function(e) {
        e.preventDefault();

        document.querySelectorAll('.admin-nav a').forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

        const tabId = this.dataset.tab;
        const target = document.getElementById(`tab-${tabId}`);
        if (target) target.classList.add('active');

        if (tabId === 'products') loadProducts();
        if (tabId === 'dashboard') loadDashboardStats();
        if (tabId === 'orders') loadOrders();
        if (tabId === 'users') loadUsers();
    });
});

// =====================================
// LOAD DASHBOARD STATS
// =====================================
async function loadDashboardStats() {
    try {
        // Products
        const productsRes = await fetch(`${API_BASE_URL}/products`);
        if (productsRes.ok) {
            const products = await productsRes.json();
            document.getElementById('total-products').textContent = products.length;
        }

        // ✅ Orders من الـ API
        let orders = [];
        try {
            const ordersRes = await fetch(`${API_BASE_URL}/orders`);
            if (ordersRes.ok) {
                orders = await ordersRes.json();
            }
        } catch (err) {
            console.log('⚠️ Orders API error, using localStorage:', err.message);
            orders = JSON.parse(localStorage.getItem('orders')) || [];
        }
        document.getElementById('total-orders').textContent = orders.length;

        // Users من الـ API
        let users = [];
        try {
            const usersRes = await fetch(`${API_BASE_URL}/auth/users`);
            if (usersRes.ok) {
                users = await usersRes.json();
            }
        } catch (err) {
            console.log('⚠️ Users API error, using localStorage:', err.message);
            users = JSON.parse(localStorage.getItem('users')) || [];
        }
        document.getElementById('total-users').textContent = users.length;

        // Revenue
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const egpText = t('egp');
        document.getElementById('total-revenue').textContent = totalRevenue.toLocaleString() + ' ' + egpText;

        renderRecentOrders(orders);
    } catch (err) {
        console.error('❌ Error loading dashboard:', err);
    }
}

// =====================================
// RENDER RECENT ORDERS
// =====================================
function renderRecentOrders(orders) {
    const container = document.getElementById('recent-orders-list');
    if (!container) return;

    if (!orders || orders.length === 0) {
        container.innerHTML = `<p style="color:var(--text2);">${t('noOrders')}</p>`;
        return;
    }

    const egpText = t('egp');
    const recent = orders.slice(0, 5);
    container.innerHTML = recent.map(order => `
        <div class="order-item-preview">
            <span class="order-id">#${order.id || 'N/A'}</span>
            <span class="order-date">${new Date(order.createdAt).toLocaleDateString()}</span>
            <span class="order-total">${order.total ? order.total.toLocaleString() : '0'} ${egpText}</span>
        </div>
    `).join('');
}

// =====================================
// LOAD PRODUCTS
// =====================================
async function loadProducts() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('Failed to load products');

        const products = await response.json();

        if (!products || products.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text2);">${t('noProductsFound')}</td></tr>`;
            return;
        }

        const egpText = t('egp');
        const inStockText = t('inStock');
        const outOfStockText = t('outOfStock');

        tbody.innerHTML = products.map((product) => {
            const productId = product._id || product.id;
            const inStock = product.stock > 0;
            const firstImage = product.images && product.images.length > 0 ? product.images[0] : (product.image || '/photos/default-product.png');

            return `
            <tr>
                <td><img src="${firstImage}" alt="${product.name}" onerror="this.src='/photos/default-product.png'"></td>
                <td><strong>${product.name}</strong></td>
                <td>${product.price ? product.price.toLocaleString() : '0'} ${egpText}</td>
                <td>${product.category || 'N/A'}</td>
                <td>${inStock ? '✅ ' + inStockText : '❌ ' + outOfStockText}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="openEditModal('${productId}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteProduct('${productId}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `}).join('');

    } catch (err) {
        console.error('❌ Error loading products:', err);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#ff2e63;">${t('errorLoadingProducts')}</td></tr>`;
    }
}

// =====================================
// CONVERT IMAGE TO BASE64
// =====================================
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// =====================================
// CONVERT MULTIPLE IMAGES
// =====================================
async function convertImagesToBase64(files) {
    const maxImages = 10;
    const images = [];
    const filesArray = Array.from(files).slice(0, maxImages);

    for (const file of filesArray) {
        if (file.type.startsWith('image/')) {
            const base64 = await convertToBase64(file);
            images.push(base64);
        }
    }

    return images;
}

// =====================================
// PARSE FEATURES FROM TEXTAREA
// =====================================
function parseFeatures(textareaId) {
    const textarea = document.getElementById(textareaId);
    if (!textarea) return [];
    
    return textarea.value
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);
}

// =====================================
// ADD PRODUCT
// =====================================
async function addProduct(event) {
    event.preventDefault();

    console.log('📝 Adding new product...');

    const name = document.getElementById('product-name')?.value.trim();
    const price = parseFloat(document.getElementById('product-price')?.value);
    const oldPrice = parseFloat(document.getElementById('product-old-price')?.value) || 0;
    const category = document.getElementById('product-category')?.value;
    const stock = parseInt(document.getElementById('product-stock')?.value);
    const description = document.getElementById('product-description')?.value.trim() || '';
    const sale = document.getElementById('product-sale')?.checked || false;
    const imageFiles = document.getElementById('product-images-input')?.files;
    
    const features = parseFeatures('product-features');

    if (!name || !price || !category) {
        showToast('⚠️ ' + t('fillAllFields'));
        return;
    }

    if (stock === undefined || stock === null || isNaN(stock)) {
        showToast('⚠️ ' + t('validStock'));
        return;
    }

    if (!imageFiles || imageFiles.length === 0) {
        showToast('⚠️ ' + t('selectImage'));
        return;
    }

    try {
        const images = await convertImagesToBase64(imageFiles);

        const productData = {
            name,
            price,
            oldPrice,
            category,
            stock: stock,
            inStock: stock > 0,
            images: images,
            image: images[0] || '/photos/default-product.png',
            description,
            sale,
            features: features
        };

        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) throw new Error('Failed to add product');

        const data = await response.json();
        console.log('✅ Product added:', data);

        showToast('✅ ' + t('productAdded'));
        document.getElementById('add-product-form').reset();
        document.getElementById('product-images-preview').innerHTML = '';
        document.getElementById('product-file-name').textContent = t('noFilesSelected');

        loadProducts();
        loadDashboardStats();

    } catch (err) {
        console.error('❌ Error adding product:', err);
        showToast('❌ ' + t('errorAddingProduct'));
    }
}

// =====================================
// DELETE PRODUCT
// =====================================
async function deleteProduct(productId) {
    if (!productId) {
        showToast('❌ ' + t('invalidProduct'));
        return;
    }

    if (!confirm(t('confirmDeleteProduct'))) return;

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete product');

        showToast('🗑️ ' + t('productDeleted'));
        loadProducts();
        loadDashboardStats();

    } catch (err) {
        console.error('❌ Error deleting product:', err);
        showToast('❌ ' + t('errorDeletingProduct'));
    }
}

// =====================================
// OPEN EDIT MODAL
// =====================================
async function openEditModal(productId) {
    console.log('📝 Opening edit modal for ID:', productId);

    if (!productId) {
        showToast('❌ ' + t('invalidProduct'));
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        if (!response.ok) throw new Error('Failed to load product');

        const product = await response.json();
        console.log('📦 Product to edit:', product);

        document.getElementById('edit-product-id').value = product._id || product.id || '';
        document.getElementById('edit-product-name').value = product.name || '';
        document.getElementById('edit-product-price').value = product.price || '';
        document.getElementById('edit-product-old-price').value = product.oldPrice || '';
        document.getElementById('edit-product-category').value = product.category || 'Keyboards';
        document.getElementById('edit-product-stock').value = product.stock || 0;
        document.getElementById('edit-product-description').value = product.description || '';
        document.getElementById('edit-product-sale').checked = product.sale || false;
        
        const featuresTextarea = document.getElementById('edit-product-features');
        if (featuresTextarea) {
            featuresTextarea.value = (product.features || []).join('\n');
        }

        const previewContainer = document.getElementById('edit-images-preview');
        previewContainer.innerHTML = '';

        const images = product.images || (product.image ? [product.image] : []);
        images.forEach((img, index) => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = `
                <img src="${img}" alt="Image ${index + 1}">
                <span class="index-badge">${index + 1}</span>
            `;
            previewContainer.appendChild(div);
        });

        document.getElementById('editModal').classList.add('active');

    } catch (err) {
        console.error('❌ Error loading product:', err);
        showToast('❌ ' + t('errorLoadingProduct'));
    }
}

// =====================================
// CLOSE EDIT MODAL
// =====================================
function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

// =====================================
// UPDATE PRODUCT
// =====================================
async function updateProduct(event) {
    event.preventDefault();

    const id = document.getElementById('edit-product-id').value;
    console.log('📝 Updating product ID:', id);

    if (!id) {
        showToast('❌ ' + t('invalidProduct'));
        return;
    }

    const name = document.getElementById('edit-product-name').value.trim();
    const price = parseFloat(document.getElementById('edit-product-price').value);
    const oldPrice = parseFloat(document.getElementById('edit-product-old-price').value) || 0;
    const category = document.getElementById('edit-product-category').value;
    const stock = parseInt(document.getElementById('edit-product-stock').value);
    const description = document.getElementById('edit-product-description').value.trim() || '';
    const sale = document.getElementById('edit-product-sale').checked;
    const imageFiles = document.getElementById('edit-product-images-input').files;
    
    const features = parseFeatures('edit-product-features');

    if (!name || !price || !category) {
        showToast('⚠️ ' + t('fillAllFields'));
        return;
    }

    if (stock === undefined || stock === null || isNaN(stock)) {
        showToast('⚠️ ' + t('validStock'));
        return;
    }

    try {
        let images = null;

        if (imageFiles && imageFiles.length > 0) {
            images = await convertImagesToBase64(imageFiles);
        }

        const productData = {
            name,
            price,
            oldPrice,
            category,
            stock: stock,
            inStock: stock > 0,
            description,
            sale,
            features: features
        };

        if (images) {
            productData.images = images;
            productData.image = images[0];
        }

        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) throw new Error('Failed to update product');

        showToast('✅ ' + t('productUpdated'));
        closeEditModal();

        loadProducts();
        loadDashboardStats();

    } catch (err) {
        console.error('❌ Error updating product:', err);
        showToast('❌ ' + t('errorUpdatingProduct'));
    }
}

// =====================================
// IMAGE PREVIEW (Add Product)
// =====================================
document.getElementById('product-images-input')?.addEventListener('change', function(e) {
    const files = this.files;
    const previewContainer = document.getElementById('product-images-preview');
    const fileNameSpan = document.getElementById('product-file-name');

    previewContainer.innerHTML = '';

    if (!files || files.length === 0) {
        fileNameSpan.textContent = t('noFilesSelected');
        return;
    }

    const maxImages = 10;
    const filesToShow = Array.from(files).slice(0, maxImages);

    fileNameSpan.textContent = `${filesToShow.length} ${t('filesSelected')}`;

    filesToShow.forEach((file, index) => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = `
                <img src="${event.target.result}" alt="Image ${index + 1}">
                <span class="index-badge">${index + 1}</span>
            `;
            previewContainer.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
});

// =====================================
// IMAGE PREVIEW (Edit Product)
// =====================================
document.getElementById('edit-product-images-input')?.addEventListener('change', function(e) {
    const files = this.files;
    const previewContainer = document.getElementById('edit-images-preview');
    const fileNameSpan = document.getElementById('edit-file-name');

    if (!files || files.length === 0) {
        fileNameSpan.textContent = t('noFilesSelected');
        return;
    }

    const maxImages = 10;
    const filesToShow = Array.from(files).slice(0, maxImages);

    fileNameSpan.textContent = `${filesToShow.length} ${t('newFilesSelected')}`;

    filesToShow.forEach((file, index) => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = `
                <img src="${event.target.result}" alt="New Image ${index + 1}">
                <span class="index-badge">NEW</span>
            `;
            previewContainer.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
});

// =====================================
// LOAD ORDERS (من API)
// =====================================
async function loadOrders() {
    const container = document.getElementById('orders-container');
    if (!container) return;

    let orders = [];
    try {
        const response = await fetch(`${API_BASE_URL}/orders`);
        if (response.ok) {
            orders = await response.json();
            console.log('📦 Orders loaded from API:', orders.length);
        }
    } catch (err) {
        console.log('⚠️ Orders API error, using localStorage');
        orders = JSON.parse(localStorage.getItem('orders')) || [];
    }

    if (!orders || orders.length === 0) {
        container.innerHTML = `<p style="color:var(--text2); text-align:center; padding:40px;">${t('noOrdersPlaced')}</p>`;
        return;
    }

    const egpText = t('egp');
    const customerText = t('customer');
    const itemsText = t('items');
    const totalText = t('total');
    const confirmText = t('confirm');
    const shipText = t('ship');
    const deliverText = t('deliver');
    const deleteText = t('delete');
    const cancelledText = t('cancelled');
    const deliveredText = t('delivered');

    const statusMap = {
        pending: t('pending'),
        confirmed: t('confirmed'),
        shipped: t('shipped'),
        delivered: t('delivered'),
        cancelled: t('cancelled')
    };

    container.innerHTML = orders.map((order) => {
        const orderId = order.id || order._id;
        const statusClass = (order.status || 'pending').toLowerCase();
        const total = order.total || 0;
        const items = order.items || [];
        const isCancelled = statusClass === 'cancelled';
        const isDelivered = statusClass === 'delivered';
        const displayStatus = statusMap[statusClass] || statusClass.toUpperCase();

        return `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">#${orderId}</span>
                    <span class="order-date">${new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</span>
                    <span class="order-status ${statusClass}">${displayStatus}</span>
                </div>

                <div class="order-body">
                    <div class="order-customer">
                        <label>${customerText}</label>
                        <span>${order.customer?.name || 'N/A'}</span>
                        <span>📞 ${order.customer?.phone || 'N/A'}</span>
                        <span>📧 ${order.customer?.email || 'N/A'}</span>
                        <span>📍 ${order.customer?.address || 'N/A'}, ${order.customer?.city || ''}, ${order.customer?.governorate || ''}</span>
                        <span>💳 ${order.payment === 'cash' ? t('cashOnDelivery') : order.payment || 'N/A'}</span>
                        ${order.customer?.notes ? `<span>📝 ${order.customer.notes}</span>` : ''}
                    </div>
                    <div class="order-items">
                        <label>${itemsText}</label>
                        ${items.map(item => `
                            <div class="order-item-row">
                                <span class="item-name">${item.name}</span>
                                <span class="item-qty">× ${item.quantity || 1}</span>
                                <span class="item-price">${(item.price * (item.quantity || 1)).toLocaleString()} ${egpText}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="order-footer">
                    <span class="order-total">${totalText}: ${total.toLocaleString()} ${egpText}</span>
                    <div class="order-actions">
                        ${!isCancelled && !isDelivered ? `
                            <button class="status-btn" onclick="updateOrderStatus('${orderId}', 'confirmed')">✅ ${confirmText}</button>
                            <button class="status-btn" onclick="updateOrderStatus('${orderId}', 'shipped')">🚚 ${shipText}</button>
                            <button class="status-btn" onclick="updateOrderStatus('${orderId}', 'delivered')">📦 ${deliverText}</button>
                            <button class="delete-btn" onclick="deleteOrder('${orderId}')">🗑️ ${deleteText}</button>
                        ` : ''}
                        ${isCancelled ? `
                            <span style="color:#ef4444;font-weight:700;padding:8px 16px;background:rgba(239,68,68,0.1);border-radius:8px;display:inline-block;">
                                <i class="fa-solid fa-ban"></i> ${cancelledText}
                            </span>
                        ` : ''}
                        ${isDelivered && !isCancelled ? `
                            <span style="color:#22c55e;font-weight:700;padding:8px 16px;background:rgba(34,197,94,0.1);border-radius:8px;display:inline-block;">
                                <i class="fa-solid fa-circle-check"></i> ${deliveredText}
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// =====================================
// UPDATE ORDER STATUS (API)
// =====================================
async function updateOrderStatus(orderId, newStatus) {
    if (!orderId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) throw new Error('Failed to update order status');

        const statusMap = {
            pending: t('pending'),
            confirmed: t('confirmed'),
            shipped: t('shipped'),
            delivered: t('delivered')
        };
        showToast(`✅ ${t('orderStatusUpdated')} ${statusMap[newStatus] || newStatus}`);
        loadOrders();
        loadDashboardStats();

    } catch (err) {
        console.error('❌ Error updating order status:', err);
        showToast('❌ ' + (err.message || 'Failed to update'));
    }
}

// =====================================
// DELETE ORDER (API)
// =====================================
async function deleteOrder(orderId) {
    if (!orderId) return;

    if (!confirm(t('confirmDeleteOrder'))) return;

    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete order');

        showToast('🗑️ ' + t('orderDeleted'));
        loadOrders();
        loadDashboardStats();

    } catch (err) {
        console.error('❌ Error deleting order:', err);
        showToast('❌ ' + (err.message || 'Failed to delete'));
    }
}

// =====================================
// LOAD USERS (من API)
// =====================================
async function loadUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    let users = [];
    try {
        const response = await fetch(`${API_BASE_URL}/auth/users`);
        if (response.ok) {
            users = await response.json();
            console.log('👥 Users loaded from API:', users.length);
        }
    } catch (err) {
        console.log('⚠️ Users API error, using localStorage');
        users = JSON.parse(localStorage.getItem('users')) || [];
    }

    const loggedInUserData = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!users || users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text2);">${t('noUsers')}</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map((user) => {
        const userId = user._id || user.id;
        const isAdmin = user.role === 'admin';
        const isCurrentUser = loggedInUserData && loggedInUserData.email === user.email;
        const roleText = isAdmin ? t('admin') : t('user');
        const roleClass = isAdmin ? 'admin' : 'user';

        return `
            <tr>
                <td><img src="${user.image || '/photos/default-avatar.png'}" alt="${user.name}" onerror="this.src='/photos/default-avatar.png'"></td>
                <td><strong>${user.name}</strong></td>
                <td>${user.email}</td>
                <td><span class="role-badge ${roleClass}">${roleText}</span></td>
                <td>
                    ${!isAdmin ? `
                        <button class="action-btn make-admin-btn" onclick="makeAdminByIndex('${userId}')">
                            <i class="fa-solid fa-user-shield"></i> ${t('makeAdmin')}
                        </button>
                    ` : `
                        ${!isCurrentUser ? `
                            <button class="action-btn remove-admin-btn" onclick="removeAdminByIndex('${userId}')">
                                <i class="fa-solid fa-user-slash"></i> ${t('removeAdmin')}
                            </button>
                        ` : `
                            <span style="color:var(--text3);font-size:13px;">${t('currentAdmin')}</span>
                        `}
                    `}
                    ${!isCurrentUser ? `
                        <button class="action-btn delete-user-btn" onclick="deleteUser('${userId}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

// =====================================
// MAKE ADMIN BY ID
// =====================================
async function makeAdminByIndex(userId) {
    if (!confirm(t('confirmMakeAdmin'))) return;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: 'admin' })
        });

        if (!response.ok) throw new Error('Failed to update user');

        showToast('✅ ' + t('makeAdminSuccess'));
        loadUsers();
        loadDashboardStats();

    } catch (err) {
        console.error('❌ Error making admin:', err);
        showToast('❌ ' + (err.message || 'Failed'));
    }
}

// =====================================
// REMOVE ADMIN BY ID
// =====================================
async function removeAdminByIndex(userId) {
    if (!confirm(t('confirmRemoveAdmin'))) return;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: 'user' })
        });

        if (!response.ok) throw new Error('Failed to update user');

        showToast('✅ ' + t('removeAdminSuccess'));
        loadUsers();
        loadDashboardStats();

    } catch (err) {
        console.error('❌ Error removing admin:', err);
        showToast('❌ ' + (err.message || 'Failed'));
    }
}

// =====================================
// DELETE USER BY ID
// =====================================
async function deleteUser(userId) {
    if (!confirm(t('confirmDeleteUser'))) return;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete user');

        showToast('🗑️ ' + t('deleteUserSuccess'));
        loadUsers();
        loadDashboardStats();

    } catch (err) {
        console.error('❌ Error deleting user:', err);
        showToast('❌ ' + (err.message || 'Failed'));
    }
}

// =====================================
// MAKE ADMIN (من الفورم)
// =====================================
async function makeAdmin() {
    const emailInput = document.getElementById('admin-email-input');
    const messageDiv = document.getElementById('admin-message');
    const email = emailInput.value.trim();

    if (!email) {
        messageDiv.className = 'admin-message error';
        messageDiv.textContent = '⚠️ ' + t('enterEmail');
        messageDiv.style.display = 'block';
        return;
    }

    try {
        const usersRes = await fetch(`${API_BASE_URL}/auth/users`);
        const users = await usersRes.json();
        const user = users.find(u => u.email === email);

        if (!user) {
            messageDiv.className = 'admin-message error';
            messageDiv.textContent = '❌ ' + t('userNotFound');
            messageDiv.style.display = 'block';
            return;
        }

        if (user.role === 'admin') {
            messageDiv.className = 'admin-message error';
            messageDiv.textContent = '⚠️ ' + t('alreadyAdmin');
            messageDiv.style.display = 'block';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/users/${user._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: 'admin' })
        });

        if (!response.ok) throw new Error('Failed to update user');

        messageDiv.className = 'admin-message success';
        messageDiv.textContent = `✅ ${user.name || email} ${t('makeAdminSuccess')}`;
        messageDiv.style.display = 'block';
        emailInput.value = '';

        loadUsers();
        loadDashboardStats();

        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 4000);

    } catch (err) {
        console.error('❌ Error:', err);
        messageDiv.className = 'admin-message error';
        messageDiv.textContent = '❌ ' + (err.message || 'Failed');
        messageDiv.style.display = 'block';
    }
}

// =====================================
// LOGOUT ADMIN
// =====================================
function logoutAdmin() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('userId');
        window.location.href = 'login.html';
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
    }, 3000);
}

// =====================================
// INITIALIZE
// =====================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Admin Panel Initialized');
    loadDashboardStats();
    loadProducts();
    loadOrders();
    loadUsers();
});

// Close modal on outside click
document.getElementById('editModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeEditModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeEditModal();
    }
});