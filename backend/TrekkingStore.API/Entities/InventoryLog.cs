using System.ComponentModel.DataAnnotations;

namespace TrekkingStore.API.Entities
{
    public enum InventoryChangeType
    {
        Import,             // Nhập kho
        Export,             // Xuất kho
        OrderDeduction,     // Khách đặt hàng trừ kho
        OrderCancelReturn,  // Hủy đơn hoàn kho
        AuditAdjustment     // Kiểm kê điều chỉnh
    }

    public class InventoryLog
    {
        public int Id { get; set; }

        public int VariantId { get; set; }
        public ProductVariant? Variant { get; set; }

        public InventoryChangeType ChangeType { get; set; }

        public int QuantityChange { get; set; } // Dương nếu tăng, âm nếu giảm

        public int PreviousStock { get; set; }

        public int CurrentStock { get; set; }

        [MaxLength(255)]
        public string? Note { get; set; }

        [MaxLength(100)]
        public string? CreatedBy { get; set; } // "System", "Admin", etc.

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

