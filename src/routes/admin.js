const express = require('express')
const router = express.Router()
const adminController = require('../app/controllers/AdminController');

router.use('/order-list', adminController.orderList);
router.use('/trash-products', adminController.trashProducts);
router.use('/list-product', adminController.storedProducts);
router.use('/list-user', adminController.listUser);
router.use('/count-product-delete', adminController.countProductDelete);

router.use('/find-product/:id', adminController.findProduct);
router.use('/update/:id', adminController.update);
router.use('/restore/:id', adminController.restore);
router.use('/force/:id', adminController.forceDestroy);
router.use('/destroy/:id', adminController.destroy);
router.use('/destroyMany', adminController.destroyMany);
router.use('/save', adminController.save);
router.use('/', adminController.index);

module.exports = router;