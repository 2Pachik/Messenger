using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Identity;
using WebApplication1.Models;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1.Hubs
{
    public class ChatHub : Hub
    {
        private readonly UserManager<AppUser> _userManager;

        public ChatHub(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }

        // Метод, который будет вызываться при подключении клиента к хабу
        public async override Task OnConnectedAsync()
        {
            var users = await GetAllUsers(); // Получаем список всех пользователей
            await Clients.Caller.SendAsync("LoadUsers", users); // Передаем список пользователей клиенту
            await base.OnConnectedAsync();
        }

        // Метод для получения списка всех пользователей
        private async Task<List<string>> GetAllUsers()
        {
            var users = await _userManager.Users.Select(u => u.UserName).ToListAsync();
            return users;
        }

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task SendPrivateMessage(string sender, string receiverEmail, string message)
        {
            var receiver = await _userManager.FindByNameAsync(receiverEmail);

            if (receiver != null)
            {
                await Clients.User(receiver.Id).SendAsync("ReceivePrivateMessage", sender, message);
            }
            else
            {
                // Обработка случая, когда получатель не найден
            }
        }
    }
}
