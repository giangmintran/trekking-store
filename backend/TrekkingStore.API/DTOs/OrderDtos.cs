using System.ComponentModel.DataAnnotations;
using TrekkingStore.API.Entities;

namespace TrekkingStore.API.DTOs
{
    public class CreateOrderItemDto
    {
        [Required]
        public int VariantId { get; set; }

        [Required]
        [Range(1, 100)]
        public int Quantity { get; set; }
    }

    public class CreateOrderDto
    {
        [Required]
        [MaxLength(100)]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string CustomerEmail { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string CustomerPhone { get; set; } = string.Empty;

        [Required]
        public string ShippingAddress { get; set; } = string.Empty;

        [Required]
        public string Province { get; set; } = string.Empty;

        [Required]
        public string District { get; set; } = string.Empty;

        [Required]
        public string Ward { get; set; } = string.Empty;

        public string PaymentMethod { get; set; } = "COD"; // COD, BankTransfer, VNPay

        public string? VoucherCode { get; set; }

        public string? Notes { get; set; }

        [Required]
        [MinLength(1)]
        public List<CreateOrderItemDto> Items { get; set; } = new();
    }

    public class OrderResponseDto
    {
        public int Id { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string Ward { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public string OrderStatus { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Notes { get; set; }
        public string? TrackingNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? VietQrUrl { get; set; }
        public List<OrderItemDetailDto> Items { get; set; } = new();
    }

    public class OrderItemDetailDto
    {
        public int Id { get; set; }
        public int VariantId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string Sku { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class OrderTrackingRequestDto
    {
        [Required]
        public string OrderCode { get; set; } = string.Empty;

        [Required]
        public string PhoneOrEmail { get; set; } = string.Empty;
    }

    public class UpdateOrderStatusDto
    {
        [Required]
        public string OrderStatus { get; set; } = string.Empty;

        public string? PaymentStatus { get; set; }
        public string? TrackingNumber { get; set; }
        public string? Notes { get; set; }
    }
}

