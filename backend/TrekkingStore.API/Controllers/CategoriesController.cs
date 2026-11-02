using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrekkingStore.API.Data;

namespace TrekkingStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories
                .Where(c => c.IsActive && c.ParentId == null)
                .OrderBy(c => c.SortOrder)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Slug,
                    c.Description,
                    c.ImageUrl,
                    c.SortOrder,
                    SubCategories = c.SubCategories.Where(sc => sc.IsActive).OrderBy(sc => sc.SortOrder).Select(sc => new
                    {
                        sc.Id,
                        sc.Name,
                        sc.Slug,
                        sc.Description,
                        sc.ImageUrl
                    }).ToList(),
                    ProductCount = c.Products.Count(p => p.IsActive)
                })
                .ToListAsync();

            return Ok(categories);
        }
    }
}

