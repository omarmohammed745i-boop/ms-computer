const API_URL = "http://localhost:5000/api/products";

const params = new URLSearchParams(window.location.search);

const productId = params.get("id");


// =========================
// ELEMENTS
// =========================

const nameInput = document.getElementById("name");

const brandInput = document.getElementById("brand");

const priceInput = document.getElementById("price");

const purchasePriceInput =
document.getElementById("purchasePrice");

const oldPriceInput =
document.getElementById("oldPrice");

const categoryInput =
document.getElementById("category");

const stockInput =
document.getElementById("stock");


const descriptionInput =
document.getElementById("description");

const detailsInput =
document.getElementById("details");


const imageFileInput =
document.getElementById("image-file");

const imagesPreview =
document.getElementById("images-preview");


const saveBtn =
document.getElementById("save-btn");


const detailsContainer =
document.getElementById("details-container");


const addDetailBtn =
document.getElementById("add-detail-btn");




// =========================
// VARIABLES
// =========================

let currentProduct = null;


let images = [];



// =========================
// HELPERS
// =========================


function getValue(element){

    return element
    ? element.value.trim()
    : "";

}



function getNumber(element){

    return element && element.value
    ? Number(element.value)
    : 0;

}
// =========================
// IMAGES PREVIEW
// =========================


function showImages(){


    if(!imagesPreview)
        return;



    imagesPreview.innerHTML = "";



    images.forEach((img,index)=>{



        const box = document.createElement("div");


        box.className =
        "image-preview-item";



        box.innerHTML = `

            <img src="${img}">


            <button 
            type="button"
            class="remove-image">

                ×

            </button>

        `;



        box.querySelector(".remove-image")
        .onclick = ()=>{


            removeImage(index);


        };



        imagesPreview.appendChild(box);



    });


}




function removeImage(index){


    images.splice(index,1);


    showImages();


}






// =========================
// DETAILS SECTIONS
// =========================



function createDetailSection(
    title="",
    content=""
){



    if(!detailsContainer)
        return;



    const box =
    document.createElement("div");



    box.className =
    "detail-box";



    box.innerHTML = `


        <label>
            Section Name
        </label>


        <input

        class="detail-title"

        value="${title}"

        placeholder="Example: Design">


        

        <label>
            Section Content
        </label>



        <textarea

        class="detail-content"

        placeholder="Example: RGB Lighting">${content}</textarea>




        <button

        type="button"

        class="remove-detail">

            Remove

        </button>



    `;



    box.querySelector(".remove-detail")
    .onclick = ()=>{


        box.remove();


    };



    detailsContainer.appendChild(box);



}






function loadDetailsSections(
    sections=[]
){



    if(!detailsContainer)
        return;



    detailsContainer.innerHTML = "";



    sections.forEach(section=>{


        createDetailSection(

            section.title || "",

            section.content || ""

        );


    });



}






function getDetailsSections(){


    let sections=[];



    document.querySelectorAll(".detail-box")
    .forEach(box=>{


        const title =
        box.querySelector(".detail-title")
        ?.value.trim();



        const content =
        box.querySelector(".detail-content")
        ?.value.trim();



        if(title || content){


            sections.push({

                title,

                content

            });


        }



    });



    return sections;


}





if(addDetailBtn){


    addDetailBtn.onclick = ()=>{


        createDetailSection();



    };


}
// =========================
// LOAD PRODUCT
// =========================


async function loadProduct(){


    if(!productId){


        alert("Missing Product ID");

        return;

    }




    try{


        const response = await fetch(

            `${API_URL}/${productId}`

        );



        const product = await response.json();




        if(!response.ok){


            throw new Error(

                product.message ||

                "Product Not Found"

            );


        }




        currentProduct = product;



        fillForm(product);




    }

    catch(error){


        console.error(

            "LOAD PRODUCT ERROR:",

            error

        );


        alert(

            "Product not found"

        );


    }



}





