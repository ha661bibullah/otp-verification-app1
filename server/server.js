const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const twilio = require("twilio");

const app = express();

// ✅ Twilio config
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ✅ CORS সঠিকভাবে (Netlify frontend URL দিন এখানে)
app.use(cors({
  origin: "https://euphonious-marzipan-bc8af5.netlify.app",  // ← Netlify live URL
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

app.use(express.json());

// ✅ Static ফাইল সার্ভ করবে (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

let otpStore = {};

// ✅ Nodemailer config (Gmail দিয়ে ইমেইল পাঠানো)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ OTP পাঠানোর route
app.post("/send-otp", (req, res) => {
  const { email, phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email || phone] = otp;

  // ইমেইলে পাঠানো
  if (email) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) return res.status(500).send("Email send failed");
      return res.send("OTP sent successfully via Email");
    });
  }

  // ফোনে SMS পাঠানো
  if (phone) {
    client.messages.create({
      body: `Your OTP code is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    })
    .then(message => {
      return res.send("OTP sent successfully via SMS");
    })
    .catch(error => {
      return res.status(500).send("SMS send failed");
    });
  }
});

// ✅ OTP যাচাই করার route
app.post("/verify-otp", (req, res) => {
  const { email, phone, otp } = req.body;
  if (otpStore[email || phone] === otp) {
    delete otpStore[email || phone];  // OTP একবার ব্যবহার হলে মুছে ফেলবো
    return res.send("OTP verified successfully");
  } else {
    return res.status(400).send("Invalid OTP");
  }
});

// ✅ সার্ভার চালু
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
