console.log("MS JS WORKING");

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

function updateCartCount() {
    const cartCount = document.getElementById("cart-count");
    if (!cartCount) return;
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    cartCount.textContent = total;
}
updateCartCount();

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

function updateWishlistCount() {
    const wishlistCount = document.getElementById("wishlist-count");
    if (!wishlistCount) return;
    const wishlist = getWishlist();
    wishlistCount.textContent = wishlist.length;
}
updateWishlistCount();

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

// =========================
// BUY NOW
// =========================
function buyNow(button) {
    const product = {
        id: button.dataset.id,
        name: button.dataset.name,
        price: Number(button.dataset.price),
        oldPrice: Number(button.dataset.oldPrice || 0),
        image: button.dataset.image,
        quantity: 1
    };

    let cart = getCart();
    let exist = cart.find(item => item.id == product.id);

    if (exist) {
        exist.quantity++;
    } else {
        cart.push(product);
    }

    saveCart(cart);
    window.location.href = "checkout.html";
}

// =========================
// USER SYSTEM
// =========================
function updateUserUI() {
    const navUser = document.getElementById("nav-user");
    const userMenu = document.getElementById("user-menu");
    const userImage = document.getElementById("user-image");

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (loggedInUser) {
        if (navUser) navUser.style.display = "none";
        if (userMenu) userMenu.style.display = "block";
        if (userImage) {
            userImage.src = loggedInUser.image || "photos/default-avatar.png";
        }
    } else {
        if (navUser) navUser.style.display = "block";
        if (userMenu) userMenu.style.display = "none";
    }
}

const navUser = document.getElementById("nav-user");
const userMenu = document.getElementById("user-menu");
const userBtn = document.getElementById("user-btn");
const dropdown = document.getElementById("dropdown");
const logoutBtn = document.getElementById("logout-btn");
const userImage = document.getElementById("user-image");

updateUserUI();

if (userBtn && dropdown) {
    userBtn.onclick = (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("show");
    };
}

document.addEventListener("click", () => {
    if (dropdown) {
        dropdown.classList.remove("show");
    }
});

if (logoutBtn) {
    logoutBtn.onclick = (e) => {
        e.preventDefault();
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("userId");
        updateUserUI();
        location.reload();
    };
}

// =========================
// SEARCH SYSTEM
// =========================
let searchProducts = [];

async function loadSearchProducts() {
    try {
        const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://ms-computer-production.up.railway.app/api';
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                searchProducts = data;
                console.log('✅ Search products loaded from API:', searchProducts.length);
                return;
            }
        }
        const localProducts = JSON.parse(localStorage.getItem('products')) || [];
        if (localProducts.length > 0) {
            searchProducts = localProducts;
            console.log('📦 Using products from localStorage');
            return;
        }
        searchProducts = [];
        console.log('⚠️ No products found');
    } catch (err) {
        console.log("Search Error:", err);
        searchProducts = [];
    }
}
loadSearchProducts();

const searchBox = document.getElementById("search-box");
const searchSuggestions = document.getElementById("search-suggestions");

if (searchBox) {
    searchBox.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            let value = searchBox.value.trim();
            if (value) {
                console.log("🔍 Searching for:", value);
                window.location.href = "search?q=" + encodeURIComponent(value);
            }
        }
    });
}

if (searchBox && searchSuggestions) {
    searchBox.addEventListener("input", () => {
        let value = searchBox.value.toLowerCase().trim();
        searchSuggestions.innerHTML = "";

        if (value === "") {
            searchSuggestions.style.display = "none";
            return;
        }

        let results = searchProducts.filter(product =>
            product.name.toLowerCase().includes(value) ||
            (product.category && product.category.toLowerCase().includes(value))
        );

        results.slice(0, 8).forEach(product => {
            let div = document.createElement("div");
            div.className = "suggestion";
            div.innerHTML = `
                <span>${product.name}</span>
                <small style="color:var(--text3);font-size:12px;margin-left:8px;">${product.category || ''}</small>
            `;
            div.onclick = () => {
                window.location.href = `product.html?id=${product._id || product.id}`;
            };
            searchSuggestions.appendChild(div);
        });

        searchSuggestions.style.display = results.length ? "block" : "none";
    });

    document.addEventListener("click", function(e) {
        if (!searchBox.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.style.display = "none";
        }
    });
}

// =========================
// THEME
// =========================
const darkMode = document.getElementById("dark-mode");
const lightMode = document.getElementById("light-mode");

