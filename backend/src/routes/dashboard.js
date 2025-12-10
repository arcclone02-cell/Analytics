const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/overview', dashboardController.getOverview);
router.get('/revenue', dashboardController.getRevenue);
router.get('/revenue/category', dashboardController.getRevenueByCategory);
router.get('/products/top', dashboardController.getTopProducts);
router.get('/products/low-stock', dashboardController.getLowStockProducts);
router.get('/customers', dashboardController.getCustomerAnalytics);
router.get('/orders', dashboardController.getOrderAnalytics);

module.exports = router;
