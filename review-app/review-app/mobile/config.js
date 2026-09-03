// Đổi thành địa chỉ backend FastAPI thật khi triển khai.
// Lưu ý khi test bằng máy thật/emulator:
// - Android Emulator: dùng http://10.0.2.2:8002 thay vì localhost
// - Thiết bị thật: dùng địa chỉ IP LAN của máy chạy backend, vd http://192.168.1.10:8002
// - Sau khi deploy backend lên server (Render/Railway/...), dùng URL public tại đây.
export const API_URL = "http://localhost:8002";
