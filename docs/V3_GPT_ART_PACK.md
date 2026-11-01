# Chánh Điện Online V3 — GPT Cinematic Art Pack

Gói hình ảnh và bản xem thử 2.5D được tạo từ concept trong cuộc hội thoại. Giữ đúng khung hình **1080 × 1920, 9:16**, bố cục lối giữa, chánh điện gỗ đỏ và ánh sáng vàng. Không có bồ đoàn vẽ cố định trên nền; bồ đoàn được quản lý như đối tượng động.

## Thành phần

- **3 bối cảnh** WebP: Chánh Điện, Vườn Sen, Sân Hoa Đăng.
- **8 nhân vật tách nền**: nam, nữ, người cao tuổi, trẻ nhỏ, sư, ni, phiên bản cao cấp và một nhân vật an tọa.
- **7 atlas nhân vật, mỗi atlas 8 khung hình**: *chuyển động 2.5D nội suy từ ảnh gốc, chưa phải skeletal rig vẽ tay riêng cho từng khung hình.*
- **12 vật phẩm**: hoa sen, chuông, hương, bồ đoàn, tràng hạt, đèn, hào quang, banner, v.v.
- **9 lớp VFX cao cấp**: vòng sáng, trang phục, đài sen, tia sáng, dải ánh vàng, cánh hoa.
- **21 sprite quà tặng riêng** được tạo bằng phối lớp mỹ thuật GPT, dùng chung engine chuyển động. Các sprite này chưa thay thế cinematic artist-authored từng cảnh.
- **Mã nguồn preview** trong `live/`: `art-preview.html`, `cinematic-art.js`.
- **Bộ ảnh kiểm tra bố cục** trong `qa-preview/` cho 24, 36, 64, 100 người và hai cảnh phụ.

## Cài asset vào repository

Tải ZIP, giải nén, sau đó tại thư mục giải nén thực hiện:

```bash
./install_into_repo.sh /duong-dan/toi/chanh-dien-online
```

Hoặc chỉ sao chép toàn bộ thư mục `assets/art_v3/` vào repository; code trên nhánh `feature/v3-art-production` sử dụng đường dẫn `/assets/art_v3/...` và tự fallback nếu chưa có asset. **Chỉ chạy app trên nhánh code V3 tương ứng.**

Bản demo độc lập: giải nén, trong thư mục gốc chạy `python -m http.server 8765`, sau đó truy cập `http://localhost:8765/live/art-preview.html` bằng trình duyệt. Chọn scene, thêm nhân vật mẫu, phát quà ảo hoặc chạy kịch bản tự động.

## Trạng thái và phạm vi QA

**Đã làm**: asset trích xuất/tách nền, nén WebP, scene art, nội suy atlas, bộ ảnh bố cục và engine preview. Mã nguồn giao diện đã được kiểm tra cú pháp; các ảnh xuất kiểm tra bằng Pillow.

**Còn phải nghiệm thu**: hoạt ảnh có rig artist-authored thực sự (đặc biệt đi, rẽ, quỳ, đứng dậy), 21 cinematic quà *theo cảnh artist-authored* với camera, ảnh render thật ở OBS, lệnh TTS/TikTok LIVE, FPS/latency trên máy phát, nghiệm thu sản phẩm cuối. Vì môi trường trình duyệt container chặn việc mở URL, bản preview không được đánh dấu là Playwright browser PASS tại đây.

**Chế độ giả lập có nhãn**: bản demo không mô phỏng người thật hoặc giao dịch TikTok thật; người và quà đều ghi `MÔ PHỎNG / QUÀ ẢO`. Giá trị quà chỉ là số liệu thử nghiệm.

## Lưu ý mỹ thuật

Các ảnh mẫu nhân vật và lớp áo cao cấp được sinh từ GPT rồi cắt/tối ưu bằng code. Một số asset nền trong suốt có phần phát sáng; phiên bản WebP vẫn giữ alpha. Do nguồn ảnh gốc không phải file nhiều layer, không thể suy ra bộ animation 3D/skeletal hoàn chỉnh chỉ bằng tách sprite.
## Chứng cứ QA đợt đóng gói

- Asset ZIP: 60 WebP, gồm 3 cảnh, 8 sprite nhân vật, 7 atlas 8 khung, 12 vật phẩm, 9 lớp VFX và 21 sprite quà.
- Kiểm tra offline Pillow và JS: **129/129 PASS** (độ phân giải cảnh, alpha, atlas, tồn tại file, video minh họa).
- Video 17 giây xuất từ bộ art bằng trình dựng ảnh, **không phải video chụp trực tiếp từ overlay/OBS**.
- Bộ ảnh raster trong ZIP cần đưa vào repository trước khi chạy `npm run test:art` và nghiệm thu Chromium/OBS thực tế.
