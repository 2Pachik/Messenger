using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Options;
using MimeKit;
using WebApplication1.ViewModels;

namespace WebApplication1.Services
{
    public class EmailSender : IEmailSender
    {
        private readonly ConfirmEmailVM _smtpSettings;

        public EmailSender(IOptions<ConfirmEmailVM> smtpSettings)
        {
            _smtpSettings = smtpSettings.Value;
        }

        public async Task SendEmailAsync(string email, string subject, string message)
        {
            var mimeMessage = new MimeMessage();
            mimeMessage.From.Add(new MailboxAddress("My App", _smtpSettings.UserName));
            mimeMessage.To.Add(new MailboxAddress("", email));
            mimeMessage.Subject = subject;
            mimeMessage.Body = new TextPart("plain")
            {
                Text = message
            };

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, SecureSocketOptions.SslOnConnect);
                await client.AuthenticateAsync(_smtpSettings.UserName, _smtpSettings.Password);
                await client.SendAsync(mimeMessage);
                await client.DisconnectAsync(true);
            }
        }
    }
}
