const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const OrdersController = require('../controllers/orders');

router.get('/', checkAuth, OrdersController.orders_get_all);

router.post('/', checkAuth, OrdersController.orders_create_order);

router.get('/:orderId',checkAuth, OrdersController.order_get_id);

router.delete('/:orderId', checkAuth, OrdersController.orders_remove_order);

module.exports = router;