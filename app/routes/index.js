const app = module.exports = require('express')();
const AppError = require('../utils/appError');

app.use('/api/user', require('./user'));
app.use('/api/health', require('./health'));
app.use('/api/weeklist', require('./weeklist'));
