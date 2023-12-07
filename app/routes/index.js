const app = module.exports = require('express')();
const AppError = require('../utils/appError');

app.use('/api/user', require('./user'));
app.use('/api/health', require('./health'));
app.use('/api/weeklist', require('./weeklist'));

app.all('*', (req, _res, next) => {
    next(new AppError(`Route ${req.originalUrl} doesn't exist`, 404));
});
