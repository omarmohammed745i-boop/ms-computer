// =====================================
// SEARCH PAGE JAVASCRIPT
// =====================================

console.log('🔍 Search Page Loaded');

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
            allProducts: 'All Products',
            noProductsFound: 'No Products Found',
            noProductsFoundText: 'We couldn\'t find any products matching your search.',
            showingResultsFor: 'Search results for:',
            searching: 'Searching...',
            browseProducts: 'Browse All Products',
            searchResults: 'Search Results'
        },
        ar: {
            outOfStock: 'غير متوفر',
            addToCart: 'أضف للسلة',
            egp: 'ج.م',
            sale: 'تخفيض',
            allProducts: 'جميع المنتجات',
            noProductsFound: 'لا توجد منتجات',
            noProductsFoundText: 'لم نعثر على أي منتجات تطابق بحثك.',
            showingResultsFor: 'نتائج البحث عن:',
            searching: 'جاري البحث...',
            browseProducts: 'تصفح جميع المنتجات',
            searchResults: 'نتائج البحث'
        }
    };
    return fallback[lang]?.[key] || key;
}

// =====================================
// GET SEARCH QUERY FROM URL
// =====================================
function getSearchQuery() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    console.log('🔍 Search query from URL:', q);
    return q || '';
}

// =====================================
// PERFORM SEARCH
// =====================================
async function performSearch(query) {
    const resultsContainer = document.getElementById('search-results');
    const loading = document.getElementById('search-loading');
    const noResults = document.getElementById('no-results');
    const queryContainer = document.getElementById('search-query-container');

    console.log('🔍 Query received:', query);

    // ✅ ترجمة "نتائج البحث عن:" أو "Search results for:"
    if (queryContainer) {
        const lang = getCurrentLanguage();
        let showingText = '';
        if (lang === 'ar') {
            showingText = 'نتائج البحث عن:';
        } else {
            showingText = 'Search results for:';
        }
        const queryText = query || t('allProducts');
        queryContainer.innerHTML = `${showingText} "<span id="search-query">${queryText}</span>"`;
        console.log('✅ Query text set to:', queryText);
    }

    // ✅ ترجمة الـ h1
    const h1 = document.querySelector('.page-header h1');
    if (h1) {
        h1.textContent = t('searchResults');
    }

    if (loading) loading.style.display = 'flex';
    if (resultsContainer) resultsContainer.innerHTML = '';

    try {
        const response = await fetch('http://localhost:5000/api/products');
        let products = [];

        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                products = data;
                console.log('✅ Products loaded:', products.length);
            } else {
                console.log('⚠️ No products');
                if (loading) loading.style.display = 'none';
                if (noResults) {
                    noResults.style.display = 'block';
                    noResults.querySelector('h2').textContent = t('noProductsFound');
                    noResults.querySelector('p').textContent = t('noProductsFoundText');
                    const btn = noResults.querySelector('.shop-btn');
                    if (btn) btn.textContent = t('browseProducts');
                }
                return;
            }
        } else {
            const localProducts = JSON.parse(localStorage.getItem('products')) || [];
            if (localProducts.length > 0) {
                products = localProducts;
                console.log('📦 Products from localStorage:', products.length);
            } else {
                console.error('❌ API Error:', response.status);
                if (loading) loading.style.display = 'none';
                if (noResults) {
                    noResults.style.display = 'block';
                    noResults.querySelector('h2').textContent = t('noProductsFound');
                    noResults.querySelector('p').textContent = 'Server error.';
                    const btn = noResults.querySelector('.shop-btn');
                    if (btn) btn.textContent = t('browseProducts');
                }
                return;
            }
        }

        const searchTerm = query.toLowerCase().trim();
        let filtered = products;
        if (searchTerm) {
            filtered = products.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                (p.category && p.category.toLowerCase().includes(searchTerm))
            );
            console.log(`🔍 Found ${filtered.length} results for "${searchTerm}"`);
        } else {
            console.log('📦 Showing all products');
        }

        if (loading) loading.style.display = 'none';

        if (filtered.length === 0) {
            if (noResults) {
                noResults.style.display = 'block';
                noResults.querySelector('h2').textContent = t('noProductsFound');
                noResults.querySelector('p').textContent = searchTerm ? t('noProductsFoundText') : 'No products available';
                const btn = noResults.querySelector('.shop-btn');
                if (btn) btn.textContent = t('browseProducts');
            }
            if (resultsContainer) resultsContainer.innerHTML = '';
            return;
        }

        if (noResults) noResults.style.display = 'none';

        renderSearchResults(filtered);

    } catch (err) {
        console.error('❌ Search error:', err);
        if (loading) loading.style.display = 'none';
        if (noResults) {
            noResults.style.display = 'block';
            noResults.querySelector('h2').textContent = t('noProductsFound');
            noResults.querySelector('p').textContent = 'Error loading products.';
            const btn = noResults.querySelector('.shop-btn');
            if (btn) btn.textContent = t('browseProducts');
        }
    }
}

