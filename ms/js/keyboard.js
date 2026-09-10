function changeImage(image){
    document.getElementById("mainImage").src = image.src;
}
function addToCart(){

    let product = {

        id:1,

        name:"AULA F2088 White Blue Switch",

        price:999,

        image:"WhatsApp Image 2026-07-18 at 7.19.17 PM.jpeg",

        quantity:1

    };

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.push(product);

    localStorage.setItem("cart", JSON.stringify(cart));

    alert("تمت إضافة المنتج إلى السلة");

}