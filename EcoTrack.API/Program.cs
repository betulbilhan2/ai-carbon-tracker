using EcoTrack.API.Data;
using EcoTrack.API.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ── 1. Services ────────────────────────────────────────────────────
builder.Services.AddControllers();

// ── FastAPI AI Mikroservis HTTP İstemcisi ──────────────────────────
builder.Services.AddHttpClient("FastApiClient", c =>
{
    c.BaseAddress = new Uri("http://localhost:8000");
    c.Timeout     = TimeSpan.FromSeconds(5); // Servis cevap vermezse 5 sn'de fallback'e düş
});

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

// ── 3. CORS — React frontend ───────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",   // Vite dev server (primary)
                "http://localhost:5174",   // Vite dev server (fallback)
                "https://localhost:5173",
                "https://localhost:5174"
            )
            .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .AllowAnyHeader()
            .AllowCredentials();
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

app.UseHttpsRedirection();

// CORS middleware
app.UseCors("ReactFrontend");

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
