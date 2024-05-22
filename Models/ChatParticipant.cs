namespace WebApplication1.Models
{
    public class ChatParticipant
    {
        public int ChatID { get; set; }
        public string UserID { get; set; }
        public DateTime JoinedDate { get; set; }
        public bool IsAdmin { get; set; }

        public virtual Chat Chat { get; set; }
        public virtual AppUser User { get; set; }
    }

}
