// Đổi URL này thành địa chỉ backend FastAPI của bạn khi triển khai thật.
const API_URL = "http://localhost:8001";

const form = document.getElementById("predict-form");
const citySelect = document.getElementById("city");
const resultBox = document.getElementById("result");
const errorBox = document.getElementById("error");
const submitBtn = document.getElementById("submit-btn");

// Tải danh sách tỉnh/thành mô hình đã học từ API để đổ vào dropdown
async function loadCities() {
  try {
    const res = await fetch(`${API_URL}/cities`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    citySelect.innerHTML = "";
    data.cities.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      citySelect.appendChild(opt);
    });
    // thêm lựa chọn "Khác" cho các tỉnh không có trong danh sách huấn luyện
    const other = document.createElement("option");
    other.value = "__other__";
    other.textContent = "Khác (tỉnh/thành không có trong danh sách)";
    citySelect.appendChild(other);
  } catch {
    citySelect.innerHTML = '<option value="Hồ Chí Minh">Hồ Chí Minh (mặc định - không tải được API)</option>';
  }
}

function showResult(data) {
  errorBox.classList.add("hidden");
  resultBox.innerHTML = `
    <div class="price-label">Giá ước tính</div>
    <div class="price">${data.predicted_price_display}</div>
    <span class="sub">~ ${data.price_per_m2_million_vnd.toLocaleString("vi-VN")} triệu VND / m²</span>
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

  const cityVal = citySelect.value === "__other__" ? "Khác" : citySelect.value;

  const payload = {
    area_m2: Number(document.getElementById("area_m2").value),
    bedrooms: Number(document.getElementById("bedrooms").value),
    bathrooms: Number(document.getElementById("bathrooms").value),
    floors: Number(document.getElementById("floors").value),
    frontage: Number(document.getElementById("frontage").value),
    city: cityVal,
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Đang định giá...";

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
    submitBtn.textContent = "Định giá";
  }
});

loadCities();
