# Diabetes Risk App

Demo dự đoán nguy cơ tiểu đường từ các chỉ số lâm sàng, gồm 3 phần:

```
diabetes-app/
├── backend/     # FastAPI - phục vụ mô hình Random Forest (.pkl) qua API
├── web/         # HTML / CSS / JS thuần - giao diện web
├── mobile/      # React Native (Expo) - app di động
└── README.md
```

Cả web và mobile đều gọi chung 1 API: `POST /predict`.

---

## 1. Chạy Backend (FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Model đã được huấn luyện sẵn tại `backend/model/model.pkl`. Nếu muốn huấn luyện lại:

```bash
# Đặt file diabetes_dataset.csv vào thư mục backend/ trước
python3 train_and_save_model.py
```

Chạy server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Kiểm tra API: mở `http://localhost:8000/docs` (Swagger UI tự sinh).

Ví dụ gọi thử bằng curl:

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "Female", "age": 45, "hypertension": 0, "heart_disease": 0,
    "smoking_history": "never", "bmi": 27.3, "hbA1c_level": 6.1, "blood_glucose_level": 140
  }'
```

---

## 2. Chạy Web

Web là HTML/CSS/JS thuần, không cần build. Chỉ cần mở `web/index.html` bằng trình duyệt,
hoặc chạy 1 server tĩnh đơn giản:

```bash
cd web
python3 -m http.server 5500
# rồi mở http://localhost:5500
```

Mặc định `web/script.js` gọi API tại `http://localhost:8000`. Nếu deploy backend ở nơi khác,
sửa biến `API_URL` ở đầu file `script.js`.

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
- Android Emulator: dùng `http://10.0.2.2:8000` (không dùng `localhost`).
- Thiết bị thật cùng mạng Wi-Fi với máy chạy backend: dùng IP LAN, vd `http://192.168.1.10:8000`.
- Sau khi deploy backend lên server thật (Render, Railway, Fly.io...): dùng URL public.

---

## 4. Đưa lên GitHub

Từ thư mục gốc `diabetes-app/`:

```bash
git init
git add .
git commit -m "Initial commit: diabetes risk prediction app (backend + web + mobile)"
git branch -M main
git remote add origin https://github.com/<username>/<ten-repo>.git
git push -u origin main
```

Tạo repo trống trên GitHub trước (không tick "Initialize with README") rồi copy URL vào lệnh `git remote add origin`.

Ghi chú:
- File `.gitignore` đã loại `node_modules/`, `venv/`, file `.csv` gốc, cache Expo... để repo gọn nhẹ.
- Model `.pkl` (~vài MB) hiện **được commit** để người khác clone về chạy ngay không cần huấn luyện lại.
  Nếu không muốn commit binary, bỏ comment dòng `backend/model/model.pkl` trong `.gitignore`.

---

## 5. Triển khai (deploy) gợi ý

| Thành phần | Gợi ý nền tảng |
|---|---|
| Backend (FastAPI) | Render, Railway, Fly.io, hoặc VPS + `uvicorn`/`gunicorn` |
| Web (tĩnh) | GitHub Pages, Netlify, Vercel |
| Mobile | Build APK/IPA bằng `eas build` (Expo Application Services) để chia sẻ ngoài Expo Go |

Sau khi backend có URL public, nhớ cập nhật `API_URL` ở cả `web/script.js` và `mobile/config.js`.

---

## API Reference

### `POST /predict`

**Request body:**

```json
{
  "gender": "Female",
  "age": 45,
  "hypertension": 0,
  "heart_disease": 0,
  "smoking_history": "never",
  "bmi": 27.3,
  "hbA1c_level": 6.1,
  "blood_glucose_level": 140
}
```

**Response:**

```json
{
  "prediction": 0,
  "label": "Không có nguy cơ tiểu đường",
  "probability": 0.0421,
  "risk_level": "Thấp"
}
```

Mô hình: Random Forest (200 cây, class_weight="balanced") huấn luyện trên Diabetes Clinical Dataset,
xem chi tiết quá trình huấn luyện/đánh giá tại `backend/train_and_save_model.py`.
