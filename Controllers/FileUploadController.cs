using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Hubs;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    [Route("upload")]
    [ApiController]
    public class FileUploadController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly UserManager<AppUser> _userManager;
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public FileUploadController(IHubContext<ChatHub> hubContext, UserManager<AppUser> userManager, AppDbContext context, IWebHostEnvironment environment)
        {
            _hubContext = hubContext;
            _userManager = userManager;
            _context = context;
            _environment = environment;
        }

        [HttpPost]
        public async Task<IActionResult> UploadFile([FromForm] IFormFile file, [FromForm] string receiverEmail)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);
            if (user == null)
            {
                return Unauthorized();
            }

            if (file == null || string.IsNullOrEmpty(receiverEmail))
            {
                return BadRequest("Invalid data");
            }

            var receiver = await _userManager.FindByNameAsync(receiverEmail);
            if (receiver == null)
            {
                return NotFound("Receiver not found");
            }

            var chat = await GetOrCreateChat(user.Id, receiver.Id);

            var chatFolder = Path.Combine(_environment.WebRootPath, "uploads", chat.Id.ToString());
            if (!Directory.Exists(chatFolder))
            {
                Directory.CreateDirectory(chatFolder);
            }

            var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(chatFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativeFilePath = $"/uploads/{chat.Id}/{fileName}";

            var newFile = new Models.File
            {
                ChatId = chat.Id,
                SenderId = user.Id,
                FilePath = relativeFilePath,
                UploadedAt = DateTime.UtcNow
            };

            _context.Files.Add(newFile);

            var newMessage = new Message
            {
                ChatId = chat.Id,
                SenderId = user.Id,
                Content = relativeFilePath,
                SentAt = DateTime.UtcNow,
                MessageType = "file"
            };

            _context.Messages.Add(newMessage);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.User(receiver.Id).SendAsync("ReceiveFile", user.Email, relativeFilePath);
            await _hubContext.Clients.User(user.Id).SendAsync("ReceiveFile", "You", relativeFilePath);
            return Ok(new { success = true });
        }

        private async Task<Chat> GetOrCreateChat(string userId1, string userId2)
        {
            var chat = await _context.Chats
                .Include(c => c.ChatMembers)
                .FirstOrDefaultAsync(c =>
                    c.ChatMembers.Any(cm => cm.UserId == userId1) &&
                    c.ChatMembers.Any(cm => cm.UserId == userId2));

            if (chat != null)
            {
                return chat;
            }

            chat = new Chat
            {
                CreatedAt = DateTime.UtcNow,
                IsGroup = false,
                Name = "Private",
                ChatMembers = new List<ChatMember>
            {
                new ChatMember { UserId = userId1 },
                new ChatMember { UserId = userId2 }
            }
            };

            _context.Chats.Add(chat);
            await _context.SaveChangesAsync();

            return chat;
        }
    }
}
