export class AppError extends Error {
  statusCode: number;
  data?: string;

  constructor(message: string, statusCode = 400, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }
}
