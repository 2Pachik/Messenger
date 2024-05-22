using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;  // Убедись, что namespace соответствует твоему проекту

namespace WebApplication1.Data
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Chat> Chats { get; set; }
        public DbSet<ChatParticipant> ChatParticipants { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<MediaFile> MediaFiles { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<MessageRead> MessageReads { get; set; }
        public DbSet<VideoCall> VideoCalls { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // AppUser and Identity
            modelBuilder.Entity<AppUser>()
                .HasMany(u => u.Messages)
                .WithOne(m => m.User)
                .HasForeignKey(m => m.UserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AppUser>()
                .HasMany(u => u.ChatParticipants)
                .WithOne(cp => cp.User)
                .HasForeignKey(cp => cp.UserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AppUser>()
                .HasMany(u => u.Contacts)
                .WithOne(c => c.User)
                .HasForeignKey(c => c.UserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AppUser>()
                .HasMany(u => u.MediaFiles)
                .WithOne(mf => mf.User)
                .HasForeignKey(mf => mf.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Chat
            modelBuilder.Entity<Chat>()
                .HasMany(c => c.Messages)
                .WithOne(m => m.Chat)
                .HasForeignKey(m => m.ChatID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Chat>()
                .HasMany(c => c.Participants)
                .WithOne(p => p.Chat)
                .HasForeignKey(p => p.ChatID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Chat>()
                .HasMany(c => c.MediaFiles)
                .WithOne(mf => mf.Chat)
                .HasForeignKey(mf => mf.ChatId)
                .OnDelete(DeleteBehavior.Cascade);

            // ChatParticipant
            modelBuilder.Entity<ChatParticipant>()
                .HasKey(cp => new { cp.ChatID, cp.UserID });

            // Contact
            modelBuilder.Entity<Contact>()
                .HasKey(c => c.ContactID);

            modelBuilder.Entity<Contact>()
                .HasOne(c => c.Friend)
                .WithMany()
                .HasForeignKey(c => c.FriendID)
                .OnDelete(DeleteBehavior.Restrict);

            // MediaFile
            modelBuilder.Entity<MediaFile>()
                .HasKey(mf => mf.Id);

            modelBuilder.Entity<MediaFile>()
                .HasOne(mf => mf.Message)
                .WithMany(m => m.MediaFiles)
                .HasForeignKey(mf => mf.MessageId)
                .OnDelete(DeleteBehavior.Restrict);

            // Message
            modelBuilder.Entity<Message>()
                .HasKey(m => m.MessageID);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.User)
                .WithMany(u => u.Messages)
                .HasForeignKey(m => m.UserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Chat)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ChatID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Message>()
                .HasIndex(m => m.Timestamp);

            // MessageRead
            modelBuilder.Entity<MessageRead>()
                .HasKey(mr => mr.Id);

            modelBuilder.Entity<MessageRead>()
                .HasOne(mr => mr.Message)
                .WithMany()
                .HasForeignKey(mr => mr.MessageID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MessageRead>()
                .HasOne(mr => mr.User)
                .WithMany()
                .HasForeignKey(mr => mr.UserID)
                .OnDelete(DeleteBehavior.Restrict);

            // VideoCall
            modelBuilder.Entity<VideoCall>()
                .HasKey(vc => vc.Id);

            modelBuilder.Entity<VideoCall>()
                .HasOne(vc => vc.Caller)
                .WithMany()
                .HasForeignKey(vc => vc.CallerID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VideoCall>()
                .HasOne(vc => vc.Receiver)
                .WithMany()
                .HasForeignKey(vc => vc.ReceiverID)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
