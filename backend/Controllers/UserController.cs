using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.DTOs;
using backend.Business.Interfaces;
using backend.Business.Services;
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

    public UserController(AppDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }
    

    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] RegisterRequest? request)
    {
        if (request == null)
        {
            return BadRequest(new { message = "Invalid request payload." });
        }

        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.RegistrationNumber))
        {
            return BadRequest(new { message = "Name, email, password, and registration number are required." });
        }

        try
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null)
            {
                return BadRequest(new { message = "Kayıtlı kullanıcı zaten var"});
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
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during registration.", error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginRequest? request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and Password are required for login" });
        }

        try
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                return Unauthorized(new { message = "Wrong email or password" });
            }

            var verificationCode = Random.Shared.Next(100000, 999999).ToString();

            user.LoginVerificationCode = verificationCode;
            user.LoginVerificationCodeExpiresAt = DateTime.UtcNow.AddMinutes(15);
            await _context.SaveChangesAsync();

            string subject = "Giriş Doğrulama Kodu";
            string body = $"Merhaba {user.Name},\n\nGiriş yapmak için kullanacağınız 2FA doğrulama kodunuz: {verificationCode}\n\nBu kod 15 dakika süreyle geçerlidir.";

            try
            {
                await _emailService.SendEmailAsync(user.Email, subject, body);
            }
            catch (Exception mailEx)
            {
                return StatusCode(500, new
                {
                    message = "Doğrulama e-postası gönderilemedi. Lütfen e-posta ayarlarınızı kontrol edin.",
                    error = mailEx.Message
                });
            }

            return Ok(new
            {
                requiresTwoFactor = true,
                message = "Doğrulama kodu e-posta adresinize gönderildi."
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Giriş işlemi sırasında bir hata oluştu.", error = ex.Message });
        }
    }

    [HttpPost("update-password")]
    public async Task<ActionResult> UpdatePassword([FromBody] UpdatePasswordRequest? request)
    {
        if (request == null ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { message = "E-posta ve yeni şifre zorunludur." });
        }

        try
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                return NotFound(new { message = "Kullanıcı bulunamadı." });
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Şifre başarıyla güncellendi." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Şifre güncellenirken bir hata oluştu.", error = ex.Message });
        }
    }

    [HttpPost("verify-login")]
    public async Task<ActionResult> VerifyLogin([FromBody] VerifyLogin request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Code))
        {
            return BadRequest(new { message = "Email and verification code are required." });
        }

        try
        {
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

            return Ok(new
            {
                message = "Giriş Başarılı",
                token = token,
                data = new { user.Id, user.Email }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Doğrulama işlemi sırasında bir hata oluştu.", error = ex.Message });
        }
    }
}