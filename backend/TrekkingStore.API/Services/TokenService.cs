using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TrekkingStore.API.Entities;

namespace TrekkingStore.API.Services
{
    public interface ITokenService
    {
        string GenerateToken(AppUser user);
    }

    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateToken(AppUser user)
        {
            var secretKey = _config["JwtSettings:SecretKey"] ?? "TrekkingStoreSuperSecretKey2026!OutdoorAdventureForeverSecureKey999";
            var issuer = _config["JwtSettings:Issuer"] ?? "TrekkingStoreAPI";
            var audience = _config["JwtSettings:Audience"] ?? "TrekkingStoreClient";
            var expiryDays = int.TryParse(_config["JwtSettings:ExpiryDays"], out var days) ? days : 7;

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(expiryDays),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}

