const express = require('express')
const router = express.Router()
const userController = require('../app/controllers/UserController');
const verifyAccessToken = require('../app/middlewares/verifyToken')

router.use('/purchase', verifyAccessToken, userController.purchase) 
router.use('/order-cancel/:id', verifyAccessToken, userController.orderCancel) 

module.exports = router;