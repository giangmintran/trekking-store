using System.ComponentModel.DataAnnotations;

namespace TrekkingStore.API.Entities
{
    public class Banner
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(250)]
        public string? Subtitle { get; set; }

        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? LinkUrl { get; set; }

        [MaxLength(50)]
        public string Position { get; set; } = "HERO"; // HERO, PROMO, SIDE

        public int SortOrder { get; set; } = 0;

        public bool IsActive { get; set; } = true;
    }
}

