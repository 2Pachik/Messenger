namespace WebApplication1.Models
{
    public class Conversation
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public ICollection<Message> Messages { get; set; }
        public ICollection<UserConversation> UserConversations { get; set; }
    }
}
