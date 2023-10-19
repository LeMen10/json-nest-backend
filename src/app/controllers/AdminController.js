const Product = require('../models/Product');
const User = require('../models/User');
const { mutipleMongooseToObject, mongooseToObject } = require('../../util/mongoose');
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const orderDetails = require('../models/orderDetails');

class AdminController {
    index = asyncHandler(async (req, res) => {
        res.status(200).json({ success: true });
    });

    findProduct = asyncHandler(async (req, res) => {
        var slug = req.params.id;
        const product = Product.findOne({ _id: slug });
        if (!product) throw new Error('Product not found');
        res.status(200).json({ success: true, product });
    });

    save = asyncHandler(async (req, res) => {
        req.body.img = `http://localhost:9000/img/${req.body.img}`;

        const newProduct = new Product(req.body);

        newProduct.save(async (err, product) => {
            if (err) return res.status(500).json({ success: false, message: 'Duplicate product name' });
            const products = await Product.find({});
            if (!products) throw new Error('Products not found');
            return res.status(200).json({ products });
        });
    });

    destroy = asyncHandler(async (req, res) => {
        Product.delete({ _id: req.params.id }, async (err, deletedProduct) => {
            if (err) return res.status(500).json({ err });
            const products = await Product.find({});
            if (!products) throw new Error('Products not found');
            return res.status(200).json({ products });
        });
    });

    destroyMany(req, res) {
        Product.delete({ _id: { $in: req.body.arr_product_delete } }, async (err, deletedProduct) => {
            if (err) return res.status(500).json({ err });
            const products = await Product.find({});
            if (!products) throw new Error('Products not found');
            return res.status(200).json({ products });
        });
    }

    update = asyncHandler(async (req, res) => {
        req.body.img = `http://localhost:9000/img/${req.body.img}`;

        Product.updateOne({ _id: req.params.id }, req.body).then(() => {
            Product.find({}, (err, products) => {
                if (err) {
                    return res.status(500).json({ err });
                } else {
                    res.json({ products });
                }
            });
        });
    });

    restore = asyncHandler(async (req, res) => {
        Product.restore({ _id: req.params.id }, async (err, restoreProduct) => {
            if (err) return res.status(500).json({ err });
            const products = await Product.findDeleted({});
            if (!products) throw new Error('Products not found');
            return res.status(200).json({ products });
        });
    });

    forceDestroy = asyncHandler(async (req, res) => {
        Product.deleteOne({ _id: req.params.id }, async (err, deletedProduct) => {
            if (err) return res.status(500).json({ err });
            const products = await Product.findDeleted({});
            if (!products) throw new Error('Products not found');
            return res.status(200).json({ products });
        });
    });

    storedProducts = asyncHandler(async (req, res) => {
        let page = req.query._page;
        const limit = req.query._limit;
        page = parseInt(page);

        var countProduct = Number((page - 1) * limit);
        const count = await Product.countDocuments();
        const products = await Product.find({}).limit(limit).skip(countProduct);
        return res.status(200).json({ success: true, products, count_product: Math.ceil(count / limit) });
    });

    trashProducts = asyncHandler(async (req, res) => {
        const products = await Product.findDeleted({});
        return res.status(200).json({ success: true, products });
    });

    listUser = asyncHandler(async (req, res) => {
        const users = await User.find({});
        return res.status(200).json({ success: true, users });
    });

    countProductDelete = asyncHandler(async (req, res) => {
        const count_delete = await Product.countDocumentsDeleted({});
        return res.status(200).json({ success: true, count_delete });
    });

    orderList = asyncHandler(async (req, res) => {
        const ordersData = await orderDetails.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order_id',
                    foreignField: '_id',
                    as: 'orders',
                },
            },
            {
                $unwind: '$orders',
            },
            {
                $project: {
                    price_total: 1,
                    full_name: '$orders.full_name',
                    phone_number: '$orders.phone_number',
                    payment_methods: '$orders.payment_methods',
                    specific_address: '$orders.recipient_details.specific_address',
                    ward: '$orders.recipient_details.ward',
                    district: '$orders.recipient_details.district',
                    city: '$orders.recipient_details.city',
                },
            },
        ]);
        console.log(ordersData);
        return res.status(200).json({ success: true, ordersData });
    });
}

module.exports = new AdminController();