// =========================
// FILL FORM
// =========================



function fillForm(product){



    if(nameInput)

        nameInput.value =
        product.name || "";




    if(brandInput)

        brandInput.value =
        product.brand || "";




    if(priceInput)

        priceInput.value =
        product.price || "";




    if(purchasePriceInput)

        purchasePriceInput.value =
        product.purchasePrice || "";




    if(oldPriceInput)

        oldPriceInput.value =
        product.oldPrice || "";




    if(categoryInput)

        categoryInput.value =
        product.category || "";




    if(stockInput)

        stockInput.value =
        product.stock || "";




    if(descriptionInput)

        descriptionInput.value =
        product.description || "";




    if(detailsInput)

        detailsInput.value =
        product.details || "";





    // =========================
    // LOAD IMAGES
    // =========================


    images = [];



    if(

        Array.isArray(product.images)

        &&

        product.images.length

    ){


        images = [

            ...product.images

        ];



    }

    else if(product.image){



        images = [

            product.image

        ];



    }





    // =========================
    // LOAD DETAILS SECTIONS
    // =========================


    if(

        Array.isArray(product.detailsSections)

    ){



        loadDetailsSections(

            product.detailsSections

        );



    }




    showImages();



}
// =========================
// UPLOAD IMAGES
// =========================


if(imageFileInput){


    imageFileInput.addEventListener(
        "change",
        function(){


            const files =
            Array.from(this.files);



            files.forEach(file=>{


                if(images.length >= 5)
                    return;



                const reader =
                new FileReader();



                reader.onload = function(e){


                    images.push(
                        e.target.result
                    );


                    showImages();



                };



                reader.readAsDataURL(file);



            });



        }
    );


}






// =========================
// SAVE CHANGES
// =========================


async function saveChanges(){



    const updatedProduct = {


        name:
        getValue(nameInput),



        brand:
        getValue(brandInput),



        category:
        getValue(categoryInput),



        price:
        getNumber(priceInput),



        purchasePrice:
        getNumber(purchasePriceInput),



        oldPrice:
        getNumber(oldPriceInput),



        stock:
        getNumber(stockInput),




        description:
        getValue(descriptionInput),




        details:
        getValue(detailsInput),




        // الصورة الأساسية

        image:
        images[0] || "",




        // كل الصور

        images:

        images,




        // السيكشنات

        detailsSections:

        getDetailsSections(),




        // نحافظ على المواصفات القديمة

        specifications:

        currentProduct?.specifications || {},




        updatedAt:

        new Date().toISOString()



    };







    if(

        !updatedProduct.name ||

        !updatedProduct.category ||

        updatedProduct.price <= 0

    ){


        alert(
            "Fill required fields"
        );


        return;


    }






    if(saveBtn){


        saveBtn.disabled = true;


        saveBtn.innerText =
        "Saving...";


    }





    try{



        const response = await fetch(

            `${API_URL}/${productId}`,

            {

                method:"PUT",


                headers:{


                    "Content-Type":
                    "application/json"


                },


                body:

                JSON.stringify(updatedProduct)


            }


        );




        const data =
        await response.json();





        if(!response.ok){


            throw new Error(

                data.message ||

                "Update Failed"

            );


        }





        alert(
            "Product Updated Successfully"
        );



        window.location.href =
        "admin.html";




    }

    catch(error){


        console.error(

            "UPDATE ERROR:",

            error

        );



        alert(

            "Update Failed"

        );



    }


    finally{


        if(saveBtn){


            saveBtn.disabled = false;


            saveBtn.innerText =
            "Save Changes";


        }


    }



}
// =========================
// SAVE BUTTON
// =========================


if(saveBtn){


    saveBtn.onclick = (e)=>{


        e.preventDefault();


        saveChanges();



    };


}





// =========================
// START
// =========================


loadProduct();



console.log(
    "edit-product.js loaded ✅"
);