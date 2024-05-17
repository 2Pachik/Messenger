namespace WebApplication1.Models
{
    public class Message
    {
        public int Id { get; set; }
        public int ConversationId { get; set; }
        public string SenderId { get; set; }
        public string Content { get; set; }
        public DateTime SentAt { get; set; } = DateTime.Now;

        public Conversation Conversation { get; set; }
        public AppUser Sender { get; set; }
    }
}
