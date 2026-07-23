using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateToplanmaAlaniSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Polygon>(
                name: "polygon_wkt",
                table: "toplanma_alanlari",
                type: "geometry(Polygon,4326)",
                nullable: true);

            migrationBuilder.AddColumn<Polygon>(
                name: "polygon_wkt",
                table: "aday_noktalar",
                type: "geometry(Polygon,4326)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_toplanma_alanlari_polygon_wkt",
                table: "toplanma_alanlari",
                column: "polygon_wkt")
                .Annotation("Npgsql:IndexMethod", "gist");

            migrationBuilder.CreateIndex(
                name: "IX_aday_noktalar_polygon_wkt",
                table: "aday_noktalar",
                column: "polygon_wkt")
                .Annotation("Npgsql:IndexMethod", "gist");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_toplanma_alanlari_polygon_wkt",
                table: "toplanma_alanlari");

            migrationBuilder.DropIndex(
                name: "IX_aday_noktalar_polygon_wkt",
                table: "aday_noktalar");

            migrationBuilder.DropColumn(
                name: "polygon_wkt",
                table: "toplanma_alanlari");

            migrationBuilder.DropColumn(
                name: "polygon_wkt",
                table: "aday_noktalar");
        }
    }
}
