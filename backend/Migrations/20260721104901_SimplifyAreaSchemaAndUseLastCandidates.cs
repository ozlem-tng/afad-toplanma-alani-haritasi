using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SimplifyAreaSchemaAndUseLastCandidates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                INSERT INTO toplanma_alanlari
                    (id, name, alan_tur, alan_m2, mahalle_adi, ilce_adi,
                     kapasite, konum, silinme_tarihi)
                SELECT kaynak_id, name, alan_tur, alan_m2, mahalle_adi, ilce_adi,
                       kapasite, konum, NULL
                FROM aday_noktalar
                WHERE kabul_edildi IS NULL
                ON CONFLICT (id) DO NOTHING;

                DELETE FROM aday_noktalar
                WHERE kabul_edildi IS NULL;

                CREATE TEMP TABLE son_aday_ids (id integer PRIMARY KEY) ON COMMIT DROP;

                INSERT INTO son_aday_ids (id)
                SELECT t.id
                FROM toplanma_alanlari AS t
                WHERE t.silinme_tarihi IS NULL
                  AND NOT EXISTS (
                      SELECT 1
                      FROM aday_noktalar AS a
                      WHERE a.toplanma_alani_id = t.id)
                ORDER BY t.id DESC
                LIMIT 15;

                INSERT INTO aday_noktalar
                    (kaynak_id, name, alan_tur, alan_m2, mahalle_adi, ilce_adi,
                     kapasite, konum, kabul_edildi, olusturulma_tarihi)
                SELECT t.id, t.name, t.alan_tur, t.alan_m2, t.mahalle_adi, t.ilce_adi,
                       t.kapasite, t.konum, NULL, CURRENT_TIMESTAMP
                FROM toplanma_alanlari AS t
                INNER JOIN son_aday_ids AS s ON s.id = t.id;

                DELETE FROM toplanma_alanlari AS t
                USING son_aday_ids AS s
                WHERE t.id = s.id;

                SELECT setval(
                    pg_get_serial_sequence('toplanma_alanlari', 'id'),
                    COALESCE((SELECT MAX(id) FROM toplanma_alanlari), 1),
                    true);
                """);

            migrationBuilder.DropIndex(
                name: "IX_toplanma_alanlari_kaynak_id",
                table: "toplanma_alanlari");

            migrationBuilder.DropIndex(
                name: "IX_aday_noktalar_kaynak_id",
                table: "aday_noktalar");

            migrationBuilder.DropColumn(
                name: "guncellenme_tarihi",
                table: "toplanma_alanlari");

            migrationBuilder.DropColumn(
                name: "kaynak_id",
                table: "toplanma_alanlari");

            migrationBuilder.DropColumn(
                name: "olusturulma_tarihi",
                table: "toplanma_alanlari");

            migrationBuilder.DropColumn(
                name: "silinen_kullanici_id",
                table: "toplanma_alanlari");

            migrationBuilder.DropColumn(
                name: "karar_veren_kullanici_id",
                table: "aday_noktalar");

            migrationBuilder.DropColumn(
                name: "kaynak_id",
                table: "aday_noktalar");

            migrationBuilder.DropColumn(
                name: "olusturan_kullanici_id",
                table: "aday_noktalar");

            migrationBuilder.RenameColumn(
                name: "konum",
                table: "toplanma_alanlari",
                newName: "point_wkt");

            migrationBuilder.RenameIndex(
                name: "IX_toplanma_alanlari_konum",
                table: "toplanma_alanlari",
                newName: "IX_toplanma_alanlari_point_wkt");

            migrationBuilder.RenameColumn(
                name: "konum",
                table: "aday_noktalar",
                newName: "point_wkt");

            migrationBuilder.RenameIndex(
                name: "IX_aday_noktalar_konum",
                table: "aday_noktalar",
                newName: "IX_aday_noktalar_point_wkt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "point_wkt",
                table: "toplanma_alanlari",
                newName: "konum");

            migrationBuilder.RenameIndex(
                name: "IX_toplanma_alanlari_point_wkt",
                table: "toplanma_alanlari",
                newName: "IX_toplanma_alanlari_konum");

            migrationBuilder.RenameColumn(
                name: "point_wkt",
                table: "aday_noktalar",
                newName: "konum");

            migrationBuilder.RenameIndex(
                name: "IX_aday_noktalar_point_wkt",
                table: "aday_noktalar",
                newName: "IX_aday_noktalar_konum");

            migrationBuilder.AddColumn<DateTime>(
                name: "guncellenme_tarihi",
                table: "toplanma_alanlari",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "kaynak_id",
                table: "toplanma_alanlari",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "olusturulma_tarihi",
                table: "toplanma_alanlari",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "silinen_kullanici_id",
                table: "toplanma_alanlari",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "karar_veren_kullanici_id",
                table: "aday_noktalar",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "kaynak_id",
                table: "aday_noktalar",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "olusturan_kullanici_id",
                table: "aday_noktalar",
                type: "integer",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE toplanma_alanlari SET kaynak_id = id;
                UPDATE aday_noktalar SET kaynak_id = id::integer;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_toplanma_alanlari_kaynak_id",
                table: "toplanma_alanlari",
                column: "kaynak_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_aday_noktalar_kaynak_id",
                table: "aday_noktalar",
                column: "kaynak_id",
                unique: true);
        }
    }
}
