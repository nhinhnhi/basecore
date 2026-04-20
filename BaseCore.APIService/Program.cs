using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using BaseCore.Repository;
using BaseCore.Repository.EFCore;
using System.Text;
using BaseCore.Common; // TokenHelper
using BaseCore.Entities;    // User, Category, Product

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

builder.Services.AddEndpointsApiExplorer();

// Swagger Configuration
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "BaseCore API Service",
        Version = "v1",
        Description = "Business Logic Microservice - Products, Categories, Orders (Bài 10, 11)"
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

// Repository Registration - Products, Categories, Orders
builder.Services.AddScoped<IProductRepositoryEF, ProductRepositoryEF>();
builder.Services.AddScoped<ICategoryRepositoryEF, CategoryRepositoryEF>();
builder.Services.AddScoped<IOrderRepositoryEF, OrderRepositoryEF>();
builder.Services.AddScoped<IOrderDetailRepositoryEF, OrderDetailRepositoryEF>();

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
            Id = Guid.NewGuid().ToString(),
            UserName = "admin",
            Password = hashedPassword,
            Salt = salt,
            Name = "Administrator",
            Email = "admin@example.com",
            Phone = "",
            Contact = "",
            Position = "Admin",
            Image = "",
            IsActive = true,
            UserType = 1,
            Created = DateTime.UtcNow
        };
        db.Users.Add(admin);
        db.SaveChanges();
        Console.WriteLine("Admin user created: admin / admin123");
    }

    // Seed categories if none exist
    if (!db.Categories.Any())
    {
        var categories = new List<Category>
        {
            new Category { Name = "Electronics", Description = "Electronic devices and gadgets" },
            new Category { Name = "Clothing", Description = "Apparel and fashion items" },
            new Category { Name = "Books", Description = "Books and publications" },
            new Category { Name = "Home & Garden", Description = "Home and garden products" },
            new Category { Name = "Sports", Description = "Sports equipment and accessories" }
        };
        db.Categories.AddRange(categories);
        db.SaveChanges();
        Console.WriteLine("Seeded 5 categories.");
    }

    // Seed products if none exist
    if (!db.Products.Any())
    {
        var products = new List<Product>
        {
            new Product { Name = "Laptop Dell XPS 15", Price = 35000000, Stock = 10, CategoryId = 1, Description = "High-performance laptop", ImageUrl = "" },
            new Product { Name = "iPhone 15 Pro", Price = 28000000, Stock = 15, CategoryId = 1, Description = "Latest Apple smartphone", ImageUrl = "" },
            new Product { Name = "Samsung Galaxy S24 Ultra", Price = 30000000, Stock = 12, CategoryId = 1, Description = "Android flagship", ImageUrl = "" },
            new Product { Name = "MacBook Air M3", Price = 32000000, Stock = 8, CategoryId = 1, Description = "Apple laptop", ImageUrl = "" },
            new Product { Name = "iPad Pro 12.9", Price = 25000000, Stock = 7, CategoryId = 1, Description = "Tablet with M2 chip", ImageUrl = "" },
            new Product { Name = "Men's T-Shirt", Price = 250000, Stock = 100, CategoryId = 2, Description = "Cotton T-shirt", ImageUrl = "" },
            new Product { Name = "Women's Jeans", Price = 600000, Stock = 50, CategoryId = 2, Description = "Slim fit jeans", ImageUrl = "" },
            new Product { Name = "Winter Jacket", Price = 1500000, Stock = 30, CategoryId = 2, Description = "Warm jacket", ImageUrl = "" },
            new Product { Name = "Running Shoes", Price = 1200000, Stock = 40, CategoryId = 2, Description = "Nike Air", ImageUrl = "" },
            new Product { Name = "Leather Bag", Price = 800000, Stock = 25, CategoryId = 2, Description = "Handbag", ImageUrl = "" },
            new Product { Name = "C# Programming Book", Price = 450000, Stock = 60, CategoryId = 3, Description = "Learn C#", ImageUrl = "" },
            new Product { Name = "ASP.NET Core Guide", Price = 550000, Stock = 45, CategoryId = 3, Description = "Web development", ImageUrl = "" },
            new Product { Name = "React Essentials", Price = 400000, Stock = 50, CategoryId = 3, Description = "Frontend library", ImageUrl = "" },
            new Product { Name = "SQL Server Bible", Price = 600000, Stock = 35, CategoryId = 3, Description = "Database guide", ImageUrl = "" },
            new Product { Name = "Design Patterns", Price = 500000, Stock = 40, CategoryId = 3, Description = "Software architecture", ImageUrl = "" },
            new Product { Name = "Garden Shovel", Price = 150000, Stock = 80, CategoryId = 4, Description = "Digging tool", ImageUrl = "" },
            new Product { Name = "Lawn Mower", Price = 3500000, Stock = 10, CategoryId = 4, Description = "Electric mower", ImageUrl = "" },
            new Product { Name = "Flower Pot Set", Price = 200000, Stock = 120, CategoryId = 4, Description = "Ceramic pots", ImageUrl = "" },
            new Product { Name = "Football", Price = 300000, Stock = 90, CategoryId = 5, Description = "Size 5", ImageUrl = "" },
            new Product { Name = "Tennis Racket", Price = 1200000, Stock = 20, CategoryId = 5, Description = "Professional", ImageUrl = "" }
        };
        db.Products.AddRange(products);
        db.SaveChanges();
        Console.WriteLine($"✅ Seeded {products.Count} products.");
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

Console.WriteLine("BaseCore API Service running on port 5001");
Console.WriteLine("Endpoints: /api/products, /api/categories, /api/orders");
app.Run();