let retryCount = 0;
const maxRetries = 5;
let timer;
let secondsLeft = 30;

function startTimer() {
  const resendBtn = document.getElementById("resend-btn");
  resendBtn.disabled = true;
  resendBtn.innerText = `পুনরায় পাঠাতে ${secondsLeft} সেকেন্ড অপেক্ষা করুন`;

  timer = setInterval(() => {
    secondsLeft--;
    resendBtn.innerText = `পুনরায় পাঠাতে ${secondsLeft} সেকেন্ড অপেক্ষা করুন`;

    if (secondsLeft <= 0) {
      clearInterval(timer);
      resendBtn.disabled = false;
      resendBtn.innerText = "পুনরায় OTP পাঠাও";
      secondsLeft = 30;
    }
  }, 1000);
}

function formatPhone(phone) {
  // 01712345678 ➜ +8801712345678
  if (phone.startsWith("0")) {
    return "+880" + phone.slice(1);
  }
  return phone;
}

function sendOTP() {
  const email = document.getElementById("email").value.trim();
  let phone = document.getElementById("phone").value.trim();

  if (!email && !phone) {
    alert("ইমেইল বা ফোন নম্বর ঠিকমতো লিখুন!");
    return;
  }

  if (phone) {
    phone = formatPhone(phone);
  }

  const data = email ? { email } : { phone };

  fetch("https://otp-verification-app1.onrender.com/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => {
      if (!res.ok) throw new Error("OTP পাঠাতে সমস্যা হয়েছে");
      return res.text();
    })
    .then((msg) => {
      document.getElementById("otp-section").style.display = "block";
      document.getElementById("message").style.color = "green";
      document.getElementById("message").innerText = msg;
      startTimer();
    })
    .catch((err) => {
      document.getElementById("message").style.color = "red";
      document.getElementById("message").innerText = err.message;
    });
}

function verifyOTP() {
  const email = document.getElementById("email").value.trim();
  let phone = document.getElementById("phone").value.trim();
  const otp = document.getElementById("otp").value.trim();

  if (!otp) {
    alert("OTP দিন!");
    return;
  }

  if (phone) {
    phone = formatPhone(phone);
  }

  const data = email ? { email, otp } : { phone, otp };

  fetch("https://otp-verification-app1.onrender.com/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => {
      if (!res.ok) throw new Error("ভুল OTP!");
      return res.text();
    })
    .then((msg) => {
      document.getElementById("message").style.color = "green";
      document.getElementById("message").innerText = msg;
      document.getElementById("otp-section").style.display = "none";
      retryCount = 0;
    })
    .catch((err) => {
      retryCount++;
      document.getElementById("message").style.color = "red";
      document.getElementById("message").innerText = err.message;

      if (retryCount >= maxRetries) {
        alert("৫ বার ভুল দিয়েছেন! অনুগ্রহ করে একটু পরে চেষ্টা করুন।");
        document.getElementById("verify-btn").disabled = true;
      }
    });
}
