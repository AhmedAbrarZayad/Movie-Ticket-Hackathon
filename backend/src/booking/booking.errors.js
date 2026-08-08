export class BookingError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'BookingError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
