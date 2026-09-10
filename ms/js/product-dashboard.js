const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function loadProduct() {

    try {

        const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://ms-computer-production.up.railway.app/api';

        if (!response.ok) {
            throw new Error("Product Not Found");
        }

        const product = await response.json();

        // =========================
        // BASIC INFO
        // =========================

        document.getElementById("product-title").textContent = product.name;
        document.getElementById("product-image").src = product.image;
        document.getElementById("product-name").textContent = product.name;
        document.getElementById("product-price").textContent = product.price + " EGP";
        document.getElementById("product-stock").textContent = product.stock;

        // =========================
        // STATS
        // =========================

        const views = Number(product.views || 0);
        const cartAdds = Number(product.cartAdds || 0);
        const orders = Number(product.orders || 0);
        const sold = Number(product.sold || 0);

        document.getElementById("visitors").textContent = views;
        document.getElementById("cartAdds").textContent = cartAdds;
        document.getElementById("orders").textContent = orders;
        document.getElementById("sold").textContent = sold;

        // =========================
        // MONEY
        // =========================

        const purchasePrice = Number(product.purchasePrice || 0);
        const price = Number(product.price || 0);
        const stock = Number(product.stock || 0);

        const profit = (price - purchasePrice) * sold;

        const expectedProfit =
            (price - purchasePrice) * stock;

        const stockValue =
            purchasePrice * stock;

        const totalValue =
            price * stock;

        function getCurrency() {
    return (localStorage.getItem("language") || "en") === "ar"
        ? "جنيه"
        : "EGP";
}

document.getElementById("profit").textContent =
    profit.toLocaleString() + " " + getCurrency();

document.getElementById("expectedProfit").textContent =
    expectedProfit.toLocaleString() + " " + getCurrency();

document.getElementById("stockValue").textContent =
    stockValue.toLocaleString() + " " + getCurrency();

document.getElementById("totalValue").textContent =
    totalValue.toLocaleString() + " " + getCurrency();

        // =========================
        // PROGRESS BARS
        // =========================

        document.getElementById("viewsProgress").value =
            Math.min(views, 100);

        document.getElementById("cartProgress").value =
            Math.min(cartAdds, 100);

        document.getElementById("ordersProgress").value =
            Math.min(orders, 100);

        document.getElementById("soldProgress").value =
            Math.min(sold, 100);

        // =========================
        // CHART
        // =========================

        const ctx = document
            .getElementById("salesChart")
            .getContext("2d");

        new Chart(ctx, {

            type: "bar",

            data: {

                labels: [
                    "Visitors",
                    "Cart",
                    "Orders",
                    "Sold"
                ],

                datasets: [{

                    label: "Product Analytics",

                    data: [
                        views,
                        cartAdds,
                        orders,
                        sold
                    ],

                    backgroundColor: [
                        "#00d4ff",
                        "#00ffb7",
                        "#ffc107",
                        "#ff5722"
                    ]

                }]

            },

            options: {

                responsive: true,

                plugins: {

                    legend: {

                        display: false

                    }

                }

            }

        });

    }

    catch (error) {

        console.error(error);

        alert("Failed To Load Product");

    }

}

loadProduct();