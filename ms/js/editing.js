// =========================
// EDITING PAGE
// =========================

const productsContainer =
document.getElementById("products-container");

const searchInput =
document.getElementById("search-product");

let products = [];

// =========================
// LOAD PRODUCTS
// =========================

async function loadProducts(){

    try{

        const response =
        await fetch("http://localhost:5000/api/products");

        products =
        await response.json();

        displayProducts(products);

    }

    catch(error){

        console.log(error);

    }

}

// =========================
// DISPLAY PRODUCTS
// =========================

function displayProducts(list){

    productsContainer.innerHTML = "";

    list.forEach(product=>{

        productsContainer.innerHTML += `

        <div class="product-row">

            <div>
                <img src="${product.image}">
            </div>

            <div>
                ${product.name}
            </div>

            <div>
                ${product.category}
            </div>

            <div>
                ${product.price} EGP
            </div>

            <div>
                ${product.stock}
            </div>

            <div>

                <button
                class="edit-btn"
                onclick="editProduct('${product._id}')">

                <i class="fa-solid fa-pen"></i>
                Edit

                </button>

            </div>

        </div>

        `;

    });

}

// =========================
// SEARCH
// =========================

searchInput.addEventListener("input",()=>{

    let value =
    searchInput.value.toLowerCase();

    let result =
    products.filter(product=>

        product.name.toLowerCase().includes(value) ||

        product.category.toLowerCase().includes(value)

    );

    displayProducts(result);

});

// =========================
// EDIT
// =========================

function editProduct(id){

    window.location.href =
    "edit-product.html?id=" + id;

}

// =========================

loadProducts();