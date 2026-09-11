export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

export class ExistingError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}