using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Models
{
    public class AppUser:IdentityUser
    {
        [StringLength(100)]
        [MaxLength(100)]
        [Required]
        public string? Email { get; set; }
    }
}
