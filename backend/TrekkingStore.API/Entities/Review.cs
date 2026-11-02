using System.ComponentModel.DataAnnotations;

namespace TrekkingStore.API.Entities
{
    public class Review
    {
        public int Id { get; set; }

        public int ProductId { get; set; }
        public Product? Product { get; set; }

        public Guid? UserId { get; set; }
        public AppUser? User { get; set; }

        [Required]
        [MaxLength(100)]
        public string CustomerName { get; set; } = string.Empty;

        [Range(1, 5)]
        public int Rating { get; set; } = 5;

        [Required]
        [MaxLength(1000)]
        public string Comment { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? PurchasedVariant { get; set; } // e.g. "Size L - Xanh Rêu"

        public string? ImagesJson { get; set; }

        public bool IsApproved { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

