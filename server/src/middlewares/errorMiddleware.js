export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export function errorMiddleware(error, _req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof HttpError) {
    return res.status(error.status).json({
      error: { code: error.code, message: error.message },
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      error: { code: 'DUPLICATE', message: 'Dữ liệu này đã tồn tại.' },
    });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      error: { code: 'BODY_TOO_LARGE', message: 'Yêu cầu quá lớn.' },
    });
  }

  if (['ValidationError', 'CastError'].includes(error.name)
      || error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'INVALID_INPUT', message: 'Dữ liệu không hợp lệ.' },
    });
  }

  console.error('Lỗi API:', error.name);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Lỗi máy chủ.' },
  });
}