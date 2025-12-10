const dashboardService = require('../services/dashboardService');

class DashboardController {
  async getOverview(req, res) {
    try {
      const data = await dashboardService.getOverview();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getOverview:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  }
  
  async getRevenue(req, res) {
    try {
      const { period = 'day', days = 30 } = req.query;
      const data = await dashboardService.getRevenue(period, parseInt(days));
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getRevenue:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  }
  
  async getRevenueByCategory(req, res) {
    try {
      const data = await dashboardService.getRevenueByCategory();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getRevenueByCategory:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  }
  
  async getTopProducts(req, res) {
    try {
      const { limit = 10 } = req.query;
      const data = await dashboardService.getTopProducts(parseInt(limit));
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getTopProducts:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  }
  
  async getLowStockProducts(req, res) {
    try {
      const { threshold = 20 } = req.query;
      const data = await dashboardService.getLowStockProducts(parseInt(threshold));
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getLowStockProducts:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  }
  
  async getCustomerAnalytics(req, res) {
    try {
      const data = await dashboardService.getCustomerAnalytics();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getCustomerAnalytics:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  }
  
  async getOrderAnalytics(req, res) {
    try {
      const data = await dashboardService.getOrderAnalytics();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getOrderAnalytics:', error);
      res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
  }
}

module.exports = new DashboardController();
