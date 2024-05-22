namespace WebApplication1.Models
{
    public class ChatMember
    {
        public int ChatId { get; set; }
        public Chat Chat { get; set; }
        public string UserId { get; set; }
        public AppUser User { get; set; }
    }
}
