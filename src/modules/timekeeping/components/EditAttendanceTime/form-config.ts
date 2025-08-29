import {z} from 'zod';

export const editAttendanceSchema = z.object({
  start_time: z.any().refine((value) => !!value, {message: 'Vui lòng chọn thời gian bắt đầu'}),
  end_time: z.any().refine((value) => !!value, {message: 'Vui lòng chọn thời gian kết thúc'}),
  reason: z.string().min(1, {message: 'Vui lòng nhập lý do'}).max(500, {message: 'Lý do không được quá 500 ký tự'}),
});

export type EditAttendanceFormData = z.infer<typeof editAttendanceSchema>;
