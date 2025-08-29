import {ICSitemap} from '@/components/Icon';
import ModalGlobal from '@/components/ModalGlobal';
import {
  requestCreateSchema,
  RequestCreateSchema,
} from '@/modules/timekeeping/components/ModalCreateRequest/form-config';
import OrgChartModal from '@/modules/timekeeping/components/ModalOrgChart';
import {HINH_THUC_NGHI_PHEP, LOAI_DMVS, REQUEST_TYPE} from '@/shared/constants';
import {QUERY_KEYS} from '@/shared/constants/query-key';
import {useGetOrganizationChart} from '@/shared/hooks/react-query-hooks/employee';
import {useCreateRequestEmployee} from '@/shared/hooks/react-query-hooks/request-employee';
import {useGetAllRequest} from '@/shared/hooks/react-query-hooks/requests';
import {formatFieldName} from '@/shared/utils';
import {EmployeeItem, useOrgChartStore} from '@/store/orgChartStore';
import {TimekeepingDetailType} from '@/store/userTimekeepingStore';
import {zodResolver} from '@hookform/resolvers/zod';
import {useQueryClient} from '@tanstack/react-query';
import {Button, DatePicker, Form, Select, TimePicker} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import {AxiosError} from 'axios';
import dayjs from 'dayjs';
import {useEffect, useMemo} from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import {toast} from 'react-toastify';
import './index.scss';

const {Option} = Select;

export interface ModalCreateRequestProps {
  isModalVisible: boolean;
  toggleModal: () => void;
  selectedTimekeeping?: TimekeepingDetailType | null;
  handleCancel: () => void;
}

