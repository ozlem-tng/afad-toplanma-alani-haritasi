using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SyncKapasiteColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Kapasite kolonu PostgreSQL tablosuna daha önce manuel eklendi.
            // Bu migration yalnızca EF model geçmişini mevcut şemayla eşitler.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Mevcut veritabanı kolonuna dokunma.
        }
    }
}
