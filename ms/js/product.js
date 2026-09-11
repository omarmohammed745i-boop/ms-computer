// =========================
// PRODUCT PAGE
// =========================

console.log('🛍️ Product Page Loaded');

// =========================
// GET API URL (محلي - بدون Conflict)
// =========================
function getApiUrl() {
    return window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api' 
        : 'https://ms-computer-production.up.railway.app/api';
}

// =========================
// GET CURRENT LANGUAGE
// =========================
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
            buyNow: 'Buy Now',
            egp: 'EGP',
            sale: 'SALE',
            inStock: 'In Stock',
            lowStock: 'Hurry! Only',
            itemsLeft: 'items left',
            productDetails: 'Product Details',
            specifications: 'Specifications',
            noDescription: 'No description available.',
            productNotFound: 'Product Not Found',
            loading: 'Loading...'
        },
        ar: {
            outOfStock: 'غير متوفر',
            addToCart: 'أضف للسلة',
            buyNow: 'اشتر الآن',
            egp: 'ج.م',
            sale: 'تخفيض',
            inStock: 'متوفر',
            lowStock: 'اسرع! متبقي فقط',
            itemsLeft: 'منتج',
            productDetails: 'تفاصيل المنتج',
            specifications: 'المواصفات',
            noDescription: 'لا يوجد وصف متاح.',
            productNotFound: 'المنتج غير موجود',
            loading: 'جاري التحميل...'
        }
    };
    return fallback[lang]?.[key] || key;
}

// =========================
// GET PRODUCT ID
// =========================
let productId = null;

const params = new URLSearchParams(window.location.search);
productId = params.get("id");

if (!productId) {
    const pathParts = window.location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && !isNaN(lastPart)) {
        productId = lastPart;
    }
}

if (!productId) {
    productId = localStorage.getItem('lastProductId');
}

// ✅ لو الـ ID مش ObjectId، جيب من localStorage
if (productId && !/^[0-9a-fA-F]{24}$/.test(productId)) {
    console.log("⚠️ Not a valid ObjectId, trying to find by custom id");
    const storedProducts = JSON.parse(localStorage.getItem('products')) || [];
    const found = storedProducts.find(p => (p.id || p._id) == productId);
    if (found && found._id) {
        productId = found._id;
        console.log("✅ Found product with _id:", productId);
    }
}

if (!productId) {
    productId = '1';
}

console.log("🔍 Final Product ID:", productId);

// =========================
// DOM ELEMENTS
// =========================
const productDetails = document.getElementById("product-details-content");
const productImage = document.getElementById("product-image");
const productName = document.getElementById("product-name");
const productPrice = document.getElementById("product-price");
const productOldPrice = document.getElementById("product-old-price");
const productDescription = document.getElementById("product-description");
const addCartBtn = document.getElementById("add-cart-btn");
const buyNowBtn = document.getElementById("buy-now-btn");
const stockWarning = document.getElementById("stock-warning");
const gallery = document.getElementById("product-gallery");
const prevBtn = document.getElementById("prev-image");
const nextBtn = document.getElementById("next-image");

let currentProduct = null;
let productImages = [];
let currentImageIndex = 0;

// =========================
// FALLBACK PRODUCTS
// =========================
const fallbackProducts = [
    { id: 1, name: 'Gaming Keyboard RGB', price: 1200, oldPrice: 1500, image: '/photos/keyboard.jpg', category: 'Keyboards', stock: 10, sale: true, description: 'High quality gaming keyboard with RGB lighting.' },
    { id: 2, name: 'Wireless Gaming Mouse', price: 800, oldPrice: 1000, image: '/photos/mouse.jpg', category: 'Mouses', stock: 5, sale: false, description: 'Wireless gaming mouse with high precision sensor.' },
    { id: 3, name: 'Gaming Headset 7.1', price: 1500, oldPrice: 2000, image: '/photos/headset.jpg', category: 'Headsets', stock: 3, sale: true, description: '7.1 surround sound gaming headset.' },
];

// =========================
// CHANGE IMAGE
// =========================
function changeImage(index) {
    if (!productImages.length || !productImage) return;
    if (index < 0) index = productImages.length - 1;
    if (index >= productImages.length) index = 0;
    currentImageIndex = index;
    productImage.src = productImages[index];
    document.querySelectorAll(".gallery-image").forEach((img, i) => {
        img.classList.toggle("active", i === index);
    });
}

