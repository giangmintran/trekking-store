using Microsoft.EntityFrameworkCore;
using TrekkingStore.API.Entities;

namespace TrekkingStore.API.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            // Ensure Database is created
            await context.Database.EnsureCreatedAsync();

            // Check if already seeded
            if (await context.Categories.AnyAsync())
            {
                return; // Data already exists
            }

            // 1. Seed Users
            var adminUser = new AppUser
            {
                Id = Guid.NewGuid(),
                FullName = "Quản Trị Viên Trekking",
                Email = "admin@trekking.vn",
                PhoneNumber = "0909123456",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow
            };

            var staffUser = new AppUser
            {
                Id = Guid.NewGuid(),
                FullName = "Nhân Viên Kho Vận",
                Email = "staff@trekking.vn",
                PhoneNumber = "0909654321",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Staff@123"),
                Role = UserRole.Staff,
                CreatedAt = DateTime.UtcNow
            };

            var demoCustomer = new AppUser
            {
                Id = Guid.NewGuid(),
                FullName = "Nguyễn Văn Phượt",
                Email = "customer@gmail.com",
                PhoneNumber = "0912345678",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer@123"),
                Role = UserRole.Customer,
                CreatedAt = DateTime.UtcNow
            };

            await context.Users.AddRangeAsync(adminUser, staffUser, demoCustomer);

            var defaultAddress = new Address
            {
                UserId = demoCustomer.Id,
                ReceiverName = "Nguyễn Văn Phượt",
                PhoneNumber = "0912345678",
                Province = "Hà Nội",
                District = "Quận Cầu Giấy",
                Ward = "Phường Dịch Vọng Hậu",
                DetailAddress = "Số 18 Phố Duy Tân",
                IsDefault = true
            };
            await context.Addresses.AddAsync(defaultAddress);

            // 2. Seed Categories
            var catAo = new Category
            {
                Name = "Áo Trekking & Dã Ngoại",
                Slug = "ao-trekking",
                Description = "Áo khoác chống thấm nước, áo thun mau khô, áo giữ nhiệt chuyên dụng leo núi dã ngoại",
                ImageUrl = "https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=800&auto=format&fit=crop",
                SortOrder = 1
            };

            var catQuan = new Category
            {
                Name = "Quần Leo Núi & Dã Ngoại",
                Slug = "quan-trekking",
                Description = "Quần tháo ống tiện lợi, quần chống thấm nước nhẹ, co giãn thoải mái khi vận động",
                ImageUrl = "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800&auto=format&fit=crop",
                SortOrder = 2
            };

            var catGiay = new Category
            {
                Name = "Giày & Dép Leo Núi",
                Slug = "giay-leo-nui",
                Description = "Giày leo núi cổ cao bảo vệ cổ chân, đế gai chống trượt bám đá vượt địa hình hiểm trở",
                ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
                SortOrder = 3
            };

            var catPhuKien = new Category
            {
                Name = "Balo & Phụ Kiện Trekking",
                Slug = "balo-phu-kien",
                Description = "Balo trợ lực, gậy leo núi carbon, mũ tai bèo chống tia UV và găng tay dã ngoại",
                ImageUrl = "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=800&auto=format&fit=crop",
                SortOrder = 4
            };

            await context.Categories.AddRangeAsync(catAo, catQuan, catGiay, catPhuKien);
            await context.SaveChangesAsync();

            // 3. Seed Products & Variants
            var products = new List<Product>
            {
                new Product
                {
                    Name = "Áo Khoác Gió Trekking Gore-Tex Chống Nước 3 Lớp",
                    Slug = "ao-khoac-gio-trekking-gore-tex-3-lop",
                    ShortDescription = "Chống nước tuyệt đối 20.000mm, thoáng khí, chống gió lạnh vùng cao Tây Bắc",
                    Description = "Áo khoác kỹ thuật cao cấp chuyên dụng cho các cung trekking Fansipan, Tà Xùa, Lảo Thẩn. Chất liệu màng lọc Gore-Tex 3 lớp ngăn nước tuyệt đối, các đường may ép seam nhiệt kín kẽ. Có khóa kéo nách thông gió khi leo dốc mồ hôi.",
                    Brand = "Trekking Pro",
                    Material = "100% Nylon Ripstop 70D kèm màng thở Gore-Tex Pro",
                    CareGuide = "Giặt tay nước lạnh, không dùng nước xả vải làm bít lỗ thoát khí, phơi trong bóng râm.",
                    SizeGuide = "Size S: 50-58kg (1m55-1m65) | Size M: 58-66kg (1m65-1m72) | Size L: 67-75kg (1m72-1m78) | Size XL: 75-85kg (1m78-1m85)",
                    BasePrice = 1250000,
                    OriginalPrice = 1450000,
                    IsFeatured = true,
                    IsNew = true,
                    CategoryId = catAo.Id,
                    Images = new List<ProductImage>
                    {
                        new ProductImage { Url = "https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=800&auto=format&fit=crop", AltText = "Mặt trước áo gió rêu", IsThumbnail = true, SortOrder = 1 },
                        new ProductImage { Url = "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800&auto=format&fit=crop", AltText = "Chi tiết khóa kéo chống nước", IsThumbnail = false, SortOrder = 2 }
                    },
                    Variants = new List<ProductVariant>
                    {
                        new ProductVariant { Sku = "AKG-REU-S", Size = "S", ColorName = "Xanh Rêu", ColorHex = "#4A5D4E", Price = 1250000, OriginalPrice = 1450000, StockQuantity = 15 },
                        new ProductVariant { Sku = "AKG-REU-M", Size = "M", ColorName = "Xanh Rêu", ColorHex = "#4A5D4E", Price = 1250000, OriginalPrice = 1450000, StockQuantity = 25 },
                        new ProductVariant { Sku = "AKG-REU-L", Size = "L", ColorName = "Xanh Rêu", ColorHex = "#4A5D4E", Price = 1250000, OriginalPrice = 1450000, StockQuantity = 18 },
                        new ProductVariant { Sku = "AKG-DEN-M", Size = "M", ColorName = "Đen Nhám", ColorHex = "#1F2022", Price = 1250000, OriginalPrice = 1450000, StockQuantity = 20 },
                        new ProductVariant { Sku = "AKG-DEN-L", Size = "L", ColorName = "Đen Nhám", ColorHex = "#1F2022", Price = 1250000, OriginalPrice = 1450000, StockQuantity = 12 },
                        new ProductVariant { Sku = "AKG-CAM-L", Size = "L", ColorName = "Cam Cảnh Báo", ColorHex = "#D35400", Price = 1250000, OriginalPrice = 1450000, StockQuantity = 4 } // Sắp hết
                    }
                },
                new Product
                {
                    Name = "Áo Thun Dã Ngoại Dài Tay Quick-Dry Chống Tia UV UPF 50+",
                    Slug = "ao-thun-da-ngoai-quick-dry-upf50",
                    ShortDescription = "Vải dệt tổ ong mau khô sau 20 phút, co giãn 4 chiều, chống nắng bảo vệ da",
                    Description = "Áo thun dài tay thể thao dã ngoại mỏng nhẹ, thoát mồ hôi cực nhanh khi vận động cường độ cao. Công nghệ chống tia cực tím UPF 50+ bảo vệ tối đa dưới ánh nắng gay gắt khi leo đồi trọc hoặc trekking bãi biển.",
                    Brand = "Trekking Pro",
                    Material = "88% Polyester Quick-Dry, 12% Spandex",
                    CareGuide = "Giặt máy bình thường, tránh phơi trực tiếp dưới nắng gắt quá lâu.",
                    SizeGuide = "Size S: 52-60kg | Size M: 60-68kg | Size L: 68-76kg | Size XL: 76-86kg",
                    BasePrice = 380000,
                    OriginalPrice = 450000,
                    IsFeatured = true,
                    IsNew = true,
                    CategoryId = catAo.Id,
                    Images = new List<ProductImage>
                    {
                        new ProductImage { Url = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop", AltText = "Áo thun outdoor", IsThumbnail = true, SortOrder = 1 }
                    },
                    Variants = new List<ProductVariant>
                    {
                        new ProductVariant { Sku = "ATD-XAM-S", Size = "S", ColorName = "Xám Tro", ColorHex = "#7F8C8D", Price = 380000, OriginalPrice = 450000, StockQuantity = 30 },
                        new ProductVariant { Sku = "ATD-XAM-M", Size = "M", ColorName = "Xám Tro", ColorHex = "#7F8C8D", Price = 380000, OriginalPrice = 450000, StockQuantity = 40 },
                        new ProductVariant { Sku = "ATD-XAM-L", Size = "L", ColorName = "Xám Tro", ColorHex = "#7F8C8D", Price = 380000, OriginalPrice = 450000, StockQuantity = 35 },
                        new ProductVariant { Sku = "ATD-XANH-M", Size = "M", ColorName = "Xanh Navy", ColorHex = "#2C3E50", Price = 380000, OriginalPrice = 450000, StockQuantity = 22 }
                    }
                },
                new Product
                {
                    Name = "Quần Trekking Tháo Ống Chống Thấm Nước 2 Trong 1",
                    Slug = "quan-trekking-thao-ong-chong-tham-2-in-1",
                    ShortDescription = "Khóa kéo ngang gối biến thành quần đùi trong 5 giây, vải chống mài mòn cành gai",
                    Description = "Mẫu quần dã ngoại được ưa chuộng nhất nhờ khả năng tháo rời ống quần linh hoạt theo thời tiết. Vải Ripstop dệt ô vuông chống xước rách khi va quẹt đá núi hoặc gai rừng. Lớp phủ DWR trượt nước nhẹ khi gặp mưa phùn.",
                    Brand = "Trekking Pro",
                    Material = "92% Polyamide Ripstop, 8% Elastane phủ nano DWR",
                    CareGuide = "Ủi ở nhiệt độ thấp để tái kích hoạt lớp chống thấm DWR.",
                    SizeGuide = "Size M: Vòng eo 74-80cm (58-66kg) | Size L: Vòng eo 80-86cm (66-74kg) | Size XL: Vòng eo 86-92cm (74-84kg)",
                    BasePrice = 690000,
                    OriginalPrice = 790000,
                    IsFeatured = true,
                    IsNew = false,
                    CategoryId = catQuan.Id,
                    Images = new List<ProductImage>
                    {
                        new ProductImage { Url = "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800&auto=format&fit=crop", AltText = "Quần tháo ống leo núi", IsThumbnail = true, SortOrder = 1 }
                    },
                    Variants = new List<ProductVariant>
                    {
                        new ProductVariant { Sku = "QTO-REU-M", Size = "M", ColorName = "Xanh Rêu", ColorHex = "#4A5D4E", Price = 690000, OriginalPrice = 790000, StockQuantity = 18 },
                        new ProductVariant { Sku = "QTO-REU-L", Size = "L", ColorName = "Xanh Rêu", ColorHex = "#4A5D4E", Price = 690000, OriginalPrice = 790000, StockQuantity = 20 },
                        new ProductVariant { Sku = "QTO-DEN-M", Size = "M", ColorName = "Đen Than", ColorHex = "#212121", Price = 690000, OriginalPrice = 790000, StockQuantity = 25 },
                        new ProductVariant { Sku = "QTO-DEN-L", Size = "L", ColorName = "Đen Than", ColorHex = "#212121", Price = 690000, OriginalPrice = 790000, StockQuantity = 15 },
                        new ProductVariant { Sku = "QTO-KHA-L", Size = "L", ColorName = "Vàng Khaki", ColorHex = "#C3B091", Price = 690000, OriginalPrice = 790000, StockQuantity = 3 } // Cảnh báo sắp hết
                    }
                },
                new Product
                {
                    Name = "Giày Leo Núi Cổ Lửng Chống Thấm Đế Vibram Bám Đá",
                    Slug = "giay-leo-nui-co-lung-chong-tham-de-vibram",
                    ShortDescription = "Đế Vibram Megagrip bám dính bùn lầy, màng chống thấm nước, bảo vệ mũi chân bọc cao su",
                    Description = "Đôi giày chuyên phục vụ các chuyến đi rừng, lội suối và vượt đá tảng trơn trượt. Đế gai sâu 5mm tự đẩy bùn đất, đệm lót EVA giảm chấn bảo vệ khớp gối khi xuống dốc dài.",
                    Brand = "Trekking Pro",
                    Material = "Da nubuck chống trầy phối vải Cordura siêu bền",
                    CareGuide = "Dùng bàn chải mềm vệ sinh bùn khô, không phơi trực tiếp dưới lửa trại hoặc máy sấy nóng.",
                    SizeGuide = "Nên tăng 1 size so với giày thể thao thông thường để đeo tất dày và trừ hao khi xuống dốc.",
                    BasePrice = 1890000,
                    OriginalPrice = 2200000,
                    IsFeatured = true,
                    IsNew = true,
                    CategoryId = catGiay.Id,
                    Images = new List<ProductImage>
                    {
                        new ProductImage { Url = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop", AltText = "Giày leo núi Vibram", IsThumbnail = true, SortOrder = 1 }
                    },
                    Variants = new List<ProductVariant>
                    {
                        new ProductVariant { Sku = "GLN-40-XAM", Size = "40", ColorName = "Xám Đất", ColorHex = "#5D5C61", Price = 1890000, OriginalPrice = 2200000, StockQuantity = 8 },
                        new ProductVariant { Sku = "GLN-41-XAM", Size = "41", ColorName = "Xám Đất", ColorHex = "#5D5C61", Price = 1890000, OriginalPrice = 2200000, StockQuantity = 14 },
                        new ProductVariant { Sku = "GLN-42-XAM", Size = "42", ColorName = "Xám Đất", ColorHex = "#5D5C61", Price = 1890000, OriginalPrice = 2200000, StockQuantity = 12 },
                        new ProductVariant { Sku = "GLN-43-XAM", Size = "43", ColorName = "Xám Đất", ColorHex = "#5D5C61", Price = 1890000, OriginalPrice = 2200000, StockQuantity = 6 }
                    }
                },
                new Product
                {
                    Name = "Balo Leo Núi Trợ Lực Chuyên Nghiệp 45L + 5L Có Áo Mưa",
                    Slug = "balo-leo-nui-tro-luc-45l-ao-mua",
                    ShortDescription = "Khung nhôm trợ lực giảm 60% áp lực lên cột sống, quai đeo êm ái thoáng khí",
                    Description = "Balo dung tích 45L mở rộng thêm 5L phù hợp các chuyến trekking 2-4 ngày. Có ngăn riêng để túi nước 2L có lỗ dẫn vòi, ngăn đáy để túi ngủ riêng biệt, tặng kèm bọc áo mưa balo phản quang.",
                    Brand = "Trekking Pro",
                    Material = "Nylon 420D chống cọ xát chịu lực tải lên đến 25kg",
                    CareGuide = "Giặt tay nhẹ nhàng bằng xà phòng trung tính, tra dầu khóa kéo định kỳ.",
                    SizeGuide = "Lưng balo có thể tăng giảm theo chiều dài sống lưng từ 42cm - 54cm",
                    BasePrice = 1350000,
                    OriginalPrice = 1590000,
                    IsFeatured = true,
                    IsNew = false,
                    CategoryId = catPhuKien.Id,
                    Images = new List<ProductImage>
                    {
                        new ProductImage { Url = "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=800&auto=format&fit=crop", AltText = "Balo trợ lực 45L", IsThumbnail = true, SortOrder = 1 }
                    },
                    Variants = new List<ProductVariant>
                    {
                        new ProductVariant { Sku = "BL-XANH-45L", Size = "45L", ColorName = "Xanh Đại Dương", ColorHex = "#1B4F72", Price = 1350000, OriginalPrice = 1590000, StockQuantity = 10 },
                        new ProductVariant { Sku = "BL-CAM-45L", Size = "45L", ColorName = "Cam Đỏ", ColorHex = "#BA4A00", Price = 1350000, OriginalPrice = 1590000, StockQuantity = 8 }
                    }
                },
                new Product
                {
                    Name = "Mũ Vành Tròn Chống Nắng Dã Ngoại Có Vạt Che Cổ UPF 50+",
                    Slug = "mu-vanh-tron-da-ngoai-che-co-upf50",
                    ShortDescription = "Chống say nắng, vạt sau che gáy tháo rời được, dây rút chống gió bay",
                    Description = "Trang bị không thể thiếu cho dân trekking đồi cát, vùng núi đá vôi nắng gắt. Vải chống nước nhẹ, hai bên tai phối lưới thoáng khí không gây nóng bí đỉnh đầu.",
                    Brand = "Trekking Pro",
                    Material = "Polyester phản xạ nhiệt kết hợp lớp phủ chống tia tử ngoại",
                    BasePrice = 190000,
                    OriginalPrice = 250000,
                    IsFeatured = false,
                    IsNew = true,
                    CategoryId = catPhuKien.Id,
                    Images = new List<ProductImage>
                    {
                        new ProductImage { Url = "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=800&auto=format&fit=crop", AltText = "Mũ vành dã ngoại", IsThumbnail = true, SortOrder = 1 }
                    },
                    Variants = new List<ProductVariant>
                    {
                        new ProductVariant { Sku = "MV-REU-F", Size = "FreeSize", ColorName = "Xanh Rêu", ColorHex = "#4A5D4E", Price = 190000, OriginalPrice = 250000, StockQuantity = 50 },
                        new ProductVariant { Sku = "MV-KHA-F", Size = "FreeSize", ColorName = "Vàng Khaki", ColorHex = "#C3B091", Price = 190000, OriginalPrice = 250000, StockQuantity = 45 }
                    }
                }
            };

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();

            // 4. Seed Vouchers
            var vouchers = new List<Voucher>
            {
                new Voucher
                {
                    Code = "CHAOBANMOI",
                    Description = "Giảm 10% cho khách hàng mới, tối đa 100.000đ",
                    DiscountType = DiscountType.Percentage,
                    DiscountValue = 10,
                    MinOrderValue = 300000,
                    MaxDiscount = 100000,
                    UsageLimit = 500,
                    StartDate = DateTime.UtcNow.AddDays(-10),
                    EndDate = DateTime.UtcNow.AddMonths(3),
                    IsActive = true
                },
                new Voucher
                {
                    Code = "TREKKING50K",
                    Description = "Giảm ngay 50.000đ cho đơn hàng từ 500.000đ",
                    DiscountType = DiscountType.FixedAmount,
                    DiscountValue = 50000,
                    MinOrderValue = 500000,
                    UsageLimit = 200,
                    StartDate = DateTime.UtcNow.AddDays(-5),
                    EndDate = DateTime.UtcNow.AddMonths(2),
                    IsActive = true
                },
                new Voucher
                {
                    Code = "FREESHIP",
                    Description = "Hỗ trợ 30.000đ phí vận chuyển cho đơn từ 1.000.000đ",
                    DiscountType = DiscountType.FixedAmount,
                    DiscountValue = 30000,
                    MinOrderValue = 1000000,
                    UsageLimit = 1000,
                    StartDate = DateTime.UtcNow.AddDays(-1),
                    EndDate = DateTime.UtcNow.AddYears(1),
                    IsActive = true
                }
            };
            await context.Vouchers.AddRangeAsync(vouchers);

            // 5. Seed Banners
            var banners = new List<Banner>
            {
                new Banner
                {
                    Title = "Chinh Phục Mọi Đỉnh Cao Cùng Trekking Pro",
                    Subtitle = "Trang phục dã ngoại công nghệ Gore-Tex & Quick-Dry giảm đến 30%",
                    ImageUrl = "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=1600&auto=format&fit=crop",
                    LinkUrl = "/san-pham",
                    Position = "HERO",
                    SortOrder = 1,
                    IsActive = true
                },
                new Banner
                {
                    Title = "Bộ Sưu Tập Giày Bám Đá Mới Nhất 2026",
                    Subtitle = "Công nghệ đế Vibram Megagrip độc quyền chống trơn trượt tuyệt đối",
                    ImageUrl = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600&auto=format&fit=crop",
                    LinkUrl = "/san-pham?category=giay-leo-nui",
                    Position = "HERO",
                    SortOrder = 2,
                    IsActive = true
                }
            };
            await context.Banners.AddRangeAsync(banners);

            // 6. Seed Sample Order
            var sampleVariant = products[0].Variants.First();
            var sampleOrder = new Order
            {
                OrderCode = "TRK-20261102-001",
                UserId = demoCustomer.Id,
                CustomerName = "Nguyễn Văn Phượt",
                CustomerEmail = "customer@gmail.com",
                CustomerPhone = "0912345678",
                ShippingAddress = "Số 18 Phố Duy Tân",
                Province = "Hà Nội",
                District = "Quận Cầu Giấy",
                Ward = "Phường Dịch Vọng Hậu",
                PaymentMethod = PaymentMethod.BankTransfer,
                PaymentStatus = PaymentStatus.Paid,
                OrderStatus = OrderStatus.Shipping,
                Subtotal = sampleVariant.Price,
                DiscountAmount = 50000,
                ShippingFee = 30000,
                TotalAmount = sampleVariant.Price - 50000 + 30000,
                Notes = "Giao giờ hành chính giúp tôi",
                CreatedAt = DateTime.UtcNow.AddHours(-12),
                OrderItems = new List<OrderItem>
                {
                    new OrderItem
                    {
                        VariantId = sampleVariant.Id,
                        ProductName = products[0].Name,
                        Sku = sampleVariant.Sku,
                        Size = sampleVariant.Size,
                        Color = sampleVariant.ColorName,
                        UnitPrice = sampleVariant.Price,
                        Quantity = 1,
                        TotalPrice = sampleVariant.Price
                    }
                }
            };
            await context.Orders.AddAsync(sampleOrder);

            await context.SaveChangesAsync();
        }
    }
}

