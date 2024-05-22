using System;

namespace WebApplication1.Models
{
    public class Message
    {
        public int MessageID { get; set; }
        public string UserID { get; set; }
        public int ChatID { get; set; }
        public string Text { get; set; }
        public DateTime Timestamp { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsRead { get; set; } // Добавлено свойство для отслеживания прочтения сообщения
        public virtual ICollection<MediaFile> MediaFiles { get; set; } = new List<MediaFile>();

        public virtual AppUser User { get; set; }
        public virtual Chat Chat { get; set; }
    }
}
