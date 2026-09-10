// =========================
// MS ADMIN DASHBOARD
// DATABASE VERSION
// =========================


const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://ms-computer-production.up.railway.app/api';



const productsCount =
document.getElementById("products-count");


const usersCount =
document.getElementById("users-count");


const ordersCount =
document.getElementById("orders-count");


const revenue =
document.getElementById("revenue");


const latestProducts =
document.getElementById("latest-products");


const latestOrders =
document.getElementById("latest-orders");





let products = [];
let users = [];
let orders = [];






// =========================
// LOAD DATABASE
// =========================


async function loadDashboard(){


try{


const productsRes =
await fetch(
`${API}/products`
);


products =
await productsRes.json();





const ordersRes =
await fetch(
`${API}/orders`
);


orders =
await ordersRes.json();





const usersRes =
await fetch(
`${API}/auth/users`
);


users =
await usersRes.json();






loadStats();


loadLatestProducts();


loadLatestOrders();



}

catch(err){


console.log(
"Dashboard Error:",
err
);


}



}









// =========================
// STATS
// =========================


function loadStats(){



if(productsCount)

productsCount.textContent =
products.length;




if(usersCount)

usersCount.textContent =
users.length;




if(ordersCount)

ordersCount.textContent =
orders.length;





let total = 0;


orders.forEach(order=>{


total += Number(order.total || 0);


});



if(revenue)

revenue.textContent =
total.toLocaleString()
+
" EGP";



}










// =========================
// PRODUCTS
// =========================


function loadLatestProducts(){



if(!latestProducts)
return;



latestProducts.innerHTML="";



let data =
products.slice(-5).reverse();




if(data.length === 0){


latestProducts.innerHTML=`

<tr>

<td colspan="4">

No Products Yet

</td>

</tr>

`;

return;


}





data.forEach(product=>{


latestProducts.innerHTML += `


<tr>


<td>

<img 
src="${product.image}"
class="dashboard-img">

</td>



<td>

${product.name}

</td>



<td>

${product.category}

</td>



<td>

${product.price} EGP

</td>



</tr>


`;



});



}











// =========================
// ORDERS
// =========================


function loadLatestOrders(){



if(!latestOrders)
return;



latestOrders.innerHTML="";



let data =
orders.slice(-5).reverse();




if(data.length===0){


latestOrders.innerHTML=`

<tr>

<td colspan="4">

No Orders Yet

</td>

</tr>

`;

return;


}





data.forEach(order=>{


latestOrders.innerHTML += `


<tr>


<td>

#${order._id}

</td>



<td>

${order.name || "Unknown"}

</td>



<td>

${order.total} EGP

</td>



<td>

<span class="status">

${order.status || "Pending"}

</span>

</td>



</tr>


`;



});



}







loadDashboard();