const ModalCreateRequest = ({
  isModalVisible,
  toggleModal,
  selectedTimekeeping,
  handleCancel,
}: ModalCreateRequestProps) => {
  const {data: dataRequests} = useGetAllRequest();
  const {data: dataOrgChart} = useGetOrganizationChart();
  const {mutate: CreateRequestEmployeeMutation, isPending} = useCreateRequestEmployee();
  const queryClient = useQueryClient();
  const {setOrgChartVisible, setCurrentSelectionTarget, setTreeDataOrgChart, resetStore, orderedEmployees} =
    useOrgChartStore();
  const methods = useForm<RequestCreateSchema>({
    resolver: zodResolver(requestCreateSchema),
    defaultValues: {
      employeeId: selectedTimekeeping?.employeeId,
      date: undefined,
      start_time: undefined,
      end_time: undefined,
      hinh_thuc: undefined,
      loai_nghi: undefined,
      reason: undefined,
      requestType: undefined,
      approvers: [],
      referrers: [],
    },
  });

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: {errors},
    reset,
  } = methods;

  const watchRequestType = watch('requestType');
  const watchLoaiNghi = watch('loai_nghi');
  const watchHinhThuc = watch('hinh_thuc');
  const watchApprovers = watch('approvers');
  const watchReferrers = watch('referrers');

  const selectedRequest = useMemo(() => {
    if (watchRequestType && dataRequests?.data) {
      return dataRequests.data.find((req) => req._id === watchRequestType) || null;
    }
    return null;
  }, [watchRequestType, dataRequests?.data]);

  const treeDataOrgChart = useMemo(() => {
    if (dataOrgChart) {
      return dataOrgChart?.data?.map((i) => {
        return {
          title: i.name_depart,
          key: `department-${i.id_depart}`,
          icon: '📂',
          children: i.children.map((child) => {
            return {
              title: `${child.name} (${child.position_name})`,
              key: `employee-${child._id}`,
              icon: '👤',
            };
          }),
        };
      });
    }
    return [];
  }, [dataOrgChart]);

  useEffect(() => {
    if (treeDataOrgChart.length > 0) {
      setTreeDataOrgChart(treeDataOrgChart);
    }
  }, [treeDataOrgChart, setTreeDataOrgChart]);

  useEffect(() => {
    if (selectedRequest) {
      // Reset tất cả các trường tùy chọn khi đổi loại yêu cầu
      setValue('hinh_thuc', undefined);
      setValue('loai_nghi', undefined);
      setValue('start_time', undefined);
      setValue('end_time', undefined);
      setValue('from_date', undefined);
      setValue('to_date', undefined);
      setValue('date', undefined);
    }
  }, [selectedRequest, setValue]);

  useEffect(() => {
    if (watchRequestType === REQUEST_TYPE.THAY_DOI_GIO_CHAM_CONG && selectedTimekeeping?.timekeeping?.work_date) {
      if (!selectedTimekeeping?.timekeeping?.checkin && !selectedTimekeeping?.timekeeping?.checkout) {
        toast.error('Không có dữ liệu check-in/check-out để thay đổi');
        return;
      }
      setValue('date', dayjs(selectedTimekeeping.timekeeping.work_date));
      setValue('start_time', dayjs(selectedTimekeeping.timekeeping.checkin));
      setValue('end_time', dayjs(selectedTimekeeping.timekeeping.checkout));
    }
  }, [selectedTimekeeping, setValue, watchRequestType]);

  const openOrgChart = (target: 'approvers' | 'referrers') => {
    setCurrentSelectionTarget(target);
    setOrgChartVisible(true);
  };

  const onFinish = (values: RequestCreateSchema) => {
    if (!values.employeeId) {
      return toast.error('Vui lòng chọn nhân viên');
    }
    if (
      values.requestType === REQUEST_TYPE.THAY_DOI_GIO_CHAM_CONG &&
      !selectedTimekeeping?.timekeeping?.checkin &&
      !selectedTimekeeping?.timekeeping?.checkout
    ) {
      return toast.error('Không có dữ liệu check-in/check-out để thay đổi');
    }

    let formattedValues;
    if (values.requestType === REQUEST_TYPE.THAY_DOI_GIO_CHAM_CONG) {
      formattedValues = {
        employeeId: values.employeeId,
        requestType: REQUEST_TYPE.THAY_DOI_GIO_CHAM_CONG,
        date: dayjs(selectedTimekeeping?.timekeeping.work_date).format('YYYY-MM-DD'),
        start_time: values.start_time ? dayjs(values.start_time).format('HH:mm') : null,
        end_time: values.end_time ? dayjs(values.end_time).format('HH:mm') : null,
        reason: values.reason,
        attendance_id: selectedTimekeeping?.timekeeping.attendance_id || 0,
        created_request: selectedTimekeeping?.timekeeping?.work_date || '',
        approvers: values.approvers,
        referrers: values.referrers,
      };
    } else {
      formattedValues = {
        ...values,
        employeeId: values.employeeId,
        start_time: values.start_time ? dayjs(values.start_time).format('HH:mm') : null,
        end_time: values.end_time ? dayjs(values.end_time).format('HH:mm') : null,
        attendance_id: selectedTimekeeping?.timekeeping.attendance_id || 0,
        created_request: selectedTimekeeping?.timekeeping?.work_date || '',
      };
    }

    CreateRequestEmployeeMutation(formattedValues, {
      onSuccess: () => {
        reset();
        toggleModal();
        resetStore();
        queryClient.invalidateQueries([QUERY_KEYS.GET_ATTENDANCE_REQUEST_BY_ATTENDANCE_ID] as any);
        if (selectedTimekeeping?.timekeeping.attendance_id === null) handleCancel();
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data.message || 'Đã có lỗi xảy ra!');
        } else {
          toast.error('Đã có lỗi xảy ra');
        }
        console.log('Error creating request:', error);
      },
    });
  };

  const resetTimeValue = () => {
    setValue('start_time', undefined);
    setValue('end_time', undefined);
    setValue('from_date', undefined);
    setValue('to_date', undefined);
    setValue('date', undefined);
  };

  const shouldShowEndTime = () => {
    // Nếu là DMVS, không hiển thị end_time
    if (selectedRequest?.code === 'DMVS') {
      return false;
    }
    // Các trường hợp khác, hiển thị end_time
    return selectedRequest?.code !== 'CONG_TAC';
  };

  const getStartTimeLabel = () => {
    if (selectedRequest?.code === 'DMVS') {
      if (watchLoaiNghi === LOAI_DMVS.DI_MUON) {
        return 'Giờ đi muộn';
      } else if (watchLoaiNghi === LOAI_DMVS.VE_SOM) {
        return 'Giờ về sớm';
      }
    }
    return 'Giờ bắt đầu';
  };

  // Hàm xác định xem start_time có bắt buộc hay không
  const isStartTimeRequired = () => selectedRequest?.code === 'DMVS';

  const renderRequestTypeFields = () => {
    if (!selectedRequest || !selectedRequest.fields) return null;
    return (
      <>
        {(selectedRequest.code === 'DMVS' || selectedRequest.code === 'NGHI_PHEP') &&
          selectedRequest.fields.loai_nghi && (
            <Form.Item
              key="loai_nghi"
              label={`${selectedRequest.code === 'DMVS' ? 'Loại' : 'Loại nghỉ phép'}`}
              required
              help={errors.loai_nghi?.message}
              validateStatus={errors.loai_nghi ? 'error' : undefined}
            >
              <Controller
                name="loai_nghi"
                control={control}
                rules={{required: true}}
                render={({field}) => (
                  <Select
                    {...field}
                    placeholder="Chọn loại"
                    status={errors.loai_nghi ? 'error' : undefined}
                    onChange={(value) => {
                      field.onChange(value);
                      setValue('start_time', undefined);
                      setValue('end_time', undefined);
                    }}
                  >
                    {selectedRequest.fields.loai_nghi.map((type: string) => (
                      <Option key={type} value={type}>
                        {formatFieldName(type)}
                      </Option>
                    ))}
                  </Select>
                )}
              />
            </Form.Item>
          )}
        {selectedRequest.code === 'NGHI_PHEP' && selectedRequest.fields.hinh_thuc && (
          <Form.Item
            key="hinh_thuc"
            label="Hình thức nghỉ phép"
            required
            help={errors.hinh_thuc?.message}
            validateStatus={errors.hinh_thuc ? 'error' : undefined}
          >
            <Controller
              name="hinh_thuc"
              control={control}
              rules={{required: true}}
              render={({field}) => (
                <Select
                  {...field}
                  placeholder="Chọn hình thức"
                  onChange={(value) => {
                    field.onChange(value);
                    resetTimeValue();
                  }}
                  status={errors.hinh_thuc ? 'error' : undefined}
                >
                  {selectedRequest.fields.hinh_thuc.map((type: string) => (
                    <Option key={type} value={type}>
                      {formatFieldName(type)}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>
        )}
      </>
    );
  };

  // Xác định kiểu hiển thị thời gian/ngày dựa trên loại yêu cầu
  const renderTimeFields = () => {
    if (selectedRequest?.code === 'CHAM_CONG') {
      if (!selectedTimekeeping?.timekeeping?.checkin && !selectedTimekeeping?.timekeeping?.checkout) {
        return;
      }
      return (
        <div className="grid grid-cols-3 gap-4">
          <Form.Item
            label="Ngày"
            required
            help={errors.date?.message?.toString()}
            validateStatus={errors.date ? 'error' : undefined}
          >
            <Controller
              name="date"
              control={control}
              rules={{required: true}}
              render={({field}) => (
                <DatePicker
                  {...field}
                  format="DD/MM/YYYY"
                  className="w-full"
                  onChange={field.onChange}
                  defaultValue={
                    selectedTimekeeping?.timekeeping?.work_date
                      ? dayjs(selectedTimekeeping.timekeeping.work_date)
                      : undefined
                  }
                  value={
                    selectedTimekeeping?.timekeeping?.work_date
                      ? dayjs(selectedTimekeeping.timekeeping.work_date)
                      : field.value
                  }
                  disabled={!!selectedTimekeeping?.timekeeping?.work_date}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Giờ check-in"
            required
            help={errors.start_time?.message?.toString()}
            validateStatus={errors.start_time ? 'error' : undefined}
          >
            <Controller
              name="start_time"
              control={control}
              rules={{required: true}}
              render={({field}) => (
                <TimePicker
                  className="w-full"
                  format="HH:mm"
                  onChange={field.onChange}
                  value={field.value ? dayjs(field.value) : null}
                  placeholder={
                    selectedTimekeeping?.timekeeping?.checkin
                      ? dayjs(selectedTimekeeping.timekeeping.checkin).format('HH:mm')
                      : 'Nhập giờ check-in'
                  }
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Giờ check-out"
            required
            help={errors.end_time?.message?.toString()}
            validateStatus={errors.end_time ? 'error' : undefined}
          >
            <Controller
              name="end_time"
              control={control}
              rules={{required: true}}
              render={({field}) => (
                <TimePicker
                  className="w-full"
                  format="HH:mm"
                  onChange={field.onChange}
                  value={field.value ? dayjs(field.value) : null}
                  placeholder={
                    selectedTimekeeping?.timekeeping?.checkout
                      ? dayjs(selectedTimekeeping.timekeeping.checkout).format('HH:mm')
                      : 'Nhập giờ check-out'
                  }
                />
              )}
            />
          </Form.Item>
        </div>
      );
    }

    if (
      selectedRequest?.code === 'CONG_TAC' ||
      (selectedRequest?.code === 'NGHI_PHEP' && watchHinhThuc === HINH_THUC_NGHI_PHEP.NHIEU_NGAY)
    ) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Từ ngày"
            required
            help={errors.from_date?.message?.toString()}
            validateStatus={errors.from_date ? 'error' : undefined}
          >
            <Controller
              name="from_date"
              control={control}
              rules={{required: true}}
              render={({field}) => (
                <DatePicker
                  {...field}
                  format="DD/MM/YYYY"
                  className="w-full"
                  onChange={field.onChange}
                  placeholder="Chọn ngày bắt đầu"
                />
              )}
            />
          </Form.Item>
          <Form.Item
            label="Đến ngày"
            required
            help={errors.to_date?.message?.toString()}
            validateStatus={errors.to_date ? 'error' : undefined}
          >
            <Controller
              name="to_date"
              control={control}
              rules={{required: true}}
              render={({field}) => (
                <DatePicker
                  {...field}
                  format="DD/MM/YYYY"
                  className="w-full"
                  onChange={field.onChange}
                  placeholder="Chọn ngày kết thúc"
                  disabledDate={(current) => {
                    // Không cho phép chọn ngày trước ngày bắt đầu
                    const fromDate = watch('from_date');
                    return fromDate ? current && current < dayjs(fromDate).startOf('day') : false;
                  }}
                />
              )}
            />
          </Form.Item>
        </div>
      );
    }

    if (selectedRequest?.code === 'NGHI_PHEP' && watchHinhThuc === HINH_THUC_NGHI_PHEP.MOT_NGAY) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Chọn ngày"
            required
            help={errors.date?.message?.toString()}
            validateStatus={errors.date ? 'error' : undefined}
          >
            <Controller
              name="date"
              control={control}
              rules={{required: true}}
              render={({field}) => (
                <DatePicker
                  {...field}
                  defaultValue={dayjs(selectedTimekeeping?.timekeeping.work_date)}
                  format="DD/MM/YYYY"
                  className="w-full"
                  onChange={field.onChange}
                  placeholder="Chọn ngày nghỉ phép"
                />
              )}
            />
          </Form.Item>
        </div>
      );
    }

    if (selectedRequest?.code === 'NGHI_VIEC') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Ngày có hiệu lực"
            required
            help={errors.from_date?.message?.toString()}
            validateStatus={errors.from_date ? 'error' : undefined}
          >
            <Controller
              name="date"
              control={control}
              rules={{required: true}}
              render={({field}) => (
                <DatePicker
                  {...field}
                  format="DD/MM/YYYY"
                  className="w-full"
                  onChange={field.onChange}
                  placeholder="Chọn ngày bắt đầu"
                />
              )}
            />
          </Form.Item>
        </div>
      );
    }

    return (
      <div className={`grid ${shouldShowEndTime() ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
        <Form.Item
          label="Ngày"
          required
          help={errors.date?.message?.toString()}
          validateStatus={errors.date ? 'error' : undefined}
        >
          <Controller
            name="date"
            control={control}
            render={({field}) => (
              <DatePicker
                {...field}
                format="DD/MM/YYYY"
                className="w-full"
                onChange={field.onChange}
                placeholder="Chọn ngày"
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label={getStartTimeLabel()}
          required={isStartTimeRequired()}
          help={errors.start_time?.message?.toString()}
          validateStatus={errors.start_time ? 'error' : undefined}
        >
          <Controller
            name="start_time"
            control={control}
            rules={isStartTimeRequired() ? {required: true} : {}}
            render={({field}) => (
              <TimePicker
                className="w-full"
                format="HH:mm"
                onChange={field.onChange}
                value={field.value ? dayjs(field.value, 'HH:mm') : null}
                placeholder="Chọn giờ bắt đầu"
              />
            )}
          />
        </Form.Item>
        {shouldShowEndTime() && (
          <Form.Item
            label="Giờ kết thúc"
            help={errors.end_time?.message?.toString()}
            validateStatus={errors.end_time ? 'error' : undefined}
          >
            <Controller
              name="end_time"
              control={control}
              render={({field}) => (
                <TimePicker
                  className="w-full"
                  format="HH:mm"
                  onChange={field.onChange}
                  value={field.value ? dayjs(field.value, 'HH:mm') : null}
                  placeholder="chọn giờ kết thúc"
                />
              )}
            />
          </Form.Item>
        )}
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div className="p-4">
        <Form onFinish={handleSubmit(onFinish)} autoComplete="off" layout="vertical">
          <Form.Item
            label="Loại yêu cầu"
            required
            help={errors.requestType?.message}
            validateStatus={errors.requestType ? 'error' : undefined}
          >
            <Controller
              name="requestType"
              control={control}
              render={({field}) => (
                <Select
                  {...field}
                  placeholder="Chọn loại yêu cầu"
                  onChange={(value) => {
                    field.onChange(value);
                    setValue('requestType', value);
                    resetTimeValue();
                  }}
                  options={dataRequests?.data.map((req) => ({label: req.name, value: req._id}))}
                />
              )}
            />
          </Form.Item>

          {renderRequestTypeFields()}

          <Form.Item
            label="Nhân viên"
            required
            help={errors.employeeId?.message}
            validateStatus={errors.employeeId ? 'error' : undefined}
            className="hidden"
          >
            <Controller
              name="employeeId"
              control={control}
              render={({field}) => (
                <Select
                  {...field}
                  placeholder="Chọn nhân viên"
                  options={[{value: selectedTimekeeping?.employeeId, label: selectedTimekeeping?.name}]}
                  onChange={field.onChange}
                />
              )}
            />
          </Form.Item>

          {renderTimeFields()}

          <Form.Item
            label="Lý do"
            required
            help={errors.reason?.message?.toString()}
            validateStatus={errors.reason ? 'error' : undefined}
          >
            <Controller
              name="reason"
              control={control}
              render={({field}) => <TextArea {...field} placeholder="Nhập lý do" rows={4} onChange={field.onChange} />}
            />
          </Form.Item>

          {/* DUYỆT */}
          <Form.Item
            label={
              <div
                className="flex items-center gap-1"
                onClick={(e) => {
                  e.preventDefault();
                  openOrgChart('approvers');
                }}
              >
                <span>Người duyệt yêu cầu</span>
                <ICSitemap className="ml-1 cursor-pointer size-6" />
              </div>
            }
            required
            help={errors.approvers?.message}
            validateStatus={errors.approvers ? 'error' : undefined}
          >
            <Controller
              name="approvers"
              control={control}
              render={({field}) => (
                <Select
                  {...field}
                  mode="multiple"
                  allowClear={false}
                  style={{width: '100%'}}
                  placeholder="Chọn người duyệt"
                  options={orderedEmployees.approvers.map((emp) => ({
                    label: emp.label,
                    value: emp.value,
                  }))}
                  value={watchApprovers?.map((item) => item.value) || []}
                  onChange={() => {}}
                  showSearch={false}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={
              <div
                className="flex items-center gap-1"
                onClick={(e) => {
                  e.preventDefault();
                  openOrgChart('referrers');
                }}
              >
                <span>Người tham chiếu</span>
                <ICSitemap className="ml-1 cursor-pointer size-6" />
              </div>
            }
            help={errors.referrers?.message}
            validateStatus={errors.referrers ? 'error' : undefined}
          >
            <Controller
              name="referrers"
              control={control}
              render={({field}) => (
                <Select
                  {...field}
                  mode="multiple"
                  allowClear={false}
                  style={{width: '100%'}}
                  placeholder="Chọn người tham chiếu"
                  options={orderedEmployees.referrers.map((emp) => ({
                    label: emp.label,
                    value: emp.value,
                  }))}
                  value={watchReferrers?.map((item) => item.value) || []}
                  onChange={() => {}}
                  showSearch={false}
                />
              )}
            />
          </Form.Item>
          <div className="flex justify-end gap-4">
            <Button onClick={toggleModal}>Huỷ bỏ</Button>
            <Button type="primary" htmlType="submit" loading={isPending} disabled={isPending}>
              Gửi yêu cầu
            </Button>
          </div>
        </Form>
      </div>
    );
  };

  const handleSave = (target: 'approvers' | 'referrers', employees: EmployeeItem[]) => {
    setValue(target, employees);
  };

  return (
    <FormProvider {...methods}>
      <ModalGlobal
        className="modal-create-request"
        isModalVisible={isModalVisible}
        handleOk={toggleModal}
        handleCancel={toggleModal}
        title="Tạo yêu cầu"
        content={renderContent()}
        width="800px"
        footer={null}
      />
      <OrgChartModal onSave={handleSave} />
    </FormProvider>
  );
};

export default ModalCreateRequest;
