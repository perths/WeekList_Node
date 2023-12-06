require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const errorHandler = require('./utils/errorHandler');

process.on('uncaughtException', error => {
    console.error('App - uncaughtException :', error);
    process.exit(1);
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(morgan('tiny'));

app.use((_req, res, next) => {
    res.requestedAt = Date.parse(new Date());
    next();
});

app.use(require('./routes'));

app.use(errorHandler)

mongoose
    .connect(process.env.DB_STRING)
    .then(() => console.log('Connected to mongodb successfully.'));

const PORT = process.env.PORT || 27031;

app.listen(PORT, 'localhost', () => {
    console.log('Server up and listening on port ', PORT);
});

process.on('unhandledRejection', error => {
    console.error('App - unhandledRejection: ', error);
    process.exit(1);
});
