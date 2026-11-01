# CHECKLIST – Chánh Điện Online 3.0

> Tiến độ được đánh dấu khi code tương ứng đã được cập nhật và kiểm tra cơ bản. Kết quả QA và blocker tại `docs/V3_QA_RUNBOOK.md`. **Không đánh dấu hoàn thành mỹ thuật/production nếu chưa nghiệm thu trên OBS.** 
> Phát triển trên nhánh `feature/v3-art-production` (PR #5 dựa trên nhánh QA V3), PR review trước khi merge vào `main`.

## A. Kiểm tra hiện trạng / chuẩn hoá
- [x] Kiểm tra PR #1, nhánh 2.0, cấu trúc assets/overlay/control/server
- [x] Đối chiếu giới hạn sprite gốc: chỉ 3 animation strips, trang phục cao cấp chưa phải rig artist-authored
- [ ] Phê duyệt một master concept 1080x1920 có vùng safe-area TikTok chính xác
- [x] Viết đặc tả Art Bible V3 (bản nháp v0.1), palette, độ sâu và tiêu chí QA trong `docs/V3_ART_BIBLE.md`
- [ ] Duyệt Art Bible và concept master trực quan trước khi khóa tài sản

## B. Chánh điện / asset chất lượng sản xuất
- [x] Tạo lớp sàn sạch phủ vùng ghế cũ, bồ đoàn động và cửa tiền cảnh dạng SVG (bản kỹ thuật dùng để tích hợp)
- [ ] Thay bản SVG kỹ thuật bằng asset cinematic artist-authored đúng concept (chưa thể xác nhận bản nền mới hoạt động trong ứng dụng)
- [ ] Sàn, phản xạ, vật thể che trước nhân vật và các lớp ánh sáng, khói
- [x] Triển khai seat map 24/36/64/100 với lối giữa và lớp bồ đoàn động
- [x] Kiểm tra tính duy nhất tọa độ và lối đi bằng 17 phép thử thực thi độc lập
- [ ] Visual QA đường đi nhân vật, va chạm và seat map trên browser/OBS
- [x] Dựng art WebP Vườn Sen / Sân Hoa Đăng và bổ sung chuyển cảnh crossfade trong V3 Art Engine (gói ZIP + code)
- [ ] Cài file bitmap hai cảnh phụ vào repo và kiểm tra bằng screenshot Chromium/OBS, duyệt mỹ thuật
- [x] Tích hợp bước tự chụp overlay 24/36/64/100 trong bài test browser (chưa chạy)
- [x] Chụp và kiểm tra bước đầu snapshot 24/36/64/100 + 36/100 Full HD
- [ ] Phê duyệt chất lượng UI theo master concept trên 2 kích thước; nickname 100 người còn khó đọc

## C. Nhân vật và chuyển động
- [x] Tạo 7 atlas × 8 frame nội suy chuyển động từ ảnh GPT và xuất 8 sprite nhân vật (bản demo 2.5D)
- [ ] Rig nhân vật chuyên nghiệp cho đủ 7 skin; artist-authored outfit cho mỗi tư thế, chưa đạt bởi atlas nội suy
- [x] Giữ và tích hợp sprite gốc đi vào / quỳ / ngồi
- [x] Premium SVG, sprite dye + hoa văn chạy theo các khung hiện có
- [ ] Animation chân/tay thực với chắp tay, dâng hoa, tặng đèn, đứng dậy, rời điện
- [ ] Tên nickname tránh chồng, camera theo hàng và vật phẩm không che mặt
- [x] Đo FPS CI 100 người: 13,5 trước tối ưu → 52–60 FPS sau cache stage/label (không phải OBS)
- [x] Tích hợp cache nền/chỗ ngồi và nhãn tên; đo cải thiện trong GitHub Actions
- [ ] Đo đạt >=30 FPS ổn định với 100 nhân vật trên máy phát TikTok LIVE/OBS thực tế

## D. Gift events
- [x] Danh mục ánh xạ 21 gift + tier 500 / 1000 / 3000 / 10000
- [x] Vòng sáng, lời tri ân, vật phẩm và hàng đợi hiệu ứng cấp cao
- [x] Tích hợp 21 chữ ký VFX Canvas, mỗi lượt 1 cinematic toàn màn hình, hàng đợi giới hạn 8, chế độ giảm chuyển động và giảm particle khi đông người
- [x] Bổ sung test ánh xạ 21 món quà và renderer VFX tại `live/gift-cinematics.test.mjs`
- [ ] 21 cinematic artist-authored đúng phong cách concept, có intro/main/outro được nghiệm thu trên OBS
- [x] Sửa luồng banner: khôi phục nội dung tụng sau khi hàng đợi quà VIP hoàn tất
- [x] Sửa hàng đợi TTS tồn đọng trước khi mở âm thanh; xử lý phát lại khi trình duyệt từ chối autoplay
- [ ] Kiểm thử thực tế TTS không chen câu kinh, giảm motion và âm lượng trên OBS
- [ ] Xác minh giftId và giá trị quà với phiên TikTok thật

## E. Admin — studio mô phỏng minh bạch
- [x] Mô-đun mô phỏng phân biệt ID mẫu, số liệu quà ảo và người thật
- [x] Menu admin thêm người mẫu, chọn skin, chọn 21 món quà, số lượng
- [x] Giả lập tặng quà thủ công cho người mẫu với Gift Engine/animation đúng cấp
- [x] Giả lập tặng quà tự động: 21 quà, nhóm nhỏ/cao cấp, chọn người nhận, nhịp phát, giới hạn 60 lượt
- [x] Nút dừng, làm sạch nhật ký sự kiện quà ảo và trạng thái phát trong Admin
- [x] 4 scenario mẫu: vào điện, hoa, premium, đông người; dừng/xóa
- [x] Nhân vật/quà mô phỏng gắn nhãn MẪU / MÔ PHỎNG trên overlay
- [x] Người mẫu không thể chiếm chỗ làm người thật bị đá khỏi phòng
- [x] Mặc định chỉ offline; khi có kết nối LIVE muốn hiển thị demo phải bật tùy chọn rõ ràng
- [x] Kiểm tra cú pháp JavaScript giao diện admin, overlay và server sau nâng cấp
- [x] Viết bài test Chromium mô phỏng Admin/overlay và 4 mật độ ghế tại `live/browser-smoke.mjs`
- [x] Chạy đạt bài test Chromium trong CI – Actions #41325391901 và #41325873371 PASS
- [ ] Duyệt UX điện thoại/OBS theo screenshot master concept và các trường hợp gift cao
- [x] Playwright kiểm tra 100 người + 5 quà VIP, ghi screenshot và FPS stress: 0,9–1,4 → 32–47 FPS trên CI sau tối ưu
- [ ] Stress toàn bộ 21 món quà và hàng đợi theo sự kiện TikTok thật, OBS trên máy phát

## F. QA / nghiệm thu
- [x] Kiểm tra tĩnh cú pháp JavaScript server/control/overlay/simulator
- [x] Bổ sung kiểm thử đơn vị cho lựa chọn quà ảo, chống gửi cho user thật, ngưỡng và giới hạn tần suất
- [x] Thêm `live/stage-geometry.test.mjs` cho 4 mật độ, đường đi và sự phù hợp renderer
- [x] Tạo GitHub Actions chạy `npm ci`, `npm test`, Chromium và xuất ảnh QA
- [x] Xác nhận `npm test` + Chromium PASS và lưu screenshot 24/36/64/100 (đợt CI #41325873371)
- [x] Có browser recording thật 42,68 giây (không phải video AI)
- [x] Thêm stress test và asset health-check; CI unit/browser PASS ở nhiều commit đã kiểm chứng
- [x] Unit/browser/audit PASS ở HEAD QA trước đó (workflow #41327217257)
- [ ] CI PASS trên HEAD nhánh art-production sau thay đổi, bản bitmap được cài đặt và UAT
- [x] Quay video 42,68 giây từ chính renderer Chromium trong CI để review logic
- [ ] Quay 30–45 giây từ OBS/TikTok LIVE Studio, có kiểm thử TTS/âm thanh và so sánh concept
- [x] Nâng `ws` 8.18.0 → 8.22.1 và thêm `npm audit --audit-level=high` vào CI; audit ở commit kiểm tra báo 0 vulnerabilities
- [ ] UAT, phân tích FPS/latency/độ ổn định và sửa P0/P1 trên OBS/TikTok thật
- [ ] Ready for Review → merge vào main sau khi chấp thuận

## G. Bộ mỹ thuật GPT – nghiệm thu V3

- [x] Tạo 3 bối cảnh 1080×1920 (chánh điện không có ghế cố định, vườn sen, sân hoa đăng), xử lý ảnh WebP
- [x] Tách riêng 8 ảnh nhân vật, 12 vật phẩm, 9 lớp VFX từ bảng art sinh bằng GPT
- [x] Tạo 7 spritesheet × 8 frame (nội suy 2D, không được đánh đồng với rig artist-authored)
- [x] Tạo gói art ZIP có hướng dẫn cài đặt và trình xem thử 2.5D, ảnh kiểm tra 24/36/64/100
- [x] Kết nối renderer V3 và fallback vào overlay; thêm Admin chuyển 3 cảnh
- [x] Viết unit test scene whitelist + fallback và browser test đồng bộ cấu hình Admin/overlay
- [x] Thêm manifest 39 ảnh WebP dự kiến và lệnh `npm run test:art` để xác minh file sau cài
- [ ] Đưa 39 file ảnh bitmap từ gói ZIP vào GitHub branch, chạy `npm run test:art` PASS
- [ ] Chụp ảnh và video Chromium khi bật asset V3 thật trên branch đã cài, kiểm tra không đè HUD/nhân vật
- [ ] Phê duyệt bộ concept/màu sắc/nhân vật với người phụ trách sản phẩm
- [ ] Hoàn thiện rig/texture 7 skin và toàn bộ 21 cinematic artist-authored (mở từ phần C/D)
- [ ] Nghiệm thu OBS/TikTok LIVE, TTS và benchmark tải trên phần cứng mục tiêu

## Các quy tắc dữ liệu mẫu
- Tạo người/quà ảo chỉ dùng để demo và QA, không mô phỏng giao dịch TikTok thật.
- Overlay công khai nhãn giả lập, không trộn điểm quà ảo vào bảng quà/người xem thật.
- Khi chỗ ngồi đầy, người mẫu không được đẩy người thật ra.
- Không có quy đổi quà ảo thành doanh thu.
