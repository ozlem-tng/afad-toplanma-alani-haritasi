using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPlacesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Places",
                table: "Places");

            migrationBuilder.RenameTable(
                name: "Places",
                newName: "places");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "places",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "Geom",
                table: "places",
                newName: "geom");

            migrationBuilder.RenameColumn(
                name: "Category",
                table: "places",
                newName: "category");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "places",
                newName: "id");

            migrationBuilder.AlterColumn<Point>(
                name: "geom",
                table: "places",
                type: "geometry(Point, 4326)",
                nullable: false,
                oldClrType: typeof(Point),
                oldType: "geometry");

            migrationBuilder.AlterColumn<string>(
                name: "category",
                table: "places",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddPrimaryKey(
                name: "PK_places",
                table: "places",
                column: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_places",
                table: "places");

            migrationBuilder.RenameTable(
                name: "places",
                newName: "Places");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "Places",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "geom",
                table: "Places",
                newName: "Geom");

            migrationBuilder.RenameColumn(
                name: "category",
                table: "Places",
                newName: "Category");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Places",
                newName: "Id");

            migrationBuilder.AlterColumn<Point>(
                name: "Geom",
                table: "Places",
                type: "geometry",
                nullable: false,
                oldClrType: typeof(Point),
                oldType: "geometry(Point, 4326)");

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                table: "Places",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Places",
                table: "Places",
                column: "Id");
        }
    }
}
