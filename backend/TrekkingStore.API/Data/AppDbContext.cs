using Microsoft.EntityFrameworkCore;
using TrekkingStore.API.Entities;

namespace TrekkingStore.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<AppUser> Users => Set<AppUser>();
        public DbSet<Address> Addresses => Set<Address>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
        public DbSet<ProductImage> ProductImages => Set<ProductImage>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<Voucher> Vouchers => Set<Voucher>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<InventoryLog> InventoryLogs => Set<InventoryLog>();
        public DbSet<Banner> Banners => Set<Banner>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User
            modelBuilder.Entity<AppUser>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();
            });

            // Category
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasIndex(c => c.Slug).IsUnique();
                entity.HasOne(c => c.Parent)
                      .WithMany(c => c.SubCategories)
                      .HasForeignKey(c => c.ParentId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Product
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasIndex(p => p.Slug).IsUnique();
                entity.HasIndex(p => p.Name);
                entity.HasOne(p => p.Category)
                      .WithMany(c => c.Products)
                      .HasForeignKey(p => p.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ProductVariant
            modelBuilder.Entity<ProductVariant>(entity =>
            {
                entity.HasIndex(v => v.Sku).IsUnique();
                entity.HasOne(v => v.Product)
                      .WithMany(p => p.Variants)
                      .HasForeignKey(v => v.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ProductImage
            modelBuilder.Entity<ProductImage>(entity =>
            {
                entity.HasOne(i => i.Product)
                      .WithMany(p => p.Images)
                      .HasForeignKey(i => i.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Order
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasIndex(o => o.OrderCode).IsUnique();
                entity.HasIndex(o => o.CustomerPhone);
                entity.HasIndex(o => o.CreatedAt);

                entity.HasOne(o => o.User)
                      .WithMany(u => u.Orders)
                      .HasForeignKey(o => o.UserId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(o => o.Voucher)
                      .WithMany(v => v.Orders)
                      .HasForeignKey(o => o.VoucherId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // OrderItem
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasOne(oi => oi.Order)
                      .WithMany(o => o.OrderItems)
                      .HasForeignKey(oi => oi.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(oi => oi.Variant)
                      .WithMany(v => v.OrderItems)
                      .HasForeignKey(oi => oi.VariantId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Voucher
            modelBuilder.Entity<Voucher>(entity =>
            {
                entity.HasIndex(v => v.Code).IsUnique();
            });

            // Review
            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasOne(r => r.Product)
                      .WithMany(p => p.Reviews)
                      .HasForeignKey(r => r.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.User)
                      .WithMany(u => u.Reviews)
                      .HasForeignKey(r => r.UserId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // InventoryLog
            modelBuilder.Entity<InventoryLog>(entity =>
            {
                entity.HasOne(il => il.Variant)
                      .WithMany(v => v.InventoryLogs)
                      .HasForeignKey(il => il.VariantId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}

