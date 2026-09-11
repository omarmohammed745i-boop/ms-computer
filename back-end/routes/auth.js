const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const User = require("../models/user");

const router = express.Router();


// ============================
// Multer Setup for Avatar Upload
// ============================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only images allowed"), false);
        }
    }
});


// ============================
// Register
// ============================
router.post("/register", async (req, res) => {
    try {
        const name = req.body.name?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password?.trim();

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: "Account Created Successfully"
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});


// ============================
// Login
// ============================
router.post("/login", async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password?.trim();

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter email and password"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email or Password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email or Password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET || "MSCOMPUTER_SECRET",
            {
                expiresIn: "7d"
            }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                image: user.image || "/photos/default-avatar.png",
                role: user.role
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});


// ============================
// Upload Avatar
// ============================
router.post("/upload-avatar/:id", upload.single("avatar"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { image: imageUrl },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "Avatar uploaded successfully",
            image: imageUrl
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});


// ============================
// Update Profile
// ============================
router.put("/update-profile/:id", async (req, res) => {
    try {
        const { name, image } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: name.trim(),
                image: image || "/photos/default-avatar.png"
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "Profile Updated Successfully",
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                image: user.image || "/photos/default-avatar.png",
                role: user.role
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});


// ============================
// GET ALL USERS (ADMIN)
// ============================
router.get("/users", async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});


module.exports = router;