using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Identity;
using WebApplication1.Models;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using System.Linq;

namespace WebApplication1.Hubs
{
    public class ChatHub : Hub
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly AppDbContext _context;

        public ChatHub(UserManager<AppUser> userManager, AppDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public override async Task OnConnectedAsync()
        {
            var userEmail = Context.User.Identity.Name;
            var user = await _userManager.FindByNameAsync(userEmail);

            if (user != null)
            {
                var contacts = await GetUserContacts(user.Id);
                await Clients.Caller.SendAsync("LoadContacts", contacts);
            }

            await base.OnConnectedAsync();
        }

        public async Task AddContactByEmail(string email)
        {
            var userEmail = Context.User.Identity.Name;
            var user = await _userManager.FindByNameAsync(userEmail);
            var contact = await _userManager.FindByNameAsync(email);

            if (user == null || contact == null)
            {
                await Clients.Caller.SendAsync("Error", "User or contact not found");
                return;
            }

            var existingContact = await _context.Contacts
                .FirstOrDefaultAsync(c => c.UserId == user.Id && c.ContactId == contact.Id);

            if (existingContact != null)
            {
                await Clients.Caller.SendAsync("Error", "Contact already exists");
                return;
            }

            var newContact = new Contact
            {
                UserId = user.Id,
                ContactId = contact.Id
            };

            _context.Contacts.Add(newContact);
            await _context.SaveChangesAsync();

            await Clients.Caller.SendAsync("ContactAdded", email);
        }

        public async Task SendMessage(string receiverEmail, string message)
        {
            var senderEmail = Context.User.Identity.Name;
            var sender = await _userManager.FindByNameAsync(senderEmail);
            var receiver = await _userManager.FindByNameAsync(receiverEmail);

            if (sender == null || receiver == null)
            {
                await Clients.Caller.SendAsync("Error", "Sender or receiver not found");
                return;
            }

            var chat = await GetOrCreateChat(sender.Id, receiver.Id);

            var newMessage = new Message
            {
                ChatId = chat.Id,
                SenderId = sender.Id,
                Content = message,
                SentAt = DateTime.UtcNow,
                MessageType = "text"
            };

            _context.Messages.Add(newMessage);
            await _context.SaveChangesAsync();

            await Clients.User(receiver.Id).SendAsync("ReceiveMessage", sender.Email, message);
            await Clients.Caller.SendAsync("ReceiveMessage", "You", message);
        }

        public async Task LoadChatHistory(string contactEmail)
        {
            var userEmail = Context.User.Identity.Name;
            var user = await _userManager.FindByNameAsync(userEmail);
            var contact = await _userManager.FindByNameAsync(contactEmail);

            if (user == null || contact == null)
            {
                await Clients.Caller.SendAsync("Error", "User or contact not found");
                return;
            }

            var chat = await _context.Chats
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c =>
                    c.ChatMembers.Any(cm => cm.UserId == user.Id) &&
                    c.ChatMembers.Any(cm => cm.UserId == contact.Id));

            if (chat == null)
            {
                await Clients.Caller.SendAsync("ChatHistory", new List<object>());
                return;
            }

            var messages = chat.Messages.OrderBy(m => m.SentAt).Select(m => new
            {
                Email = m.Sender.Email,
                Content = m.Content,
                SentAt = m.SentAt
            }).ToList();

            await Clients.Caller.SendAsync("ChatHistory", messages);
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
                Name = "Private", // Установим значение для личных чатов
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

        private async Task<List<string>> GetUserContacts(string userId)
        {
            var contacts = await _context.Contacts
                .Where(c => c.UserId == userId)
                .Select(c => c.ContactUser.Email)
                .ToListAsync();
            return contacts;
        }
    }
}
