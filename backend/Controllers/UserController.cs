using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.DTOs;
using backend.Services;
using backend.Data;
using System;
using System.Threading.Tasks;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;

    public UserController(AppDbContext context, IEmailService emailService) // Fixed: Changed from AppContext to AppDbContext
    {
        _context = context;
        _emailService = emailService;
    }

    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || 
            string.IsNullOrWhiteSpace(request.Password) || 
            string.IsNullOrWhiteSpace(request.Name) || 
            string.IsNullOrWhiteSpace(request.RegistrationNumber))
        {
            return BadRequest(new { message = "Name, email, password, and registration number are required for registration." });
        }

        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
        {
            return BadRequest(new { message = "User already exists." });
        }

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RegistrationNumber = request.RegistrationNumber
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User registered successfully" });
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and Password are required for login" });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
        {
            return Unauthorized(new { message = "Wrong email or password" });
        }

        var random = new Random();
        var verificationCode = random.Next(100000, 999999).ToString();

        user.LoginVerificationCode = verificationCode;
        user.LoginVerificationCodeExpiresAt = DateTime.UtcNow.AddMinutes(15);
        await _context.SaveChangesAsync();

        await _emailService.SendEmailAsync(user.Email, "Giriş Doğrulama Kodu", $"Doğrulama kodunuz: {verificationCode}");

        return Ok(new { 
            requiresTwoFactor = true, 
            message = "Doğrulama kodu e-posta adresinize gönderildi. Kodun geçerlilik süresi 15 dakikadır.",
            email = user.Email
        });
    }

    [HttpPost("verify-login")]
    public async Task<ActionResult> VerifyLogin([FromBody] VerifyLogin request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Code))
        {
            return BadRequest(new { message = "Email and verification code are required." });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null || 
            user.LoginVerificationCode != request.Code || 
            !user.LoginVerificationCodeExpiresAt.HasValue || 
            user.LoginVerificationCodeExpiresAt.Value < DateTime.UtcNow)
        {
            return BadRequest(new { message = "Geçersiz veya süresi dolmuş doğrulama kodu." });
        }

        user.LoginVerificationCode = null;
        user.LoginVerificationCodeExpiresAt = null;
        await _context.SaveChangesAsync();

        var token = "mock-jwt-token-string"; 

        return Ok(new { 
            message = "Login successful", 
            token = token,
            data = new { user.Id, user.Email } 
        });
    }
}