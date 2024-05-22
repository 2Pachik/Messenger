namespace WebApplication1.Models
{
    public class MediaFile
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string FilePath { get; set; }
        public string FileType { get; set; }
        public long Size { get; set; }
        public DateTime UploadDate { get; set; }

        // Добавление ссылок на Message и Chat
        public int? MessageId { get; set; }
        public int? ChatId { get; set; }

        public virtual AppUser User { get; set; }
        public virtual Message Message { get; set; }
        public virtual Chat Chat { get; set; }
    }
}
