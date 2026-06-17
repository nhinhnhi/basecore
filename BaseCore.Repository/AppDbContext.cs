using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // DbSets
        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<ProductVariant> ProductVariants { get; set; }
        public DbSet<AttributeGroup> AttributeGroups { get; set; }
        public DbSet<AttributeValue> AttributeValues { get; set; }
        public DbSet<VariantAttributeValue> VariantAttributeValues { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<ProductTag> ProductTags { get; set; }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderImage> OrderImages { get; set; }
        public DbSet<UserAddress> UserAddresses { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Coupon> Coupons { get; set; }
        public DbSet<UserCoupon> UserCoupons { get; set; }
        public DbSet<OrderStatusLog> OrderStatusLogs { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Refund> Refunds { get; set; }
        public DbSet<ShippingProvider> ShippingProviders { get; set; }
        public DbSet<Shipment> Shipments { get; set; }
        public DbSet<ShipmentEvent> ShipmentEvents { get; set; }
        public DbSet<BrandCategory> BrandCategories { get; set; }
        public DbSet<OrderItem> OrderItems {get; set;}
        public DbSet<InventoryLog> InventoryLogs {get;set;}

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ========== CẤU HÌNH USER ==========
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(450);
                entity.Property(e => e.UserName).HasMaxLength(100).IsRequired();
                entity.Property(e => e.FullName).HasMaxLength(100).IsRequired();
                entity.Property(e => e.PasswordHash).HasMaxLength(255).IsRequired();
                entity.Property(e => e.Email).HasMaxLength(200);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.Role).HasMaxLength(20).HasDefaultValue("customer");
                entity.Property(e => e.AvatarUrl).HasMaxLength(500);
                entity.Property(e => e.Contact).HasMaxLength(200);
                entity.Property(e => e.Position).HasMaxLength(100);
                
                entity.HasIndex(e => e.UserName).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            // ========== CẤU HÌNH USER ADDRESS ==========
            modelBuilder.Entity<UserAddress>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(450);
                entity.Property(e => e.RecipientName).HasMaxLength(100);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.Province).HasMaxLength(100);
                entity.Property(e => e.District).HasMaxLength(100);
                entity.Property(e => e.Ward).HasMaxLength(100);
                
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Addresses)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ========== CẤU HÌNH REFRESH TOKEN ==========
            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(450);
                entity.Property(e => e.Token).IsRequired();
                
                entity.HasOne(e => e.User)
                      .WithMany(u => u.RefreshTokens)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<RelatedProduct>(entity =>
            {
                entity.HasKey(e => new { e.ProductId, e.RelatedProductId });
                entity.HasOne(e => e.Product)
                    .WithMany()
                    .HasForeignKey(e => e.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.RelatedProductRef)
                    .WithMany()
                    .HasForeignKey(e => e.RelatedProductId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ========== CẤU HÌNH CATEGORY ==========
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Slug).HasMaxLength(120).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.ImageUrl).HasMaxLength(255);
                entity.Property(e => e.IconClass).HasMaxLength(100);
                entity.Property(e => e.MetaTitle).HasMaxLength(160);
                entity.Property(e => e.MetaDescription).HasMaxLength(300);
                
                entity.HasIndex(e => e.Slug).IsUnique();
                
                entity.HasOne(e => e.Parent)
                      .WithMany(e => e.Children)
                      .HasForeignKey(e => e.ParentId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ========== CẤU HÌNH BRAND ==========
            modelBuilder.Entity<Brand>(entity =>
            {
                entity.HasIndex(e => e.Slug).IsUnique();
                entity.HasMany(b => b.Products)
                    .WithOne(p => p.Brand)
                    .HasForeignKey(p => p.BrandId)
                    .OnDelete(DeleteBehavior.SetNull);
            });
            modelBuilder.Entity<BrandCategory>(entity =>
            {
                entity.HasKey(e => new { e.BrandId, e.CategoryId });

                entity.HasOne(e => e.Brand)
                    .WithMany(b => b.BrandCategories)
                    .HasForeignKey(e => e.BrandId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Category)
                    .WithMany()
                    .HasForeignKey(e => e.CategoryId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ========== CẤU HÌNH PRODUCT ==========
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Slug).HasMaxLength(220).IsRequired();
                entity.Property(e => e.ShortDescription).HasMaxLength(500);
                entity.Property(e => e.Description).HasMaxLength(4000);
                entity.Property(e => e.BasePrice).HasPrecision(18, 2);
                entity.Property(e => e.SalePrice).HasPrecision(18, 2);
                entity.Property(e => e.Sku).HasMaxLength(50);
                entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("active");
                entity.Property(e => e.MainImageUrl).HasMaxLength(500);
                entity.Property(e => e.MetaTitle).HasMaxLength(160);
                entity.Property(e => e.MetaDescription).HasMaxLength(300);
                
                entity.HasIndex(e => e.Slug).IsUnique();
                entity.HasIndex(e => e.Sku).IsUnique();
                entity.HasQueryFilter(e => !e.IsDeleted);
                
                entity.HasOne(e => e.Category)
                      .WithMany(c => c.Products)
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
                
                entity.HasOne(e => e.Brand)
                      .WithMany(b => b.Products)
                      .HasForeignKey(e => e.BrandId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ========== CẤU HÌNH PRODUCT IMAGE ==========
            modelBuilder.Entity<ProductImage>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ImageUrl).IsRequired().HasMaxLength(500);
                entity.Property(e => e.AltText).HasMaxLength(255);
                
                entity.HasOne(e => e.Product)
                      .WithMany(p => p.Images)
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(e => e.Variant)
                      .WithMany(v => v.Images)
                      .HasForeignKey(e => e.VariantId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ========== CẤU HÌNH PRODUCT VARIANT ==========
            modelBuilder.Entity<ProductVariant>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.SkuVariant).HasMaxLength(50);
                entity.Property(e => e.PriceOverride).HasPrecision(18, 2);
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                
                entity.HasOne(e => e.Product)
                      .WithMany(p => p.Variants)
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ========== CẤU HÌNH ATTRIBUTE GROUP & VALUE ==========
            modelBuilder.Entity<AttributeGroup>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(80).IsRequired();
                entity.Property(e => e.InputType).HasMaxLength(50);
            });

            modelBuilder.Entity<AttributeValue>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Value).HasMaxLength(100).IsRequired();
                entity.Property(e => e.ColorHex).HasMaxLength(7);
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                
                entity.HasOne(e => e.Group)
                      .WithMany(g => g.AttributeValues)
                      .HasForeignKey(e => e.GroupId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ========== CẤU HÌNH VARIANT ATTRIBUTE VALUES (Composite Key) ==========
            modelBuilder.Entity<VariantAttributeValue>(entity =>
            {
                entity.HasKey(e => new { e.VariantId, e.AttributeValueId });
                
                entity.HasOne(e => e.Variant)
                      .WithMany(v => v.VariantAttributeValues)
                      .HasForeignKey(e => e.VariantId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(e => e.AttributeValue)
                      .WithMany(av => av.VariantAttributeValues)
                      .HasForeignKey(e => e.AttributeValueId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ========== CẤU HÌNH TAG ==========
            modelBuilder.Entity<Tag>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(80).IsRequired();
                entity.Property(e => e.Slug).HasMaxLength(90);
                entity.Property(e => e.ColorHex).HasMaxLength(20);
                
                entity.HasIndex(e => e.Slug).IsUnique();
            });

            // ========== CẤU HÌNH PRODUCT TAG (Composite Key) ==========
            modelBuilder.Entity<ProductTag>(entity =>
            {
                entity.HasKey(e => new { e.ProductId, e.TagId });
                
                entity.HasOne(e => e.Product)
                      .WithMany(p => p.ProductTags)
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(e => e.Tag)
                      .WithMany(t => t.ProductTags)
                      .HasForeignKey(e => e.TagId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ========== CẤU HÌNH ORDER ==========
            // Cấu hình Order
                modelBuilder.Entity<Order>(entity =>
                {
                    entity.HasKey(e => e.Id);
                    
                    entity.Property(e => e.UserId)
                        .IsRequired()
                        .HasMaxLength(450);
                    
                    entity.Property(e => e.OrderDate)
                        .IsRequired();
                    
                    entity.Property(e => e.Subtotal)
                        .HasPrecision(18, 2)
                        .IsRequired();
                    
                    entity.Property(e => e.ShippingFee)
                        .HasPrecision(18, 2)
                        .IsRequired();
                    
                    entity.Property(e => e.Total)
                        .HasPrecision(18, 2)
                        .IsRequired();
                    
                    entity.Property(e => e.Status)
                        .HasMaxLength(50)
                        .IsRequired()
                        .HasDefaultValue("pending");
                    
                    entity.Property(e => e.ShippingAddress)
                        .HasMaxLength(500);
                    
                    entity.Property(e => e.CustomerNote)
                        .HasMaxLength(500);
                    
                    entity.Property(e => e.AdminNote)
                        .HasMaxLength(500);
                    
                    entity.Property(e => e.PaymentMethod)
                        .HasMaxLength(50)
                        .HasDefaultValue("cod");
                    
                    entity.Property(e => e.PaymentStatus)
                        .HasMaxLength(30)
                        .HasDefaultValue("unpaid");
                    
                    entity.Property(e => e.CreatedBy)
                        .IsRequired()
                        .HasMaxLength(256)
                        .HasDefaultValue("system");
                    
                    entity.Property(e => e.ConfirmedAt);
                    entity.Property(e => e.ShippedAt);
                    entity.Property(e => e.DeliveredAt);
                    entity.Property(e => e.CancelledAt);
                    
                    entity.Property(e => e.Created)
                        .IsRequired()
                        .HasDefaultValueSql("GETUTCDATE()");
                    
                    entity.Property(e => e.Modified);
                    
                    // Quan hệ với User
                    entity.HasOne(e => e.User)
                        .WithMany(u => u.Orders)
                        .HasForeignKey(e => e.UserId)
                        .OnDelete(DeleteBehavior.Restrict);
                    
                    // Quan hệ với OrderItems
                    entity.HasMany(e => e.OrderItems)
                        .WithOne(oi => oi.Order)
                        .HasForeignKey(oi => oi.OrderId)
                        .OnDelete(DeleteBehavior.Cascade);

                    entity.Property(e => e.RecipientName).HasMaxLength(100);
                    entity.Property(e => e.RecipientPhone).HasMaxLength(20);
                    entity.Property(e => e.DiscountAmount).HasPrecision(18, 2).HasDefaultValue(0);
                    entity.Property(e => e.EstimatedDelivery);
                });

            // Cấu hình OrderItem
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ProductNameSnapshot).IsRequired().HasMaxLength(200);
                entity.Property(e => e.VariantInfoSnapshot).HasMaxLength(100);
                entity.Property(e => e.ImageUrlSnapshot).HasMaxLength(500);
                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
                entity.Property(e => e.Subtotal).HasPrecision(18, 2);

                entity.HasOne(e => e.Order)
                    .WithMany(o => o.OrderItems)
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Product)
                    .WithMany(p => p.OrderItems)
                    .HasForeignKey(e => e.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Variant)
                    .WithMany()
                    .HasForeignKey(e => e.VariantId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Cấu hình OrderImage
            modelBuilder.Entity<OrderImage>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                entity.Property(e => e.ImagePublicId).HasMaxLength(255);
                entity.Property(e => e.ImageType).HasMaxLength(50);

                entity.HasOne(e => e.OrderItem)
                    .WithMany(oi => oi.Images)
                    .HasForeignKey(e => e.OrderItemId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
            // SocialLogin configuration
            modelBuilder.Entity<SocialLogin>(entity =>
            {
                entity.HasIndex(e => new { e.Provider, e.ProviderUserId }).IsUnique();
                entity.HasOne(e => e.User)
                    .WithMany(u => u.SocialLogins)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // PasswordReset configuration
            modelBuilder.Entity<PasswordReset>(entity =>
            {
                entity.HasIndex(e => e.Token).IsUnique();
                entity.HasOne(e => e.User)
                    .WithMany(u => u.PasswordResets)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // OtpVerification configuration
            modelBuilder.Entity<OtpVerification>(entity =>
            {
                entity.HasIndex(e => e.OtpCode);
            });

                        // Cấu hình Coupon
            modelBuilder.Entity<Coupon>(entity =>
            {
                entity.HasIndex(e => e.Code).IsUnique();
                entity.Property(e => e.DiscountType).HasMaxLength(20);
            });

            modelBuilder.Entity<Coupon>(entity =>
            {
                entity.HasIndex(e => e.Code).IsUnique();
                entity.Property(e => e.DiscountType).HasMaxLength(20);
            });

            // ← THÊM ĐOẠN NÀY
            modelBuilder.Entity<UserCoupon>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.CouponId }).IsUnique();
                entity.HasOne(e => e.Coupon)
                    .WithMany()
                    .HasForeignKey(e => e.CouponId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Cấu hình OrderStatusLog
            modelBuilder.Entity<OrderStatusLog>(entity =>
            {
                entity.HasOne(e => e.Order)
                    .WithMany(o => o.StatusLogs)
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Cấu hình Payment
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasOne(e => e.Order)
                    .WithMany(o => o.Payments)
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Cấu hình Refund
            modelBuilder.Entity<Refund>(entity =>
            {
                entity.HasOne(e => e.Order)
                    .WithMany(o => o.Refunds)
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Cấu hình Shipment
            modelBuilder.Entity<Shipment>(entity =>
            {
                entity.HasOne(e => e.Order)
                    .WithMany(o => o.Shipments)
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Cấu hình ShipmentEvent
            modelBuilder.Entity<ShipmentEvent>(entity =>
            {
                entity.HasOne(e => e.Shipment)
                    .WithMany(s => s.Events)
                    .HasForeignKey(e => e.ShipmentId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Cấu hình RelatedProduct (thêm vào OnModelCreating)
            modelBuilder.Entity<RelatedProduct>(entity =>
            {
                entity.HasKey(e => new { e.ProductId, e.RelatedProductId });
                
                entity.Property(e => e.RelationType).HasMaxLength(20).HasDefaultValue("similar");
                
                // Cấu hình quan hệ với Product (sản phẩm chính)
                entity.HasOne(e => e.Product)
                    .WithMany()
                    .HasForeignKey(e => e.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);
                
                // Cấu hình quan hệ với RelatedProduct (sản phẩm liên quan)
                entity.HasOne(e => e.RelatedProductRef)
                    .WithMany()
                    .HasForeignKey(e => e.RelatedProductId)
                    .OnDelete(DeleteBehavior.Restrict);
                
                // Không cho phép sản phẩm liên quan đến chính nó
                entity.ToTable(tb => tb.HasCheckConstraint("CK_RelatedProduct_NoSelfRelation", "[ProductId] != [RelatedProductId]"));
            });

            modelBuilder.Entity<InventoryLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Type).HasMaxLength(20).IsRequired();
                entity.Property(e => e.Note).HasMaxLength(500);
                entity.Property(e => e.CreatedByName).HasMaxLength(100);
                entity.HasOne(e => e.Product)
                    .WithMany()
                    .HasForeignKey(e => e.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}