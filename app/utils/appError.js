class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode || 500;
        this.status = (statusCode.toString()).includes('4') ? 'fail' : 'error';
    }
}

module.exports = AppError;
