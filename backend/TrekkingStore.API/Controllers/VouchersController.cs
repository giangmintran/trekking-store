using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrekkingStore.API.Data;
using TrekkingStore.API.DTOs;
using TrekkingStore.API.Entities;

namespace TrekkingStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VouchersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VouchersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("validate")]
        public async Task<ActionResult<ValidateVoucherResponseDto>> ValidateVoucher([FromBody] ValidateVoucherRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Code))
            {
                return BadRequest(new ValidateVoucherResponseDto { IsValid = false, Message = "Vui lòng nhập mã giảm giá." });
            }

            var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Code.ToUpper() == dto.Code.Trim().ToUpper() && v.IsActive);

            if (voucher == null)
            {
                return Ok(new ValidateVoucherResponseDto { IsValid = false, Message = "Mã giảm giá không tồn tại hoặc đã hết hiệu lực." });
            }

            var now = DateTime.UtcNow;
            if (now < voucher.StartDate || now > voucher.EndDate)
            {
                return Ok(new ValidateVoucherResponseDto { IsValid = false, Message = "Mã giảm giá đã hết hạn sử dụng." });
            }

            if (voucher.UsedCount >= voucher.UsageLimit)
            {
                return Ok(new ValidateVoucherResponseDto { IsValid = false, Message = "Mã giảm giá đã hết lượt sử dụng." });
            }

            if (dto.OrderAmount < voucher.MinOrderValue)
            {
                return Ok(new ValidateVoucherResponseDto
                {
                    IsValid = false,
                    Message = $"Đơn hàng tối thiểu phải từ {voucher.MinOrderValue:N0}đ để áp dụng mã này."
                });
            }

            decimal discount = 0;
            if (voucher.DiscountType == DiscountType.Percentage)
            {
                discount = dto.OrderAmount * (voucher.DiscountValue / 100m);
                if (voucher.MaxDiscount.HasValue && discount > voucher.MaxDiscount.Value)
                {
                    discount = voucher.MaxDiscount.Value;
                }
            }
            else
            {
                discount = voucher.DiscountValue;
            }

            return Ok(new ValidateVoucherResponseDto
            {
                IsValid = true,
                Code = voucher.Code,
                DiscountAmount = discount,
                Message = $"Áp dụng mã thành công! Giảm {discount:N0}đ."
            });
        }
    }
}

