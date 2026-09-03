# Review Recommend App

Demo dự đoán khách hàng có **recommend sản phẩm** hay không, dựa trên nội dung đánh giá
(review text) — huấn luyện trên bộ *Women's Clothing E-Commerce Reviews*. Gồm 3 phần:

```
review-app/
├── backend/     # FastAPI - phục vụ mô hình TF-IDF + Logistic Regression (.pkl) qua API
├── web/         # HTML / CSS / JS thuần - giao diện web
├── mobile/      # React Native (Expo) - app di động
└── README.md
```

Cả web và mobile đều gọi chung 1 API: `POST /predict`.

> Backend chạy ở cổng **8002** (khác cổng 8000 của diabetes-app và 8001 của housing-app) để
> có thể chạy song song cả 3 demo.

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
# Đặt file Womens_Clothing_E-Commerce_Reviews.csv vào thư mục backend/, đổi tên thành reviews.csv
python3 train_and_save_model.py
```

Chạy server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8002
```

Kiểm tra API: mở `http://localhost:8002/docs` (Swagger UI tự sinh).

Ví dụ gọi thử bằng curl:

```bash
curl -X POST http://localhost:8002/predict \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Love it!",
    "review_text": "This dress fits perfectly and the fabric feels amazing. Highly recommend!"
  }'
```

---

## 2. Chạy Web

```bash
cd web
python3 -m http.server 5502
# rồi mở http://localhost:5502
```

Có 3 nút "Thử nhanh" (tích cực / tiêu cực / trung lập) để test ngay không cần gõ tay.
Mặc định `web/script.js` gọi API tại `http://localhost:8002` — nếu deploy backend ở nơi khác,
sửa biến `API_URL` ở đầu file.

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
- Android Emulator: dùng `http://10.0.2.2:8002` (không dùng `localhost`).
- Thiết bị thật cùng mạng Wi-Fi với máy chạy backend: dùng IP LAN, vd `http://192.168.1.10:8002`.
- Sau khi deploy backend lên server thật: dùng URL public.

---

## 4. Đưa lên GitHub

Từ thư mục gốc `review-app/`:

```bash
git init
git add .
git commit -m "Initial commit: review recommendation prediction app (backend + web + mobile)"
git branch -M main
git remote add origin https://github.com/<username>/<ten-repo>.git
git push -u origin main
```

Tạo repo trống trên GitHub trước (không tick "Initialize with README") rồi copy URL vào lệnh
`git remote add origin`. Có thể gộp chung với `diabetes-app/` và `housing-app/` vào cùng 1
mono-repo — cả 3 backend đã dùng cổng khác nhau (8000/8001/8002) nên chạy song song được.

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

### `POST /predict`

**Request body:**

```json
{
  "title": "Love it!",
  "review_text": "This dress fits perfectly and the fabric feels amazing. Highly recommend!"
}
```

`title` không bắt buộc (có thể để rỗng `""`). Lưu ý: mô hình huấn luyện trên dữ liệu **tiếng Anh**,
nhập review tiếng Việt sẽ cho kết quả kém chính xác hơn nhiều.

**Response:**

```json
{
  "recommended": 1,
  "label": "Khách hàng có khả năng recommend sản phẩm",
  "probability": 0.9978,
  "sentiment_level": "Tích cực"
}
```

## Về mô hình

- **Thuật toán**: TF-IDF (unigram + bigram, 20.000 từ) + Logistic Regression (`class_weight="balanced"`)
- **Dữ liệu**: 22.641 đánh giá còn lại sau khi loại bỏ dòng thiếu `Review Text` (Title + Review Text được gộp làm đầu vào)
- **Kết quả trên tập test (20%)**: Accuracy 0.894, ROC-AUC 0.9435, F1-score lớp "Recommend" 0.9336,
  F1-score lớp "Không recommend" 0.7347 (lớp thiểu số ~18% dữ liệu)
- Xem chi tiết quá trình huấn luyện tại `backend/train_and_save_model.py`

**Hạn chế cần lưu ý**: mô hình chỉ dựa vào từ ngữ trong văn bản (bag-of-words), không hiểu ngữ
cảnh/phủ định phức tạp (ví dụ câu mỉa mai "great, it broke after one day" có thể bị dự đoán sai
theo hướng tích cực do có từ "great"). Đây là giới hạn cố hữu của TF-IDF so với các mô hình
hiểu ngôn ngữ sâu hơn (BERT, LLM).
