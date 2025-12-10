const productService = require('../services/productService');

class ProductController {
  async getAllProducts(req, res) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const data = await productService.getAllProducts(parseInt(page), parseInt(limit), search);
      res.json({ success: true, ...data });
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  }
  
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const data = await productService.getProductById(parseInt(id));
      
      if (!data) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
      }
      
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getProductById:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  }
}

module.exports = new ProductController();
