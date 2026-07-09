using Microsoft.AspNetCore.SignalR;
using Microsoft.Net.Http.Headers;

namespace backend.Models;
public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; }

    public string? VerificationToken { get; set;}
    public DateTime? TokenExpiresAt {get; set; }
    public bool IsVerified { get; set; } = false;

}