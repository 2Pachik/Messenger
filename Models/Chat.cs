using System;
using System.Collections.Generic;

namespace WebApplication1.Models
{
    public class Chat
    {
        public int ChatID { get; set; }
        public string ChatName { get; set; }
        public bool IsGroup { get; set; }
        public DateTime CreationTime { get; set; }
        public virtual ICollection<Message> Messages { get; set; }
        public virtual ICollection<ChatParticipant> Participants { get; set; }
        public virtual ICollection<MediaFile> MediaFiles { get; set; }  // Добавлено для хранения медиафайлов

        public Chat()
        {
            Messages = new List<Message>();
            Participants = new List<ChatParticipant>();
            MediaFiles = new List<MediaFile>();  // Инициализация коллекции медиафайлов
        }
    }
}
