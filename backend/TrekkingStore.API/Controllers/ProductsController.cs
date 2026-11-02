using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrekkingStore.API.Data;
using TrekkingStore.API.DTOs;
using TrekkingStore.API.Entities;

namespace TrekkingStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        private static string RemoveDiacritics(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return string.Empty;
            var normalizedString = text.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();

            foreach (var c in normalizedString)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }

            return stringBuilder.ToString().Normalize(NormalizationForm.FormC).ToLower().Replace("đ", "d");
        }

        [HttpGet]
        public async Task<IActionResult> GetProducts(
            [FromQuery] string? search,
            [FromQuery] string? category,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] string? size,
            [FromQuery] string? color,
            [FromQuery] string? sort,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .Where(p => p.IsActive)
                .AsQueryable();

            // Filter by category
            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(p => p.Category!.Slug == category || (p.Category.Parent != null && p.Category.Parent.Slug == category));
            }

            // Filter by price range
            if (minPrice.HasValue)
            {
                query = query.Where(p => p.BasePrice >= minPrice.Value);
            }
            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.BasePrice <= maxPrice.Value);
            }

            // Filter by size
            if (!string.IsNullOrWhiteSpace(size))
            {
                query = query.Where(p => p.Variants.Any(v => v.IsActive && v.Size.ToLower() == size.ToLower()));
            }

            // Filter by color
            if (!string.IsNullOrWhiteSpace(color))
            {
                query = query.Where(p => p.Variants.Any(v => v.IsActive && v.ColorName.ToLower().Contains(color.ToLower())));
            }

            var allMatching = await query.ToListAsync();

            // Accent-insensitive search in memory if keyword provided
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchClean = RemoveDiacritics(search);
                var searchTerms = searchClean.Split(' ', StringSplitOptions.RemoveEmptyEntries);

                allMatching = allMatching.Where(p =>
                {
                    var nameClean = RemoveDiacritics(p.Name);
                    var brandClean = RemoveDiacritics(p.Brand ?? "");
                    var descClean = RemoveDiacritics(p.Description);
                    var combined = $"{nameClean} {brandClean} {descClean}";

                    return searchTerms.All(term => combined.Contains(term));
                }).ToList();
            }

            // Sorting
            allMatching = sort switch
            {
                "price_asc" => allMatching.OrderBy(p => p.BasePrice).ToList(),
                "price_desc" => allMatching.OrderByDescending(p => p.BasePrice).ToList(),
                "newest" => allMatching.OrderByDescending(p => p.CreatedAt).ToList(),
                _ => allMatching.OrderByDescending(p => p.IsFeatured).ThenByDescending(p => p.CreatedAt).ToList()
            };

            var totalItems = allMatching.Count;
            var items = allMatching
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new ProductListDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Slug = p.Slug,
                    ShortDescription = p.ShortDescription,
                    Brand = p.Brand,
                    BasePrice = p.BasePrice,
                    OriginalPrice = p.OriginalPrice,
                    ThumbnailUrl = p.Images.FirstOrDefault(i => i.IsThumbnail)?.Url ?? p.Images.FirstOrDefault()?.Url,
                    CategoryName = p.Category?.Name ?? "",
                    CategorySlug = p.Category?.Slug ?? "",
                    IsFeatured = p.IsFeatured,
                    IsNew = p.IsNew,
                    AvailableSizes = p.Variants.Where(v => v.IsActive && v.StockQuantity > 0).Select(v => v.Size).Distinct().ToList(),
                    AvailableColors = p.Variants.Where(v => v.IsActive && v.StockQuantity > 0).Select(v => v.ColorName).Distinct().ToList(),
                    TotalStock = p.Variants.Sum(v => v.StockQuantity)
                })
                .ToList();

            return Ok(new
            {
                Items = items,
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalItems / pageSize)
            });
        }

        [HttpGet("{slug}")]
        public async Task<ActionResult<ProductDetailDto>> GetProductBySlug(string slug)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Images.OrderBy(i => i.SortOrder))
                .Include(p => p.Variants.Where(v => v.IsActive))
                .Include(p => p.Reviews.Where(r => r.IsApproved).OrderByDescending(r => r.CreatedAt))
                .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive);

            if (product == null)
            {
                return NotFound(new { message = "Không tìm thấy sản phẩm." });
            }

            return Ok(new ProductDetailDto
            {
                Id = product.Id,
                Name = product.Name,
                Slug = product.Slug,
                ShortDescription = product.ShortDescription,
                Description = product.Description,
                Brand = product.Brand,
                Material = product.Material,
                CareGuide = product.CareGuide,
                SizeGuide = product.SizeGuide,
                BasePrice = product.BasePrice,
                OriginalPrice = product.OriginalPrice,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.Name ?? "",
                CategorySlug = product.Category?.Slug ?? "",
                IsFeatured = product.IsFeatured,
                IsNew = product.IsNew,
                Images = product.Images.Select(i => new ProductImageDto
                {
                    Id = i.Id,
                    Url = i.Url,
                    AltText = i.AltText,
                    IsThumbnail = i.IsThumbnail
                }).ToList(),
                Variants = product.Variants.Select(v => new VariantDto
                {
                    Id = v.Id,
                    Sku = v.Sku,
                    Size = v.Size,
                    ColorName = v.ColorName,
                    ColorHex = v.ColorHex,
                    Price = v.Price,
                    OriginalPrice = v.OriginalPrice,
                    StockQuantity = v.StockQuantity,
                    ImageUrl = v.ImageUrl
                }).ToList(),
                Reviews = product.Reviews.Select(r => new ReviewDto
                {
                    Id = r.Id,
                    CustomerName = r.CustomerName,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    PurchasedVariant = r.PurchasedVariant,
                    CreatedAt = r.CreatedAt
                }).ToList()
            });
        }

        [HttpGet("banners")]
        public async Task<IActionResult> GetBanners()
        {
            var banners = await _context.Banners
                .Where(b => b.IsActive)
                .OrderBy(b => b.SortOrder)
                .ToListAsync();

            return Ok(banners);
        }

        [HttpPost("{id}/reviews")]
        public async Task<IActionResult> AddReview(int id, [FromBody] ReviewDto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound(new { message = "Sản phẩm không tồn tại." });

            var review = new Review
            {
                ProductId = id,
                CustomerName = dto.CustomerName.Trim(),
                Rating = Math.Clamp(dto.Rating, 1, 5),
                Comment = dto.Comment.Trim(),
                PurchasedVariant = dto.PurchasedVariant,
                IsApproved = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cảm ơn bạn đã gửi đánh giá!" });
        }
    }
}

