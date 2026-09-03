export default class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    if (stack) {
      this.stack = this.stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
