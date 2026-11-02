using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrekkingStore.API.Entities
{
    public enum DiscountType
    {
        Percentage,
        FixedAmount
    }

    public class Voucher
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Description { get; set; }

        public DiscountType DiscountType { get; set; } = DiscountType.Percentage;

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountValue { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal MinOrderValue { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? MaxDiscount { get; set; }

        public int UsageLimit { get; set; } = 100;
        public int UsedCount { get; set; } = 0;

        public DateTime StartDate { get; set; } = DateTime.UtcNow;
        public DateTime EndDate { get; set; } = DateTime.UtcNow.AddMonths(1);

        public bool IsActive { get; set; } = true;

        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}

