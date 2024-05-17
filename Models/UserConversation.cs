namespace WebApplication1.Models
{
    public class UserConversation
    {
        public string UserId { get; set; }
        public int ConversationId { get; set; }

        public AppUser User { get; set; }
        public Conversation Conversation { get; set; }
    }
}
