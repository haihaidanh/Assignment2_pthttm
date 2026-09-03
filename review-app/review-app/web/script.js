// Đổi URL này thành địa chỉ backend FastAPI của bạn khi triển khai thật.
const API_URL = "http://localhost:8002";

const form = document.getElementById("predict-form");
const resultBox = document.getElementById("result");
const errorBox = document.getElementById("error");
const submitBtn = document.getElementById("submit-btn");
const titleInput = document.getElementById("title");
const textInput = document.getElementById("review_text");

function sentimentClass(level) {
  if (level === "Tiêu cực") return "negative";
  if (level === "Trung lập") return "neutral";
  return "positive";
}

function showResult(data) {
  errorBox.classList.add("hidden");
  const pct = Math.round(data.probability * 100);
  const cls = sentimentClass(data.sentiment_level);
  const barColor = cls === "negative" ? "#c0504d" : cls === "neutral" ? "#d9a441" : "#2f9e5c";

  resultBox.innerHTML = `
    <h2>${data.label}</h2>
    <div class="prob">Xác suất recommend theo mô hình: <strong>${pct}%</strong></div>
    <span class="badge ${cls}">Cảm xúc: ${data.sentiment_level}</span>
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
    title: titleInput.value,
    review_text: textInput.value,
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Đang phân tích...";

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
    submitBtn.textContent = "Phân tích";
  }
});

document.querySelectorAll(".example-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    textInput.value = btn.dataset.text;
    titleInput.value = "";
  });
});
