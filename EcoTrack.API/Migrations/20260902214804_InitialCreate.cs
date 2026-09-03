using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace EcoTrack.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "aktivite_kategorileri",
                columns: table => new
                {
                    kategori_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    kategori_adi = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    birim_tipi = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    emisyon_katsayisi = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_aktivite_kategorileri", x => x.kategori_id);
                });

            migrationBuilder.CreateTable(
                name: "kullanicilar",
                columns: table => new
                {
                    kullanici_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ad_soyad = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    eposta = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    sifrelenmis_sifre = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    hedeflenen_karbon_limiti = table.Column<double>(type: "double precision", nullable: false, defaultValue: 56.0),
                    kayit_tarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_kullanicilar", x => x.kullanici_id);
                });

            migrationBuilder.CreateTable(
                name: "aktiviteler",
                columns: table => new
                {
                    aktivite_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    kullanici_id = table.Column<int>(type: "integer", nullable: false),
                    kategori_id = table.Column<int>(type: "integer", nullable: false),
                    tuketim_degeri = table.Column<double>(type: "double precision", nullable: false),
                    aktivite_tarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_aktiviteler", x => x.aktivite_id);
                    table.ForeignKey(
                        name: "FK_aktiviteler_aktivite_kategorileri_kategori_id",
                        column: x => x.kategori_id,
                        principalTable: "aktivite_kategorileri",
                        principalColumn: "kategori_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_aktiviteler_kullanicilar_kullanici_id",
                        column: x => x.kullanici_id,
                        principalTable: "kullanicilar",
                        principalColumn: "kullanici_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "kullanici_istatistikleri",
                columns: table => new
                {
                    istatistik_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    kullanici_id = table.Column<int>(type: "integer", nullable: false),
                    toplam_tasarruf = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                    gunluk_seri = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    rozet_adi = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: "İlk Adım"),
                    guncellenme_tarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_kullanici_istatistikleri", x => x.istatistik_id);
                    table.ForeignKey(
                        name: "FK_kullanici_istatistikleri_kullanicilar_kullanici_id",
                        column: x => x.kullanici_id,
                        principalTable: "kullanicilar",
                        principalColumn: "kullanici_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "karbon_hesaplamalari",
                columns: table => new
                {
                    hesaplama_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    kullanici_id = table.Column<int>(type: "integer", nullable: false),
                    aktivite_id = table.Column<int>(type: "integer", nullable: false),
                    karbon_miktari = table.Column<double>(type: "double precision", nullable: false),
                    hesaplama_tarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_karbon_hesaplamalari", x => x.hesaplama_id);
                    table.ForeignKey(
                        name: "FK_karbon_hesaplamalari_aktiviteler_aktivite_id",
                        column: x => x.aktivite_id,
                        principalTable: "aktiviteler",
                        principalColumn: "aktivite_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_karbon_hesaplamalari_kullanicilar_kullanici_id",
                        column: x => x.kullanici_id,
                        principalTable: "kullanicilar",
                        principalColumn: "kullanici_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "oneriler",
                columns: table => new
                {
                    oneri_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    kullanici_id = table.Column<int>(type: "integer", nullable: false),
                    hesaplama_id = table.Column<int>(type: "integer", nullable: true),
                    oneri_metni = table.Column<string>(type: "text", nullable: false),
                    etki_skoru = table.Column<double>(type: "double precision", nullable: false),
                    uygulandi_mi = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    olusturulma_tarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now() at time zone 'utc'")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_oneriler", x => x.oneri_id);
                    table.ForeignKey(
                        name: "FK_oneriler_karbon_hesaplamalari_hesaplama_id",
                        column: x => x.hesaplama_id,
                        principalTable: "karbon_hesaplamalari",
                        principalColumn: "hesaplama_id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_oneriler_kullanicilar_kullanici_id",
                        column: x => x.kullanici_id,
                        principalTable: "kullanicilar",
                        principalColumn: "kullanici_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "aktivite_kategorileri",
                columns: new[] { "kategori_id", "birim_tipi", "emisyon_katsayisi", "kategori_adi" },
                values: new object[,]
                {
                    { 1, "km", 0.14499999999999999, "Ulaşım - Araba" },
                    { 2, "km", 0.02, "Ulaşım - Metro" },
                    { 3, "km", 0.088999999999999996, "Ulaşım - Otobüs" },
                    { 4, "km", 0.10299999999999999, "Ulaşım - Motosiklet" },
                    { 5, "km", 0.0, "Ulaşım - Bisiklet" },
                    { 6, "km", 0.255, "Ulaşım - Uçak" },
                    { 7, "kWh", 0.48099999999999998, "Enerji - Elektrik" },
                    { 8, "m3", 2.04, "Enerji - Doğalgaz" },
                    { 9, "kg", 2.8599999999999999, "Enerji - Kömür" },
                    { 10, "porsiyon", 6.6100000000000003, "Beslenme - Kırmızı Et" },
                    { 11, "porsiyon", 3.1899999999999999, "Beslenme - Beyaz Et" },
                    { 12, "porsiyon", 1.5, "Beslenme - Vejetaryen" },
                    { 13, "porsiyon", 0.90000000000000002, "Beslenme - Vegan" },
                    { 14, "adet", 0.083000000000000004, "Atık - Plastik Şişe" },
                    { 15, "kg", 0.021000000000000001, "Atık - Kağıt/Karton" },
                    { 16, "adet", 0.010999999999999999, "Atık - Cam" },
                    { 17, "kg", 0.39000000000000001, "Atık - Organik" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_aktiviteler_kategori_id",
                table: "aktiviteler",
                column: "kategori_id");

            migrationBuilder.CreateIndex(
                name: "IX_aktiviteler_kullanici_id",
                table: "aktiviteler",
                column: "kullanici_id");

            migrationBuilder.CreateIndex(
                name: "IX_karbon_hesaplamalari_aktivite_id",
                table: "karbon_hesaplamalari",
                column: "aktivite_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_karbon_hesaplamalari_kullanici_id",
                table: "karbon_hesaplamalari",
                column: "kullanici_id");

            migrationBuilder.CreateIndex(
                name: "IX_kullanici_istatistikleri_kullanici_id",
                table: "kullanici_istatistikleri",
                column: "kullanici_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_kullanicilar_eposta",
                table: "kullanicilar",
                column: "eposta",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_oneriler_hesaplama_id",
                table: "oneriler",
                column: "hesaplama_id");

            migrationBuilder.CreateIndex(
                name: "IX_oneriler_kullanici_id",
                table: "oneriler",
                column: "kullanici_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "kullanici_istatistikleri");

            migrationBuilder.DropTable(
                name: "oneriler");

            migrationBuilder.DropTable(
                name: "karbon_hesaplamalari");

            migrationBuilder.DropTable(
                name: "aktiviteler");

            migrationBuilder.DropTable(
                name: "aktivite_kategorileri");

            migrationBuilder.DropTable(
                name: "kullanicilar");
        }
    }
}
