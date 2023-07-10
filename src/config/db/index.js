const mongoose = require('mongoose');
require('dotenv').config();
// const { TRUE } = require('node-sass');
const uri = process.env.URI_MONGODB_CLOUD;
// const uri = 'mongodb://localhost:27017/nest_ecommerce'

function connect() {
    // mongoose.set('strictQuery', TRUE);
    mongoose
        .connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log('Connected to MongoDB Atlas');
            // Perform operations on the database
        })
        .catch((error) => {
            console.log(error);
        });
}

module.exports = { connect };
