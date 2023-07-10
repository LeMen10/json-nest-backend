const express = require('express');
const router = express.Router();
const siteController = require('../app/controllers/SiteController');
const verifyAccessToken = require('../app/middlewares/verifyToken')

router.get('/cancel', (req,res) => res.send('Cancelled (Đơn hàng đã hủy)'));
router.use('/update-address', verifyAccessToken, siteController.updateAddress) 
router.use('/get-address', verifyAccessToken, siteController.getAddressUser) 
router.use('/get-address-active', verifyAccessToken, siteController.getAddressUserActive) 
router.use('/update-status-order', siteController.updateStatusOrder) 
router.use('/success', siteController.success) 
router.post('/payment', siteController.payment); 
router.use('/save-order', verifyAccessToken, siteController.saveOrder);
router.use('/update-quantity', verifyAccessToken, siteController.updateQuantityCart);
router.use('/delete/:id', verifyAccessToken, siteController.delete);
router.use('/cart', verifyAccessToken, siteController.cart);
router.use('/checkout', verifyAccessToken, siteController.checkout);

router.use('/forgot_password', siteController.forgotPassword);
router.use('/reset_password', siteController.resetPassword);

router.post('/login', siteController.login);

router.post('/register', siteController.register);

router.post('/search', siteController.search);
router.use('/category', siteController.category);
router.use('/contact', siteController.contact);
router.use('/about', verifyAccessToken, siteController.about);
router.use('/shop', siteController.shop);
router.use('/number-items-cart', verifyAccessToken, siteController.numberItemsCart);
router.use('/get-username', siteController.getUserName) 
router.use('/', siteController.index);

module.exports = router;
