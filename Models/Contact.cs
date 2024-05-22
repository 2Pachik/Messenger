namespace WebApplication1.Models
{
    public class Contact
    {
        public int ContactID { get; set; }
        public string UserID { get; set; }
        public string FriendID { get; set; }
        public string Status { get; set; }
        public DateTime AddedDate { get; set; }

        public virtual AppUser User { get; set; }
        public virtual AppUser Friend { get; set; }
    }

}
