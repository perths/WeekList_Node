const app = module.exports = require('express')();
const { getHealth } = require('../actions/health');

app.get('/', getHealth);
