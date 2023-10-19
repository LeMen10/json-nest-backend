const siteRouter = require('./site')
const productRouter = require('./product')
const adminRouter = require('./admin')
const userRouter = require('./user')

function route(app) {
    app.use('/admin', adminRouter);
    app.use('/product', productRouter)
    app.use('/user', userRouter)
    app.use('/', siteRouter)

    // docker
    // app.use('/api/admin', adminRouter);
    // app.use('/api/product', productRouter)
    // app.use('/api/user', userRouter)
    // app.use('/api/', siteRouter)
}

module.exports = route;