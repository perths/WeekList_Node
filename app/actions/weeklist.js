const WeekList = require('../models/WeekList');
const AppError = require('../utils/appError');

const validateWeekList = async (req, next) => {
  const weekList = await WeekList.findOne({ _id: req.params.id, createdBy: req.user._id }).lean();

  if (!weekList) {
    return next(
      new AppError(
        'The weeklist requested does not exist or you do not have permission to perform this action', 401
      )
    );
  } else
    return weekList;
};

const getAllWeekLists = async (_req, res, next) => {
  const weekLists = await WeekList.find().lean();

  res.status(200).send({
    success: true,
    requestedAt: res.requestedAt,
    data: { data: weekLists, totalCount: weekLists.length }
  });
};

const getWeekLists = async (_req, res, next) => {
  const weekLists = await WeekList.find({ isCompleted: false, expiresOn: { $gt: new Date() } });

  res.status(200).send({
    success: true,
    requestedAt: res.requestedAt,
    data: {
      data: weekLists,
      totalCount: weekLists.length
    }
  });
};

const createWeekList = async (req, res, next) => {
  const weekLists = await WeekList.countDocuments(
    {
      createdBy: req.user._id,
      isCompleted: false,
      expiresOn: {
        $gt: new Date()
      }
    });

  if (weekLists >= 2) {
    return next(new AppError('You have reached your limit ( Max 2 active weeklists ).', 403));
  }

  const filteredObj = filterProperties(req.body, 'description', 'tasks');

  if (filteredObj.tasks) {
    const filteredTasks = filteredObj.tasks.map(task => filterProperties(task, 'description'));
    filteredObj.tasks = filteredTasks;
  }

  const weekList = await WeekList.create({ createdBy: req.user._id, ...filteredObj });

  res.status(200).send({
    success: true,
    data: weekList
  });
};

const deleteWeekList = async (req, res, next) => {
  const weekList = await validateWeekList(req, next);

  if (!weekList.canModify(weekList, 1)) {
    return next(new AppError('You cannot no longer delete this weeklist.', 403));
  }

  await WeekList.findByIdAndDelete(weekList.id);

  res.status(204).send({
    success: true,
    message: 'Weeklist deleted successfully.'
  });
};

const updateWeekList = async (req, res, next) => {
  let weekList = await validateWeekList(req, next);
  const allowedPropertiesObj = filterProperties(req.body, 'description', 'tasks');

  if (!weekList.canModify(weekList, 1)) {
    return next(new AppError('You can no longer update this weeklist.', 403));
  }
  if (allowedPropertiesObj.tasks) {
    const filteredTasks = allowedPropertiesObj.tasks.map(task => filterProperties(task, 'description'));
    allowedPropertiesObj.tasks = filteredTasks;
  }

  weekList = await WeekList.findByIdAndUpdate(weekList.id, allowedPropertiesObj, { new: true });

  res.status(200).send({
    success: true,
    data: weekList
  });
};

const markTask = async (req, res, next) => {
  if (!req.body.taskId) {
    return next(new AppError('Task _id required', 403));
  }

  const weekList = await validateWeekList(req, next);

  if (weekList.isCompleted) {
    return next(new AppError('This weeklist is marked as complete. You can no longer update it.', 403));
  }

  const currentTask = await weekList.tasks.filter((task) => {
    if (req.body.taskId == task._id)
      return task;
  });

  if (!currentTask) {
    return next(new AppError('The task with the given _id doesn\'t exist', 400));
  }

  if (!weekList.canModify(weekList, 7)) {
    return next(new AppError('You can no longer update this weeklist.', 403));
  }

  currentTask.isCompleted = req.body.isCompleted;

  if (req.body.isCompleted) {
    currentTask.completedAt = new Date();
  } else {
    currentTask.completedAt = null;
  }
  
  if (!weekList.tasks.some(task => task.isCompleted === false)) {
    weekList.isCompleted = true;
  }

  weekList.save();

  res.status(200).json({
    success: true,
    data: { currentTask }
  });
};


const filterProperties = (obj, ...args) => {
  const filterObj = {};

  Object.keys(obj).forEach(key => {
    if (args.includes(key)) filterObj[key] = obj[key];
  });

  return filterObj;
};

module.exports = { createWeekList, deleteWeekList, getAllWeekLists, getWeekLists, markTask, updateWeekList }