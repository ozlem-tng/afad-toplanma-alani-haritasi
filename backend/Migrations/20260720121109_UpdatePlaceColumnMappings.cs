using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePlaceColumnMappings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "places",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "Kapasite",
                table: "places",
                newName: "kapasite");

            migrationBuilder.RenameColumn(
                name: "Geom",
                table: "places",
                newName: "geom");

            migrationBuilder.RenameColumn(
                name: "AlanTur",
                table: "places",
                newName: "alan_tur");

            migrationBuilder.RenameColumn(
                name: "AlanM2",
                table: "places",
                newName: "alan_m2");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "name",
                table: "places",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "kapasite",
                table: "places",
                newName: "Kapasite");

            migrationBuilder.RenameColumn(
                name: "geom",
                table: "places",
                newName: "Geom");

            migrationBuilder.RenameColumn(
                name: "alan_tur",
                table: "places",
                newName: "AlanTur");

            migrationBuilder.RenameColumn(
                name: "alan_m2",
                table: "places",
                newName: "AlanM2");
        }
    }
}
