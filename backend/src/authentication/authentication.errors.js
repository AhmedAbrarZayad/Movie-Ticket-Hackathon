export class AuthenticationError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
