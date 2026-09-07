using EcoTrack.API.Data;
using EcoTrack.API.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ── 1. Services ────────────────────────────────────────────────────
builder.Services.AddControllers();

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title       = "EcoTrack AI — Backend API",
        Version     = "v1",
        Description = "TerkenTech ekibi tarafından geliştirilen EcoTrack AI projesinin " +
                      "RESTful backend servisi. Teknofest Sıfır Atık ve Döngüsel Ekonomi " +
                      "kategorisi için geliştirilmiştir. (Takım ID: 1003737)"
    });

    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        options.IncludeXmlComments(xmlPath);
});

// ── 2. PostgreSQL (Supabase) — EF Core ────────────────────────────
builder.Services.AddDbContext<EcoTrackDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorCodesToAdd: null)
    )
);

// ── 2.1 FastApiClient (Python AI Mikroservisi) ─────────────────────
builder.Services.AddHttpClient("FastApiClient", client =>
{
    client.BaseAddress = new Uri("http://localhost:8000");
    client.Timeout = TimeSpan.FromSeconds(3); // Hızlı yanıt veya fallback
});

// ── 3. CORS Yapılandırması ──────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ── 4. Build ───────────────────────────────────────────────────────
var app = builder.Build();

// ── 5. Middleware Pipeline ─────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "EcoTrack AI API v1");
        c.RoutePrefix = "swagger";
        c.DocumentTitle = "EcoTrack AI — API Dokümantasyonu";
    });
}

// Geliştirme ortamında port yönlendirmesi kaynaklı fetch kopmalarını engellemek için devre dışı bırakıldı:
// app.UseHttpsRedirection();

app.UseRouting();

// CORS middleware
app.UseCors("AllowAll");

app.UseAuthorization();
app.MapControllers();

// ── 6. Startup: Database Seeder & Connection Check ──────────────────
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    var db = services.GetRequiredService<EcoTrackDbContext>();

    try
    {
        bool canConnect = await db.Database.CanConnectAsync();
        if (canConnect)
        {
            logger.LogInformation("✅ PostgreSQL (Supabase) bağlantısı başarılı.");

            // 1. Kullanıcı Seeder (Ayşe Kaya - ID 1)
            var existingUser = await db.Users.FirstOrDefaultAsync(u => u.KullaniciId == 1 || u.Eposta == "ayse.kaya@metu.edu.tr");
            if (existingUser == null)
            {
                var defaultUser = new User
                {
                    AdSoyad = "Ayşe Kaya",
                    Eposta = "ayse.kaya@metu.edu.tr",
                    SifrelenmisSifre = "hashed_secret_123",
                    HedeflenenKarbonLimiti = 56.0,
                    KayitTarihi = DateTime.UtcNow
                };

                db.Users.Add(defaultUser);
                await db.SaveChangesAsync();
                existingUser = defaultUser;

                logger.LogInformation("🌱 Varsayılan kullanıcı oluşturuldu: Ayşe Kaya (ID: {Id})", existingUser.KullaniciId);
            }

            // 2. Kullanıcı İstatistikleri Seeder
            var existingStat = await db.UserStatistics.FirstOrDefaultAsync(s => s.KullaniciId == existingUser.KullaniciId);
            if (existingStat == null)
            {
                var defaultStat = new UserStatistic
                {
                    KullaniciId = existingUser.KullaniciId,
                    ToplamTasarruf = 18.4,
                    GunlukSeri = 12,
                    RozetAdi = "Gezegen Dostu",
                    GuncellenmeZamani = DateTime.UtcNow
                };

                db.UserStatistics.Add(defaultStat);
                await db.SaveChangesAsync();

                logger.LogInformation("🌱 Varsayılan kullanıcı istatistiği eklendi: {Rozet}, Seri: {Seri}", defaultStat.RozetAdi, defaultStat.GunlukSeri);
            }

            // 3. Ek Örnek Öğrenci Kullanıcıları (Liderlik tablosu için)
            var sampleStudents = new[]
            {
                new { Ad = "Mehmet Demir", Eposta = "mehmet.demir@metu.edu.tr", Limit = 50.0, Tasarruf = 48.0, Seri = 18, Rozet = "Çevre Şampiyonu 🏆" },
                new { Ad = "Zeynep Çelik", Eposta = "zeynep.celik@metu.edu.tr", Limit = 52.0, Tasarruf = 41.5, Seri = 14, Rozet = "14 Günlük Seri 🔥" },
                new { Ad = "Selin Arslan", Eposta = "selin.arslan@metu.edu.tr", Limit = 54.0, Tasarruf = 32.0, Seri = 9,  Rozet = "Gezegen Dostu 🌍" },
                new { Ad = "Caner Erkin",  Eposta = "caner.erkin@metu.edu.tr",  Limit = 60.0, Tasarruf = 15.0, Seri = 5,  Rozet = "İlk Adım 🌱" }
            };

            foreach (var student in sampleStudents)
            {
                var userExists = await db.Users.FirstOrDefaultAsync(u => u.Eposta == student.Eposta);
                if (userExists == null)
                {
                    var newUser = new User
                    {
                        AdSoyad = student.Ad,
                        Eposta = student.Eposta,
                        SifrelenmisSifre = "hashed_secret_student",
                        HedeflenenKarbonLimiti = student.Limit,
                        KayitTarihi = DateTime.UtcNow.AddDays(-20)
                    };
                    db.Users.Add(newUser);
                    await db.SaveChangesAsync();

                    var newStat = new UserStatistic
                    {
                        KullaniciId = newUser.KullaniciId,
                        ToplamTasarruf = student.Tasarruf,
                        GunlukSeri = student.Seri,
                        RozetAdi = student.Rozet,
                        GuncellenmeZamani = DateTime.UtcNow
                    };
                    db.UserStatistics.Add(newStat);
                    await db.SaveChangesAsync();

                    logger.LogInformation("🌱 Örnek öğrenci eklendi: {Ad} (ID: {Id})", student.Ad, newUser.KullaniciId);
                }
            }
        }
        else
        {
            logger.LogWarning("⚠️ PostgreSQL bağlantısı kurulamadı.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "⚠️ Startup veritabanı tohumlama (seeder) sırasında hata oluştu.");
    }
}

app.Run();
