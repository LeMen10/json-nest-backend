const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderDetails = new Schema(
    {
        product_id: { type: mongoose.Schema.Types.ObjectId, maxLenght: 255 },
        order_id: { type: mongoose.Schema.Types.ObjectId, maxLenght: 255 },
        title: { type: String, maxLenght: 255 },
        quantity: { type: Number, default: 0 },
        price_total: { type: Number, default: 0 },
        img: { type: String, maxLenght: 255 },
        status: { type: String, maxLenght: 255 },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('orderDetails', orderDetails);
