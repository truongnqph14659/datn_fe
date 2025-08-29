import {z} from 'zod';

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email không được để trống',
      invalid_type_error: 'Email không hợp lệ',
    })
    .email('Email không hợp lệ')
    .min(1, 'Email không được để trống'),
  password: z
    .string({
      required_error: 'Mật khẩu không được để trống',
      invalid_type_error: 'Mật khẩu không hợp lệ',
    })
    .min(1, 'Mật khẩu không được để trống'),
});

export type LoginData = z.infer<typeof loginSchema>;
