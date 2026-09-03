# House Price App

Demo định giá bất động sản dựa trên diện tích, số phòng, mặt tiền và tỉnh/thành, gồm 3 phần:

```
housing-app/
├── backend/     # FastAPI - phục vụ mô hình Random Forest Regressor (.pkl) qua API
├── web/         # HTML / CSS / JS thuần - giao diện web
├── mobile/      # React Native (Expo) - app di động
└── README.md
```

Cả web và mobile đều gọi chung 1 API: `POST /predict` (và `GET /cities` để lấy danh sách tỉnh/thành).

> Backend chạy ở cổng **8001** (khác với app "diabetes-app" dùng cổng 8000) để có thể chạy song song cả hai demo.

---

## 1. Chạy Backend (FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Model đã được huấn luyện sẵn tại `backend/model/model.pkl` (kèm `backend/model/city_list.json`
là danh sách 15 tỉnh/thành mô hình học riêng biệt, các tỉnh khác gộp vào nhóm "Other").

Nếu muốn huấn luyện lại:

```bash
# Đặt file house_buying_dec29th_2025.csv vào thư mục backend/ trước
python3 train_and_save_model.py
```

Chạy server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

Kiểm tra API: mở `http://localhost:8001/docs` (Swagger UI tự sinh).

Ví dụ gọi thử bằng curl:

```bash
curl -X POST http://localhost:8001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "area_m2": 60, "bedrooms": 3, "bathrooms": 2, "floors": 3,
    "frontage": 1, "city": "Hồ Chí Minh"
  }'
```

---

## 2. Chạy Web

Web là HTML/CSS/JS thuần, không cần build.

```bash
cd web
python3 -m http.server 5501
# rồi mở http://localhost:5501
```

Trang sẽ tự gọi `GET /cities` để đổ danh sách tỉnh/thành vào dropdown. Mặc định
`web/script.js` gọi API tại `http://localhost:8001` — nếu deploy backend ở nơi khác, sửa
biến `API_URL` ở đầu file.

---

## 3. Chạy Mobile (React Native / Expo)

```bash
cd mobile
npm install
npx expo start
```

- Quét mã QR bằng app **Expo Go** (Android/iOS) để chạy trên điện thoại thật.
- Hoặc nhấn `a` để mở Android Emulator, `i` để mở iOS Simulator.

**Lưu ý về địa chỉ API** (sửa trong `mobile/config.js`):
- Android Emulator: dùng `http://10.0.2.2:8001` (không dùng `localhost`).
- Thiết bị thật cùng mạng Wi-Fi với máy chạy backend: dùng IP LAN, vd `http://192.168.1.10:8001`.
- Sau khi deploy backend lên server thật: dùng URL public.

---

## 4. Đưa lên GitHub

Từ thư mục gốc `housing-app/`:

```bash
git init
git add .
git commit -m "Initial commit: house price prediction app (backend + web + mobile)"
git branch -M main
git remote add origin https://github.com/<username>/<ten-repo>.git
git push -u origin main
```

Tạo repo trống trên GitHub trước (không tick "Initialize with README") rồi copy URL vào lệnh `git remote add origin`.

Nếu muốn gộp chung với repo **diabetes-app** đã làm trước đó thành 1 mono-repo, có thể copy
thư mục `housing-app/` vào cùng cấp và commit chung — chỉ cần đổi cổng API cho khỏi trùng
(hiện tại đã là 8000 vs 8001).

---

## 5. Triển khai (deploy) gợi ý

| Thành phần | Gợi ý nền tảng |
|---|---|
| Backend (FastAPI) | Render, Railway, Fly.io, hoặc VPS + `uvicorn`/`gunicorn` |
| Web (tĩnh) | GitHub Pages, Netlify, Vercel |
| Mobile | Build APK/IPA bằng `eas build` (Expo Application Services) |

Sau khi backend có URL public, nhớ cập nhật `API_URL` ở cả `web/script.js` và `mobile/config.js`.

---

## API Reference

### `GET /cities`

```json
{ "cities": ["Bà Rịa Vũng Tàu", "Bình Dương", "Hà Nội", "..."] }
```

### `POST /predict`

**Request body:**

```json
{
  "area_m2": 60,
  "bedrooms": 3,
  "bathrooms": 2,
  "floors": 3,
  "frontage": 1,
  "city": "Hồ Chí Minh"
}
```

**Response:**

```json
{
  "predicted_price_million_vnd": 5914.3,
  "predicted_price_display": "5.91 tỷ VND",
  "price_per_m2_million_vnd": 98.57,
  "city_used": "Hồ Chí Minh"
}
```

Mô hình: Random Forest Regressor (200 cây) huấn luyện trên log(giá), Vietnam Real Estate Dataset.
R² ≈ 0.40 trên thang log — xem phân tích chi tiết và hạn chế của mô hình (thiếu vị trí chi tiết,
outlier giá trị thấp bất thường) tại chương "Nhận xét và Đánh giá chi tiết" trong báo cáo đầy đủ.
Xem `backend/train_and_save_model.py` để biết chi tiết quá trình huấn luyện.
