const customerService = require('../services/customerService');

class CustomerController {
  async getAllCustomers(req, res) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const data = await customerService.getAllCustomers(parseInt(page), parseInt(limit), search);
      res.json({ success: true, ...data });
    } catch (error) {
      console.error('Error in getAllCustomers:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  }
  
  async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      const data = await customerService.getCustomerById(parseInt(id));
      
      if (!data) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
      }
      
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getCustomerById:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  }
}

module.exports = new CustomerController();
