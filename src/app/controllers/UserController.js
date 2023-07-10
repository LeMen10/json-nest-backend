const asyncHandler = require('express-async-handler');
const orderDetails = require('../models/orderDetails');
const order = require('../models/Order');

class UserController {
    purchase = asyncHandler(async (req, res) => {
        const { _id } = req.user;
        const order_data = await order.find({ user: _id }, { _id: 1 });
        console.log(order_data);
        if (!order_data) return res.status(200).json({ success: true, state: 'No orders yet' });
        let order_details;

        switch (req.query.type) {
            case 'complete':
                order_details = await orderDetails.find({
                    order_id: { $in: order_data },
                    status: 'Đã hoàn thành',
                });
                break;
            case 'cancelled':
                order_details = await orderDetails.find({
                    order_id: { $in: order_data },
                    status: 'Đã hủy',
                });
                break;
            case 'noted':
                order_details = await orderDetails.find({
                    order_id: { $in: order_data },
                    status: { $in: ['Chưa thanh toán', 'Đã thanh toán'] },
                });
                break;
        }

        console.log(order_details);
        return res.status(200).json({ success: true, order_details });
    });

    orderCancel = asyncHandler(async (req, res) => {
        const order_detail_id = req.params.id;
        const result = await orderDetails.findOneAndUpdate(
            { _id: order_detail_id },
            { $set: { status: 'Đã hủy' } },
            { new: true },
        );

        console.log(result);
        if(!result) return res.status(400).json({ success: false });
        return res.status(200).json({ success: true, result });
    });
}

module.exports = new UserController();
