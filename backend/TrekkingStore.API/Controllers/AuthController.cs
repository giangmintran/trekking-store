using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrekkingStore.API.Data;
using TrekkingStore.API.DTOs;
using TrekkingStore.API.Entities;
using TrekkingStore.API.Services;

namespace TrekkingStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITokenService _tokenService;

        public AuthController(AppDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
        {
            var emailLower = dto.Email.Trim().ToLower();
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == emailLower))
            {
                return BadRequest(new { message = "Email này đã được sử dụng." });
            }

            var user = new AppUser
            {
                FullName = dto.FullName.Trim(),
                Email = emailLower,
                PhoneNumber = dto.PhoneNumber?.Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = UserRole.Customer,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _tokenService.GenerateToken(user);
            return Ok(new AuthResponseDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role.ToString(),
                Token = token
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
        {
            var emailLower = dto.Email.Trim().ToLower();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == emailLower);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác." });
            }

            if (!user.IsActive)
            {
                return Unauthorized(new { message = "Tài khoản của bạn đã bị khóa." });
            }

            var token = _tokenService.GenerateToken(user);
            return Ok(new AuthResponseDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role.ToString(),
                Token = token
            });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<UserProfileDto>> GetProfile()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users
                .Include(u => u.Addresses)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng." });
            }

            return Ok(new UserProfileDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role.ToString(),
                Addresses = user.Addresses.Select(a => new AddressDto
                {
                    Id = a.Id,
                    ReceiverName = a.ReceiverName,
                    PhoneNumber = a.PhoneNumber,
                    Province = a.Province,
                    District = a.District,
                    Ward = a.Ward,
                    DetailAddress = a.DetailAddress,
                    IsDefault = a.IsDefault
                }).ToList()
            });
        }

        [Authorize]
        [HttpPost("addresses")]
        public async Task<ActionResult<AddressDto>> AddAddress([FromBody] AddressDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

            if (dto.IsDefault)
            {
                var existingDefaults = await _context.Addresses.Where(a => a.UserId == userId && a.IsDefault).ToListAsync();
                foreach (var a in existingDefaults) a.IsDefault = false;
            }

            var address = new Address
            {
                UserId = userId,
                ReceiverName = dto.ReceiverName,
                PhoneNumber = dto.PhoneNumber,
                Province = dto.Province,
                District = dto.District,
                Ward = dto.Ward,
                DetailAddress = dto.DetailAddress,
                IsDefault = dto.IsDefault
            };

            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();

            dto.Id = address.Id;
            return Ok(dto);
        }
    }
}

