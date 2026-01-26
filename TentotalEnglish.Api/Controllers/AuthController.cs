using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TentotalEnglish.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using TentotalEnglish.Domain.Entities;
using TentotalEnglish.Infrastructure.Data;

namespace TentotalEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly AppDbContext _db;

    public AuthController(IConfiguration config, AppDbContext db)
    {
        _config = config;
        _db = db;
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest req)
    {
        var user = await _db.AdminUsers.FirstOrDefaultAsync(u => u.Username == req.Username);
        if (user is null) return Unauthorized("Invalid credentials");

        var hasher = new PasswordHasher<AdminUser>();
        var result = hasher.VerifyHashedPassword(user, user.PasswordHash, req.Password);

        if (result == PasswordVerificationResult.Failed)
            return Unauthorized("Invalid credentials");


        var jwt = _config.GetSection("Jwt");
        var issuer = jwt["Issuer"]!;
        var audience = jwt["Audience"]!;
        var key = jwt["Key"]!;
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, "admin"),
            new(ClaimTypes.Name, "admin"),
            new(ClaimTypes.Role, "Admin")
        };

        var expires = DateTime.UtcNow.AddHours(8);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expires,
            signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256)
        );

        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
        return Ok(new LoginResponse(accessToken, expires));
    }
}
