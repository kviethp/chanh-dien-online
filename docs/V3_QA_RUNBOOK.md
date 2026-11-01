# V3 QA – Kết quả và quy trình nghiệm thu (01/11/2026)

## Bằng chứng đã có

- GitHub Actions [41325391901](https://github.com/kviethp/chanh-dien-online/actions/runs/41325391901): **PASS unit + Chromium** trên `ubuntu-24.04`.
- Actions [41325873371](https://github.com/kviethp/chanh-dien-online/actions/runs/41325873371): **PASS**, quay video thực tế từ Chromium overlay (42,68 giây, 540×960), snapshot 24/36/64/100 và 36/100 Full HD.
- Artifacts nằm trong phần `live-v3-browser-screenshots` của workflow run. Video là **browser capture**, chưa phải OBS capture.
- Unit tests pass, 21/21 tên quà được ánh xạ vào Gift Engine; mock tags/metrics tách khỏi người xem thật.
- Chromium baseline 100 người: khoảng **13,5 FPS** trong CI runner lúc chưa cache static backdrop; không thể ngoại suy sang OBS/máy livestream.

## Các vấn đề phát hiện từ screenshot thật

| Mã | Phát hiện | Xử lý | Nghiệm thu |
|---|---|---|---|
| UI-01 | Banner quà che vùng tượng Phật | Đã chuyển về lower third, giảm kích thước | CI Chromium PASS; xem screenshot sau sửa |
| UI-02 | Nút bật âm thanh chắn nhiều nhân vật | Đã thu nhỏ và dời xuống; bộ test bấm mở tiếng trước khi chụp | Đã xác nhận UI điều khiển; vẫn cần OBS |
| UI-03 | Nickname 64/100 người quá dày | Thu nhỏ font, nhãn MẪU rút gọn, thêm label texture cache | Cần so sánh 1080×1920 trên màn hình LIVE |
| RENDER-01 | Nền và bồ đoàn bị vẽ lại từng frame | Cache stage theo số ghế (LRU 2 cấu hình) | Cần kiểm tra FPS CI sau tối ưu và kiểm thử máy phát |
| AUDIO-01 | TTS đến trước khi bật âm thanh có thể bị treo hàng đợi | Gọi playTTS() khi bật âm thanh, tiếp tục queue nếu phát lỗi | Đã tích hợp; chưa có integration test TTS thật |
| ART-01 | 100 người khó đọc nickname đồng thời trên điện thoại | Cho phép thu gọn; thiết kế focus + nhãn đủ lớn khi gửi quà | Cần duyệt UI |
| ART-02 | Trang phục vẫn là sprite nhuộm màu, chưa có rig 7 skin artist-authored | Chưa giải quyết | BLOCKER chất lượng concept |
| MEDIA-01 | Video và ảnh trong CI không có TTS xác minh | Chưa giải quyết | BLOCKER production |
| PERF-01 | CI 100 người dưới 30 FPS mục tiêu | Đang tối ưu | BLOCKER performance |
| SECURITY-01 | `npm ci` báo 1 cảnh báo high-severity từ dependency | Cần `npm audit`, xác định dependency, nâng version có kiểm thử | BLOCKER phát hành |

## Thực thi kiểm thử

Chạy tại thư mục `live/`:

```bash
npm ci
npm test
npm install --no-save --package-lock=false playwright@1.56.1
npx playwright install --with-deps chromium
node browser-smoke.mjs
```

Với GitHub Actions, runner được cố định **ubuntu-24.04** vì Playwright 1.56.1 không hỗ trợ cài đặt trên ubuntu-26.04. Sử dụng nút Artifacts trong CI để lấy snapshot và video.

## Các gate bắt buộc trước khi merge vào main

1. `unit` và `browser` đều PASS ở **commit HEAD cuối**, không chỉ một commit cũ.
2. Không còn P0/P1 ở luồng xếp ghế, nhập điện, Gift Engine, quản trị, nhãn demo và TTS.
3. Screenshot từ bản chạy thực tế (1080×1920) được PO/QA duyệt theo master concept.
4. Chạy 24/36/64/100 người, đo FPS trên máy livestream đích đồng thời quay OBS, mục tiêu **>=30 FPS ổn định**.
5. Nghiệm thu 21 quà và 7 bộ nhân vật hoàn chỉnh, trang phục không lệch theo frame.
6. Đối chiếu mapping Gift ID/giá trị từ TikTok thực, kiểm thử reconnect, thử nghiệm phiên LIVE thật.
7. PR được đổi từ Draft sang Ready chỉ sau khi có bằng chứng thỏa các mục liên quan.

**Trạng thái:** bản hiện tại là testable prototype, không phải release production.
