using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApplication1.Migrations
{
    /// <inheritdoc />
    public partial class Fix_c : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MediaFiles_AspNetUsers_UserId",
                table: "MediaFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_MediaFiles_Chats_ChatId",
                table: "MediaFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_MediaFiles_Messages_MessageId",
                table: "MediaFiles");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_Timestamp",
                table: "Messages",
                column: "Timestamp");

            migrationBuilder.AddForeignKey(
                name: "FK_MediaFiles_AspNetUsers_UserId",
                table: "MediaFiles",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MediaFiles_Chats_ChatId",
                table: "MediaFiles",
                column: "ChatId",
                principalTable: "Chats",
                principalColumn: "ChatID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MediaFiles_Messages_MessageId",
                table: "MediaFiles",
                column: "MessageId",
                principalTable: "Messages",
                principalColumn: "MessageID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MediaFiles_AspNetUsers_UserId",
                table: "MediaFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_MediaFiles_Chats_ChatId",
                table: "MediaFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_MediaFiles_Messages_MessageId",
                table: "MediaFiles");

            migrationBuilder.DropIndex(
                name: "IX_Messages_Timestamp",
                table: "Messages");

            migrationBuilder.AddForeignKey(
                name: "FK_MediaFiles_AspNetUsers_UserId",
                table: "MediaFiles",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MediaFiles_Chats_ChatId",
                table: "MediaFiles",
                column: "ChatId",
                principalTable: "Chats",
                principalColumn: "ChatID");

            migrationBuilder.AddForeignKey(
                name: "FK_MediaFiles_Messages_MessageId",
                table: "MediaFiles",
                column: "MessageId",
                principalTable: "Messages",
                principalColumn: "MessageID");
        }
    }
}
