using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Models
{
    public class AppUser : IdentityUser
    {
        [StringLength(100)]
        [MaxLength(100)]
        [Required]
        public override string Email { get; set; } = null!;

        public ICollection<Contact> Contacts { get; set; } = new List<Contact>();
        public ICollection<ChatMember> ChatMembers { get; set; } = new List<ChatMember>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();
        public ICollection<File> Files { get; set; } = new List<File>();
        public ICollection<VoiceMessage> VoiceMessages { get; set; } = new List<VoiceMessage>();
        public ICollection<VideoCall> VideoCalls { get; set; } = new List<VideoCall>();
    }
}
