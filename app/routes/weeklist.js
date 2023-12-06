const app = module.exports = require('express')();
const { createWeekList, deleteWeekList, getAllWeekLists, getWeekLists, markTask, updateWeekList } = require('../actions/weeklist');
const { authenticate } = require('../actions/auth');

app.get('/', authenticate, getWeekLists);

app.get('/getAll', authenticate, getAllWeekLists);

app.post('/create', authenticate, createWeekList);

app.patch('/markTask/:id', authenticate, markTask);

app.delete('/:id', authenticate, deleteWeekList);

app.patch('/:id', authenticate, updateWeekList);
