const express = require("express");
const Order = require("../models/Order");

const router = express.Router();


// =======================
// Create Order
// =======================
router.post("/", async (req, res) => {
    try {
        const {
            id,
            user,
            customer,
            items,
            payment,
            screenshot,
            subtotal,
            shipping,
            discount,
            total,
            status
        } = req.body;

        // ✅ التحقق من البيانات الأساسية
        if (!customer || !customer.name || !customer.phone || !customer.address) {
            return res.status(400).json({
                success: false,
                message: "Please fill all customer information"
            });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order must have at least one item"
            });
        }

        if (total === undefined || total === null) {
            return res.status(400).json({
                success: false,
                message: "Total price is required"
            });
        }

        const order = new Order({
            id: id || 'ORD-' + Date.now(),
            user: user || null,
            customer,
            items,
            payment: payment || "cash",
            screenshot: screenshot || null,
            subtotal: subtotal || 0,
            shipping: shipping || 0,
            discount: discount || 0,
            total,
            status: status || "pending"
        });

        await order.save();

        res.status(201).json({
            success: true,
            message: "Order Created Successfully",
            order
        });

    } catch (err) {
        console.log("CREATE ORDER ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});


// =======================
// Get All Orders (Admin)
// =======================
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.log("GET ALL ORDERS ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});


// =======================
// Get User Orders
// =======================
router.get("/user/:id", async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.log("GET USER ORDERS ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});


// =======================
// Update Order Status
// =======================
router.put("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }

        const order = await Order.findOneAndUpdate(
            { id: req.params.id },
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order Not Found"
            });
        }

        res.json({
            success: true,
            message: "Order Status Updated",
            order
        });

    } catch (err) {
        console.log("UPDATE ORDER STATUS ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});


// =======================
// Delete Order
// =======================
router.delete("/:id", async (req, res) => {
    try {
        const order = await Order.findOneAndDelete({ id: req.params.id });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order Not Found"
            });
        }

        res.json({
            success: true,
            message: "Order Deleted Successfully"
        });

    } catch (err) {
        console.log("DELETE ORDER ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});


module.exports = router;