// =========================
// CREATE GALLERY
// =========================
function createGallery() {
    if (!gallery) return;
    gallery.innerHTML = "";
    productImages.forEach((img, index) => {
        const image = document.createElement("img");
        image.src = img;
        image.className = "gallery-image";
        if (index === 0) image.classList.add("active");
        image.onclick = () => changeImage(index);
        gallery.appendChild(image);
    });
}

// =========================
// DISPLAY PRODUCT
// =========================
function displayProduct(product) {
    currentProduct = product;

    productImages = [];
    if (Array.isArray(product.images) && product.images.length) {
        productImages = [...product.images];
    } else if (product.image) {
        productImages.push(product.image);
    } else {
        productImages.push('/photos/default-product.png');
    }

    if (productImages.length) {
        createGallery();
        changeImage(0);
    }

    if (productName) productName.textContent = product.name || "Product";

    // ✅ استخدام الترجمة
    const egpText = t('egp');

    if (productPrice) productPrice.textContent = (product.price || 0).toLocaleString() + " " + egpText;
    if (productOldPrice) {
        productOldPrice.textContent = product.oldPrice > 0 ? product.oldPrice.toLocaleString() + " " + egpText : "";
    }
    if (productDescription) {
        productDescription.textContent = product.description || t('noDescription');
    }

    // Details
if (productDetails) {
    productDetails.innerHTML = "";

    // ✅ 1. عرض الوصف
    if (product.description) {
        productDetails.innerHTML += `
            <div class="details-section">
                <h3>📝 Description</h3>
                <p>${product.description}</p>
            </div>
        `;
    }

    // ✅ 2. عرض المميزات (Features)
    if (product.features && product.features.length > 0) {
        let featuresHTML = `
            <div class="details-section">
                <h3>✨ Features</h3>
                <ul class="features-list">
        `;
        product.features.forEach(feature => {
            featuresHTML += `<li>${feature}</li>`;
        });
        featuresHTML += `</ul></div>`;
        productDetails.innerHTML += featuresHTML;
    }

    // ✅ 3. عرض الـ detailsSections
    if (Array.isArray(product.detailsSections) && product.detailsSections.length) {
        product.detailsSections.forEach(section => {
            productDetails.innerHTML += `
                <div class="details-section">
                    <h3>${section.title}</h3>
                    <p>${section.content}</p>
                </div>
            `;
        });
    }

    // ✅ 4. عرض المواصفات (Specifications)
    let specsHTML = "";
    const specs = product.specifications || {};

    function addSpec(title, item) {
        if (item && item.enabled && item.value) {
            specsHTML += `
                <div class="spec-row">
                    <strong>${title}</strong>
                    <span>${item.value}</span>
                </div>
            `;
        }
    }

    addSpec("Color", specs.color);
    addSpec("Switch Color", specs.switchColor);
    addSpec("Material", specs.material);
    addSpec("Weight", specs.weight);
    addSpec("Size", specs.size);
    addSpec("Cable Length", specs.cableLength);
    addSpec("Connection", specs.connection);
    addSpec("Compatible With", specs.compatible);

    if (specsHTML) {
        productDetails.innerHTML += `
            <div class="details-section">
                <h3>⚙️ Specifications</h3>
                <div class="specifications-content">
                    ${specsHTML}
                </div>
            </div>
        `;
    }
}
    // Stock
    if (stockWarning) {
        const stock = product.stock || 0;
        if (stock <= 0) {
            stockWarning.innerHTML = "❌ " + t('outOfStock');
            stockWarning.className = "out-stock";
            if (addCartBtn) addCartBtn.disabled = true;
            if (buyNowBtn) buyNowBtn.disabled = true;
        } else if (stock <= 5) {
            stockWarning.innerHTML = `⚠️ ${t('lowStock')} ${stock} ${t('itemsLeft')}`;
            stockWarning.className = "low-stock";
            if (addCartBtn) addCartBtn.disabled = false;
            if (buyNowBtn) buyNowBtn.disabled = false;
        } else {
            stockWarning.innerHTML = "✅ " + t('inStock');
            stockWarning.className = "in-stock";
            if (addCartBtn) addCartBtn.disabled = false;
            if (buyNowBtn) buyNowBtn.disabled = false;
        }
    }

    // ✅ تحديث أزرار
    if (addCartBtn) addCartBtn.innerHTML = `🛒 ${t('addToCart')}`;
    if (buyNowBtn) buyNowBtn.innerHTML = `⚡ ${t('buyNow')}`;

    localStorage.setItem('lastProductId', product.id || product._id);
    console.log("✅ Product displayed successfully!");
}

