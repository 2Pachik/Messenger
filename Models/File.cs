namespace WebApplication1.Models
{
    public class File
    {
        public int Id { get; set; }
        public int ChatId { get; set; }
        public Chat Chat { get; set; }
        public string SenderId { get; set; }
        public AppUser Sender { get; set; }
        public string FilePath { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}
