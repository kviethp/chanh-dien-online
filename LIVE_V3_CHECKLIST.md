# CHECKLIST – Chánh Điện Online 3.0

> Tiến độ được đánh dấu khi code tương ứng đã được cập nhật và kiểm tra cơ bản. **Không đánh dấu hoàn thành mỹ thuật/production nếu chưa nghiệm thu trên OBS.** 
> Phát triển trên nhánh `feature/v3-cinematic-stage-milestone` (PR riêng dựa trên nhánh admin V3), PR review trước khi merge vào `main`.

## A. Kiểm tra hiện trạng / chuẩn hoá
- [x] Kiểm tra PR #1, nhánh 2.0, cấu trúc assets/overlay/control/server
- [x] Đối chiếu giới hạn sprite gốc: chỉ 3 animation strips, trang phục cao cấp chưa phải rig artist-authored
- [ ] Phê duyệt một master concept 1080x1920 có vùng safe-area TikTok chính xác
- [x] Viết đặc tả Art Bible V3 (bản nháp v0.1), palette, độ sâu và tiêu chí QA trong `docs/V3_ART_BIBLE.md`
- [ ] Duyệt Art Bible và concept master trực quan trước khi khóa tài sản

## B. Chánh điện / asset chất lượng sản xuất
- [x] Tạo lớp sàn sạch phủ vùng ghế cũ, bồ đoàn động và cửa tiền cảnh dạng SVG (bản kỹ thuật dùng để tích hợp)
- [ ] Thay bản SVG kỹ thuật bằng asset cinematic artist-authored đúng concept
- [ ] Sàn, phản xạ, vật thể che trước nhân vật và các lớp ánh sáng, khói
- [x] Triển khai seat map 24/36/64/100 với lối giữa và lớp bồ đoàn động
- [x] Kiểm tra tính duy nhất tọa độ và lối đi bằng 17 phép thử thực thi độc lập
- [ ] Visual QA đường đi nhân vật, va chạm và seat map trên browser/OBS
- [ ] Hai cảnh phụ: Vườn sen / Hoa đăng, có chuyển cảnh cinematic
- [ ] Visual snapshot QA ở 4 mật độ ghế + 2 kích thước thiết bị

## C. Nhân vật và chuyển động
- [ ] Rig/atlas đồng bộ 7 skin; artist-authored outfits có ít nhất 8 trạng thái
- [x] Giữ và tích hợp sprite gốc đi vào / quỳ / ngồi
- [x] Premium SVG, sprite dye + hoa văn chạy theo các khung hiện có
- [ ] Animation chân/tay thực với chắp tay, dâng hoa, tặng đèn, đứng dậy, rời điện
- [ ] Tên nickname tránh chồng, camera theo hàng và vật phẩm không che mặt
- [ ] Kiểm thử hoạt ảnh 100 nhân vật / 30 FPS trên cấu hình máy live xác định

## D. Gift events
- [x] Danh mục ánh xạ 21 gift + tier 500 / 1000 / 3000 / 10000
- [x] Vòng sáng, lời tri ân, vật phẩm và hàng đợi hiệu ứng cấp cao
- [ ] 21 cinematic được dựng theo phong cách concept, có đủ intro/main/outro
- [ ] Hiệu ứng không cắt ngang kinh/tụng, giảm motion và âm lượng phù hợp
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
- [ ] Duyệt chức năng admin bằng test trình duyệt thật và kiểm tra UX điện thoại
- [ ] Kiểm thử luồng 100 người và hàng đợi 21 gift end-to-end

## F. QA / nghiệm thu
- [x] Kiểm tra tĩnh cú pháp JavaScript server/control/overlay/simulator
- [x] Bổ sung kiểm thử đơn vị cho lựa chọn quà ảo, chống gửi cho user thật, ngưỡng và giới hạn tần suất
- [x] Thêm `live/stage-geometry.test.mjs` cho 4 mật độ, đường đi và sự phù hợp renderer
- [ ] Chạy đầy đủ npm test trên branch đã pull và kiểm chứng GIF/asset
- [ ] Quay 30–45 giây từ renderer thật (OBS), không dùng storyboard AI thay thế
- [ ] UAT, phân tích FPS/latency/độ ổn định và sửa P0/P1
- [ ] Ready for Review → merge vào main sau khi chấp thuận

## Các quy tắc dữ liệu mẫu
- Tạo người/quà ảo chỉ dùng để demo và QA, không mô phỏng giao dịch TikTok thật.
- Overlay công khai nhãn giả lập, không trộn điểm quà ảo vào bảng quà/người xem thật.
- Khi chỗ ngồi đầy, người mẫu không được đẩy người thật ra.
- Không có quy đổi quà ảo thành doanh thu.
