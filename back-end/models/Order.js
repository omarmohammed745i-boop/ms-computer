const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

    // ============================
    // Order ID (Custom)
    // ============================
    id: {
        type: String,
        required: true,
        unique: true
    },

    // ============================
    // User (ObjectId)
    // ============================
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false // ✅ ممكن يكون ضيف
    },

    // ============================
    // Customer Info
    // ============================
    customer: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            default: "",
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            default: "",
            trim: true
        },
        governorate: {
            type: String,
            default: "",
            trim: true
        },
        notes: {
            type: String,
            default: ""
        }
    },

    // ============================
    // Items (المنتجات)
    // ============================
    items: [
        {
            id: {
                type: String,
                default: ""
            },
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true,
                min: 0
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1
            },
            image: {
                type: String,
                default: ""
            }
        }
    ],

    // ============================
    // Payment
    // ============================
    payment: {
        type: String,
        default: "cash",
        enum: ["cash", "vodafone", "instapay"]
    },

    screenshot: {
        type: String,
        default: null
    },

    // ============================
    // Totals
    // ============================
    subtotal: {
        type: Number,
        default: 0,
        min: 0
    },

    shipping: {
        type: Number,
        default: 0,
        min: 0
    },

    discount: {
        type: Number,
        default: 0,
        min: 0
    },

    total: {
        type: Number,
        required: true,
        min: 0
    },

    // ============================
    // Status
    // ============================
    status: {
        type: String,
        enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
        default: "pending"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);