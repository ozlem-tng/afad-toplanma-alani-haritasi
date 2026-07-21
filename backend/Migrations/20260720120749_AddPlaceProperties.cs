using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPlaceProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "category",
                table: "places");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "places",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "geom",
                table: "places",
                newName: "Geom");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "places",
                newName: "Id");

            migrationBuilder.AddColumn<double>(
                name: "AlanM2",
                table: "places",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "AlanTur",
                table: "places",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Kapasite",
                table: "places",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AlanM2",
                table: "places");

            migrationBuilder.DropColumn(
                name: "AlanTur",
                table: "places");

            migrationBuilder.DropColumn(
                name: "Kapasite",
                table: "places");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "places",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "Geom",
                table: "places",
                newName: "geom");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "places",
                newName: "id");

            migrationBuilder.AddColumn<string>(
                name: "category",
                table: "places",
                type: "text",
                nullable: true);
        }
    }
}
