const orderService = require('../services/orderService');

class OrderController {
  async getAllOrders(req, res) {
    try {
      const { page = 1, limit = 20, status = '', search = '' } = req.query;
      const data = await orderService.getAllOrders(parseInt(page), parseInt(limit), status, search);
      res.json({ success: true, ...data });
    } catch (error) {
      console.error('Error in getAllOrders:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  }
  
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const data = await orderService.getOrderById(parseInt(id));
      
      if (!data) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
      }
      
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getOrderById:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  }
}

module.exports = new OrderController();
