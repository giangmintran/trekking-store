# Yêu cầu chức năng cơ bản – Website bán quần áo

*Tổng hợp yêu cầu cho website bán quần áo vận hành thực tế, chia theo phía khách hàng và phía quản trị.*

## 1. Phía khách hàng (Front-end)

### Tài khoản và xác thực

- Đăng ký, đăng nhập (email/số điện thoại, Google, Facebook), quên và đặt lại mật khẩu
- Quản lý hồ sơ cá nhân, sổ địa chỉ giao hàng
- Lịch sử đơn hàng, theo dõi trạng thái đơn
- Danh sách yêu thích (wishlist)

### Hiển thị và tìm kiếm sản phẩm

- Trang chủ: banner, sản phẩm mới, bán chạy, khuyến mãi
- Danh mục theo nhóm (nam, nữ, trẻ em, phụ kiện) và danh mục con (áo, quần, váy...)
- Bộ lọc: size, màu, khoảng giá, thương hiệu, chất liệu
- Sắp xếp: giá, mới nhất, bán chạy, đánh giá
- Tìm kiếm có gợi ý từ khóa, chịu được sai chính tả/không dấu

### Trang chi tiết sản phẩm

- Nhiều ảnh, zoom, video (nếu có)
- Chọn biến thể màu/size, hiển thị tồn kho theo từng biến thể
- Bảng hướng dẫn chọn size
- Mô tả, chất liệu, hướng dẫn bảo quản
- Đánh giá, bình luận kèm ảnh thực tế
- Sản phẩm liên quan, gợi ý phối đồ

### Giỏ hàng và thanh toán

- Thêm, sửa, xóa sản phẩm; cập nhật số lượng; kiểm tra tồn kho theo thời gian thực
- Áp dụng mã giảm giá, voucher
- Thanh toán không cần đăng nhập (guest checkout)
- Chọn địa chỉ, phương thức vận chuyển, tính phí ship tự động
- Phương thức thanh toán: COD, chuyển khoản, thẻ ATM/quốc tế, ví điện tử (MoMo, ZaloPay, VNPay)
- Xác nhận đơn qua email/SMS

### Sau mua hàng

- Tra cứu đơn hàng
- Yêu cầu hủy, đổi, trả hàng
- Đánh giá sản phẩm sau khi nhận

## 2. Phía quản trị (Back-end/Admin)

### Quản lý sản phẩm

- Thêm, sửa, xóa, ẩn/hiện sản phẩm
- Quản lý biến thể (màu, size), SKU, giá gốc/giá bán
- Quản lý danh mục, thương hiệu, thuộc tính
- Upload ảnh hàng loạt, import/export Excel

### Quản lý kho

- Tồn kho theo SKU, nhập/xuất kho
- Cảnh báo sắp hết hàng
- Lịch sử biến động tồn kho

### Quản lý đơn hàng

- Danh sách và lọc đơn theo trạng thái (chờ xác nhận, đang giao, hoàn thành, hủy, hoàn trả)
- Cập nhật trạng thái, in hóa đơn/phiếu giao hàng
- Xử lý đổi trả, hoàn tiền
- Tích hợp đơn vị vận chuyển (GHN, GHTK, Viettel Post)

### Quản lý khách hàng

- Danh sách, thông tin, lịch sử mua
- Phân nhóm khách hàng (VIP, thân thiết)
- Quản lý đánh giá, phản hồi

### Marketing và khuyến mãi

- Mã giảm giá, flash sale, combo, miễn phí vận chuyển
- Quản lý banner, bài viết/blog
- Email/SMS marketing cơ bản

### Báo cáo và thống kê

- Doanh thu theo ngày/tháng/sản phẩm/danh mục
- Sản phẩm bán chạy, tồn đọng
- Tỷ lệ chuyển đổi, đơn hủy/hoàn

### Phân quyền hệ thống

- Vai trò: quản trị viên, nhân viên bán hàng, kế toán, kho
- Nhật ký hoạt động (log)

## 3. Yêu cầu phi chức năng quan trọng

- **Responsive**: ưu tiên mobile vì phần lớn khách mua quần áo qua điện thoại
- **Hiệu năng**: tải nhanh, tối ưu ảnh (lazy load, WebP)
- **Bảo mật**: HTTPS, mã hóa mật khẩu, chống SQL injection/XSS, tuân thủ bảo mật thanh toán
- **SEO**: URL thân thiện, meta, sitemap, dữ liệu có cấu trúc cho sản phẩm
- **Sao lưu dữ liệu** định kỳ, khả năng mở rộng khi lượng đơn tăng

## 4. Chức năng mở rộng (tùy quy mô)

- Chat trực tuyến, tích hợp Zalo/Messenger
- Chương trình tích điểm, khách hàng thân thiết
- Đồng bộ đa kênh (Shopee, TikTok Shop, Facebook Shop)
- Gợi ý sản phẩm cá nhân hóa
- Thông báo khi hàng về lại kho
- Quản lý đa chi nhánh/cửa hàng offline (omnichannel)
