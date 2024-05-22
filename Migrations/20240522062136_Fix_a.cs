using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApplication1.Migrations
{
    /// <inheritdoc />
    public partial class Fix_a : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContentURL",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "MessageType",
                table: "Messages");

            migrationBuilder.RenameColumn(
                name: "CallID",
                table: "VideoCalls",
                newName: "Id");

            migrationBuilder.AddColumn<int>(
                name: "ChatId",
                table: "MediaFiles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MessageId",
                table: "MediaFiles",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MediaFiles_ChatId",
                table: "MediaFiles",
                column: "ChatId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaFiles_MessageId",
                table: "MediaFiles",
                column: "MessageId");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MediaFiles_Chats_ChatId",
                table: "MediaFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_MediaFiles_Messages_MessageId",
                table: "MediaFiles");

            migrationBuilder.DropIndex(
                name: "IX_MediaFiles_ChatId",
                table: "MediaFiles");

            migrationBuilder.DropIndex(
                name: "IX_MediaFiles_MessageId",
                table: "MediaFiles");

            migrationBuilder.DropColumn(
                name: "ChatId",
                table: "MediaFiles");

            migrationBuilder.DropColumn(
                name: "MessageId",
                table: "MediaFiles");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "VideoCalls",
                newName: "CallID");

            migrationBuilder.AddColumn<string>(
                name: "ContentURL",
                table: "Messages",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MessageType",
                table: "Messages",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
