// =========================
// PRODUCT DETAILS BUILDER
// =========================

const detailsContainer = document.getElementById("details-container");
const addDetailBtn = document.getElementById("add-detail-btn");


// إضافة سيكشن جديد

function createDetailSection(title = "", content = "") {

    const div = document.createElement("div");

    div.className = "detail-item";


    div.innerHTML = `

        <label>Section Name</label>

        <input 
        type="text"
        class="detail-title"
        placeholder="مثال: Switch Type"
        value="${title}">


        <label>Section Content</label>

        <textarea
        class="detail-content"
        placeholder="مثال: Blue Mechanical Switch">${content}</textarea>


        <button 
        type="button"
        class="remove-detail">

        Remove

        </button>

    `;



    div.querySelector(".remove-detail")
    .addEventListener("click",()=>{

        div.remove();

    });



    detailsContainer.appendChild(div);

}




// زر الإضافة

if(addDetailBtn){

    addDetailBtn.addEventListener("click",()=>{

        createDetailSection();

    });

}



// جلب التفاصيل وقت الحفظ

function getDetailsSections(){

    const sections = [];


    document.querySelectorAll(".detail-item")
    .forEach(item=>{


        const title =
        item.querySelector(".detail-title").value.trim();


        const content =
        item.querySelector(".detail-content").value.trim();



        if(title && content){

            sections.push({

                title:title,

                content:content

            });

        }


    });


    return sections;

}


// نخليها متاحة للـ add-product.js

window.getDetailsSections = getDetailsSections;