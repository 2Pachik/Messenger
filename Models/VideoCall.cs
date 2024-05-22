namespace WebApplication1.Models
{
    public class VideoCall
    {
        public int Id { get; set; }
        public int ChatId { get; set; }
        public Chat Chat { get; set; }
        public string CallerId { get; set; }
        public AppUser Caller { get; set; }
        public string CalleeId { get; set; }
        public AppUser Callee { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime EndedAt { get; set; }
    }
}
