using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Identity;
using WebApplication1.Models;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.ViewModels;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using System.Linq;
using Humanizer;

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
                ContactId = contact.Id,
                DisplayName = contact.Email // Устанавливаем первоначальное отображаемое имя как email
            };

            _context.Contacts.Add(newContact);
            await _context.SaveChangesAsync();

            await Clients.Caller.SendAsync("ContactAdded", new ContactVM
            {
                Email = contact.Email,
                DisplayName = newContact.DisplayName,
                AvatarPath = contact.AvatarPath
            });
        }

        public async Task DeleteContactByEmail(string contactEmail)
        {
            var userEmail = Context.User.Identity.Name;
            var user = await _userManager.FindByNameAsync(userEmail);
            var contact = await _userManager.FindByNameAsync(contactEmail);

            if (user == null || contact == null)
            {
                await Clients.Caller.SendAsync("Error", "User or contact not found");
                return;
            }

            var contactToRemove = await _context.Contacts
                .FirstOrDefaultAsync(c => c.UserId == user.Id && c.ContactId == contact.Id);

            if (contactToRemove != null)
            {
                _context.Contacts.Remove(contactToRemove);
                await _context.SaveChangesAsync();

                await Clients.Caller.SendAsync("ContactDeleted", contactEmail);
            }
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

            var receiverContact = await _context.Contacts.FirstOrDefaultAsync(c => c.UserId == receiver.Id && c.ContactId == sender.Id);
            var senderDisplayName = receiverContact?.DisplayName ?? sender.Email;

            await Clients.User(receiver.Id).SendAsync("ReceiveMessage", senderDisplayName, message, sender.AvatarPath);
            await Clients.Caller.SendAsync("ReceiveMessage", "You", message, sender.AvatarPath);
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
                .ThenInclude(m => m.Sender)
                .FirstOrDefaultAsync(c =>
                    c.ChatMembers.Any(cm => cm.UserId == user.Id) &&
                    c.ChatMembers.Any(cm => cm.UserId == contact.Id));

            if (chat == null)
            {
                await Clients.Caller.SendAsync("ChatHistory", new List<object>());
                return;
            }

            var userContact = await _context.Contacts.FirstOrDefaultAsync(c => c.UserId == user.Id && c.ContactId == contact.Id);
            var contactDisplayName = userContact?.DisplayName ?? contact.Email;

            var messages = chat.Messages.OrderBy(m => m.SentAt).Select(m => new
            {
                Email = m.Sender.Email,
                DisplayName = m.SenderId == user.Id ? "You" : contactDisplayName,
                Content = m.Content,
                SentAt = m.SentAt,
                Avatar = m.Sender.AvatarPath,
                MessageType = m.MessageType
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

        private async Task<List<ContactVM>> GetUserContacts(string userId)
        {
            var contacts = await _context.Contacts
                .Where(c => c.UserId == userId)
                .Select(c => new ContactVM
                {
                    Email = c.ContactUser.Email,
                    DisplayName = c.DisplayName,
                    AvatarPath = c.ContactUser.AvatarPath ?? "/uploads/avatars/default.jpg"
                })
                .ToListAsync();
            return contacts;
        }

        public async Task UpdateContactDisplayName(string contactEmail, string newDisplayName)
        {
            var userEmail = Context.User.Identity.Name;
            var user = await _userManager.FindByNameAsync(userEmail);
            var contact = await _userManager.FindByNameAsync(contactEmail);

            if (user == null || contact == null)
            {
                await Clients.Caller.SendAsync("Error", "User or contact not found");
                return;
            }

            var existingContact = await _context.Contacts
                .FirstOrDefaultAsync(c => c.UserId == user.Id && c.ContactId == contact.Id);

            if (existingContact != null)
            {
                existingContact.DisplayName = newDisplayName;
                _context.Contacts.Update(existingContact);
                await _context.SaveChangesAsync();

                var contactVM = new ContactVM
                {
                    Email = contactEmail,
                    DisplayName = newDisplayName
                };

                await Clients.Caller.SendAsync("ContactUpdated", contactVM);
            }
        }

        public async Task UpdateAvatar(string contactEmail, string avatarPath)
        {
            var userEmail = Context.User.Identity.Name;
            var user = await _userManager.FindByNameAsync(userEmail);
            var contact = await _userManager.FindByNameAsync(contactEmail);

            if (user == null || contact == null)
            {
                await Clients.Caller.SendAsync("Error", "User or contact not found");
                return;
            }

            var existingContact = await _context.Contacts
                .FirstOrDefaultAsync(c => c.UserId == user.Id && c.ContactId == contact.Id);

            if (existingContact != null)
            {
                contact.AvatarPath = avatarPath;
                _context.Users.Update(contact);
                await _context.SaveChangesAsync();

                await Clients.User(user.Id).SendAsync("AvatarUpdated", new ContactVM
                {
                    Email = contactEmail,
                    AvatarPath = avatarPath
                });
            }
        }
    }
}
