const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Order = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, maxLenght: 255, ref: 'User' },
        order_date: { type: Date },
        full_name: { type: String, maxLenght: 255, default: null },
        phone_number: { type: String, maxLenght: 255, default: null },
        payment_methods: { type: String, maxLenght: 255, default: null },
        recipient_details: {
            specific_address: { type: String, maxLenght: 255, default: null },
            ward: { type: String, maxLenght: 255, default: null },
            district: { type: String, maxLenght: 255, default: null },
            city: { type: String, maxLenght: 255, default: null },
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Order', Order);
