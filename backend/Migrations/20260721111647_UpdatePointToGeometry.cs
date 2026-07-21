using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePointToGeometry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:postgis", ",,");

            migrationBuilder.AlterColumn<Point>(
                name: "point_wkt",
                table: "toplanma_alanlari",
                type: "geometry",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:postgis", ",,");

            migrationBuilder.AlterColumn<string>(
                name: "point_wkt",
                table: "toplanma_alanlari",
                type: "text",
                nullable: true,
                oldClrType: typeof(Point),
                oldType: "geometry",
                oldNullable: true);
        }
    }
}