// =========================
// LOAD PRODUCT
// =========================
async function loadProduct() {
    try {
        if (!productId) {
            console.error("❌ No product ID provided");
            if (productName) productName.textContent = t('productNotFound');
            if (productDescription) productDescription.textContent = "No product ID provided.";
            if (stockWarning) {
                stockWarning.innerHTML = "❌ Invalid Product ID";
                stockWarning.className = "out-stock";
            }
            if (addCartBtn) addCartBtn.disabled = true;
            if (buyNowBtn) buyNowBtn.disabled = true;
            return;
        }

        console.log("🔍 Loading product with ID:", productId);

        let product = null;

        try {
            const API_URL = getApiUrl();
            const response = await fetch(`${API_URL}/products/${productId}`);
            console.log("📡 Response status:", response.status);

            if (response.ok) {
                product = await response.json();
                console.log("📦 Product from API:", product);
            }
        } catch (err) {
            console.log("⚠️ API fetch error:", err.message);
        }

        // If API failed, try localStorage
        if (!product) {
            const storedProducts = JSON.parse(localStorage.getItem('products')) || [];
            product = storedProducts.find(p => (p.id || p._id) == productId);
            if (product) {
                console.log("📦 Product from localStorage:", product);
            }
        }

        // If still no product, use fallback
        if (!product) {
            product = fallbackProducts.find(p => p.id == productId);
            if (product) {
                console.log("📦 Product from fallback:", product);
            }
        }

        if (!product) {
            throw new Error("Product not found");
        }

        displayProduct(product);

    } catch (error) {
        console.error("❌ LOAD PRODUCT ERROR:", error);
        if (productName) productName.textContent = t('productNotFound');
        if (productDescription) {
            productDescription.textContent = "Sorry, we couldn't find this product.";
        }
        if (stockWarning) {
            stockWarning.innerHTML = "❌ " + t('productNotFound');
            stockWarning.className = "out-stock";
        }
        if (addCartBtn) addCartBtn.disabled = true;
        if (buyNowBtn) buyNowBtn.disabled = true;
    }
}

// =========================
// IMAGE BUTTONS
// =========================
if (prevBtn) {
    prevBtn.onclick = () => changeImage(currentImageIndex - 1);
}
if (nextBtn) {
    nextBtn.onclick = () => changeImage(currentImageIndex + 1);
}

// =========================
// ADD TO CART
// =========================
if (addCartBtn) {
    addCartBtn.onclick = () => {
        if (!currentProduct) {
            showToast("❌ Product not loaded");
            return;
        }
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const pid = currentProduct.id || currentProduct._id;
        const existing = cart.find(item => (item.id || item._id) == pid);
        if (existing) {
            existing.quantity++;
        } else {
            cart.push({
                id: pid,
                _id: pid,
                name: currentProduct.name,
                price: Number(currentProduct.price),
                oldPrice: Number(currentProduct.oldPrice || 0),
                image: productImages[0] || currentProduct.image || "/photos/default-product.png",
                quantity: 1
            });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        const countEl = document.getElementById('cart-count');
        if (countEl) {
            const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
            countEl.textContent = total;
        }
        showToast("✅ Product Added To Cart 🛒");
    };
}

// =========================
// BUY NOW
// =========================
if (buyNowBtn) {
    buyNowBtn.onclick = () => {
        if (!currentProduct) {
            showToast("❌ Product not loaded");
            return;
        }
        const pid = currentProduct.id || currentProduct._id;
        localStorage.setItem("cart", JSON.stringify([{
            id: pid,
            _id: pid,
            name: currentProduct.name,
            price: Number(currentProduct.price),
            oldPrice: Number(currentProduct.oldPrice || 0),
            image: productImages[0] || currentProduct.image || "/photos/default-product.png",
            quantity: 1
        }]));
        const countEl = document.getElementById('cart-count');
        if (countEl) countEl.textContent = 1;
        window.location.href = "checkout.html";
    };
}

// =========================
// KEYBOARD SHORTCUTS
// =========================
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") changeImage(currentImageIndex - 1);
    if (e.key === "ArrowRight") changeImage(currentImageIndex + 1);
});

// =========================
// START
// =========================
document.addEventListener("DOMContentLoaded", loadProduct);

// =========================
// SHOW TOAST
// =========================
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