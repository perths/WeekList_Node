const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  isCompleted: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    required: [true, 'Task description required']
  },
  completedAt: Date
});

const weeklistSchema = new mongoose.Schema(
  {
    createdBy: String,
    description: {
      type: String,
      required: [true, 'Weeklist description required']
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tasks: [taskSchema],
    expiresOn: { type: Date, select: false }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

weeklistSchema.pre('save', function (next) {
  if (this.isNew) {
    this.expiresOn = Date.now() + 604800000;
  }
  next();
});

weeklistSchema.virtual('timeLeft').get(function () {
  const timeDiff = Date.now() - this.createdAt.getTime();
  const daysDiff = Math.floor(timeDiff / 86400000);

  if (!this.isCompleted && daysDiff >= 7) {
    return null;
  }

  const timeLeft = Math.floor(604800 - timeDiff / 1000);

  return timeLeft;
});

weeklistSchema.virtual('state').get(function () {
  let state;
  const timeDiff = Date.now() - this.createdAt.getTime();
  const daysDiff = Math.floor(timeDiff / 86400000);

  if (daysDiff >= 7) {
    state = 'inactive';
  } else {
    state = 'active';
  }
  return state;
});

weeklistSchema.methods.canModify = (weekList, period) => {
  const timeDiff = Date.now() - weekList.createdAt.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  if (daysDiff >= period) return false;
  else return true;
};

const WeekList = mongoose.model('WeekList', weeklistSchema);

module.exports = WeekList;