// =====================================
// RENDER SEARCH RESULTS
// =====================================
function renderSearchResults(products) {
    const container = document.getElementById('search-results');
    if (!container || products.length === 0) return;

    const outOfStockText = t('outOfStock');
    const addToCartText = t('addToCart');
    const egpText = t('egp');
    const saleText = t('sale');

    container.innerHTML = products.map(product => {
        const inStock = product.stock > 0;
        const productId = product._id || product.id;
        const image = (product.images && product.images.length > 0) ? product.images[0] : (product.image || 'photos/default-product.png');

        return `
            <div class="card" onclick="window.location.href='product.html?id=${productId}'" style="cursor:pointer;">
                ${product.sale ? `<span class="sale-badge">🔥 ${saleText}</span>` : ''}
                ${!inStock ? `<span class="stock-badge out-stock">${outOfStockText}</span>` : ''}
                ${product.oldPrice ? `<span class="discount-badge">${Math.round((1 - product.price / product.oldPrice) * 100)}%</span>` : ''}
                <img src="${image}" alt="${product.name}" loading="lazy" onerror="this.src='photos/default-product.png'">
                <h3>${product.name}</h3>
                <div class="price">
                    <span class="new-price">${product.price.toLocaleString()} ${egpText}</span>
                    ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString()} ${egpText}</span>` : ''}
                </div>
                <button class="add-btn" 
                    onclick="event.stopPropagation(); addToCart('${productId}')"
                    ${!inStock ? 'disabled' : ''}>
                    ${inStock ? `🛒 ${addToCartText}` : outOfStockText}
                </button>
            </div>
        `;
    }).join('');

    setTimeout(() => {
        document.querySelectorAll('.card.hidden').forEach(el => {
            el.classList.remove('hidden');
            el.classList.add('show');
        });
    }, 100);
}

// =====================================
// ADD TO CART
// =====================================
async function addToCart(productId) {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const products = await response.json();
        const product = products.find(p => (p._id || p.id) == productId);
        if (!product) { showToast('❌ Product not found'); return; }
        if (product.stock <= 0) { showToast('❌ Product out of stock'); return; }

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(item => (item.id || item._id) == productId);
        if (existing) {
            existing.quantity += 1;
        } else {
            const image = (product.images && product.images.length > 0) ? product.images[0] : (product.image || 'photos/default-product.png');
            cart.push({ id: product._id || product.id, name: product.name, price: product.price, image: image, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        const countEl = document.getElementById('cart-count');
        if (countEl) countEl.textContent = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        showToast(`✅ ${product.name} added to cart`);
    } catch (err) {
        console.error('❌ Error adding to cart:', err);
        showToast('❌ Error adding to cart');
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
    toast._timeout = setTimeout(() => { toast.classList.remove('show'); }, 2500);
}

// =====================================
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
}

function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistEl = document.getElementById('wishlist-count');
    if (wishlistEl) wishlistEl.textContent = wishlist.length;
}

// =====================================
// INITIALIZE
// =====================================
document.addEventListener('DOMContentLoaded', () => {
    const query = getSearchQuery();
    performSearch(query);
    updateCartCount();
    updateWishlistCount();
});

// ✅ استمع لتغيير اللغة
document.addEventListener('languageChanged', function() {
    console.log('🔄 Language changed, re-rendering search...');
    const query = getSearchQuery();
    performSearch(query);
});