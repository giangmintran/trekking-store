using System.ComponentModel.DataAnnotations;

namespace TrekkingStore.API.DTOs
{
    public class ProductListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? ShortDescription { get; set; }
        public string? Brand { get; set; }
        public decimal BasePrice { get; set; }
        public decimal? OriginalPrice { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string CategorySlug { get; set; } = string.Empty;
        public bool IsFeatured { get; set; }
        public bool IsNew { get; set; }
        public List<string> AvailableSizes { get; set; } = new();
        public List<string> AvailableColors { get; set; } = new();
        public int TotalStock { get; set; }
    }

    public class ProductDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? ShortDescription { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? Brand { get; set; }
        public string? Material { get; set; }
        public string? CareGuide { get; set; }
        public string? SizeGuide { get; set; }
        public decimal BasePrice { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string CategorySlug { get; set; } = string.Empty;
        public bool IsFeatured { get; set; }
        public bool IsNew { get; set; }
        public List<ProductImageDto> Images { get; set; } = new();
        public List<VariantDto> Variants { get; set; } = new();
        public List<ReviewDto> Reviews { get; set; } = new();
    }

    public class ProductImageDto
    {
        public int Id { get; set; }
        public string Url { get; set; } = string.Empty;
        public string? AltText { get; set; }
        public bool IsThumbnail { get; set; }
    }

    public class VariantDto
    {
        public int Id { get; set; }
        public string Sku { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string ColorName { get; set; } = string.Empty;
        public string ColorHex { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class ReviewDto
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public string? PurchasedVariant { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateProductDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(250)]
        public string Slug { get; set; } = string.Empty;

        public string? ShortDescription { get; set; }

        [Required]
        public string Description { get; set; } = string.Empty;

        public string? Brand { get; set; } = "Trekking Pro";
        public string? Material { get; set; }
        public string? CareGuide { get; set; }
        public string? SizeGuide { get; set; }

        public decimal BasePrice { get; set; }
        public decimal? OriginalPrice { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsNew { get; set; }

        [Required]
        public int CategoryId { get; set; }

        public List<string> ImageUrls { get; set; } = new();
        public List<CreateVariantDto> Variants { get; set; } = new();
    }

    public class CreateVariantDto
    {
        public string Sku { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string ColorName { get; set; } = string.Empty;
        public string ColorHex { get; set; } = "#000000";
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
    }
}

