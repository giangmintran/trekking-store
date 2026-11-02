using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrekkingStore.API.Data;
using TrekkingStore.API.DTOs;
using TrekkingStore.API.Entities;
using TrekkingStore.API.Services;

namespace TrekkingStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IVietQrService _vietQrService;

        public OrdersController(AppDbContext context, IVietQrService vietQrService)
        {
            _context = context;
            _vietQrService = vietQrService;
        }

        [HttpPost]
        public async Task<ActionResult<OrderResponseDto>> CreateOrder([FromBody] CreateOrderDto dto)
        {
            if (dto.Items == null || !dto.Items.Any())
            {
                return BadRequest(new { message = "Giỏ hàng không có sản phẩm nào." });
            }

            // Extract User ID if authenticated
            Guid? userId = null;
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(userIdStr, out var parsedGuid))
            {
                userId = parsedGuid;
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var variantIds = dto.Items.Select(i => i.VariantId).ToList();
                var variants = await _context.ProductVariants
                    .Include(v => v.Product)
                    .Where(v => variantIds.Contains(v.Id))
                    .ToListAsync();

                decimal subtotal = 0;
                var orderItems = new List<OrderItem>();

                foreach (var item in dto.Items)
                {
                    var variant = variants.FirstOrDefault(v => v.Id == item.VariantId);
                    if (variant == null)
                    {
                        return BadRequest(new { message = $"Sản phẩm biến thể ID {item.VariantId} không tồn tại." });
                    }

                    if (variant.StockQuantity < item.Quantity)
                    {
                        return BadRequest(new { message = $"Sản phẩm '{variant.Product?.Name} - {variant.ColorName}/{variant.Size}' chỉ còn {variant.StockQuantity} sản phẩm trong kho." });
                    }

                    // Decrement stock
                    var previousStock = variant.StockQuantity;
                    variant.StockQuantity -= item.Quantity;

                    // Log inventory change
                    _context.InventoryLogs.Add(new InventoryLog
                    {
                        VariantId = variant.Id,
                        ChangeType = InventoryChangeType.OrderDeduction,
                        QuantityChange = -item.Quantity,
                        PreviousStock = previousStock,
                        CurrentStock = variant.StockQuantity,
                        Note = "Đơn hàng mới tạo",
                        CreatedBy = "System",
                        CreatedAt = DateTime.UtcNow
                    });

                    var itemTotal = variant.Price * item.Quantity;
                    subtotal += itemTotal;

                    orderItems.Add(new OrderItem
                    {
                        VariantId = variant.Id,
                        ProductName = variant.Product?.Name ?? "Sản phẩm",
                        Sku = variant.Sku,
                        Size = variant.Size,
                        Color = variant.ColorName,
                        ImageUrl = variant.ImageUrl ?? variant.Product?.Images.FirstOrDefault()?.Url,
                        UnitPrice = variant.Price,
                        Quantity = item.Quantity,
                        TotalPrice = itemTotal
                    });
                }

                // Handle Voucher
                decimal discountAmount = 0;
                int? voucherId = null;
                if (!string.IsNullOrWhiteSpace(dto.VoucherCode))
                {
                    var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Code.ToUpper() == dto.VoucherCode.Trim().ToUpper() && v.IsActive);
                    if (voucher != null && voucher.UsedCount < voucher.UsageLimit && subtotal >= voucher.MinOrderValue)
                    {
                        if (voucher.DiscountType == DiscountType.Percentage)
                        {
                            discountAmount = subtotal * (voucher.DiscountValue / 100m);
                            if (voucher.MaxDiscount.HasValue && discountAmount > voucher.MaxDiscount.Value)
                            {
                                discountAmount = voucher.MaxDiscount.Value;
                            }
                        }
                        else
                        {
                            discountAmount = voucher.DiscountValue;
                        }

                        voucher.UsedCount++;
                        voucherId = voucher.Id;
                    }
                }

                // Shipping fee policy: Free shipping if subtotal >= 1,000,000 VND, otherwise 30,000 VND
                decimal shippingFee = subtotal >= 1000000 ? 0 : 30000;
                decimal totalAmount = Math.Max(0, subtotal - discountAmount + shippingFee);

                // Generate Order Code
                var orderCode = $"TRK-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}";

                // Parse Payment Method
                var paymentMethod = dto.PaymentMethod.ToLower() switch
                {
                    "banktransfer" => PaymentMethod.BankTransfer,
                    "vnpay" => PaymentMethod.VNPay,
                    _ => PaymentMethod.COD
                };

                var order = new Order
                {
                    OrderCode = orderCode,
                    UserId = userId,
                    CustomerName = dto.CustomerName.Trim(),
                    CustomerEmail = dto.CustomerEmail.Trim().ToLower(),
                    CustomerPhone = dto.CustomerPhone.Trim(),
                    ShippingAddress = dto.ShippingAddress.Trim(),
                    Province = dto.Province.Trim(),
                    District = dto.District.Trim(),
                    Ward = dto.Ward.Trim(),
                    PaymentMethod = paymentMethod,
                    PaymentStatus = PaymentStatus.Pending,
                    OrderStatus = OrderStatus.Pending,
                    Subtotal = subtotal,
                    DiscountAmount = discountAmount,
                    ShippingFee = shippingFee,
                    TotalAmount = totalAmount,
                    VoucherId = voucherId,
                    Notes = dto.Notes,
                    CreatedAt = DateTime.UtcNow,
                    OrderItems = orderItems
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                string? vietQrUrl = null;
                if (paymentMethod == PaymentMethod.BankTransfer)
                {
                    vietQrUrl = _vietQrService.GenerateVietQrUrl(totalAmount, order.OrderCode);
                }

                return Ok(new OrderResponseDto
                {
                    Id = order.Id,
                    OrderCode = order.OrderCode,
                    CustomerName = order.CustomerName,
                    CustomerEmail = order.CustomerEmail,
                    CustomerPhone = order.CustomerPhone,
                    ShippingAddress = order.ShippingAddress,
                    Province = order.Province,
                    District = order.District,
                    Ward = order.Ward,
                    PaymentMethod = order.PaymentMethod.ToString(),
                    PaymentStatus = order.PaymentStatus.ToString(),
                    OrderStatus = order.OrderStatus.ToString(),
                    Subtotal = order.Subtotal,
                    DiscountAmount = order.DiscountAmount,
                    ShippingFee = order.ShippingFee,
                    TotalAmount = order.TotalAmount,
                    Notes = order.Notes,
                    CreatedAt = order.CreatedAt,
                    VietQrUrl = vietQrUrl,
                    Items = order.OrderItems.Select(oi => new OrderItemDetailDto
                    {
                        Id = oi.Id,
                        VariantId = oi.VariantId,
                        ProductName = oi.ProductName,
                        Sku = oi.Sku,
                        Size = oi.Size,
                        Color = oi.Color,
                        ImageUrl = oi.ImageUrl,
                        UnitPrice = oi.UnitPrice,
                        Quantity = oi.Quantity,
                        TotalPrice = oi.TotalPrice
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Lỗi khi xử lý đơn hàng: " + ex.Message });
            }
        }

        [HttpGet("{orderCode}")]
        public async Task<ActionResult<OrderResponseDto>> GetOrderByCode(string orderCode)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderCode == orderCode);

            if (order == null)
            {
                return NotFound(new { message = "Không tìm thấy đơn hàng." });
            }

            string? vietQrUrl = null;
            if (order.PaymentMethod == PaymentMethod.BankTransfer)
            {
                vietQrUrl = _vietQrService.GenerateVietQrUrl(order.TotalAmount, order.OrderCode);
            }

            return Ok(new OrderResponseDto
            {
                Id = order.Id,
                OrderCode = order.OrderCode,
                CustomerName = order.CustomerName,
                CustomerEmail = order.CustomerEmail,
                CustomerPhone = order.CustomerPhone,
                ShippingAddress = order.ShippingAddress,
                Province = order.Province,
                District = order.District,
                Ward = order.Ward,
                PaymentMethod = order.PaymentMethod.ToString(),
                PaymentStatus = order.PaymentStatus.ToString(),
                OrderStatus = order.OrderStatus.ToString(),
                Subtotal = order.Subtotal,
                DiscountAmount = order.DiscountAmount,
                ShippingFee = order.ShippingFee,
                TotalAmount = order.TotalAmount,
                Notes = order.Notes,
                TrackingNumber = order.TrackingNumber,
                CreatedAt = order.CreatedAt,
                VietQrUrl = vietQrUrl,
                Items = order.OrderItems.Select(oi => new OrderItemDetailDto
                {
                    Id = oi.Id,
                    VariantId = oi.VariantId,
                    ProductName = oi.ProductName,
                    Sku = oi.Sku,
                    Size = oi.Size,
                    Color = oi.Color,
                    ImageUrl = oi.ImageUrl,
                    UnitPrice = oi.UnitPrice,
                    Quantity = oi.Quantity,
                    TotalPrice = oi.TotalPrice
                }).ToList()
            });
        }

        [HttpPost("track")]
        public async Task<ActionResult<OrderResponseDto>> TrackOrder([FromBody] OrderTrackingRequestDto dto)
        {
            var query = dto.PhoneOrEmail.Trim().ToLower();
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderCode.ToUpper() == dto.OrderCode.Trim().ToUpper() &&
                    (o.CustomerPhone == query || o.CustomerEmail.ToLower() == query));

            if (order == null)
            {
                return NotFound(new { message = "Không tìm thấy đơn hàng phù hợp với mã và thông tin liên hệ này." });
            }

            string? vietQrUrl = null;
            if (order.PaymentMethod == PaymentMethod.BankTransfer)
            {
                vietQrUrl = _vietQrService.GenerateVietQrUrl(order.TotalAmount, order.OrderCode);
            }

            return Ok(new OrderResponseDto
            {
                Id = order.Id,
                OrderCode = order.OrderCode,
                CustomerName = order.CustomerName,
                CustomerEmail = order.CustomerEmail,
                CustomerPhone = order.CustomerPhone,
                ShippingAddress = order.ShippingAddress,
                Province = order.Province,
                District = order.District,
                Ward = order.Ward,
                PaymentMethod = order.PaymentMethod.ToString(),
                PaymentStatus = order.PaymentStatus.ToString(),
                OrderStatus = order.OrderStatus.ToString(),
                Subtotal = order.Subtotal,
                DiscountAmount = order.DiscountAmount,
                ShippingFee = order.ShippingFee,
                TotalAmount = order.TotalAmount,
                Notes = order.Notes,
                TrackingNumber = order.TrackingNumber,
                CreatedAt = order.CreatedAt,
                VietQrUrl = vietQrUrl,
                Items = order.OrderItems.Select(oi => new OrderItemDetailDto
                {
                    Id = oi.Id,
                    VariantId = oi.VariantId,
                    ProductName = oi.ProductName,
                    Sku = oi.Sku,
                    Size = oi.Size,
                    Color = oi.Color,
                    ImageUrl = oi.ImageUrl,
                    UnitPrice = oi.UnitPrice,
                    Quantity = oi.Quantity,
                    TotalPrice = oi.TotalPrice
                }).ToList()
            });
        }

        [Authorize]
        [HttpGet("my-orders")]
        public async Task<ActionResult<List<OrderResponseDto>>> GetMyOrders()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            var results = orders.Select(o => new OrderResponseDto
            {
                Id = o.Id,
                OrderCode = o.OrderCode,
                CustomerName = o.CustomerName,
                CustomerEmail = o.CustomerEmail,
                CustomerPhone = o.CustomerPhone,
                ShippingAddress = o.ShippingAddress,
                Province = o.Province,
                District = o.District,
                Ward = o.Ward,
                PaymentMethod = o.PaymentMethod.ToString(),
                PaymentStatus = o.PaymentStatus.ToString(),
                OrderStatus = o.OrderStatus.ToString(),
                Subtotal = o.Subtotal,
                DiscountAmount = o.DiscountAmount,
                ShippingFee = o.ShippingFee,
                TotalAmount = o.TotalAmount,
                Notes = o.Notes,
                TrackingNumber = o.TrackingNumber,
                CreatedAt = o.CreatedAt,
                Items = o.OrderItems.Select(oi => new OrderItemDetailDto
                {
                    Id = oi.Id,
                    VariantId = oi.VariantId,
                    ProductName = oi.ProductName,
                    Sku = oi.Sku,
                    Size = oi.Size,
                    Color = oi.Color,
                    ImageUrl = oi.ImageUrl,
                    UnitPrice = oi.UnitPrice,
                    Quantity = oi.Quantity,
                    TotalPrice = oi.TotalPrice
                }).ToList()
            }).ToList();

            return Ok(results);
        }
    }
}

