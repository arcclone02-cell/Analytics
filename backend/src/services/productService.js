const pool = require('../config/database');

class ProductService {
  async getAllProducts(page = 1, limit = 20, search = '') {
    const client = await pool.connect();
    
    try {
      const offset = (page - 1) * limit;
      
      let query = `
        SELECT 
          p.id,
          p.name,
          c.name as category,
          p.price,
          p.stock,
          p.created_at,
          COALESCE(SUM(oi.quantity), 0) as total_sold
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN order_items oi ON oi.product_id = p.id
        LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'completed'
      `;
      
      const params = [];
      if (search) {
        query += ` WHERE p.name ILIKE $1`;
        params.push(`%${search}%`);
      }
      
      query += ` GROUP BY p.id, p.name, c.name, p.price, p.stock, p.created_at
                 ORDER BY p.created_at DESC
                 LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      
      params.push(limit, offset);
      
      const result = await client.query(query, params);
      
      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM products p';
      const countParams = [];
      if (search) {
        countQuery += ' WHERE p.name ILIKE $1';
        countParams.push(`%${search}%`);
      }
      
      const countResult = await client.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);
      
      return {
        products: result.rows.map(row => ({
          ...row,
          price: parseFloat(row.price),
          total_sold: parseInt(row.total_sold)
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } finally {
      client.release();
    }
  }
  
  async getProductById(id) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
           p.id,
           p.name,
           c.name as category,
           p.price,
           p.stock,
           p.created_at,
           COALESCE(SUM(oi.quantity), 0) as total_sold,
           COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         LEFT JOIN order_items oi ON oi.product_id = p.id
         LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'completed'
         WHERE p.id = $1
         GROUP BY p.id, p.name, c.name, p.price, p.stock, p.created_at`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return {
        ...result.rows[0],
        price: parseFloat(result.rows[0].price),
        total_sold: parseInt(result.rows[0].total_sold),
        total_revenue: parseFloat(result.rows[0].total_revenue)
      };
    } finally {
      client.release();
    }
  }
}

module.exports = new ProductService();
