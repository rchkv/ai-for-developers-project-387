/**
 * Ошибка API, соответствующая модели `Error { code, message }` из контракта.
 * `status` — HTTP-статус ответа, `code` — код в теле ответа.
 */
export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const notFound = (message) => new ApiError(404, 404, message);
export const badRequest = (message) => new ApiError(400, 400, message);
export const conflict = (message) => new ApiError(409, 409, message);

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    res.status(err.status).json({ code: err.code, message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ code: 500, message: "Внутренняя ошибка сервера" });
}
