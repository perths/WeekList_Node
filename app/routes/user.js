const app = module.exports = require('express')();
const { login, signup } = require('../actions/auth');

app.post('/login', login);
app.post('/signup', signup);
