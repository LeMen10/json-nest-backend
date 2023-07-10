const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Cart = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, maxLenght: 255, ref: 'User' },
        cart_line: [
            {
                product_id: { type: String, maxLenght: 255 },
                title: { type: String, maxLenght: 255 },
                img: { type: String, maxLenght: 255 },
                quantity: { type: Number, default: 0 },
                price_unit: { type: Number, default: 0 },
                price_total: { type: Number, default: 0 },
            },
        ],
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Cart', Cart);
