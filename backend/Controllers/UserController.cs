using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using backend.Data;
using backend.Models;
using backend.DTOs;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.RegistrationNumber))
        {
            return BadRequest(new { message = "Name, email, passwrd and registration number are required for registration." });
        }

        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
        {
            return Conflict(new { message = "Email already exists." });
        }

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            Password = hashedPassword,
            RegistrationNumber = request.RegistrationNumber,
            CreatedAt = DateTime.UtcNow,
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "User registered",
            data = new { user.Id, user.Name, user.Email, user.RegistrationNumber } // Included name in the response payload
        });
    }

    [HttpPost("login")]
public async Task<ActionResult> Login([FromBody] LoginRequest request)
{
    if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
    {
        return BadRequest(new { message = "Email and Password are required for login" });
    }

    var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
    if (user == null)
    {
        return Unauthorized(new { message = "Wrong email or password" });
    }

    // 1. Check if the account is currently locked out
    if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.UtcNow)
    {
        var remainingMinutes = Math.Ceiling((user.LockoutEnd.Value - DateTime.UtcNow).TotalMinutes);
        return StatusCode(StatusCodes.Status423Locked, new { 
            message = $"Hesabınız çok fazla başarısız giriş denemesi nedeniyle kilitlenmiştir. Lütfen {remainingMinutes} dakika sonra tekrar deneyin." 
        });
    }

    // 2. Verify the password
    if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
    {
        // Increment the failed attempt counter
        user.FailedAttemptCount++;

        // If attempts reach 5, lock the account for 15 minutes
        if (user.FailedAttemptCount >= 5)
        {
            user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
            await _context.SaveChangesAsync();
            return StatusCode(StatusCodes.Status423Locked, new { 
                message = "Çok fazla başarısız deneme! Hesabınız 15 dakika boyunca kilitlendi." 
            });
        }

        await _context.SaveChangesAsync();
        return Unauthorized(new { message = $"Hatalı şifre. Kalan deneme hakkınız: {5 - user.FailedAttemptCount}" });
    }

    // 3. On successful login, reset the tracking flags
    user.FailedAttemptCount = 0;
    user.LockoutEnd = null;
    await _context.SaveChangesAsync();

    return Ok(new { 
        message = "Login successful", 
        data = new { user.Id, user.Name, user.Email } 
    });
}

    [HttpPost("update-password")]
    public async Task<ActionResult> UpdatePassword([FromBody] UpdatePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { message = "Email and new password are required" });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Password updated", updatedAt = user.UpdatedAt });
    }
}