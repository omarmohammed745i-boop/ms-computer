const axios = require("axios");

// =====================================
// Brevo API Configuration
// =====================================
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.EMAIL_USER || "omarmohammed745i@gmail.com";
const SENDER_NAME = "MS Computer";

// =====================================
// دالة إرسال كود التحقق
// =====================================
async function sendVerificationCode(email, code, name) {
    try {
        const emailData = {
            sender: {
                name: SENDER_NAME,
                email: SENDER_EMAIL
            },
            to: [
                {
                    email: email,
                    name: name
                }
            ],
            subject: "🔐 Verification Code - MS Computer",
            htmlContent: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #0a0e17;
                            margin: 0;
                            padding: 40px 20px;
                        }
                        .container {
                            max-width: 500px;
                            margin: 0 auto;
                            background: linear-gradient(135deg, #1a1f2e, #0f1419);
                            border-radius: 20px;
                            padding: 40px;
                            border: 1px solid #00d4b4;
                            box-shadow: 0 10px 40px rgba(0, 212, 180, 0.2);
                        }
                        .logo {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .logo h1 {
                            color: #00d4b4;
                            font-size: 28px;
                            margin: 0;
                            letter-spacing: 3px;
                        }
                        .content {
                            color: #e0e0e0;
                            text-align: center;
                        }
                        .content h2 {
                            color: #ffffff;
                            font-size: 22px;
                            margin-bottom: 15px;
                        }
                        .content p {
                            font-size: 15px;
                            line-height: 1.6;
                            color: #a0a0a0;
                        }
                        .code-box {
                            background: #00d4b4;
                            color: #0a0e17;
                            font-size: 36px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            padding: 20px;
                            border-radius: 12px;
                            margin: 25px 0;
                            text-align: center;
                        }
                        .footer {
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #2a2f3e;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="logo">
                            <h1>MS COMPUTER</h1>
                        </div>
                        <div class="content">
                            <h2>مرحباً ${name} 👋</h2>
                            <p>شكراً لتسجيلك في MS Computer. استخدم الكود التالي لتفعيل حسابك:</p>
                            
                            <div class="code-box">${code}</div>
                            
                            <p>الكود صالح لمدة <strong>10 دقائق</strong> فقط.</p>
                            <p>لو مش انت اللي عملت الحساب، تجاهل الإيميل ده.</p>
                        </div>
                        <div class="footer">
                            <p>© 2026 MS Computer. All Rights Reserved.</p>
                            <p>Alexandria, Egypt</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        console.log("📧 Sending email to:", email);
        console.log("📧 From:", SENDER_EMAIL);
        console.log("📧 API Key exists:", !!BREVO_API_KEY);

        const response = await axios.post(BREVO_API_URL, emailData, {
            headers: {
                "accept": "application/json",
                "api-key": BREVO_API_KEY,
                "content-type": "application/json"
            },
            timeout: 15000
        });

        console.log("✅ Email sent:", response.data.messageId);
        return { success: true, messageId: response.data.messageId };

    } catch (err) {
        console.error("❌ Brevo API error:");
        console.error("Status:", err.response?.status);
        console.error("Data:", err.response?.data);
        console.error("Message:", err.message);
        return { 
            success: false, 
            error: err.response?.data?.message || err.message 
        };
    }
}

// =====================================
// ✅ نتأكد من إعدادات Brevo عند البدء
// =====================================
if (BREVO_API_KEY) {
    console.log("✅ Brevo API Key configured");
    console.log("📧 Sender Email:", SENDER_EMAIL);
} else {
    console.error("❌ BREVO_API_KEY is missing in environment variables");
}

module.exports = { sendVerificationCode };