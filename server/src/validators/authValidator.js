import { z } from 'zod';
import { HttpError } from '../middlewares/errorMiddleware.js';

const emailSchema = z.string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email());

const passwordSchema = z.string()
  .min(8)
  .refine(
    (value) => Buffer.byteLength(value, 'utf8') <= 72,
    'Mật khẩu dài tối đa 72 byte UTF-8.',
  );

export const registerSchema = z.strictObject({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['student', 'employer']),
});

export const loginSchema = z.strictObject({
  email: emailSchema,
  password: passwordSchema,
});

export function parseBody(schema, body) {
  const result = schema.safeParse(body);

  if (!result.success) {
    const field = result.error.issues[0].path.join('.');

    throw new HttpError(
      400,
      'INVALID_INPUT',
      field
        ? `Vui lòng kiểm tra trường ${field}.`
        : 'Dữ liệu gửi lên không hợp lệ.',
    );
  }

  return result.data;
}