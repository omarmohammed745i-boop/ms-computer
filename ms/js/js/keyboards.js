const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://ms-computer-production.up.railway.app/api';


const params = new URLSearchParams(window.location.search);

const category =
params.get("category");



async function loadProducts(){


    try{


        const response =
        await fetch(API);



        const products =
        await response.json();




        const filteredProducts =
products.filter(product=>{


    if(!product.category || !category)
        return false;



    return product.category.trim().toLowerCase()
    ===
    category.trim().toLowerCase();



});





        const container =
        document.getElementById(
            "products-container"
        );



        if(!container)
            return;



        container.innerHTML="";





        filteredProducts.forEach(product=>{


            container.innerHTML += `


            <div class="card">


                <img 
                src="${product.image}"
                alt="${product.name}">



                <h2>
                    ${product.name}
                </h2>



                <div class="price">


                    <span class="new-price">

                    ${product.price} EGP

                    </span>


                    ${
                        product.oldPrice > 0

                        ?

                        `<span class="old-price">
                        ${product.oldPrice} EGP
                        </span>`

                        :

                        ""

                    }


                </div>



                <button onclick="openProduct('${product._id}')">

                    View Product

                </button>



            </div>


            `;


        });



        if(filteredProducts.length === 0){


            container.innerHTML = `

            <h2>
            No Products Found
            </h2>

            `;


        }



    }
    catch(error){


        console.log(
            "Products Load Error:",
            error
        );


    }


}





function openProduct(id){


    window.location.href =
    "product.html?id=" + id;


}





loadProducts();