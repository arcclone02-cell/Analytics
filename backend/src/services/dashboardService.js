const pool = require('../config/database');

class DashboardService {
  // Lấy tổng quan KPIs
  async getOverview() {
    const client = await pool.connect();
    
    try {
      // Tháng hiện tại
      const currentMonth = new Date();
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      // Tháng trước
      const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
      
      // Tổng doanh số tháng hiện tại
      const currentMonthRevenue = await client.query(
        `SELECT COALESCE(SUM(total_amount), 0) as total 
         FROM orders 
         WHERE status = 'completed' 
         AND created_at >= $1`,
        [firstDayOfMonth]
      );
      
      // Tổng doanh số tháng trước
      const lastMonthRevenue = await client.query(
        `SELECT COALESCE(SUM(total_amount), 0) as total 
         FROM orders 
         WHERE status = 'completed' 
         AND created_at >= $1 AND created_at < $2`,
        [lastMonth, firstDayOfMonth]
      );
      
      const currentTotal = parseFloat(currentMonthRevenue.rows[0].total);
      const lastTotal = parseFloat(lastMonthRevenue.rows[0].total);
      const revenueChange = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal * 100) : 0;
      
      // Tổng số đơn hàng tháng này
      const ordersCount = await client.query(
        `SELECT COUNT(*) as count 
         FROM orders 
         WHERE created_at >= $1`,
        [firstDayOfMonth]
      );
      
      // Giá trị đơn hàng trung bình (AOV)
      const avgOrderValue = await client.query(
        `SELECT COALESCE(AVG(total_amount), 0) as avg 
         FROM orders 
         WHERE status = 'completed' 
         AND created_at >= $1`,
        [firstDayOfMonth]
      );
      
      // Tổng số khách hàng mới tháng này
      const newCustomers = await client.query(
        `SELECT COUNT(*) as count 
         FROM customers 
         WHERE created_at >= $1`,
        [firstDayOfMonth]
      );
      
      return {
        currentMonthRevenue: currentTotal,
        revenueChange: revenueChange.toFixed(2),
        totalOrders: parseInt(ordersCount.rows[0].count),
        avgOrderValue: parseFloat(avgOrderValue.rows[0].avg),
        newCustomers: parseInt(newCustomers.rows[0].count)
      };
    } finally {
      client.release();
    }
  }
  
  // Lấy dữ liệu doanh thu theo thời gian
  async getRevenue(period = 'day', days = 30) {
    const client = await pool.connect();
    
    try {
      let groupFormat, dateFormat;
      
      switch(period) {
        case 'week':
          groupFormat = "DATE_TRUNC('week', created_at)";
          dateFormat = 'YYYY-"W"IW';
          break;
        case 'month':
          groupFormat = "DATE_TRUNC('month', created_at)";
          dateFormat = 'YYYY-MM';
          break;
        default: // day
          groupFormat = "DATE_TRUNC('day', created_at)";
          dateFormat = 'YYYY-MM-DD';
      }
      
      const result = await client.query(
        `SELECT 
           TO_CHAR(${groupFormat}, $1) as period,
           COALESCE(SUM(total_amount), 0) as revenue,
           COUNT(*) as orders
         FROM orders
         WHERE status = 'completed'
         AND created_at >= NOW() - INTERVAL '${days} days'
         GROUP BY ${groupFormat}
         ORDER BY ${groupFormat}`,
        [dateFormat]
      );
      
      return result.rows.map(row => ({
        period: row.period,
        revenue: parseFloat(row.revenue),
        orders: parseInt(row.orders)
      }));
    } finally {
      client.release();
    }
  }
  
  // Doanh thu theo danh mục
  async getRevenueByCategory() {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
           c.name as category,
           COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
           COUNT(DISTINCT o.id) as orders
         FROM categories c
         LEFT JOIN products p ON p.category_id = c.id
         LEFT JOIN order_items oi ON oi.product_id = p.id
         LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'completed'
         GROUP BY c.id, c.name
         ORDER BY revenue DESC`
      );
      
      return result.rows.map(row => ({
        category: row.category,
        revenue: parseFloat(row.revenue),
        orders: parseInt(row.orders)
      }));
    } finally {
      client.release();
    }
  }
  
  // Top sản phẩm bán chạy
  async getTopProducts(limit = 10) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
           p.id,
           p.name,
           c.name as category,
           COALESCE(SUM(oi.quantity), 0) as sold,
           COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
           p.stock
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         LEFT JOIN order_items oi ON oi.product_id = p.id
         LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'completed'
         GROUP BY p.id, p.name, c.name, p.stock
         ORDER BY sold DESC
         LIMIT $1`,
        [limit]
      );
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        sold: parseInt(row.sold),
        revenue: parseFloat(row.revenue),
        stock: row.stock
      }));
    } finally {
      client.release();
    }
  }
  
  // Sản phẩm tồn kho thấp
  async getLowStockProducts(threshold = 20) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
           p.id,
           p.name,
           c.name as category,
           p.stock,
           p.price
         FROM products p
         JOIN categories c ON c.id = p.category_id
         WHERE p.stock < $1
         ORDER BY p.stock ASC`,
        [threshold]
      );
      
      return result.rows;
    } finally {
      client.release();
    }
  }
  
  // Phân tích khách hàng
  async getCustomerAnalytics() {
    const client = await pool.connect();
    
    try {
      // Tháng hiện tại
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      
      // Khách hàng mới vs khách hàng quay lại
      const customerTypes = await client.query(
        `SELECT 
           CASE 
             WHEN c.created_at >= $1 THEN 'new'
             ELSE 'returning'
           END as type,
           COUNT(DISTINCT o.customer_id) as count
         FROM orders o
         JOIN customers c ON c.id = o.customer_id
         WHERE o.created_at >= $1
         GROUP BY type`,
        [firstDayOfMonth]
      );
      
      // Top khách hàng chi tiêu nhiều
      const topCustomers = await client.query(
        `SELECT 
           c.id,
           c.name,
           c.email,
           COUNT(o.id) as total_orders,
           COALESCE(SUM(o.total_amount), 0) as total_spent
         FROM customers c
         LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'completed'
         GROUP BY c.id, c.name, c.email
         HAVING COUNT(o.id) > 0
         ORDER BY total_spent DESC
         LIMIT 10`
      );
      
      // RFM Analysis (simplified)
      const rfmData = await client.query(
        `SELECT 
           c.id,
           c.name,
           MAX(o.created_at) as last_order_date,
           COUNT(o.id) as frequency,
           COALESCE(SUM(o.total_amount), 0) as monetary
         FROM customers c
         LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'completed'
         GROUP BY c.id, c.name
         HAVING COUNT(o.id) > 0
         ORDER BY monetary DESC
         LIMIT 20`
      );
      
      return {
        customerTypes: customerTypes.rows,
        topCustomers: topCustomers.rows.map(row => ({
          ...row,
          total_spent: parseFloat(row.total_spent)
        })),
        rfmData: rfmData.rows.map(row => ({
          ...row,
          monetary: parseFloat(row.monetary),
          recency_days: Math.floor((new Date() - new Date(row.last_order_date)) / (1000 * 60 * 60 * 24))
        }))
      };
    } finally {
      client.release();
    }
  }
  
  // Phân tích đơn hàng
  async getOrderAnalytics() {
    const client = await pool.connect();
    
    try {
      // Trạng thái đơn hàng
      const orderStatus = await client.query(
        `SELECT 
           status,
           COUNT(*) as count,
           COALESCE(SUM(total_amount), 0) as total_amount
         FROM orders
         GROUP BY status`
      );
      
      // Tỷ lệ hoàn thành
      const completionRate = await client.query(
        `SELECT 
           ROUND(
             COUNT(CASE WHEN status = 'completed' THEN 1 END)::NUMERIC / 
             COUNT(*)::NUMERIC * 100, 
             2
           ) as completion_rate
         FROM orders`
      );
      
      // Thời gian xử lý trung bình (giả sử updated_at là thời điểm hoàn thành)
      const avgProcessingTime = await client.query(
        `SELECT 
           ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600), 2) as avg_hours
         FROM orders
         WHERE status = 'completed'`
      );
      
      return {
        orderStatus: orderStatus.rows.map(row => ({
          status: row.status,
          count: parseInt(row.count),
          total_amount: parseFloat(row.total_amount)
        })),
        completionRate: parseFloat(completionRate.rows[0].completion_rate || 0),
        avgProcessingTime: parseFloat(avgProcessingTime.rows[0].avg_hours || 0)
      };
    } finally {
      client.release();
    }
  }
}

module.exports = new DashboardService();
