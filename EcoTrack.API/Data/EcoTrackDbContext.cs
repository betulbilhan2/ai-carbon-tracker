using Microsoft.EntityFrameworkCore;
using EcoTrack.API.Models;

namespace EcoTrack.API.Data;

public class EcoTrackDbContext : DbContext
{
    public EcoTrackDbContext(DbContextOptions<EcoTrackDbContext> options) : base(options) { }

    // ── DbSets ───────────────────────────────────────────────────
    public DbSet<User>               Users               { get; set; }
    public DbSet<ActivityCategory>   ActivityCategories  { get; set; }
    public DbSet<Activity>           Activities          { get; set; }
    public DbSet<CarbonCalculation>  CarbonCalculations  { get; set; }
    public DbSet<UserStatistic>      UserStatistics      { get; set; }
    public DbSet<Recommendation>     Recommendations     { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User ─────────────────────────────────────────────────
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("kullanicilar");

            entity.HasIndex(u => u.Eposta)
                  .IsUnique()
                  .HasDatabaseName("IX_kullanicilar_eposta");

            entity.Property(u => u.HedeflenenKarbonLimiti)
                  .HasDefaultValue(56.0);

            entity.Property(u => u.KayitTarihi)
                  .HasDefaultValueSql("now() at time zone 'utc'");
        });

        // ── ActivityCategory ──────────────────────────────────────
        modelBuilder.Entity<ActivityCategory>(entity =>
        {
            entity.ToTable("aktivite_kategorileri");
        });

        // ── Activity ──────────────────────────────────────────────
        modelBuilder.Entity<Activity>(entity =>
        {
            entity.ToTable("aktiviteler");

            // User -> Activities (Cascade)
            entity.HasOne(a => a.User)
                  .WithMany(u => u.Activities)
                  .HasForeignKey(a => a.KullaniciId)
                  .OnDelete(DeleteBehavior.Cascade);

            // ActivityCategory -> Activities (Restrict — category silince aktivite silinmesin)
            entity.HasOne(a => a.Category)
                  .WithMany(c => c.Activities)
                  .HasForeignKey(a => a.KategoriId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── CarbonCalculation ─────────────────────────────────────
        modelBuilder.Entity<CarbonCalculation>(entity =>
        {
            entity.ToTable("karbon_hesaplamalari");

            // User -> CarbonCalculations (Cascade)
            entity.HasOne(cc => cc.User)
                  .WithMany(u => u.CarbonCalculations)
                  .HasForeignKey(cc => cc.KullaniciId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Activity -> CarbonCalculation (1:1, Cascade)
            entity.HasOne(cc => cc.Activity)
                  .WithOne(a => a.CarbonCalculation)
                  .HasForeignKey<CarbonCalculation>(cc => cc.AktiviteId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── UserStatistic ─────────────────────────────────────────
        modelBuilder.Entity<UserStatistic>(entity =>
        {
            entity.ToTable("kullanici_istatistikleri");

            // Unique FK: her kullanici için tek bir istatistik satırı
            entity.HasIndex(us => us.KullaniciId)
                  .IsUnique()
                  .HasDatabaseName("IX_kullanici_istatistikleri_kullanici_id");

            entity.HasOne(us => us.User)
                  .WithOne(u => u.UserStatistic)
                  .HasForeignKey<UserStatistic>(us => us.KullaniciId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.Property(us => us.ToplamTasarruf).HasDefaultValue(0.0);
            entity.Property(us => us.GunlukSeri).HasDefaultValue(0);
            entity.Property(us => us.RozetAdi).HasDefaultValue("İlk Adım");
            entity.Property(us => us.GuncellenmeZamani)
                  .HasDefaultValueSql("now() at time zone 'utc'");
        });

        // ── Recommendation ────────────────────────────────────────
        modelBuilder.Entity<Recommendation>(entity =>
        {
            entity.ToTable("oneriler");

            // User -> Recommendations (Cascade)
            entity.HasOne(r => r.User)
                  .WithMany(u => u.Recommendations)
                  .HasForeignKey(r => r.KullaniciId)
                  .OnDelete(DeleteBehavior.Cascade);

            // CarbonCalculation -> Recommendations (nullable FK, SetNull)
            entity.HasOne(r => r.CarbonCalculation)
                  .WithMany(cc => cc.Recommendations)
                  .HasForeignKey(r => r.HesaplamaId)
                  .OnDelete(DeleteBehavior.SetNull)
                  .IsRequired(false);

            entity.Property(r => r.UygulandiMi).HasDefaultValue(false);
            entity.Property(r => r.OlusturulmaTarihi)
                  .HasDefaultValueSql("now() at time zone 'utc'");
        });

        // ── Seed: Aktivite Kategorileri ───────────────────────────
        modelBuilder.Entity<ActivityCategory>().HasData(
            new ActivityCategory { KategoriId = 1, KategoriAdi = "Ulaşım - Araba",       BirimTipi = "km",       EmisyonKatsayisi = 0.145 },
            new ActivityCategory { KategoriId = 2, KategoriAdi = "Ulaşım - Metro",        BirimTipi = "km",       EmisyonKatsayisi = 0.020 },
            new ActivityCategory { KategoriId = 3, KategoriAdi = "Ulaşım - Otobüs",       BirimTipi = "km",       EmisyonKatsayisi = 0.089 },
            new ActivityCategory { KategoriId = 4, KategoriAdi = "Ulaşım - Motosiklet",   BirimTipi = "km",       EmisyonKatsayisi = 0.103 },
            new ActivityCategory { KategoriId = 5, KategoriAdi = "Ulaşım - Bisiklet",     BirimTipi = "km",       EmisyonKatsayisi = 0.000 },
            new ActivityCategory { KategoriId = 6, KategoriAdi = "Ulaşım - Uçak",         BirimTipi = "km",       EmisyonKatsayisi = 0.255 },
            new ActivityCategory { KategoriId = 7, KategoriAdi = "Enerji - Elektrik",      BirimTipi = "kWh",      EmisyonKatsayisi = 0.481 },
            new ActivityCategory { KategoriId = 8, KategoriAdi = "Enerji - Doğalgaz",      BirimTipi = "m3",       EmisyonKatsayisi = 2.040 },
            new ActivityCategory { KategoriId = 9, KategoriAdi = "Enerji - Kömür",         BirimTipi = "kg",       EmisyonKatsayisi = 2.860 },
            new ActivityCategory { KategoriId = 10, KategoriAdi = "Beslenme - Kırmızı Et", BirimTipi = "porsiyon", EmisyonKatsayisi = 6.610 },
            new ActivityCategory { KategoriId = 11, KategoriAdi = "Beslenme - Beyaz Et",   BirimTipi = "porsiyon", EmisyonKatsayisi = 3.190 },
            new ActivityCategory { KategoriId = 12, KategoriAdi = "Beslenme - Vejetaryen", BirimTipi = "porsiyon", EmisyonKatsayisi = 1.500 },
            new ActivityCategory { KategoriId = 13, KategoriAdi = "Beslenme - Vegan",      BirimTipi = "porsiyon", EmisyonKatsayisi = 0.900 },
            new ActivityCategory { KategoriId = 14, KategoriAdi = "Atık - Plastik Şişe",   BirimTipi = "adet",     EmisyonKatsayisi = 0.083 },
            new ActivityCategory { KategoriId = 15, KategoriAdi = "Atık - Kağıt/Karton",   BirimTipi = "kg",       EmisyonKatsayisi = 0.021 },
            new ActivityCategory { KategoriId = 16, KategoriAdi = "Atık - Cam",             BirimTipi = "adet",     EmisyonKatsayisi = 0.011 },
            new ActivityCategory { KategoriId = 17, KategoriAdi = "Atık - Organik",         BirimTipi = "kg",       EmisyonKatsayisi = 0.390 }
        );
    }
}