if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
}

if (darkMode) {
    darkMode.onclick = (e) => {
        e.preventDefault();
        document.body.classList.remove("light-mode");
        localStorage.setItem("theme", "dark");
    };
}

if (lightMode) {
    lightMode.onclick = (e) => {
        e.preventDefault();
        document.body.classList.add("light-mode");
        localStorage.setItem("theme", "light");
    };
}

// =========================
// MOBILE MENU
// =========================
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

if (menuBtn && navLinks) {
    menuBtn.onclick = () => {
        navLinks.classList.toggle("active");
    };
}

// =========================
// TOAST
// =========================
function showToast(message) {
    const toast = document.getElementById("toast");
    const toastText = document.getElementById("toast-text");
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// =========================
// IMAGE CHANGE
// =========================
function changeImage(image) {
    const mainImage = document.getElementById("mainImage");
    if (mainImage) {
        mainImage.src = image.src;
    }
}

// =========================
// ADD TO WISHLIST
// =========================
function addToWishlist(button) {
    const product = {
        id: button.dataset.id,
        name: button.dataset.name,
        price: Number(button.dataset.price),
        image: button.dataset.image
    };
    let wishlist = getWishlist();
    let exist = wishlist.find(item => item.id == product.id);
    if (!exist) {
        wishlist.push(product);
    }
    saveWishlist(wishlist);
    updateWishlistCount();
    showToast("Added To Wishlist ❤️");
}

// =========================
// SCROLL ANIMATION
// =========================
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }, {
        threshold: 0.15
    }
);

document.querySelectorAll(
    ".card,.feature,.special-box,.category-container a"
).forEach(item => {
    item.classList.add("hidden");
    observer.observe(item);
});

// =========================
// SEARCH IMPROVEMENTS
// =========================
if (searchBox && searchSuggestions) {
    searchBox.addEventListener("focus", () => {
        if (searchSuggestions.children.length > 0) {
            searchSuggestions.style.display = "block";
        }
    });
}

// =========================
// IMAGE FALLBACK
// =========================
document.querySelectorAll("img").forEach(img => {
    img.onerror = function() {
        this.src = "default-product.png";
    };
});

// =========================
// PAGE LOADER
// =========================
window.addEventListener("load", () => {
    document.body.classList.add("loaded");
});

// =========================
// GLOBAL SHORTCUTS
// =========================
window.updateCartCount = updateCartCount;
window.showToast = showToast;
window.buyNow = buyNow;
window.changeImage = changeImage;
window.addToWishlist = addToWishlist;

// =========================
// DISCOVER CATEGORIES
// =========================
const discoverCategories = document.getElementById("discover-categories");
const categoryContainer = document.querySelector(".category-container");

if (discoverCategories && categoryContainer) {
    discoverCategories.addEventListener("click", function() {
        const isOpen = categoryContainer.classList.toggle("show-all");
        if (isOpen) {
            discoverCategories.innerHTML = `
                <span data-lang="showLess">Show Less</span>
                <i class="fa-solid fa-arrow-up"></i>
            `;
            const span = discoverCategories.querySelector('span');
            if (span) {
                span.textContent = t('showLess');
            }
        } else {
            discoverCategories.innerHTML = `
                <span data-lang="discoverMore">Discover More Categories</span>
                <i class="fa-solid fa-arrow-right"></i>
            `;
            const span = discoverCategories.querySelector('span');
            if (span) {
                span.textContent = t('discoverMore');
            }
            window.scrollTo({
                top: document.querySelector(".categories").offsetTop - 100,
                behavior: "smooth"
            });
        }
    });
}

