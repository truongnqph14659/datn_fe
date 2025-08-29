import {HINH_THUC_NGHI_PHEP, REQUEST_TYPE} from '@/shared/constants';
import dayjs from 'dayjs';
import {z} from 'zod';

export const requestCreateSchema = z
  .object({
    requestType: z
      .number({
        required_error: 'Loại yêu cầu không được để trống',
        invalid_type_error: 'Loại yêu cầu không hợp lệ',
      })
      .min(1, 'Loại yêu cầu không được để trống'),
    employeeId: z
      .number({
        required_error: 'Nhân viên không được để trống',
        invalid_type_error: 'Nhân viên không hợp lệ',
      })
      .min(1, 'Nhân viên không được để trống'),
    date: z.any().optional(),
    start_time: z.any().optional(),
    end_time: z.any().optional(),
    from_date: z.any().optional(),
    to_date: z.any().optional(),
    hinh_thuc: z.string().optional(),
    loai_nghi: z.string().optional(),
    reason: z
      .string({
        required_error: 'Lý do không được để trống',
        invalid_type_error: 'Lý do không hợp lệ',
      })
      .min(1, 'Lý do không được để trống')
      .max(500, 'Lý do không được quá 500 ký tự'),
    approvers: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .min(1, 'Vui lòng chọn ít nhất một người duyệt'),
    referrers: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
  })
  // Validate start_time và end_time khi không phải là công tác
  .refine(
    (data) => {
      // Bỏ qua validation nếu là CONG_TAC
      if (data.requestType === REQUEST_TYPE.DI_CONG_TAC) return true;

      if (!data.start_time || !data.end_time) return true;

      const startHour = data.start_time.hour();
      const startMinute = data.start_time.minute();
      const endHour = data.end_time.hour();
      const endMinute = data.end_time.minute();

      // (ví dụ: 8:30 => 830, 17:15 => 1715)
      const startTimeValue = startHour * 100 + startMinute;
      const endTimeValue = endHour * 100 + endMinute;

      return endTimeValue > startTimeValue;
    },
    {
      message: 'Giờ kết thúc phải sau giờ bắt đầu',
      path: ['end_time'],
    },
  )
  .refine(
    (data) => {
      if (data.requestType !== REQUEST_TYPE.DI_MUON_VE_SOM) return true;
      return !!data.start_time;
    },
    {
      message: 'Giờ không được để trống',
      path: ['start_time'],
    },
  )
  // Validate loai_nghi khi requestType là DMVS hoặc NGHI_PHEP
  .refine(
    (data) => {
      // Nếu requestType không phải là 3 hoặc 4, không cần kiểm tra loai_nghi
      if (data.requestType !== REQUEST_TYPE.DI_MUON_VE_SOM && data.requestType !== REQUEST_TYPE.NGHI_PHEP) return true;
      // Nếu requestType là 3 hoặc 4, loai_nghi phải có giá trị
      return !!data.loai_nghi;
    },
    {
      message: 'Vui lòng chọn loại',
      path: ['loai_nghi'],
    },
  )
  // Validate hinh_thuc khi requestType là Nghỉ phép (4)
  .refine(
    (data) => {
      // Nếu requestType không phải là 4, không cần kiểm tra hinh_thuc
      if (data.requestType !== REQUEST_TYPE.NGHI_PHEP) return true;
      // Nếu requestType là 4, hinh_thuc phải có giá trị
      return !!data.hinh_thuc;
    },
    {
      message: 'Vui lòng chọn hình thức nghỉ phép',
      path: ['hinh_thuc'],
    },
  )
  // Validate from_date khi requestType là Công tác (8)
  .refine(
    (data) => {
      // Nếu requestType không phải là 8, không cần kiểm tra from_date
      if (
        data.requestType !== REQUEST_TYPE.DI_CONG_TAC &&
        !(data.requestType === REQUEST_TYPE.NGHI_PHEP && data.hinh_thuc === HINH_THUC_NGHI_PHEP.NHIEU_NGAY)
      )
        return true;
      // Nếu requestType là 8, from_date phải có giá trị
      return !!data.from_date;
    },
    {
      message: 'Vui lòng chọn ngày bắt đầu',
      path: ['from_date'],
    },
  )
  // Validate to_date khi requestType là Công tác (8)
  .refine(
    (data) => {
      // Nếu requestType không phải là 8, không cần kiểm tra to_date
      if (
        data.requestType !== REQUEST_TYPE.DI_CONG_TAC &&
        !(data.requestType === REQUEST_TYPE.NGHI_PHEP && data.hinh_thuc === HINH_THUC_NGHI_PHEP.NHIEU_NGAY)
      )
        return true;
      // Nếu requestType là 8, to_date phải có giá trị
      return !!data.to_date;
    },
    {
      message: 'Vui lòng chọn ngày kết thúc',
      path: ['to_date'],
    },
  )
  // Validate from_date phải trước to_date
  .refine(
    (data) => {
      if (data.requestType !== REQUEST_TYPE.DI_CONG_TAC) return true;
      if (!data.from_date || !data.to_date) return true;

      return dayjs(data.to_date).isAfter(dayjs(data.from_date)) || dayjs(data.to_date).isSame(dayjs(data.from_date));
    },
    {
      message: 'Ngày kết thúc phải sau hoặc cùng ngày với ngày bắt đầu',
      path: ['to_date'],
    },
  )
  // Validate date khi requestType không phải là Công tác (8) hoặc Nghỉ phép (4) và hinh_thuc là NHIEU_NGAY
  .refine(
    (data) => {
      // Nếu requestType là 8 (Công tác), không cần kiểm tra date
      if (data.requestType === REQUEST_TYPE.DI_CONG_TAC) return true;
      // Nếu requestType là (4) Nghỉ phép là hinh_thuc = NHIEU_NGAY, không cần kiểm tra date
      if (data.requestType === REQUEST_TYPE.NGHI_PHEP && data.hinh_thuc === HINH_THUC_NGHI_PHEP.NHIEU_NGAY) return true;
      // Nếu requestType không phải là 8, date phải có giá trị
      return !!data.date;
    },
    {
      message: 'Vui lòng chọn ngày',
      path: ['date'],
    },
  )
  .refine(
    (data) => {
      const isTimeChangeRequest = data.requestType === REQUEST_TYPE.THAY_DOI_GIO_CHAM_CONG;
      if (isTimeChangeRequest) {
        return !!data.start_time && !!data.end_time && !!data.date;
      }
      return true;
    },
    {
      message: 'Vui lòng nhập đầy đủ thông tin giờ check-in và check-out',
      path: ['start_time'],
    },
  );

export type RequestCreateSchema = z.infer<typeof requestCreateSchema>;
