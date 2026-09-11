const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const upload = require("../middleware/upload");
const { sendVerificationCode } = require("../utils/sendEmail");

const User = require("../models/user");

const router = express.Router();

// ============================
// Passport Google Strategy
// ============================
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "https://ms-computer-production.up.railway.app/api/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("🔍 Google Profile:", profile.id, profile.emails?.[0]?.value);

        const email = profile.emails?.[0]?.value?.toLowerCase();
        const name = profile.displayName || "Google User";
        const image = profile.photos?.[0]?.value || "/photos/default-avatar.png";

        if (!email) {
            return done(new Error("No email from Google"), null);
        }

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                name,
                email,
                password: "google_" + profile.id,
                image,
                isVerified: true,
                role: "user"
            });
            await user.save();
            console.log("✅ New user created via Google:", email);
        } else {
            if (!user.image || user.image === "/photos/default-avatar.png") {
                user.image = image;
                await user.save();
            }
            console.log("✅ Existing user logged in via Google:", email);
        }

        return done(null, user);

    } catch (err) {
        console.error("❌ Google Strategy Error:", err);
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// ============================
// Helper: Generate 6-digit code
// ============================
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================
// Generate Token
// ============================
function generateToken(user) {
    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET || "MSCOMPUTER_SECRET",
        {
            expiresIn: "7d"
        }
    );
}

// ============================
// Register
// ============================
router.post("/register", async (req, res) => {
    try {
        const name = req.body.name?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password?.trim();
        const phone = req.body.phone?.trim() || "";

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        let user;
        if (existingUser) {
            existingUser.name = name;
            existingUser.password = hashedPassword;
            existingUser.phone = phone;
            existingUser.verificationCode = verificationCode;
            existingUser.verificationCodeExpires = expiresAt;
            user = await existingUser.save();
        } else {
            user = new User({
                name,
                email,
                password: hashedPassword,
                phone,
                isVerified: false,
                verificationCode,
                verificationCodeExpires: expiresAt
            });
            await user.save();
        }

        const emailResult = await sendVerificationCode(email, verificationCode, name);

        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: "Failed to send verification code. Please try again."
            });
        }

        res.status(201).json({
            success: true,
            message: "Verification code sent to your email",
            email: email
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
// Verify Email
// ============================
router.post("/verify-email", async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const code = req.body.code?.trim();

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: "Email and code are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email already verified"
            });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification code"
            });
        }

        if (new Date() > user.verificationCodeExpires) {
            return res.status(400).json({
                success: false,
                message: "Verification code expired"
            });
        }

        user.isVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        await user.save();

        const token = generateToken(user);

        res.json({
            success: true,
            message: "Account verified successfully",
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
// Resend Code
// ============================
router.post("/resend-code", async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email already verified"
            });
        }

        const verificationCode = generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        user.verificationCode = verificationCode;
        user.verificationCodeExpires = expiresAt;
        await user.save();

        const emailResult = await sendVerificationCode(email, verificationCode, user.name);

        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: "Failed to send verification code"
            });
        }

        res.json({
            success: true,
            message: "Verification code resent"
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

        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Please verify your email first",
                needsVerification: true,
                email: email
            });
        }

        const token = generateToken(user);

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
// Google OAuth - Start
// ============================
router.get("/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);

// ============================
// Google OAuth - Callback
// ============================
router.get("/google/callback",
    passport.authenticate("google", {
        failureRedirect: "https://ms-computer-wheat.vercel.app/login.html?error=google_failed",
        session: false
    }),
    (req, res) => {
        try {
            const user = req.user;
            const token = generateToken(user);

            const userData = encodeURIComponent(JSON.stringify({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                image: user.image || "/photos/default-avatar.png",
                role: user.role
            }));

            res.redirect(
                `https://ms-computer-wheat.vercel.app/google-callback.html?token=${token}&user=${userData}`
            );

        } catch (err) {
            console.log(err);
            res.redirect("https://ms-computer-wheat.vercel.app/login.html?error=server_error");
        }
    }
);

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
        const users = await User.find().select("-password -verificationCode");
        res.json(users);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});

// ============================
// ✅ UPDATE USER ROLE (ADMIN)
// ============================
router.put("/users/:id", async (req, res) => {
    try {
        const { role } = req.body;

        if (!role || !["user", "admin"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select("-password -verificationCode");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "User role updated successfully",
            user
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
// ✅ DELETE USER (ADMIN)
// ============================
router.delete("/users/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});

module.exports = router;