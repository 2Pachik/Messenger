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
        public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
        public virtual ICollection<ChatParticipant> ChatParticipants { get; set; } = new List<ChatParticipant>();
        public virtual ICollection<Contact> Contacts { get; set; } = new List<Contact>(); // Если у пользователя есть контакты
        public virtual ICollection<MediaFile> MediaFiles { get; set; } = new List<MediaFile>(); // Если у пользователя есть контакты

    }
}
