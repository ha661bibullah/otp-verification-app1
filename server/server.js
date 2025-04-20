require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const twilio = require("twilio");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const otpStore = {};

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// ✅ OTP জেনারেট ফাংশন
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ SEND OTP
app.post("/send-otp", (req, res) => {
  const { email, phone } = req.body;
  const otp = generateOTP();

  if (phone) {
    otpStore[phone] = otp;

    client.messages
      .create({
        body: `আপনার OTP: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER, // যেমন +1 978 830 9714
        to: phone,
      })
      .then((msg) => {
        console.log("SMS sent:", msg.sid);
        res.send("SMS OTP পাঠানো হয়েছে");
      })
      .catch((err) => {
        console.error("SMS Error:", err.message);
        res.status(500).send("SMS পাঠাতে সমস্যা হয়েছে");
      });
  } else if (email) {
    otpStore[email] = otp;
    // Nodemailer ব্যবহার করে ইমেইল পাঠানোর কোড
    res.send("ইমেইলে OTP পাঠানো হয়েছে");
  } else {
    res.status(400).send("ইমেইল বা ফোন নম্বর প্রয়োজন");
  }
});

// ✅ VERIFY OTP
app.post("/verify-otp", (req, res) => {
  const { email, phone, otp } = req.body;

  const key = email || phone;
  if (otpStore[key] === otp) {
    delete otpStore[key];
    res.send("OTP সঠিকভাবে যাচাই হয়েছে");
  } else {
    res.status(400).send("ভুল OTP!");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
