import { z } from 'zod';

const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const password = z.string().min(8).max(72);

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email,
  password,
});

export const loginSchema = z.object({ email, password });

export function validate(schema) {
  return (request, response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      response.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please check the submitted fields.',
          details: result.error.flatten().fieldErrors,
        },
      });
      return;
    }

    request.validatedBody = result.data;
    next();
  };
}
