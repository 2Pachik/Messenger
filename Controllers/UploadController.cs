using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IWebHostEnvironment _environment;

        public UploadController(UserManager<AppUser> userManager, IWebHostEnvironment environment)
        {
            _userManager = userManager;
            _environment = environment;
        }

        [HttpPost("avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile avatar)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return BadRequest(new { success = false, error = "User not found" });
            }

            var uploads = Path.Combine(_environment.WebRootPath, "uploads", "avatars");
            if (!Directory.Exists(uploads))
            {
                Directory.CreateDirectory(uploads);
            }

            var fileName = $"{user.Id}{Path.GetExtension(avatar.FileName)}";
            var filePath = Path.Combine(uploads, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await avatar.CopyToAsync(stream);
            }

            var avatarUrl = $"/uploads/avatars/{fileName}";

            user.AvatarPath = avatarUrl;
            await _userManager.UpdateAsync(user);

            return Ok(new { success = true, avatarUrl });
        }
    }
}