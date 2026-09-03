// Đổi URL này thành địa chỉ backend FastAPI của bạn khi triển khai thật
// (vd: https://your-api.onrender.com) — mặc định trỏ tới localhost lúc phát triển.
const API_URL = "http://localhost:8000";

const form = document.getElementById("predict-form");
const resultBox = document.getElementById("result");
const errorBox = document.getElementById("error");
const submitBtn = document.getElementById("submit-btn");

function riskClass(level) {
  if (level === "Thấp") return "low";
  if (level === "Trung bình") return "medium";
  return "high";
}

function showResult(data) {
  errorBox.classList.add("hidden");
  const pct = Math.round(data.probability * 100);
  const cls = riskClass(data.risk_level);
  const barColor = cls === "low" ? "#2f9e5c" : cls === "medium" ? "#d9a441" : "#c0504d";

  resultBox.innerHTML = `
    <h2>${data.label}</h2>
    <div class="prob">Xác suất mô hình dự đoán: <strong>${pct}%</strong></div>
    <span class="badge ${cls}">Mức nguy cơ: ${data.risk_level}</span>
    <div class="bar-bg">
      <div class="bar-fill" style="width:${pct}%; background:${barColor}"></div>
    </div>
  `;
  resultBox.classList.remove("hidden");
}

function showError(message) {
  resultBox.classList.add("hidden");
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    gender: document.getElementById("gender").value,
    age: Number(document.getElementById("age").value),
    hypertension: Number(document.getElementById("hypertension").value),
    heart_disease: Number(document.getElementById("heart_disease").value),
    smoking_history: document.getElementById("smoking_history").value,
    bmi: Number(document.getElementById("bmi").value),
    hbA1c_level: Number(document.getElementById("hbA1c_level").value),
    blood_glucose_level: Number(document.getElementById("blood_glucose_level").value),
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Đang dự đoán...";

  try {
    const res = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Lỗi API (mã ${res.status})`);
    }

    const data = await res.json();
    showResult(data);
  } catch (err) {
    showError(
      `Không thể kết nối tới API: ${err.message}. Hãy đảm bảo backend đang chạy tại ${API_URL}.`
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Dự đoán";
  }
});
