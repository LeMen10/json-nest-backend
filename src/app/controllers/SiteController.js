const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { mutipleMongooseToObject, mongooseToObject } = require('../../util/mongoose');
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt');
const orderDetails = require('../models/orderDetails');
const asyncHandler = require('express-async-handler');
var paypal = require('paypal-rest-sdk');
const sendMail = require('../../service/sendMail');
const { query } = require('express');
require('dotenv').config();
// const mongoose = require('mongoose');

paypal.configure({
    mode: 'sandbox',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
});

class SiteController {
    index = asyncHandler(async (req, res) => {
        return res.status(200).json({
            success: true,
        });
    });

    getUserName = asyncHandler(async (req, res) => {
        if (req?.headers?.authorization?.startsWith('Bearer')) {
            const token = req.headers.authorization.split(' ')[1];
            if (token !== 'undefined') {
                jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
                    if (err)
                        return res.status(401).json({
                            success: false,
                            message: 'Invalid access token',
                        });
                    const user = await User.findById({ _id: decode._id });
                    if (!user) return res.status(400).json({ success: true, message: 'User not found' });

                    return res.status(200).json({
                        success: true,
                        username: user.username,
                    });
                });
            } else {
                res.json({ message: 'No Login' });
            }
        }
    });

    numberItemsCart = asyncHandler(async (req, res) => {
        var count = 0;
        const { _id } = req.user;
        const result = await Cart.findOne({ user: _id });
        if (result) count = mutipleMongooseToObject(result.cart_line).length;

        return res.status(200).json({ success: true, count });
    });

    category = asyncHandler(async (req, res) => {
        const categories = await Category.find({});
        if (categories) return res.status(200).json({ success: true, categories });
    });

    shop = asyncHandler(async (req, res) => {
        let page = req.query._page || req.body._page;
        const limit = req.query._limit || req.body._limit;
        const cate = req.query._cate || req.body._cate;
        page = parseInt(page);

        var countProduct = Number((page - 1) * limit);
        let query = {};
        if (cate !== 'null' && cate !== undefined) query.category = cate;

        const count_doc = await Product.countDocuments(query);
        const products = await Product.find(query).limit(limit).skip(countProduct);
        return res.status(200).json({ success: true, products, count_product: Math.ceil(count_doc / limit) });
    });

    search = asyncHandler(async (req, res) => {
        var params_q = req.body._query || req.query._query;
        let page = req.query._page || req.body._page;
        const limit = req.query._limit || req.body._limit;
        page = parseInt(page);

        var countProduct = Number((page - 1) * limit);

        const count_doc = await Product.find({ title: { $regex: `.*${params_q}*.`, $options: 'i' } }).count();
        const products = await Product.find({ title: { $regex: `.*${params_q}*.`, $options: 'i' } })
            .limit(limit)
            .skip(countProduct);
        if (products)
            return res.status(200).json({ success: true, products, count_product: Math.ceil(count_doc / limit) });
    });

    about(req, res) {
        res.status(200).json({ success: true });
    }

    contact(req, res) {
        res.status(200).json({ success: true });
    }

    register = asyncHandler(async (req, res) => {
        const { username, password, email } = req.body;
        if (!username || !password || !email)
            return res.status(400).json({
                success: false,
                message: 'Missing inputs',
            });
        const findUser = await User.findOne({ username });
        if (findUser) return res.status(400).json({ success: false, message: 'Account already exists' });

        const hashPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username: username,
            email: email,
            password: hashPassword,
        });
        await user.save();
        return res.status(200).json({
            success: true,
            message: 'Sign Up Success',
        });
    });

    login = asyncHandler(async (req, res) => {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({
                success: false,
                message: 'Missing inputs',
            });
        const response = await User.findOne({ username });

        if (response && (await response.isCorrectPassword(password))) {
            const { password, role, refreshToken, ...userData } = response.toObject();
            const accessToken = generateAccessToken(response._id, role);

            return res.status(200).json({
                sucess: true,
                accessToken,
                userData,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials',
            });
        }
    });

    cart = asyncHandler(async (req, res) => {
        const { _id } = req.user;
        var cart = [];
        var price_total = 0;
        const result = await Cart.findOne({ user: _id });
        if (result) {
            cart = mutipleMongooseToObject(result.cart_line);
            cart.map((item) => {
                price_total += item.price_total;
            });
        }
        return res.status(200).json({
            success: true,
            cart,
            price_total,
        });
    });

    checkout = asyncHandler(async (req, res) => {
        const { _id } = req.user;
        let data_id = req.body.dataId;
        let price_total = 0;

        const result = await Cart.findOne({ user: _id });
        if (!result) return res.status(400).json({ success: false, message: 'No cart' });

        const new_data = result.cart_line.filter((item) => data_id.includes(item.product_id));
        new_data.map((item) => (price_total += item.price_total));
        res.status(200).json({ products: new_data, price_total });
    });

    delete = asyncHandler(async (req, res) => {
        const { _id } = req.user;
        let idLineCart = req.params.id;
        let price_total = 0;
        await Cart.updateOne({ user: _id }, { $pull: { cart_line: { _id: idLineCart } } });
        const cart = await Cart.findOne({ user: _id });
        if (!cart) return res.status(400).json({ success: false, message: 'No cart' });
        cart.cart_line.map((item) => {
            price_total += item.price_total;
        });
        return res
            .status(200)
            .json({ success: true, cart: cart.cart_line, price_total, count: cart.cart_line.length });
    });

    updateQuantityCart = asyncHandler(async (req, res) => {
        const { _id } = req.user;
        const { quantityValue, targetId, priceTotalValue } = req.body;
        var price_total = 0;
        await Cart.updateOne(
            { user: _id, 'cart_line._id': targetId },
            { $set: { 'cart_line.$.quantity': quantityValue, 'cart_line.$.price_total': priceTotalValue } },
            { new: true },
        );
        const cart = await Cart.findOne({ user: _id });
        if (!cart) return res.status(400).json({ success: false, message: 'No cart' });
        cart.cart_line.map((item) => {
            price_total += item.price_total;
        });
        return res.status(200).json({
            success: true,
            price_total,
            cart: cart.cart_line,
        });
    });

    updateAddress = asyncHandler(async (req, res) => {
        const { _id } = req.user;
        const { full_name, phone_number, specific_address, ward, district, city } = req.body;
        let active;
        const arr_recipient_details = await User.findOne({ _id: _id });
        if (arr_recipient_details && arr_recipient_details.recipient_details.length == 0) active = true;
        const recipient_details = {
            full_name,
            phone_number,
            specific_address,
            ward,
            district,
            city,
            active,
        };
        await User.updateOne({ _id: _id }, { $push: { recipient_details } });
        return res.status(200).json({
            success: true,
            recipient_details: arr_recipient_details.recipient_details,
        });
    });

    getAddressUser = asyncHandler(async (req, res) => {
        const { _id } = req.user;
        const result = await User.findOne({ _id: _id });
        let address_active = [];
        result.recipient_details.map((item) => {
            if (item.active == true) {
                address_active.push(item);
            }
        });

        if (result)
            res.status(200).json({ recipient_details: result.recipient_details, address_active, success: true });
    });

    getAddressUserActive = asyncHandler(async (req, res) => {
        const { _id } = req.user;
        const data_id = req.body.data_id;

        const result = await User.findOneAndUpdate(
            {
                _id: _id,
                recipient_details: {
                    $elemMatch: {
                        active: { $eq: true },
                    },
                },
            },
            {
                $set: {
                    'recipient_details.$.active': false,
                },
            },
            { new: true },
        );
        if (result) {
            const rs = await User.findOneAndUpdate(
                {
                    _id: _id,
                    'recipient_details._id': data_id,
                },
                {
                    $set: {
                        'recipient_details.$.active': true,
                    },
                },
                { new: true },
            );
            let address_active = [];
            rs.recipient_details.map((item) => {
                if (item.active == true) {
                    address_active.push(item);
                }
            });
            if (rs) res.status(200).json({ recipient_details: rs.recipient_details, address_active, success: true });
        }
    });

    saveOrder = asyncHandler(async (req, res) => {
        const { _id } = req.user;
        const order_items = req.body.order_items;
        const status = req.body.status;
        const full_name = req.body.recipientDetails[0].full_name;
        const phone_number = req.body.recipientDetails[0].phone_number;
        const specific_address = req.body.recipientDetails[0].specific_address;
        const ward = req.body.recipientDetails[0].ward;
        const district = req.body.recipientDetails[0].district;
        const city = req.body.recipientDetails[0].city;
        const payment_methods = req.body.payment_methods;
        var arrIdProduct = [];

        const order = {
            user: _id,
            full_name,
            phone_number,
            payment_methods,
            recipient_details: {
                specific_address,
                ward,
                district,
                city,
            },
        };

        const orderModel = await Order.create(order);

        const data = order_items.map((item) => {
            arrIdProduct.push(item.product_id);
            return {
                ...item,
                order_id: orderModel._id,
                status,
            };
        });
        await orderDetails.insertMany(data);
        // await Cart.updateOne({ user: _id }, { $pull: { cart_line: { product_id: { $in: arrIdProduct } } } });
        return res.status(200).json({ success: true, order_id: orderModel._id });
    });

    payment(req, res) {
        const product_list = [];
        const { priceTotal, order_id, productList } = req.body;

        productList.map((item) => {
            product_list.push({
                name: item.title,
                sku: item._id,
                price: `${item.price_unit}`,
                currency: 'USD',
                quantity: item.quantity,
            });
        });

        var create_payment_json = {
            intent: 'sale',
            payer: {
                payment_method: 'paypal',
            },
            redirect_urls: {
                return_url: `${process.env.BASE_URL_REACTJS}/success?total=${priceTotal}&order_id=${order_id}`,
                cancel_url: `${process.env.BASE_URL_REACTJS}/cancel?order_id=${order_id}`,
            },
            transactions: [
                {
                    item_list: {
                        items: product_list,
                    },
                    amount: {
                        currency: 'USD',
                        total: `${priceTotal}`,
                    },
                    description: 'This is the payment description.',
                },
            ],
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            // console.log(payment);
            if (error) {
                throw error;
            } else {
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        res.send(payment.links[i].href);
                    }
                }
            }
        });
    }

    success(req, res) {
        const payerId = req.body.PayerID;
        const paymentId = req.body.paymentId;
        const totalOrder = req.body.totalOrder;

        const execute_payment_json = {
            payer_id: payerId,
            transactions: [
                {
                    amount: {
                        currency: 'USD',
                        total: `${totalOrder}`,
                    },
                },
            ],
        };

        paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
            if (error) {
                // console.log(error.response);
                throw error;
            } else {
                res.status(200).json({ success: true });
            }
        });
    }

    updateStatusOrder = asyncHandler(async (req, res) => {
        const result = await orderDetails.updateMany(
            { order_id: req.body.order_id },
            { $set: { status: 'Đã thanh toán' } },
            { new: true },
        );
        if (result) return res.status(200).json({ success: true });
    });

    deleteCanceledOrder = asyncHandler(async (req, res) => {
        const order_id = req.body.order_id;
        await Order.deleteOne({ _id: order_id });
        await orderDetails.deleteOne({ order_id: order_id });
        return res.status(200).json({ success: true });
    });

    forgotPassword = asyncHandler(async (req, res) => {
        const email = req.body.email;
        if (!email) throw new Error('Missing email');
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: 'User not found' });
        const resetToken = user.createPasswordChangedToken();
        await user.save();
        const html = `Xin vui lòng nhấn vào link dưới đây để thay đổi mật khẩu của bạn.Link này sẽ hết hạn sau 15p kể từ khi bạn nhận được mail này. 
        <a href=${`${process.env.BASE_URL_REACTJS}/reset_password/${resetToken}`}>Click here</a>`;

        const data = {
            email,
            html,
        };
        const rs = await sendMail(data);
        return res.status(200).json({
            success: true,
            rs,
        });
    });

    resetPassword = asyncHandler(async (req, res) => {
        const { password, token } = req.body;
        if (!password || !token) return res.status(400).json({ success: false, message: 'Missing inputs' });
        const password_reset_token = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({ password_reset_token, password_reset_expires: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ success: false, message: 'Invalid reset token' });
        const hashPassword = await bcrypt.hash(password, 10);
        user.password = hashPassword;
        user.password_reset_token = undefined;
        user.passwordChangedAt = Date.now();
        user.password_reset_expires = undefined;
        await user.save();
        return res.status(200).json({
            success: user ? true : false,
            message: user ? 'Updated password' : 'Something went wrong',
            email: user.email,
        });
    });
}

module.exports = new SiteController();
