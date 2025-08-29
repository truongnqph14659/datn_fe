import {
  EditAttendanceFormData,
  editAttendanceSchema,
} from '@/modules/timekeeping/components/EditAttendanceTime/form-config';
import {REQUEST_TYPE} from '@/shared/constants';
import {useCreateRequestEmployee} from '@/shared/hooks/react-query-hooks/request-employee';
import {useUserTimekeepingStore} from '@/store';
import {zodResolver} from '@hookform/resolvers/zod';
import {Button, TimePicker} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import dayjs from 'dayjs';
import {useEffect} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {toast} from 'react-toastify';

export interface EditAttendanceTimeProps {
  setIsEditing: (isEditing: boolean) => void;
}

export default function EditAttendanceTime({setIsEditing}: EditAttendanceTimeProps) {
  const {selectedTimekeeping} = useUserTimekeepingStore();
  const {mutate: CreateRequestEmployeeMutation, isPending} = useCreateRequestEmployee();

  const {
    handleSubmit,
    control,
    formState: {errors},
    setValue,
    reset,
  } = useForm<EditAttendanceFormData>({
    resolver: zodResolver(editAttendanceSchema),
    defaultValues: {
      start_time: null,
      end_time: null,
      reason: '',
    },
  });

  useEffect(() => {
    if (selectedTimekeeping?.timekeeping) {
      setValue('start_time', dayjs(selectedTimekeeping.timekeeping.checkin));
      setValue('end_time', dayjs(selectedTimekeeping.timekeeping.checkout));
    }
  }, [selectedTimekeeping, setValue]);

  const onSubmit = (data: EditAttendanceFormData) => {
    if (!selectedTimekeeping?.employeeId) {
      toast.error('Không tìm thấy thông tin nhân viên');
      return;
    }
    const requestData = {
      employeeId: selectedTimekeeping.employeeId,
      requestType: REQUEST_TYPE.THAY_DOI_GIO_CHAM_CONG,
      date: dayjs(selectedTimekeeping.timekeeping.work_date).format('YYYY-MM-DD'),
      start_time: data.start_time ? dayjs(data.start_time).format('HH:mm') : null,
      end_time: data.end_time ? dayjs(data.end_time).format('HH:mm') : null,
      reason: data.reason,
      attendance_id: selectedTimekeeping?.timekeeping.attendance_id || 0,
      created_request: selectedTimekeeping?.timekeeping?.work_date || '',
      approvers: [],
    };
    CreateRequestEmployeeMutation(requestData, {
      onSuccess: () => {
        reset();
        setIsEditing(false);
      },
      onError: (error) => {
        console.error('Error creating time change request:', error);
        toast.error('Đã có lỗi xảy ra khi tạo yêu cầu');
      },
    });
  };

  return (
    <div className="p-4 mt-4 bg-gray-100 border rounded-lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-[1fr_1fr_2fr] gap-4">
          <div>
            <label className="block mb-1 font-semibold">Thời gian bắt đầu</label>
            <Controller
              name="start_time"
              control={control}
              render={({field}) => (
                <TimePicker
                  className="w-full"
                  format="HH:mm:ss"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={field.onChange}
                  status={errors.start_time ? 'error' : undefined}
                />
              )}
            />
            {errors.start_time && <p className="mt-1 text-xs text-red-500">{errors.start_time.message?.toString()}</p>}
          </div>
          <div>
            <label className="block mb-1 font-semibold">Thời gian kết thúc</label>
            <Controller
              name="end_time"
              control={control}
              render={({field}) => (
                <TimePicker
                  className="w-full"
                  format="HH:mm:ss"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={field.onChange}
                  status={errors.end_time ? 'error' : undefined}
                />
              )}
            />
            {errors.end_time && <p className="mt-1 text-xs text-red-500">{errors.end_time.message?.toString()}</p>}
          </div>
          <div>
            <label className="block mb-1 font-semibold">Lý do</label>
            <Controller
              name="reason"
              control={control}
              render={({field}) => (
                <TextArea rows={1} placeholder="Nhập lý do" {...field} status={errors.reason ? 'error' : undefined} />
              )}
            />
            {errors.reason && <p className="mt-1 text-xs text-red-500">{errors.reason.message}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => setIsEditing(false)} htmlType="button" type="primary">
            Hủy
          </Button>
          <Button htmlType="submit" loading={isPending} type="primary">
            Tạo đơn
          </Button>
        </div>
      </form>
    </div>
  );
}
