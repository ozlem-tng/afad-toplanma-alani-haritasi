using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCandidateWorkflowAndPostGis : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:postgis", ",,");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "toplanma_alanlari",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

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

            migrationBuilder.AddColumn<Point>(
                name: "konum",
                table: "toplanma_alanlari",
                type: "geometry(Point,4326)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "olusturulma_tarihi",
                table: "toplanma_alanlari",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<int>(
                name: "silinen_kullanici_id",
                table: "toplanma_alanlari",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "silinme_tarihi",
                table: "toplanma_alanlari",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE toplanma_alanlari
                SET kaynak_id = id,
                    konum = ST_SetSRID(ST_GeomFromText(point_wkt), 4326)
                WHERE point_wkt IS NOT NULL;

                ALTER TABLE toplanma_alanlari
                ALTER COLUMN konum SET NOT NULL;

                ALTER TABLE toplanma_alanlari
                DROP COLUMN point_wkt;
                """);

            migrationBuilder.CreateTable(
                name: "aday_noktalar",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    kaynak_id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    alan_tur = table.Column<string>(type: "text", nullable: false),
                    alan_m2 = table.Column<double>(type: "double precision", nullable: false),
                    mahalle_adi = table.Column<string>(type: "text", nullable: true),
                    ilce_adi = table.Column<string>(type: "text", nullable: true),
                    kapasite = table.Column<int>(type: "integer", nullable: false),
                    konum = table.Column<Point>(type: "geometry(Point,4326)", nullable: false),
                    kabul_edildi = table.Column<bool>(type: "boolean", nullable: true),
                    olusturan_kullanici_id = table.Column<int>(type: "integer", nullable: true),
                    olusturulma_tarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    karar_veren_kullanici_id = table.Column<int>(type: "integer", nullable: true),
                    karar_tarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ret_nedeni = table.Column<string>(type: "text", nullable: true),
                    toplanma_alani_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_aday_noktalar", x => x.id);
                    table.ForeignKey(
                        name: "FK_aday_noktalar_toplanma_alanlari_toplanma_alani_id",
                        column: x => x.toplanma_alani_id,
                        principalTable: "toplanma_alanlari",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "islem_gecmisi",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    toplanma_alani_id = table.Column<int>(type: "integer", nullable: true),
                    aday_nokta_id = table.Column<long>(type: "bigint", nullable: true),
                    kullanici_id = table.Column<int>(type: "integer", nullable: true),
                    islem_turu = table.Column<string>(type: "text", nullable: false),
                    eski_degerler = table.Column<string>(type: "jsonb", nullable: true),
                    yeni_degerler = table.Column<string>(type: "jsonb", nullable: true),
                    islem_tarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_islem_gecmisi", x => x.id);
                    table.ForeignKey(
                        name: "FK_islem_gecmisi_aday_noktalar_aday_nokta_id",
                        column: x => x.aday_nokta_id,
                        principalTable: "aday_noktalar",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_islem_gecmisi_toplanma_alanlari_toplanma_alani_id",
                        column: x => x.toplanma_alani_id,
                        principalTable: "toplanma_alanlari",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_toplanma_alanlari_kaynak_id",
                table: "toplanma_alanlari",
                column: "kaynak_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_toplanma_alanlari_konum",
                table: "toplanma_alanlari",
                column: "konum")
                .Annotation("Npgsql:IndexMethod", "gist");

            migrationBuilder.CreateIndex(
                name: "IX_aday_noktalar_kaynak_id",
                table: "aday_noktalar",
                column: "kaynak_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_aday_noktalar_konum",
                table: "aday_noktalar",
                column: "konum")
                .Annotation("Npgsql:IndexMethod", "gist");

            migrationBuilder.CreateIndex(
                name: "IX_aday_noktalar_toplanma_alani_id",
                table: "aday_noktalar",
                column: "toplanma_alani_id");

            migrationBuilder.CreateIndex(
                name: "IX_islem_gecmisi_aday_nokta_id",
                table: "islem_gecmisi",
                column: "aday_nokta_id");

            migrationBuilder.CreateIndex(
                name: "IX_islem_gecmisi_toplanma_alani_id",
                table: "islem_gecmisi",
                column: "toplanma_alani_id");

            migrationBuilder.Sql("""
                INSERT INTO aday_noktalar
                    (kaynak_id, name, alan_tur, alan_m2, mahalle_adi, ilce_adi,
                     kapasite, konum, kabul_edildi, olusturulma_tarihi)
                SELECT kaynak_id, name, alan_tur, alan_m2, mahalle_adi, ilce_adi,
                       kapasite, konum, NULL, CURRENT_TIMESTAMP
                FROM toplanma_alanlari
                WHERE silinme_tarihi IS NULL
                ORDER BY kaynak_id
                LIMIT 15;

                DELETE FROM toplanma_alanlari
                WHERE kaynak_id IN (SELECT kaynak_id FROM aday_noktalar);

                SELECT setval(
                    pg_get_serial_sequence('toplanma_alanlari', 'id'),
                    COALESCE((SELECT MAX(id) FROM toplanma_alanlari), 1),
                    true);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "islem_gecmisi");

            migrationBuilder.DropTable(
                name: "aday_noktalar");

            migrationBuilder.DropIndex(
                name: "IX_toplanma_alanlari_kaynak_id",
                table: "toplanma_alanlari");

            migrationBuilder.DropIndex(
                name: "IX_toplanma_alanlari_konum",
                table: "toplanma_alanlari");

            migrationBuilder.DropColumn(
                name: "guncellenme_tarihi",
                table: "toplanma_alanlari");

            migrationBuilder.DropColumn(
                name: "kaynak_id",
                table: "toplanma_alanlari");

            migrationBuilder.AddColumn<string>(
                name: "point_wkt",
                table: "toplanma_alanlari",
                type: "text",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE toplanma_alanlari
                SET point_wkt = ST_AsText(konum);
                """);

            migrationBuilder.DropColumn(
                name: "konum",
                table: "toplanma_alanlari");

            migrationBuilder.DropColumn(
                name: "olusturulma_tarihi",
                table: "toplanma_alanlari");

            migrationBuilder.DropColumn(
                name: "silinen_kullanici_id",
                table: "toplanma_alanlari");

            migrationBuilder.DropColumn(
                name: "silinme_tarihi",
                table: "toplanma_alanlari");

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:postgis", ",,");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "toplanma_alanlari",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

        }
    }
}
