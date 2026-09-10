// =========================
// DELETE PRODUCTS
// =========================

const productsList =
document.getElementById("products-list");

let products = [];

async function loadProducts(){

    try{

        const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://ms-computer-production.up.railway.app/api';

        products = await response.json();

        displayProducts();

    }

    catch(error){

        console.log(
            "Load Error:",
            error
        );

    }

}

function displayProducts(){

    productsList.innerHTML = "";

    products.forEach(product=>{

        productsList.innerHTML += `

        <div class="table-row">

            <img
            src="${product.image}"
            class="product-image"
            onerror="this.src='../images/default-product.png'">

            <span>
                ${product.name}
            </span>

            <span>
                ${product.category}
            </span>

            <span>
                ${product.price} EGP
            </span>

            <span>
                ${product._id}
            </span>

            <button
            class="delete-btn"
            onclick="deleteProduct('${product._id}')">

                <i class="fa-solid fa-trash"></i>

                Remove

            </button>

        </div>

        `;

    });

}

async function deleteProduct(id){

    let confirmDelete = confirm(
        "Are you sure you want to delete this product?"
    );

    if(!confirmDelete) return;

    try{

        const response = await fetch(

            "http://localhost:5000/api/products/" + id,

            {

                method:"DELETE"

            }

        );

        const data = await response.json();

        alert(data.message);

        loadProducts();

    }

    catch(error){

        console.log(error);

    }

}

loadProducts();