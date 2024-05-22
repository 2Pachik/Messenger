using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;  // Убедись, что namespace соответствует твоему проекту

namespace WebApplication1.Data
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Contact> Contacts { get; set; }
        public DbSet<Chat> Chats { get; set; }
        public DbSet<ChatMember> ChatMembers { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Models.File> Files { get; set; }
        public DbSet<VoiceMessage> VoiceMessages { get; set; }
        public DbSet<VideoCall> VideoCalls { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Contact>()
                .HasKey(c => new { c.UserId, c.ContactId });

            modelBuilder.Entity<Contact>()
                .HasOne(c => c.User)
                .WithMany(u => u.Contacts)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Contact>()
                .HasOne(c => c.ContactUser)
                .WithMany()
                .HasForeignKey(c => c.ContactId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Chat>()
                .HasKey(c => c.Id);

            modelBuilder.Entity<ChatMember>()
                .HasKey(cm => new { cm.ChatId, cm.UserId });

            modelBuilder.Entity<ChatMember>()
                .HasOne(cm => cm.Chat)
                .WithMany(c => c.ChatMembers)
                .HasForeignKey(cm => cm.ChatId);

            modelBuilder.Entity<ChatMember>()
                .HasOne(cm => cm.User)
                .WithMany(u => u.ChatMembers)
                .HasForeignKey(cm => cm.UserId);

            modelBuilder.Entity<Message>()
                .HasKey(m => m.Id);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Chat)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ChatId);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany(u => u.Messages)
                .HasForeignKey(m => m.SenderId);

            modelBuilder.Entity<Models.File>()
                .HasKey(f => f.Id);

            modelBuilder.Entity<Models.File>()
                .HasOne(f => f.Chat)
                .WithMany(c => c.Files)
                .HasForeignKey(f => f.ChatId);

            modelBuilder.Entity<Models.File>()
                .HasOne(f => f.Sender)
                .WithMany(u => u.Files)
                .HasForeignKey(f => f.SenderId);

            modelBuilder.Entity<VoiceMessage>()
                .HasKey(vm => vm.Id);

            modelBuilder.Entity<VoiceMessage>()
                .HasOne(vm => vm.Chat)
                .WithMany(c => c.VoiceMessages)
                .HasForeignKey(vm => vm.ChatId);

            modelBuilder.Entity<VoiceMessage>()
                .HasOne(vm => vm.Sender)
                .WithMany(u => u.VoiceMessages)
                .HasForeignKey(vm => vm.SenderId);

            modelBuilder.Entity<VideoCall>()
                .HasKey(vc => vc.Id);

            modelBuilder.Entity<VideoCall>()
                .HasOne(vc => vc.Chat)
                .WithMany(c => c.VideoCalls)
                .HasForeignKey(vc => vc.ChatId);

            modelBuilder.Entity<VideoCall>()
                .HasOne(vc => vc.Caller)
                .WithMany(u => u.VideoCalls)
                .HasForeignKey(vc => vc.CallerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VideoCall>()
                .HasOne(vc => vc.Callee)
                .WithMany()
                .HasForeignKey(vc => vc.CalleeId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
