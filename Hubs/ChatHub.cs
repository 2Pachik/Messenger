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
