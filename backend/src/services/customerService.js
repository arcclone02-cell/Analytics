const pool = require('../config/database');

class CustomerService {
  async getAllCustomers(page = 1, limit = 20, search = '') {
    const client = await pool.connect();
    
    try {
      const offset = (page - 1) * limit;
      
      let query = `
        SELECT 
          c.id,
          c.name,
          c.email,
          c.phone,
          c.address,
          c.created_at,
          COUNT(o.id) as total_orders,
          COALESCE(SUM(o.total_amount), 0) as total_spent
        FROM customers c
        LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'completed'
      `;
      
      const params = [];
      if (search) {
        query += ` WHERE c.name ILIKE $1 OR c.email ILIKE $1 OR c.phone ILIKE $1`;
        params.push(`%${search}%`);
      }
      
      query += ` GROUP BY c.id, c.name, c.email, c.phone, c.address, c.created_at
                 ORDER BY c.created_at DESC
                 LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      
      params.push(limit, offset);
      
      const result = await client.query(query, params);
      
      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM customers c';
      const countParams = [];
      if (search) {
        countQuery += ' WHERE c.name ILIKE $1 OR c.email ILIKE $1 OR c.phone ILIKE $1';
        countParams.push(`%${search}%`);
      }
      
      const countResult = await client.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);
      
      return {
        customers: result.rows.map(row => ({
          ...row,
          total_orders: parseInt(row.total_orders),
          total_spent: parseFloat(row.total_spent)
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
  
  async getCustomerById(id) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
           c.id,
           c.name,
           c.email,
           c.phone,
           c.address,
           c.created_at,
           COUNT(o.id) as total_orders,
           COALESCE(SUM(o.total_amount), 0) as total_spent,
           MAX(o.created_at) as last_order_date
         FROM customers c
         LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'completed'
         WHERE c.id = $1
         GROUP BY c.id, c.name, c.email, c.phone, c.address, c.created_at`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return {
        ...result.rows[0],
        total_orders: parseInt(result.rows[0].total_orders),
        total_spent: parseFloat(result.rows[0].total_spent)
      };
    } finally {
      client.release();
    }
  }
}

module.exports = new CustomerService();
