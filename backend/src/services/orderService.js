const pool = require('../config/database');

class OrderService {
  async getAllOrders(page = 1, limit = 20, status = '', search = '') {
    const client = await pool.connect();
    
    try {
      const offset = (page - 1) * limit;
      
      let query = `
        SELECT 
          o.id,
          o.total_amount,
          o.status,
          o.created_at,
          o.updated_at,
          c.name as customer_name,
          c.email as customer_email,
          COUNT(oi.id) as items_count
        FROM orders o
        JOIN customers c ON c.id = o.customer_id
        LEFT JOIN order_items oi ON oi.order_id = o.id
      `;
      
      const params = [];
      const conditions = [];
      
      if (status) {
        conditions.push(`o.status = $${params.length + 1}`);
        params.push(status);
      }
      
      if (search) {
        conditions.push(`c.name ILIKE $${params.length + 1}`);
        params.push(`%${search}%`);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ` GROUP BY o.id, o.total_amount, o.status, o.created_at, o.updated_at, c.name, c.email
                 ORDER BY o.created_at DESC
                 LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      
      params.push(limit, offset);
      
      const result = await client.query(query, params);
      
      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM orders o JOIN customers c ON c.id = o.customer_id';
      const countParams = [];
      
      if (conditions.length > 0) {
        countQuery += ' WHERE ' + conditions.join(' AND ');
        if (status) countParams.push(status);
        if (search) countParams.push(`%${search}%`);
      }
      
      const countResult = await client.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);
      
      return {
        orders: result.rows.map(row => ({
          ...row,
          total_amount: parseFloat(row.total_amount),
          items_count: parseInt(row.items_count)
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
  
  async getOrderById(id) {
    const client = await pool.connect();
    
    try {
      const orderResult = await client.query(
        `SELECT 
           o.id,
           o.total_amount,
           o.status,
           o.created_at,
           o.updated_at,
           c.id as customer_id,
           c.name as customer_name,
           c.email as customer_email,
           c.phone as customer_phone,
           c.address as customer_address
         FROM orders o
         JOIN customers c ON c.id = o.customer_id
         WHERE o.id = $1`,
        [id]
      );
      
      if (orderResult.rows.length === 0) {
        return null;
      }
      
      const itemsResult = await client.query(
        `SELECT 
           oi.id,
           oi.quantity,
           oi.price,
           p.name as product_name,
           p.id as product_id
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = $1`,
        [id]
      );
      
      return {
        ...orderResult.rows[0],
        total_amount: parseFloat(orderResult.rows[0].total_amount),
        items: itemsResult.rows.map(row => ({
          ...row,
          price: parseFloat(row.price)
        }))
      };
    } finally {
      client.release();
    }
  }
}

module.exports = new OrderService();
