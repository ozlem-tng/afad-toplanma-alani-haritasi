using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class PreserveCandidateSourceIds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_islem_gecmisi_aday_noktalar_aday_nokta_id",
                table: "islem_gecmisi");

            migrationBuilder.AlterColumn<int>(
                name: "aday_nokta_id",
                table: "islem_gecmisi",
                type: "integer",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "aday_noktalar",
                type: "integer",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.Sql(
                """
                CREATE TEMP TABLE aday_id_eslestirme ON COMMIT DROP AS
                SELECT a.id AS eski_id, kaynak.id AS yeni_id
                FROM aday_noktalar AS a
                JOIN (VALUES
                    (2342272, 'Şehit Bakım Onbaşı Faruk Ergenç Parkı'),
                    (2342293, 'Sincan Park'),
                    (2342294, 'Sancak Parkı'),
                    (2342295, 'Necip Fasıl Kısakürek Ortaokulu'),
                    (2342298, 'Türkkonut Merkez Cami'),
                    (2342302, 'Sarayacık Mahallesi Cami'),
                    (2342316, 'Şehitler Parkı'),
                    (2342318, 'Demir Hamdi Hisarcıklıoğlu Cami'),
                    (2342319, 'Şehit Mustafa Koçak Parkı'),
                    (2342320, 'Evliya Çelebi Parkı'),
                    (2342322, 'Cimşit Mezarlığı Cami'),
                    (2342325, 'Dora Park Sitesi'),
                    (2342335, 'Safir Park Evleri'),
                    (2342336, 'Livapark Sitesi'),
                    (2342342, 'Yankı Park Sitesi')
                ) AS kaynak(id, name) ON kaynak.name = a.name;

                UPDATE islem_gecmisi AS i
                SET aday_nokta_id = e.yeni_id
                FROM aday_id_eslestirme AS e
                WHERE i.aday_nokta_id = e.eski_id;

                UPDATE aday_noktalar AS a
                SET id = e.yeni_id
                FROM aday_id_eslestirme AS e
                WHERE a.id = e.eski_id;
                """);

            migrationBuilder.AddForeignKey(
                name: "FK_islem_gecmisi_aday_noktalar_aday_nokta_id",
                table: "islem_gecmisi",
                column: "aday_nokta_id",
                principalTable: "aday_noktalar",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_islem_gecmisi_aday_noktalar_aday_nokta_id",
                table: "islem_gecmisi");

            migrationBuilder.AlterColumn<long>(
                name: "aday_nokta_id",
                table: "islem_gecmisi",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "id",
                table: "aday_noktalar",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddForeignKey(
                name: "FK_islem_gecmisi_aday_noktalar_aday_nokta_id",
                table: "islem_gecmisi",
                column: "aday_nokta_id",
                principalTable: "aday_noktalar",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
