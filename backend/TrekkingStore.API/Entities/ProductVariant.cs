using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrekkingStore.API.Entities
{
    public class ProductVariant
    {
        public int Id { get; set; }

        public int ProductId { get; set; }
        public Product? Product { get; set; }

        [Required]
        [MaxLength(60)]
        public string Sku { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Size { get; set; } = string.Empty; // S, M, L, XL, XXL, 39, 40, etc.

        [Required]
        [MaxLength(50)]
        public string ColorName { get; set; } = string.Empty; // Xanh Rêu, Đen, Cam Đất, Xám

        [MaxLength(20)]
        public string ColorHex { get; set; } = "#000000";

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? OriginalPrice { get; set; }

        public int StockQuantity { get; set; } = 0;

        public string? ImageUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<InventoryLog> InventoryLogs { get; set; } = new List<InventoryLog>();
    }
}

