using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using BaseCore.Repository;
using BaseCore.Repository.EFCore;
using System.Text;
using BaseCore.Common;
using BaseCore.Entities;
using BaseCore.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();


// Swagger Configuration
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "BaseCore API Service - Decor Store",
        Version = "v1",
        Description = "API for Decor Store - Products, Categories, Orders, Users"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter JWT token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// SQL Server Configuration with EF Core
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("ConnectedDb"));
});

// Repository Registration
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProductRepositoryEF, ProductRepositoryEF>();
builder.Services.AddScoped<ICategoryRepositoryEF, CategoryRepositoryEF>();
builder.Services.AddScoped<IOrderRepositoryEF, OrderRepositoryEF>();
builder.Services.AddScoped<IOrderItemRepositoryEF, OrderItemRepositoryEF>();
builder.Services.AddScoped<IRepository<Brand>, Repository<Brand>>();
builder.Services.AddScoped<ICouponRepositoryEF, CouponRepositoryEF>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<ICouponService, CouponService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IBrandRepository, BrandRepository>();
builder.Services.AddScoped<IBrandService, BrandService>();

// JWT Authentication
var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:SecretKey"] ?? "YourSecretKeyForAuthenticationShouldBeLongEnough");
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

var app = builder.Build();

// Auto migrate database and seed data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    // Seed admin user
    if (!db.Users.Any(u => u.UserName == "admin"))
    {
        byte[] salt;
        string hashedPassword = TokenHelper.HashPassword("admin123", out salt);
        var admin = new User
        {
            Id = Guid.NewGuid(),
            UserName = "admin",
            PasswordHash = hashedPassword,
            Salt = salt,
            FullName = "Administrator",
            Email = "admin@decorstore.com",
            Phone = "0123456789",
            Contact = "",
            Position = "Admin",
            AvatarUrl = "",           // ← THÊM DÒNG NÀY (không cho phép null)
            Role = "admin",
            IsActive = true,
            IsEmailVerified = true,
            EmailVerifiedAt = DateTime.UtcNow,
            Created = DateTime.UtcNow
        };
        db.Users.Add(admin);
        db.SaveChanges();
        Console.WriteLine("✅ Admin user created: admin / admin123");
    }
        // Seed categories first
    if (!db.Categories.Any())
    {
        var categories = new List<Category>
        {
            new Category { 
                Name = "Đèn trang trí", 
                Slug = "den-trang-tri", 
                Description = "Đèn bàn, đèn thả, đèn đứng",
                MetaDescription = "Đèn trang trí đẹp cho không gian sống",
                MetaTitle = "Đèn trang trí - Decor Store",
                IconClass = "fas fa-lightbulb",
                ImageUrl = "/img/categories/den-trang-tri.jpg",
                IsActive = true,
                ShowInMenu = true,
                SortOrder = 1,
                Created = DateTime.UtcNow
            },
            new Category { 
                Name = "Tranh treo tường", 
                Slug = "tranh-treo-tuong", 
                Description = "Tranh trừu tượng, phong cảnh",
                MetaDescription = "Tranh treo tường nghệ thuật",
                MetaTitle = "Tranh treo tường - Decor Store",
                IconClass = "fas fa-palette",
                ImageUrl = "/img/categories/tranh-treo-tuong.jpg",
                IsActive = true,
                ShowInMenu = true,
                SortOrder = 2,
                Created = DateTime.UtcNow
            },
            new Category { 
                Name = "Gương", 
                Slug = "guong", 
                Description = "Gương trang trí",
                MetaDescription = "Gương trang trí đẹp",
                MetaTitle = "Gương - Decor Store",
                IconClass = "fas fa-image",
                ImageUrl = "/img/categories/guong.jpg",
                IsActive = true,
                ShowInMenu = true,
                SortOrder = 3,
                Created = DateTime.UtcNow
            },
            new Category { 
                Name = "Lọ hoa & Chậu cây", 
                Slug = "lo-hoa-chau-cay", 
                Description = "Lọ hoa gốm sứ, chậu cây cảnh",
                MetaDescription = "Lọ hoa và chậu cây trang trí",
                MetaTitle = "Lọ hoa & Chậu cây - Decor Store",
                IconClass = "fas fa-seedling",
                ImageUrl = "/img/categories/lo-hoa.jpg",
                IsActive = true,
                ShowInMenu = true,
                SortOrder = 4,
                Created = DateTime.UtcNow
            },
            new Category { 
                Name = "Phụ kiện trang trí", 
                Slug = "phu-kien-trang-tri", 
                Description = "Đồng hồ, khung ảnh, nến",
                MetaDescription = "Phụ kiện trang trí nhà cửa",
                MetaTitle = "Phụ kiện trang trí - Decor Store",
                IconClass = "fas fa-gift",
                ImageUrl = "/img/categories/phu-kien.jpg",
                IsActive = true,
                ShowInMenu = true,
                SortOrder = 5,
                Created = DateTime.UtcNow
            }
        };
        db.Categories.AddRange(categories);
        db.SaveChanges();
        Console.WriteLine("✅ Seeded 5 categories.");
    }
        // Seed brands
        if (!db.Brands.Any())
        {
            var brands = new List<Brand>
            {
                new Brand { Name = "Apple", Slug = "apple", Description = "", LogoUrl = "", WebsiteUrl = "", IsActive = true },
                new Brand { Name = "Samsung", Slug = "samsung", Description = "", LogoUrl = "", WebsiteUrl = "", IsActive = true }
            };
            db.Brands.AddRange(brands);
            db.SaveChanges();
            Console.WriteLine("✅ Seeded brands.");
        }

        // Seed products - CHỈ 1 BLOCK DUY NHẤT
        if (!db.Products.Any())
        {
            var denTrangTriId = db.Categories.FirstOrDefault(c => c.Slug == "den-trang-tri")?.Id ?? Guid.NewGuid();
            var tranhTreoTuongId = db.Categories.FirstOrDefault(c => c.Slug == "tranh-treo-tuong")?.Id ?? Guid.NewGuid();
            var guongId = db.Categories.FirstOrDefault(c => c.Slug == "guong")?.Id ?? Guid.NewGuid();
            var loHoaId = db.Categories.FirstOrDefault(c => c.Slug == "lo-hoa-chau-cay")?.Id ?? Guid.NewGuid();
            var phuKienId = db.Categories.FirstOrDefault(c => c.Slug == "phu-kien-trang-tri")?.Id ?? Guid.NewGuid();
            var appleBrandId = db.Brands.FirstOrDefault(b => b.Slug == "apple")?.Id ?? Guid.NewGuid();


            var appleBrand = db.Brands.FirstOrDefault(b => b.Slug == "apple");
            var tranhTreoTuong = db.Categories.FirstOrDefault(c => c.Slug == "tranh-treo-tuong");
            var phuKien = db.Categories.FirstOrDefault(c => c.Slug == "phu-kien-trang-tri");
            if (appleBrand != null && tranhTreoTuong != null && phuKien != null)
            {
                if (!db.BrandCategories.Any(bc => bc.BrandId == appleBrand.Id))
                {
                    db.BrandCategories.AddRange(
                        new BrandCategory { BrandId = appleBrand.Id, CategoryId = tranhTreoTuong.Id },
                        new BrandCategory { BrandId = appleBrand.Id, CategoryId = phuKien.Id }
                    );
                    db.SaveChanges();
                    Console.WriteLine("✅ Seeded BrandCategories for Apple.");
                }
            }

            var products = new List<Product>
            {
                // === APPLE PRODUCTS (có BrandId) ===
                new Product { 
                    Id = Guid.NewGuid(), Name = "Tranh treo tường phong cảnh (Apple)", 
                    Slug = "tranh-phong-canh-apple", BasePrice = 550000, TotalStock = 25, 
                    CategoryId = tranhTreoTuongId, BrandId = appleBrandId,
                    Status = "active", Created = DateTime.UtcNow,
                    ShortDescription = "Tranh phong cảnh đẹp", Description = "In trên vải cao cấp, khung gỗ",
                    MainImageUrl = "/img/tranh-phong-canh.jpg", 
                    Sku = "APPLE-001",
                    MetaTitle = "Tranh phong cảnh", MetaDescription = "",
                    IsFeatured = false, IsNewArrival = false, AvgRating = 0, ReviewCount = 0, SoldCount = 0 
                },
                new Product { 
                    Id = Guid.NewGuid(), Name = "Phụ kiện iPhone 15 Pro Max", 
                    Slug = "phu-kien-iphone-15", BasePrice = 1200000, TotalStock = 20, 
                    CategoryId = phuKienId, BrandId = appleBrandId,
                    Status = "active", Created = DateTime.UtcNow,
                    ShortDescription = "Phụ kiện cao cấp cho iPhone", Description = "Ốp lưng, cường lực, sạc dự phòng",
                    MainImageUrl = "/img/iphone-accessory.jpg", 
                    Sku = "APPLE-002",
                    MetaTitle = "iPhone Accessory", MetaDescription = "",
                    IsFeatured = false, IsNewArrival = false, AvgRating = 0, ReviewCount = 0, SoldCount = 0 
                },
                new Product { 
                    Id = Guid.NewGuid(), Name = "Ốp lưng iPhone 15 Pro Max Silicon", 
                    Slug = "op-lung-iphone-15-silicon", BasePrice = 250000, TotalStock = 50, 
                    CategoryId = phuKienId, BrandId = appleBrandId,
                    Status = "active", Created = DateTime.UtcNow,
                    ShortDescription = "Ốp lưng mềm cao cấp", Description = "Chất liệu silicon, chống va đập",
                    MainImageUrl = "/img/op-lung-silicon.jpg", 
                    Sku = "APPLE-003",
                    MetaTitle = "Ốp lưng iPhone", MetaDescription = "",
                    IsFeatured = false, IsNewArrival = false, AvgRating = 0, ReviewCount = 0, SoldCount = 0 
                },
                new Product { 
                    Id = Guid.NewGuid(),
                    Name = "Đèn bàn gỗ Minimal", 
                    Slug = "den-ban-go-minimal", 
                    Sku = "DE001",
                    BasePrice = 450000, 
                    SalePrice = 399000, 
                    TotalStock = 20, 
                    CategoryId = denTrangTriId,   // Dùng Guid
                    IsFeatured = true, 
                    IsNewArrival = true, 
                    Status = "active", 
                    ShortDescription = "Đèn bàn gỗ tối giản, phù hợp phòng làm việc",
                    Description = "Đèn bàn gỗ minimal với thiết kế đơn giản, tinh tế...",
                    MainImageUrl = "/img/products/den-ban.jpg",
                    MetaTitle = "Đèn bàn gỗ Minimal - Đèn trang trí phòng làm việc",
                    MetaDescription = "Đèn bàn gỗ Minimal thiết kế tối giản...",
                    Created = DateTime.UtcNow
                },
                new Product { 
                    Id = Guid.NewGuid(),
                    Name = "Đèn thả trần tròn", 
                    Slug = "den-tha-tran-tron", 
                    Sku = "DE002",
                    BasePrice = 890000, 
                    TotalStock = 15, 
                    CategoryId = denTrangTriId,
                    IsNewArrival = true, 
                    Status = "active", 
                    ShortDescription = "Đèn thả trần phong cách Scandinavian",
                    Description = "Đèn thả trần thiết kế hình tròn...",
                    MainImageUrl = "/img/products/den-tha.jpg",
                    MetaTitle = "Đèn thả trần tròn - Phong cách Scandinavian",
                    MetaDescription = "Đèn thả trần hình tròn, phong cách Scandinavian...",
                    Created = DateTime.UtcNow
                },
                new Product { 
                    Id = Guid.NewGuid(),
                    Name = "Đèn đứng phòng khách", 
                    Slug = "den-dung-phong-khach", 
                    Sku = "DE003",
                    BasePrice = 1250000, 
                    SalePrice = 990000, 
                    TotalStock = 10, 
                    CategoryId = denTrangTriId,
                    IsFeatured = true, 
                    Status = "active", 
                    ShortDescription = "Đèn đứng cao cấp",
                    Description = "Đèn đứng cao cấp với thiết kế sang trọng...",
                    MainImageUrl = "/img/products/den-dung.jpg",
                    MetaTitle = "Đèn đứng phòng khách cao cấp",
                    MetaDescription = "Đèn đứng cao cấp, thiết kế sang trọng...",
                    Created = DateTime.UtcNow
                },
                new Product { 
                    Id = Guid.NewGuid(),
                    Name = "Tranh trừu tượng màu nước", 
                    Slug = "tranh-truu-tuong-mau-nuoc", 
                    Sku = "TR001",
                    BasePrice = 550000, 
                    TotalStock = 25, 
                    CategoryId = tranhTreoTuongId,
                    IsFeatured = true, 
                    Status = "active", 
                    ShortDescription = "Tranh treo tường phòng khách",
                    Description = "Tranh trừu tượng màu nước với họa tiết độc đáo...",
                    MainImageUrl = "/img/products/tranh-1.jpg",
                    MetaTitle = "Tranh trừu tượng màu nước - Tranh treo tường phòng khách",
                    MetaDescription = "Tranh trừu tượng màu nước độc đáo...",
                    Created = DateTime.UtcNow
                },
                new Product { 
                    Id = Guid.NewGuid(),
                    Name = "Tranh hoa lá", 
                    Slug = "tranh-hoa-la", 
                    Sku = "TR002",
                    BasePrice = 320000, 
                    TotalStock = 30, 
                    CategoryId = tranhTreoTuongId,
                    Status = "active", 
                    ShortDescription = "Tranh in hoa lá tự nhiên",
                    Description = "Tranh in hoa lá với màu sắc tươi sáng...",
                    MainImageUrl = "/img/products/tranh-2.jpg",
                    MetaTitle = "Tranh hoa lá - Tranh treo tường thiên nhiên",
                    MetaDescription = "Tranh in hoa lá màu sắc tươi sáng...",
                    Created = DateTime.UtcNow
                },
                new Product { 
                    Id = Guid.NewGuid(),
                    Name = "Gương tròn viền gỗ", 
                    Slug = "guong-tron-vien-go", 
                    Sku = "GU001",
                    BasePrice = 680000, 
                    TotalStock = 18, 
                    CategoryId = guongId,
                    IsFeatured = true, 
                    Status = "active", 
                    ShortDescription = "Gương trang trí phòng ngủ",
                    Description = "Gương tròn viền gỗ tự nhiên, sang trọng...",
                    MainImageUrl = "/img/products/guong-1.jpg",
                    MetaTitle = "Gương tròn viền gỗ - Gương trang trí phòng ngủ",
                    MetaDescription = "Gương tròn viền gỗ tự nhiên, sang trọng...",
                    Created = DateTime.UtcNow
                },
                new Product { 
                    Id = Guid.NewGuid(),
                    Name = "Gương đứng full-body", 
                    Slug = "guong-dung-full-body", 
                    Sku = "GU002",
                    BasePrice = 1290000, 
                    SalePrice = 1190000, 
                    TotalStock = 8, 
                    CategoryId = guongId,
                    Status = "active", 
                    ShortDescription = "Gương soi toàn thân",
                    Description = "Gương đứng full-body cao cấp, thiết kế hiện đại...",
                    MainImageUrl = "/img/products/guong-2.jpg",
                    MetaTitle = "Gương đứng full-body - Gương soi toàn thân hiện đại",
                    MetaDescription = "Gương đứng full-body cao cấp, thiết kế hiện đại...",
                    Created = DateTime.UtcNow
                },
                new Product { 
                    Id = Guid.NewGuid(),
                    Name = "Lọ hoa gốm sứ thô", 
                    Slug = "lo-hoa-gom-su-tho", 
                    Sku = "LH001",
                    BasePrice = 250000, 
                    TotalStock = 40, 
                    CategoryId = loHoaId,
                    IsNewArrival = true, 
                    Status = "active", 
                    ShortDescription = "Lọ hoa trang trí bàn",
                    Description = "Lọ hoa gốm sứ thô mộc, mang vẻ đẹp tự nhiên...",
                    MainImageUrl = "/img/products/lo-hoa.jpg",
                    MetaTitle = "Lọ hoa gốm sứ thô - Lọ hoa trang trí bàn",
                    MetaDescription = "Lọ hoa gốm sứ thô mộc, vẻ đẹp tự nhiên...",
                    Created = DateTime.UtcNow
                },
                new Product { 
                    Id = Guid.NewGuid(),
                    Name = "Chậu cây treo tường", 
                    Slug = "chau-cay-treo-tuong", 
                    Sku = "LH002",
                    BasePrice = 180000, 
                    TotalStock = 50, 
                    CategoryId = loHoaId,
                    Status = "active", 
                    ShortDescription = "Chậu cây cảnh treo tường",
                    Description = "Chậu cây treo tường thông minh, tiết kiệm diện tích...",
                    MainImageUrl = "/img/products/chau-cay.jpg",
                    MetaTitle = "Chậu cây treo tường - Chậu cây cảnh thông minh",
                    MetaDescription = "Chậu cây treo tường thông minh, tiết kiệm diện tích...",
                    Created = DateTime.UtcNow
                },
                new Product { 
                    Id = Guid.NewGuid(),
                    Name = "Đồng hồ treo tường tối giản", 
                    Slug = "dong-ho-treo-tuong-toi-gian", 
                    Sku = "PK001",
                    BasePrice = 420000, 
                    TotalStock = 15, 
                    CategoryId = phuKienId,
                    IsFeatured = true, 
                    Status = "active", 
                    ShortDescription = "Đồng hồ trang trí phòng khách",
                    Description = "Đồng hồ treo tường thiết kế tối giản...",
                    MainImageUrl = "/img/products/dong-ho.jpg",
                    MetaTitle = "Đồng hồ treo tường tối giản - Đồng hồ trang trí phòng khách",
                    MetaDescription = "Đồng hồ treo tường thiết kế tối giản...",
                    Created = DateTime.UtcNow
                },
                new Product { 
                    Id = Guid.NewGuid(),
                    Name = "Khung ảnh gỗ 3D", 
                    Slug = "khung-anh-go-3d", 
                    Sku = "PK002",
                    BasePrice = 150000, 
                    TotalStock = 60, 
                    CategoryId = phuKienId,
                    Status = "active", 
                    ShortDescription = "Khung ảnh treo tường",
                    Description = "Khung ảnh gỗ 3D với lớp nổi tạo chiều sâu...",
                    MainImageUrl = "/img/products/khung-anh.jpg",
                    MetaTitle = "Khung ảnh gỗ 3D - Khung ảnh treo tường nghệ thuật",
                    MetaDescription = "Khung ảnh gỗ 3D tạo chiều sâu...",
                    Created = DateTime.UtcNow
                }
            };
            db.Products.AddRange(products);
            db.SaveChanges();
            Console.WriteLine($"✅ Seeded {products.Count} products.");
        }
        
        // Seed manufacturer user
        if (!db.Users.Any(u => u.UserName == "apple_manufacturer"))
        {
            byte[] salt;
            var hash = TokenHelper.HashPassword("123456", out salt);
            var appleBrand = db.Brands.First(b => b.Slug == "apple");
            var manufacturer = new User
            {
                Id = Guid.NewGuid(),
                UserName = "apple_manufacturer",
                FullName = "Apple Manufacturer",
                Email = "manufacturer@apple.com",
                Phone = "",
                PasswordHash = hash,
                Salt = salt,
                Role = "manufacturer",
                BrandId = appleBrand.Id,
                IsActive = true,
                Created = DateTime.UtcNow,
                AvatarUrl = "",
                Contact = "",
                Position = ""
            };
            db.Users.Add(manufacturer);
            db.SaveChanges();
        }
}


// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("🎨 BaseCore API Service - Decor Store running on port 5001");
Console.WriteLine("📦 Endpoints: /api/products, /api/categories, /api/orders, /api/auth");
app.Run();