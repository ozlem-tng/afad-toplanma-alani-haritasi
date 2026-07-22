using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAreaGeometry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<MultiPolygon>(
                name: "alan_geometrisi",
                table: "toplanma_alanlari",
                type: "geometry(MultiPolygon,4326)",
                nullable: true);

            migrationBuilder.AddColumn<MultiPolygon>(
                name: "alan_geometrisi",
                table: "aday_noktalar",
                type: "geometry(MultiPolygon,4326)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_toplanma_alanlari_alan_geometrisi",
                table: "toplanma_alanlari",
                column: "alan_geometrisi")
                .Annotation("Npgsql:IndexMethod", "gist");

            migrationBuilder.CreateIndex(
                name: "IX_aday_noktalar_alan_geometrisi",
                table: "aday_noktalar",
                column: "alan_geometrisi")
                .Annotation("Npgsql:IndexMethod", "gist");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_toplanma_alanlari_alan_geometrisi",
                table: "toplanma_alanlari");

            migrationBuilder.DropIndex(
                name: "IX_aday_noktalar_alan_geometrisi",
                table: "aday_noktalar");

            migrationBuilder.DropColumn(
                name: "alan_geometrisi",
                table: "toplanma_alanlari");

            migrationBuilder.DropColumn(
                name: "alan_geometrisi",
                table: "aday_noktalar");
        }
    }
}
