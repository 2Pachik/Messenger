namespace WebApplication1.Models
{
    public class Chat
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsGroup { get; set; }
        public DateTime CreatedAt { get; set; }
        public ICollection<ChatMember> ChatMembers { get; set; }
        public ICollection<Message> Messages { get; set; }
        public ICollection<File> Files { get; set; }
        public ICollection<VoiceMessage> VoiceMessages { get; set; }
        public ICollection<VideoCall> VideoCalls { get; set; }
    }
}
