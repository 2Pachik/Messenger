using WebApplication1.Models;

public class MessageRead
{
    public int Id { get; set; }  // Суррогатный первичный ключ
    public int MessageID { get; set; }
    public string UserID { get; set; }
    public DateTime ReadTimestamp { get; set; }

    public virtual Message Message { get; set; }
    public virtual AppUser User { get; set; }
}
