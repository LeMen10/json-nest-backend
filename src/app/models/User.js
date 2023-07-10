const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const User = new Schema(
    {
        username: { type: String, maxLenght: 255 },
        email: { type: String, maxLenght: 255, require: true, lowercase: true },
        password: { type: String, maxLenght: 255, require: true },
        recipient_details: [
            {
                full_name: { type: String, maxLenght: 255, default: null },
                phone_number: { type: String, maxLenght: 255, default: null },
                specific_address: { type: String, maxLenght: 255, default: null },
                ward: { type: String, maxLenght: 255, default: null },
                district: { type: String, maxLenght: 255, default: null },
                city: { type: String, maxLenght: 255, default: null },
                active: { type: Boolean, default: false },
            },
        ],
        role: { type: String, default: 'user' },
        password_reset_token: { type: String, maxLenght: 255, default: null },
        password_reset_expires: { type: String, maxLenght: 255, default: null },
        refreshToken: { type: String, maxLenght: 255, default: null },
    },
    {
        timestamps: true,
    },
);

User.methods = {
    isCorrectPassword: async function (password) {
        return await bcrypt.compare(password, this.password);
    },

    createPasswordChangedToken: function () {
        const resetToken = crypto.randomBytes(32).toString('hex');
        this.password_reset_token = crypto.createHash('sha256').update(resetToken).digest('hex');
        this.password_reset_expires = Date.now() + 15 * 60 * 1000;
        return resetToken;
    },
};

module.exports = mongoose.model('User', User);
