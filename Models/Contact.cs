namespace WebApplication1.Models
{
    public class Contact
    {
        public string UserId { get; set; }
        public AppUser User { get; set; }
        public string ContactId { get; set; }
        public AppUser ContactUser { get; set; }
        public string DisplayName { get; set; } // Новое поле для отображаемого имени
    }
}
