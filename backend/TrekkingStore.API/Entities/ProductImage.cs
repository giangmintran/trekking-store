using System.ComponentModel.DataAnnotations;

namespace TrekkingStore.API.Entities
{
    public class ProductImage
    {
        public int Id { get; set; }

        public int ProductId { get; set; }
        public Product? Product { get; set; }

        [Required]
        public string Url { get; set; } = string.Empty;

        [MaxLength(150)]
        public string? AltText { get; set; }

        public bool IsThumbnail { get; set; } = false;

        public int SortOrder { get; set; } = 0;
    }
}

