namespace WebApplication1.Models
{
    public class VideoCall
    {
        public int Id { get; set; }
        public string CallerID { get; set; }
        public string ReceiverID { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string CallStatus { get; set; }

        public virtual AppUser Caller { get; set; }
        public virtual AppUser Receiver { get; set; }
    }

}
