const express = require('express')
const router = express.Router()
const verifyToken = require('../app/middlewares/verifyToken')

const productController = require('../app/controllers/ProductController');

router.use('/:slug_id/add-to-cart', verifyToken, productController.add_cart)
router.use('/:slug', verifyToken, productController.show);

module.exports = router;