// =========================
// ADD PRODUCT
// =========================

const form = document.getElementById("add-product-form");
const imageInput = document.getElementById("product-images");
const previewImage = document.getElementById("preview-image");

const API_URL = "http://localhost:5000/api/products";

// =========================
// IMAGE PREVIEW
// =========================

let selectedImages = [];

if (imageInput && previewImage) {

    imageInput.addEventListener("change", async function () {

        const files = [...this.files];

        selectedImages = [];

        if (!files.length) {

            previewImage.src = "";
            previewImage.style.display = "none";
            return;

        }

        for (const file of files) {

            const image = await new Promise((resolve) => {

                const reader = new FileReader();

                reader.onload = (e) => resolve(e.target.result);

                reader.readAsDataURL(file);

            });

            selectedImages.push(image);

        }

        previewImage.src = selectedImages[0];
        previewImage.style.display = "block";

    });

}

// =========================
// GET FORM DATA
// =========================

function getFormValue(id) {

    const el = document.getElementById(id);

    return el ? el.value.trim() : "";

}

function getNumberValue(id) {

    const value = getFormValue(id);

    return value === "" ? 0 : Number(value);

}
// =========================
// NOTIFICATION
// =========================

function showMessage(text, type = "success") {

    let box = document.getElementById("add-product-message");

    if (!box) {

        box = document.createElement("div");

        box.id = "add-product-message";

        box.style.position = "fixed";
        box.style.right = "20px";
        box.style.bottom = "20px";
        box.style.zIndex = "99999";
        box.style.padding = "14px 18px";
        box.style.borderRadius = "14px";
        box.style.fontWeight = "bold";
        box.style.boxShadow = "0 15px 35px rgba(0,0,0,.25)";
        box.style.backdropFilter = "blur(10px)";
        box.style.transition = ".3s ease";

        document.body.appendChild(box);

    }

    box.textContent = text;

    box.style.background =
        type === "success"
            ? "linear-gradient(135deg,#22c55e,#16a34a)"
            : "linear-gradient(135deg,#ef4444,#dc2626)";

    box.style.color = "#fff";
    box.style.opacity = "1";
    box.style.transform = "translateY(0)";

    setTimeout(() => {

        box.style.opacity = "0";
        box.style.transform = "translateY(20px)";

    },2200);

}

// =========================
// SAVE LOCAL
// =========================

function saveProductLocally(product){

    const products =
        JSON.parse(localStorage.getItem("adminProducts")) || [];

    products.unshift(product);

    localStorage.setItem(
        "adminProducts",
        JSON.stringify(products)
    );

}

// =========================
// SUBMIT
// =========================

if(form){

form.addEventListener("submit",async function(e){

e.preventDefault();

const name = getFormValue("name");
const brand = getFormValue("brand");
const category = getFormValue("category");

const price = getNumberValue("price");
const oldPrice = getNumberValue("oldPrice");
const purchasePrice = getNumberValue("purchasePrice");
const stock = getNumberValue("stock");

const description = getFormValue("description");

if(!name || !category || price<=0){

showMessage("Please fill all required fields","error");

return;

}

const image =
selectedImages.length
? selectedImages[0]
: "default-product.png";

const product = {

name,
brand,
category,

price,
oldPrice,
purchasePrice,

stock,

description,

image,

images:selectedImages,

detailsSections:getDetailsSections(),

sold:0,

createdAt:new Date().toISOString(),

showOnHome:true

};
try{

    const response = await fetch(API_URL,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify(product)

    });

    console.log("Status:",response.status);

    const data = await response.json();

    console.log(data);

    if(!response.ok){

        throw new Error(
            data.message || "API Error"
        );

    }

    saveProductLocally(data);

    showMessage(
        "Product Added Successfully",
        "success"
    );

    form.reset();

    selectedImages = [];

    if(previewImage){

        previewImage.src = "";
        previewImage.style.display = "none";

    }

}catch(error){

    console.error(error);

    // لو الباك إند واقع
    saveProductLocally(product);

    showMessage(
        "Saved Locally",
        "success"
    );

    form.reset();

    selectedImages = [];

    if(previewImage){

        previewImage.src = "";
        previewImage.style.display = "none";

    }

}

});

}

console.log("add-product.js loaded ✅");