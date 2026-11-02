namespace TrekkingStore.API.DTOs
{
    public class DashboardStatsDto
    {
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public int PendingOrders { get; set; }
        public int TotalCustomers { get; set; }
        public int LowStockProductsCount { get; set; }
        public List<RecentOrderDto> RecentOrders { get; set; } = new();
        public List<LowStockItemDto> LowStockItems { get; set; } = new();
        public List<DailyRevenueDto> RevenueChart { get; set; } = new();
    }

    public class RecentOrderDto
    {
        public int Id { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string OrderStatus { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class LowStockItemDto
    {
        public int VariantId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string Sku { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public int StockQuantity { get; set; }
    }

    public class DailyRevenueDto
    {
        public string Date { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
    }

    public class InventoryAdjustmentDto
    {
        public int VariantId { get; set; }
        public int QuantityChange { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}

