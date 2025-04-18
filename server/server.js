// // শুধু জিমেইল ভেরিফিকেশনের কোড
// const express = require("express");
// const nodemailer = require("nodemailer");
// const path = require("path");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();

// // ✅ CORS সেটআপ (শুধু একবার এবং সঠিকভাবে)
// app.use(cors({
//   origin: "https://otp-verification-app-nj90.onrender.com", // তোমার frontend live URL
//   methods: ["GET", "POST", "OPTIONS"],
//   credentials: true
// }));

// app.use(express.json());

// // ✅ Static frontend serve (HTML, CSS, JS ফাইল public ফোল্ডার থেকে দেখাবে)
// app.use(express.static(path.join(__dirname, "public")));

// let otpStore = {};

// // ✅ Nodemailer config
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // ✅ Send OTP route
// app.post("/send-otp", (req, res) => {
//   const { email } = req.body;
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   otpStore[email] = otp;

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Your OTP Code",
//     text: `Your OTP code is ${otp}`,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) return res.status(500).send("Email send failed");
//     res.send("OTP sent successfully");
//   });
// });

// // ✅ Verify OTP route
// app.post("/verify-otp", (req, res) => {
//   const { email, otp } = req.body;
//   if (otpStore[email] === otp) {
//     delete otpStore[email];
//     res.send("OTP verified successfully");
//   } else {
//     res.status(400).send("Invalid OTP");
//   }
// });

// // ✅ Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));





const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const twilio = require("twilio");
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);   // Twilio client

const app = express();

// ✅ CORS সেটআপ (শুধু একবার এবং সঠিকভাবে)
app.use(cors({
  origin: "https://otp-verification-app-nj90.onrender.com", // তোমার frontend live URL
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

app.use(express.json());

// ✅ Static frontend serve (HTML, CSS, JS ফাইল public ফোল্ডার থেকে দেখাবে)
app.use(express.static(path.join(__dirname, "public")));

let otpStore = {};

// ✅ Nodemailer config (ইমেইল OTP পাঠানোর জন্য)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Send OTP route
app.post("/send-otp", (req, res) => {
  const { email, phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email || phone] = otp;

  // যদি ইমেইল দেওয়া থাকে
  if (email) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) return res.status(500).send("Email send failed");
      res.send("OTP sent successfully via Email");
    });
  }

  // যদি ফোন নম্বর দেওয়া থাকে
  if (phone) {
    client.messages.create({
      body: `Your OTP code is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER, // Twilio phone number
      to: phone,
    })
    .then(message => {
      res.send("OTP sent successfully via SMS");
    })
    .catch(error => {
      res.status(500).send("SMS send failed");
    });
  }
});

// ✅ Verify OTP route
app.post("/verify-otp", (req, res) => {
  const { email, phone, otp } = req.body;
  if (otpStore[email || phone] === otp) {
    delete otpStore[email || phone];  // OTP যাচাই হলে সেটি মুছে ফেলা হবে
    res.send("OTP verified successfully");
  } else {
    res.status(400).send("Invalid OTP");
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// যুক্ত করা হয়েছে in github
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// 👉 Static file serve
app.use(express.static(path.join(__dirname, "../client")));

// ✅ API Routes
app.post("/send-email-otp", (req, res) => {
  // Email OTP logic
});

app.post("/send-sms-otp", (req, res) => {
  // SMS OTP logic
});

// 👉 Serve index.html for all routes (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

