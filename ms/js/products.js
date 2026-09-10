// =====================================
// PRODUCTS PAGE JAVASCRIPT
// =====================================

console.log('🛒 Products Page Loaded');

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
            productsCount: 'products',
            loadMore: 'Load More',
            noProductsFound: 'No Products Found',
            noProductsFoundText: 'Try adjusting your filters or search terms',
            allCategories: 'All Categories',
            sortBy: 'Sort By',
            priceLow: 'Price: Low to High',
            priceHigh: 'Price: High to Low',
            nameAZ: 'Name: A to Z',
            nameZA: 'Name: Z to A',
            allProducts: 'All Products',
            inStock: 'In Stock'
        },
        ar: {
            outOfStock: 'غير متوفر',
            addToCart: 'أضف للسلة',
            egp: 'ج.م',
            sale: 'تخفيض',
            productsCount: 'منتج',
            loadMore: 'تحميل المزيد',
            noProductsFound: 'لا توجد منتجات',
            noProductsFoundText: 'حاول تعديل الفلاتر أو كلمات البحث',
            allCategories: 'جميع الأقسام',
            sortBy: 'ترتيب حسب',
            priceLow: 'السعر: من الأقل للأعلى',
            priceHigh: 'السعر: من الأعلى للأقل',
            nameAZ: 'الاسم: من أ إلى ي',
            nameZA: 'الاسم: من ي إلى أ',
            allProducts: 'جميع المنتجات',
            inStock: 'متوفر'
        }
    };
    return fallback[lang]?.[key] || key;
}

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 8;

function getSearchQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
}

async function loadAllProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                allProducts = data;
                console.log('✅ Products loaded:', allProducts.length);
                applyFilters();
                return;
            }
        }
        const localProducts = JSON.parse(localStorage.getItem('products')) || [];
        if (localProducts.length > 0) {
            allProducts = localProducts;
            console.log('📦 Products from localStorage:', allProducts.length);
            applyFilters();
            return;
        }
        allProducts = [];
        applyFilters();
    } catch (err) {
        console.error('❌ Error loading products:', err);
        allProducts = [];
        applyFilters();
    }
}

function applyFilters() {
    const categorySelect = document.getElementById('category-filter');
    const sort = document.getElementById('sort-filter')?.value || 'default';
    const stock = document.getElementById('stock-filter')?.value || 'all';
    const searchQuery = getSearchQuery().toLowerCase().trim();
    
    // ✅ جيب الفلتر من الـ URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    
    console.log('🔍 Category from URL:', categoryParam);
    
    // ✅ اختار الفلتر: من الـ URL ولا من الـ select
    let selectedCategory = 'all';
    if (categoryParam) {
        selectedCategory = categoryParam;
        if (categorySelect) {
            categorySelect.value = categoryParam;
            console.log('✅ Category select set to:', categoryParam);
        }
    } else if (categorySelect) {
        selectedCategory = categorySelect.value;
    }

    console.log('📂 Selected category:', selectedCategory);

    let results = [...allProducts];

    if (searchQuery) {
        results = results.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(searchQuery);
            const categoryMatch = product.category && product.category.toLowerCase().includes(searchQuery);
            return nameMatch || categoryMatch;
        });
    }

    if (selectedCategory !== 'all') {
        results = results.filter(product => product.category === selectedCategory);
        console.log(`🔍 Filtered ${results.length} products for category: ${selectedCategory}`);
    }

    if (stock === 'in-stock') {
        results = results.filter(p => p.stock > 0);
    } else if (stock === 'out-stock') {
        results = results.filter(p => p.stock === 0 || p.stock === null || p.stock === undefined);
    }

    switch (sort) {
        case 'price-low':
            results.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            results.sort((a, b) => b.price - a.price);
            break;
        case 'name-az':
            results.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-za':
            results.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            break;
    }

    filteredProducts = results;
    currentPage = 1;
    renderProducts();
}

function renderProducts() {
    const container = document.getElementById('products-grid');
    const loadMoreContainer = document.getElementById('load-more-container');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const noResults = document.getElementById('no-results');
    const resultsCount = document.getElementById('results-count');

    if (!container) return;

    const start = 0;
    const end = currentPage * productsPerPage;
    const productsToShow = filteredProducts.slice(start, end);

    if (filteredProducts.length === 0) {
        container.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
        if (resultsCount) resultsCount.textContent = `0 ${t('productsCount')}`;
        return;
    }

    if (noResults) noResults.style.display = 'none';

    const outOfStockText = t('outOfStock');
    const addToCartText = t('addToCart');
    const egpText = t('egp');
    const saleText = t('sale');
    const productsCountText = t('productsCount');
    const loadMoreText = t('loadMore');

    container.innerHTML = productsToShow.map(product => {
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

    if (resultsCount) {
        resultsCount.textContent = `${filteredProducts.length} ${productsCountText}`;
    }

    if (loadMoreContainer) {
        if (end >= filteredProducts.length) {
            loadMoreContainer.style.display = 'none';
        } else {
            loadMoreContainer.style.display = 'block';
        }
    }

    if (loadMoreBtn) {
        if (end >= filteredProducts.length) {
            loadMoreBtn.disabled = true;
        } else {
            loadMoreBtn.disabled = false;
        }
        loadMoreBtn.innerHTML = `${loadMoreText} <i class="fa-solid fa-arrow-down"></i>`;
    }

    setTimeout(() => {
        document.querySelectorAll('.card.hidden').forEach(el => {
            el.classList.remove('hidden');
            el.classList.add('show');
        });
    }, 100);
}

function loadMore() {
    currentPage++;
    renderProducts();
}

async function addToCart(productId) {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const products = await response.json();
        
        const product = products.find(p => (p._id || p.id) == productId);
        if (!product) {
            showToast('❌ Product not found');
            return;
        }

        const inStock = product.stock > 0;
        if (!inStock) {
            showToast('❌ Product out of stock');
            return;
        }

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(item => (item.id || item._id) == productId);

        if (existing) {
            existing.quantity += 1;
        } else {
            const image = (product.images && product.images.length > 0) ? product.images[0] : (product.image || 'photos/default-product.png');
            cart.push({
                id: product._id || product.id,
                name: product.name,
                price: product.price,
                image: image,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));

        const countEl = document.getElementById('cart-count');
        if (countEl) {
            const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
            countEl.textContent = total;
        }

        showToast(`✅ ${product.name} added to cart`);

    } catch (err) {
        console.error('❌ Error adding to cart:', err);
        showToast('❌ Error adding to cart');
    }
}

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
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
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

document.addEventListener('DOMContentLoaded', () => {
    loadAllProducts();
    updateCartCount();
    updateWishlistCount();

    document.getElementById('category-filter')?.addEventListener('change', applyFilters);
    document.getElementById('sort-filter')?.addEventListener('change', applyFilters);
    document.getElementById('stock-filter')?.addEventListener('change', applyFilters);
    document.getElementById('load-more-btn')?.addEventListener('click', loadMore);
});

document.addEventListener('languageChanged', function() {
    console.log('🔄 Language changed, re-rendering products...');
    renderProducts();
});

window.loadMore = loadMore;
window.applyFilters = applyFilters;
window.addToCart = addToCart;
window.showToast = showToast;