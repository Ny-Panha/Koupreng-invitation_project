export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.code = data?.code || data?.error?.code;
    this.details = data?.details || data?.error?.details || {};
    this.fieldErrors = data?.fieldErrors || data?.fields || {};
  }
}
