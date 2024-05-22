using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Identity;
using WebApplication1.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApplication1.Data;

namespace WebApplication1.Hubs
{
    public class ChatHub : Hub
    {
    //    private readonly UserManager<AppUser> _userManager;
    //    private readonly AppDbContext _context;

    //    public ChatHub(UserManager<AppUser> userManager, AppDbContext context)
    //    {
    //        _userManager = userManager;
    //        _context = context;
    //    }

    //    public async override Task OnConnectedAsync()
    //    {
    //        var users = await GetAllUsers(); // Получаем список всех пользователей

    //        var userEmail = Context.User.Identity.Name;
    //        var user = await _userManager.FindByNameAsync(userEmail);

    //        if (user != null)
    //        {
    //            var messages = await GetMessages(user.Id);
    //            await Clients.Caller.SendAsync("LoadData", users, messages); // Передаем список пользователей клиенту
    //            //await Clients.Caller.SendAsync("LoadUsers", users); // Передаем список пользователей клиенту
    //            //await Clients.Caller.SendAsync("LoadMessages", messages);
    //        }

    //        await base.OnConnectedAsync();
    //    }


    //    private async Task<List<MessageDto>> GetMessages(string userId)
    //    {
    //        var messages = await _context.UserConversations
    //            .Where(uc => uc.UserId == userId)
    //            .SelectMany(uc => uc.Conversation.Messages)
    //            .Select(m => new MessageDto
    //            {
    //                Sender = m.Sender.Email,
    //                Content = m.Content,
    //                SentAt = m.SentAt
    //            })
    //            .ToListAsync();

    //        return messages;
    //    }

    //    private async Task<List<string>> GetAllUsers()
    //    {
    //        var users = await _userManager.Users.Select(u => u.UserName).ToListAsync();
    //        return users;
    //    }

    //    public async Task SendPrivateMessage(string sender, string receiverEmail, string message)
    //    {
    //        var receiver = await _userManager.FindByNameAsync(receiverEmail);

    //        if (receiver != null)
    //        {
    //            var conversation = await GetOrCreateConversation(sender, receiver.Email);

    //            var newMessage = new Message
    //            {
    //                ConversationId = conversation.Id,
    //                SenderId = (await _userManager.FindByNameAsync(sender)).Id,
    //                Content = message
    //            };

    //            _context.Messages.Add(newMessage);
    //            await _context.SaveChangesAsync();

    //            await Clients.User(receiver.Id).SendAsync("ReceivePrivateMessage", sender, message);
    //        }
    //        else
    //        {
    //            // Handle case when the receiver is not found
    //        }
    //    }

    //    private async Task<Conversation> GetOrCreateConversation(string senderEmail, string receiverEmail)
    //    {
    //        var conversation = await _context.UserConversations
    //            .Where(uc => (uc.User.Email == senderEmail && uc.User.Email == receiverEmail))
    //            .Select(uc => uc.Conversation)
    //            .FirstOrDefaultAsync();

    //        if (conversation == null)
    //        {
    //            conversation = new Conversation
    //            {
    //                Name = $"{senderEmail} - {receiverEmail}" // Set a meaningful name for the conversation
    //            };
    //            _context.Conversations.Add(conversation);

    //            await _context.SaveChangesAsync();

    //            var sender = await _userManager.FindByNameAsync(senderEmail);
    //            var receiver = await _userManager.FindByNameAsync(receiverEmail);

    //            _context.UserConversations.Add(new UserConversation { UserId = sender.Id, ConversationId = conversation.Id });
    //            _context.UserConversations.Add(new UserConversation { UserId = receiver.Id, ConversationId = conversation.Id });

    //            await _context.SaveChangesAsync();
    //        }

    //        return conversation;
    //    }

    }
}
