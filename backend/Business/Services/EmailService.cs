using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace backend.Business.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string message)
    {
        string senderEmail = _configuration["SmtpSettings:SenderEmail"] 
            ?? throw new InvalidOperationException("SenderEmail configuration is missing.");
        string appPassword = _configuration["SmtpSettings:AppPassword"] 
            ?? throw new InvalidOperationException("AppPassword configuration is missing.");

        using var smtpClient = new SmtpClient("smtp.gmail.com")
        {
            Port = 587,
            Credentials = new NetworkCredential(senderEmail, appPassword),
            EnableSsl = true,
        };

        using var mailMessage = new MailMessage
        {
            From = new MailAddress(senderEmail, "AFAD Yönetim Paneli"),
            Subject = subject,
            Body = message,
            IsBodyHtml = false,
        };

        mailMessage.To.Add(toEmail);

        try
        {
            await smtpClient.SendMailAsync(mailMessage);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EMAIL FAILURE]: Failed to send 2FA mail. Error: {ex.Message}");
            throw;
        }
    }
}