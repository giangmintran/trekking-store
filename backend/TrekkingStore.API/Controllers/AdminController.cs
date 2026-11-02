using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrekkingStore.API.Data;
using TrekkingStore.API.DTOs;
using TrekkingStore.API.Entities;

namespace TrekkingStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Staff")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
        {
            var totalOrders = await _context.Orders.CountAsync();
            var totalRevenue = await _context.Orders
                .Where(o => o.OrderStatus != OrderStatus.Cancelled && o.PaymentStatus == PaymentStatus.Paid)
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            var pendingOrders = await _context.Orders
                .CountAsync(o => o.OrderStatus == OrderStatus.Pending);

            var totalCustomers = await _context.Users
                .CountAsync(u => u.Role == UserRole.Customer);

            var lowStockVariants = await _context.ProductVariants
                .Include(v => v.Product)
                .Where(v => v.IsActive && v.StockQuantity <= 5)
                .OrderBy(v => v.StockQuantity)
                .Select(v => new LowStockItemDto
                {
                    VariantId = v.Id,
                    ProductName = v.Product != null ? v.Product.Name : "N/A",
                    Sku = v.Sku,
                    Size = v.Size,
                    Color = v.ColorName,
                    StockQuantity = v.StockQuantity
                })
                .ToListAsync();

            var recentOrders = await _context.Orders
                .OrderByDescending(o => o.CreatedAt)
                .Take(7)
                .Select(o => new RecentOrderDto
                {
                    Id = o.Id,
                    OrderCode = o.OrderCode,
                    CustomerName = o.CustomerName,
                    TotalAmount = o.TotalAmount,
                    OrderStatus = o.OrderStatus.ToString(),
                    PaymentStatus = o.PaymentStatus.ToString(),
                    CreatedAt = o.CreatedAt
                })
                .ToListAsync();

            // Last 7 days revenue
            var sevenDaysAgo = DateTime.UtcNow.Date.AddDays(-6);
            var ordersLast7Days = await _context.Orders
                .Where(o => o.CreatedAt >= sevenDaysAgo && o.OrderStatus != OrderStatus.Cancelled)
                .ToListAsync();

            var revenueChart = new List<DailyRevenueDto>();
            for (int i = 0; i < 7; i++)
            {
                var day = sevenDaysAgo.AddDays(i);
                var dayOrders = ordersLast7Days.Where(o => o.CreatedAt.Date == day.Date).ToList();
                revenueChart.Add(new DailyRevenueDto
                {
                    Date = day.ToString("dd/MM"),
                    Revenue = dayOrders.Sum(o => o.TotalAmount),
                    OrderCount = dayOrders.Count
                });
            }

            return Ok(new DashboardStatsDto
            {
                TotalRevenue = totalRevenue,
                TotalOrders = totalOrders,
                PendingOrders = pendingOrders,
                TotalCustomers = totalCustomers,
                LowStockProductsCount = lowStockVariants.Count,
                LowStockItems = lowStockVariants,
                RecentOrders = recentOrders,
                RevenueChart = revenueChart
            });
        }

        [HttpGet("orders")]
        public async Task<IActionResult> GetOrders([FromQuery] string? status, [FromQuery] string? search)
        {
            var query = _context.Orders
                .Include(o => o.OrderItems)
                .OrderByDescending(o => o.CreatedAt)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status, true, out var orderStatus))
            {
                query = query.Where(o => o.OrderStatus == orderStatus);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(o => o.OrderCode.Contains(search) || o.CustomerName.Contains(search) || o.CustomerPhone.Contains(search));
            }

            var orders = await query.Select(o => new
            {
                o.Id,
                o.OrderCode,
                o.CustomerName,
                o.CustomerEmail,
                o.CustomerPhone,
                o.ShippingAddress,
                o.Province,
                o.District,
                o.Ward,
                PaymentMethod = o.PaymentMethod.ToString(),
                PaymentStatus = o.PaymentStatus.ToString(),
                OrderStatus = o.OrderStatus.ToString(),
                o.Subtotal,
                o.DiscountAmount,
                o.ShippingFee,
                o.TotalAmount,
                o.TrackingNumber,
                o.Notes,
                o.CreatedAt,
                ItemsCount = o.OrderItems.Sum(oi => oi.Quantity),
                Items = o.OrderItems.Select(oi => new
                {
                    oi.Id,
                    oi.ProductName,
                    oi.Sku,
                    oi.Size,
                    oi.Color,
                    oi.UnitPrice,
                    oi.Quantity,
                    oi.TotalPrice
                }).ToList()
            }).ToListAsync();

            return Ok(orders);
        }

        [HttpPut("orders/{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound(new { message = "Không tìm thấy đơn hàng." });

            if (!Enum.TryParse<OrderStatus>(dto.OrderStatus, true, out var newStatus))
            {
                return BadRequest(new { message = "Trạng thái đơn hàng không hợp lệ." });
            }

            // If changing to Cancelled from non-cancelled, restore stock
            if (newStatus == OrderStatus.Cancelled && order.OrderStatus != OrderStatus.Cancelled)
            {
                foreach (var item in order.OrderItems)
                {
                    var variant = await _context.ProductVariants.FindAsync(item.VariantId);
                    if (variant != null)
                    {
                        var prev = variant.StockQuantity;
                        variant.StockQuantity += item.Quantity;

                        _context.InventoryLogs.Add(new InventoryLog
                        {
                            VariantId = variant.Id,
                            ChangeType = InventoryChangeType.OrderCancelReturn,
                            QuantityChange = item.Quantity,
                            PreviousStock = prev,
                            CurrentStock = variant.StockQuantity,
                            Note = $"Hoàn kho do hủy đơn {order.OrderCode}",
                            CreatedBy = User.Identity?.Name ?? "Admin",
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            order.OrderStatus = newStatus;

            if (!string.IsNullOrWhiteSpace(dto.PaymentStatus) && Enum.TryParse<PaymentStatus>(dto.PaymentStatus, true, out var paymentStatus))
            {
                order.PaymentStatus = paymentStatus;
            }

            if (!string.IsNullOrWhiteSpace(dto.TrackingNumber))
            {
                order.TrackingNumber = dto.TrackingNumber.Trim();
            }

            if (!string.IsNullOrWhiteSpace(dto.Notes))
            {
                order.Notes = dto.Notes.Trim();
            }

            order.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật trạng thái đơn hàng thành công." });
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetAdminProducts()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Variants)
                .Include(p => p.Images)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Slug,
                    p.Brand,
                    p.BasePrice,
                    p.OriginalPrice,
                    CategoryName = p.Category != null ? p.Category.Name : "",
                    p.CategoryId,
                    p.IsFeatured,
                    p.IsNew,
                    p.IsActive,
                    Thumbnail = p.Images.FirstOrDefault(i => i.IsThumbnail)!.Url ?? p.Images.FirstOrDefault()!.Url,
                    TotalStock = p.Variants.Sum(v => v.StockQuantity),
                    VariantsCount = p.Variants.Count,
                    Variants = p.Variants.Select(v => new
                    {
                        v.Id,
                        v.Sku,
                        v.Size,
                        v.ColorName,
                        v.ColorHex,
                        v.Price,
                        v.OriginalPrice,
                        v.StockQuantity,
                        v.IsActive
                    }).ToList()
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpPost("products")]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
        {
            var product = new Product
            {
                Name = dto.Name.Trim(),
                Slug = dto.Slug.Trim().ToLower(),
                ShortDescription = dto.ShortDescription,
                Description = dto.Description,
                Brand = dto.Brand ?? "Trekking Pro",
                Material = dto.Material,
                CareGuide = dto.CareGuide,
                SizeGuide = dto.SizeGuide,
                BasePrice = dto.BasePrice,
                OriginalPrice = dto.OriginalPrice,
                IsFeatured = dto.IsFeatured,
                IsNew = dto.IsNew,
                CategoryId = dto.CategoryId,
                CreatedAt = DateTime.UtcNow
            };

            if (dto.ImageUrls != null)
            {
                int order = 1;
                foreach (var url in dto.ImageUrls)
                {
                    product.Images.Add(new ProductImage
                    {
                        Url = url,
                        IsThumbnail = order == 1,
                        SortOrder = order++
                    });
                }
            }

            if (dto.Variants != null)
            {
                foreach (var v in dto.Variants)
                {
                    product.Variants.Add(new ProductVariant
                    {
                        Sku = v.Sku.Trim(),
                        Size = v.Size.Trim(),
                        ColorName = v.ColorName.Trim(),
                        ColorHex = string.IsNullOrWhiteSpace(v.ColorHex) ? "#000000" : v.ColorHex,
                        Price = v.Price > 0 ? v.Price : dto.BasePrice,
                        OriginalPrice = v.OriginalPrice ?? dto.OriginalPrice,
                        StockQuantity = v.StockQuantity,
                        ImageUrl = v.ImageUrl
                    });
                }
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thêm sản phẩm thành công!", productId = product.Id });
        }

        [HttpGet("inventory")]
        public async Task<IActionResult> GetInventory([FromQuery] bool lowStockOnly = false)
        {
            var query = _context.ProductVariants
                .Include(v => v.Product)
                .AsQueryable();

            if (lowStockOnly)
            {
                query = query.Where(v => v.StockQuantity <= 5);
            }

            var inventory = await query
                .OrderBy(v => v.StockQuantity)
                .Select(v => new
                {
                    v.Id,
                    v.Sku,
                    ProductName = v.Product != null ? v.Product.Name : "",
                    v.Size,
                    v.ColorName,
                    v.Price,
                    v.StockQuantity,
                    IsLowStock = v.StockQuantity <= 5
                })
                .ToListAsync();

            return Ok(inventory);
        }

        [HttpPost("inventory/adjust")]
        public async Task<IActionResult> AdjustInventory([FromBody] InventoryAdjustmentDto dto)
        {
            var variant = await _context.ProductVariants.FindAsync(dto.VariantId);
            if (variant == null) return NotFound(new { message = "Biến thể không tồn tại." });

            var prev = variant.StockQuantity;
            variant.StockQuantity += dto.QuantityChange;
            if (variant.StockQuantity < 0) variant.StockQuantity = 0;

            _context.InventoryLogs.Add(new InventoryLog
            {
                VariantId = variant.Id,
                ChangeType = dto.QuantityChange >= 0 ? InventoryChangeType.Import : InventoryChangeType.Export,
                QuantityChange = dto.QuantityChange,
                PreviousStock = prev,
                CurrentStock = variant.StockQuantity,
                Note = dto.Reason,
                CreatedBy = User.Identity?.Name ?? "Admin",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật tồn kho thành công!",
                previousStock = prev,
                newStock = variant.StockQuantity
            });
        }

        [HttpGet("vouchers")]
        public async Task<IActionResult> GetVouchers()
        {
            var vouchers = await _context.Vouchers.OrderByDescending(v => v.StartDate).ToListAsync();
            return Ok(vouchers);
        }

        [HttpPost("vouchers")]
        public async Task<IActionResult> CreateVoucher([FromBody] CreateVoucherDto dto)
        {
            if (await _context.Vouchers.AnyAsync(v => v.Code.ToUpper() == dto.Code.Trim().ToUpper()))
            {
                return BadRequest(new { message = "Mã giảm giá này đã tồn tại." });
            }

            var voucher = new Voucher
            {
                Code = dto.Code.Trim().ToUpper(),
                Description = dto.Description,
                DiscountType = dto.DiscountType == "FixedAmount" ? DiscountType.FixedAmount : DiscountType.Percentage,
                DiscountValue = dto.DiscountValue,
                MinOrderValue = dto.MinOrderValue,
                MaxDiscount = dto.MaxDiscount,
                UsageLimit = dto.UsageLimit,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                IsActive = true
            };

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tạo mã giảm giá thành công!", voucher });
        }
    }
}