// =============================================
// FALLBACK PRODUCTS
// =============================================
function getFallbackProducts() {
    return [
        { id: 1, name: 'Gaming Keyboard RGB', price: 1200, oldPrice: 1500, image: 'photos/keyboard.jpg', category: 'Keyboards', stock: 10, sale: true },
        { id: 2, name: 'Wireless Gaming Mouse', price: 800, oldPrice: 1000, image: 'photos/mouse.jpg', category: 'Mouses', stock: 5, sale: false },
        { id: 3, name: 'Gaming Headset 7.1', price: 1500, oldPrice: 2000, image: 'photos/headset.jpg', category: 'Headsets', stock: 3, sale: true },
        { id: 4, name: 'Gaming Laptop Pro', price: 25000, oldPrice: 30000, image: 'photos/laptop.jpg', category: 'Laptops', stock: 0, sale: true },
        { id: 5, name: '4K Gaming Monitor', price: 8000, oldPrice: 10000, image: 'photos/monitor.jpg', category: 'Monitors', stock: 7, sale: true },
        { id: 6, name: 'RGB Mouse Pad', price: 350, oldPrice: 500, image: 'photos/mousepad.jpg', category: 'Mouse Pads', stock: 15, sale: false },
        { id: 7, name: 'Mechanical Keyboard', price: 1800, oldPrice: 2200, image: 'photos/mech-keyboard.jpg', category: 'Keyboards', stock: 4, sale: true },
        { id: 8, name: 'Wireless Headset', price: 2000, oldPrice: 2500, image: 'photos/wireless-headset.jpg', category: 'Headsets', stock: 0, sale: true },
        { id: 9, name: 'Gaming Mouse', price: 600, oldPrice: 800, image: 'photos/gaming-mouse.jpg', category: 'Mouses', stock: 8, sale: true },
        { id: 10, name: 'Mechanical Keyboard Pro', price: 2200, oldPrice: 2800, image: 'photos/mech-keyboard-pro.jpg', category: 'Keyboards', stock: 2, sale: true },
        { id: 11, name: 'Gaming Monitor 144Hz', price: 12000, oldPrice: 15000, image: 'photos/monitor-144hz.jpg', category: 'Monitors', stock: 3, sale: true },
        { id: 12, name: 'Gaming Desk Mat', price: 450, oldPrice: 600, image: 'photos/desk-mat.jpg', category: 'Accessories', stock: 20, sale: false },
    ];
}

// =============================================
// RENDER FEATURED PRODUCTS
// =============================================
function renderFeaturedProducts(products, container) {
    const outOfStockText = t('outOfStock');
    const addToCartText = t('addToCart');
    const egpText = t('egp');
    const saleText = t('sale');

    container.innerHTML = products.map(product => {
        const inStock = product.stock > 0;
        const productId = product._id || product.id;
        const image = (product.images && product.images.length > 0) ? product.images[0] : (product.image || 'photos/default-product.png');
        
        return `
        <div class="card hidden" onclick="window.location.href='product.html?id=${productId}'" style="cursor:pointer;">
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
    `}).join('');

    setTimeout(() => {
        document.querySelectorAll('.card.hidden').forEach(el => {
            el.classList.remove('hidden');
            el.classList.add('show');
        });
    }, 200);
}

// =============================================
// LOAD FEATURED PRODUCTS
// =============================================
async function loadFeaturedProducts() {
    const container = document.getElementById('products-container');
    if (!container) {
        console.log('ℹ️ products-container not found (not on home page)');
        return;
    }

    try {
        const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://ms-computer-production.up.railway.app/api';
        let products = [];

        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                products = data;
                console.log('✅ Products loaded from API:', products.length);
            } else {
                console.log('⚠️ No products from API, using fallback');
                products = getFallbackProducts();
            }
        } else {
            console.log('⚠️ API error, using fallback');
            products = getFallbackProducts();
        }

        let featuredProducts = [];
        if (products.length <= 12) {
            featuredProducts = products;
        } else {
            featuredProducts = products.slice(-12);
        }

        if (featuredProducts.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text2);padding:40px;">No products available</p>';
            return;
        }

        renderFeaturedProducts(featuredProducts, container);

    } catch (err) {
        console.error('❌ Error loading featured products:', err);
        container.innerHTML = '<p style="text-align:center;color:#ff2e63;padding:40px;">Error loading products</p>';
    }
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
        if (!product) {
            showToast('❌ Product not found');
            return;
        }

        const inStock = product.stock > 0;
        if (!inStock) {
            showToast('❌ Product out of stock');
            return;
        }

        let cart = getCart();
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

        saveCart(cart);
        updateCartCount();
        showToast(`✅ ${product.name} added to cart`);

    } catch (err) {
        console.error('❌ Error adding to cart:', err);
        showToast('❌ Error adding to cart');
    }
}

// ✅ استمع لتغيير اللغة
document.addEventListener('languageChanged', function() {
    console.log('🔄 Language changed, re-rendering products...');
    if (document.getElementById('products-container')) {
        loadFeaturedProducts();
    }
});

// =====================================
// INITIALIZE
// =====================================
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('products-container')) {
        loadFeaturedProducts();
    }
    updateCartCount();
    updateWishlistCount();
    updateUserUI();
});