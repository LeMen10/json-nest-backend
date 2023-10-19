const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { mutipleMongooseToObject, mongooseToObject } = require('../../util/mongoose');
const asyncHandler = require('express-async-handler');

class ProductController {
    show = asyncHandler(async (req, res) => {
        var slug = req.params.slug;
        const result = await Product.findOne({ _id: slug });
        if (result) return res.status(200).json({ success: true, product: result });
    });

    add_cart = asyncHandler(async (req, res) => {
        const { _id } = req.user;

        let product_id = req.params.slug_id;
        let quantity = Number(req.body.quantity);
        const product = await Product.findOne({ _id: product_id });
        const cart = await Cart.findOne({ user: _id });

        let title = product.title;
        let img = product.img;
        let price_unit = product.price;

        if (cart) {
            const productIndex = cart.cart_line.findIndex((item) => item.product_id === product_id);
            if (productIndex !== -1) {
                const updatedItems = [...cart.cart_line];
                updatedItems[productIndex].quantity += quantity;
                updatedItems[productIndex].price_total += quantity * updatedItems[productIndex].price_unit;

                await Cart.updateOne({ _id: cart._id }, { $set: { cart_line: updatedItems } });
                const count = await Cart.findOne({ user: _id });
                return res.status(200).json({ success: true, count: count.cart_line.length });
            } else {
                var [...rest] = cart.cart_line;
                cart.cart_line = [
                    ...rest,
                    {
                        product_id,
                        title,
                        img,
                        quantity,
                        price_unit,
                        price_total: product.price * quantity,
                    },
                ];

                await Cart.updateOne({ _id: cart._id }, cart);
                const count = await Cart.findOne({ user: _id });
                return res.status(200).json({ success: true, count: count.cart_line.length });
            }
        } else {
            var cart_line = {
                product_id,
                title,
                img,
                quantity,
                price_unit,
                price_total: product.price * quantity,
            };
            var cart_list = new Cart({ user: _id, cart_line: cart_line });
            cart_list.save();
            const count = await Cart.findOne({ user: _id });
            return res.status(200).json({ success: true, count: count.cart_line.length });
        }
    });
}

module.exports = new ProductController();
