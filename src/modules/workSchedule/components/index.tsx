import ModalGlobal from '@/components/ModalGlobal';
import {QUERY_KEYS} from '@/shared/constants/query-key';
import {useUpdateEmployeeWorkSchedule} from '@/shared/hooks/react-query-hooks/employee';
import {useQueryClient} from '@tanstack/react-query';
import {Button, Form, InputNumber, Space, TimePicker} from 'antd';
import {AxiosError} from 'axios';
import {useState} from 'react';
import {toast} from 'react-toastify';
import {ClockCircleOutlined, SyncOutlined} from '@ant-design/icons';
import {IEmployeeRes} from '@/shared/types/employee.type';
import dayjs from 'dayjs';
import {verifyDetailPermission} from '@/shared/utils';
import {ROUTE_PATH} from '@/shared/constants';

interface ModalCreateEmployeeProps {
  isModalVisible: boolean;
  toggleModal: () => void;
  employee: IEmployeeRes | null;
}

const ModalEmployeeWorkSchedule = ({isModalVisible, toggleModal, employee}: ModalCreateEmployeeProps) => {
  const {mutateAsync: UpdateEmployeeWorkingTime} = useUpdateEmployeeWorkSchedule();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const initialValues = {
    break_time: employee?.workScheduled?.break_time,
    time_working: [
      dayjs(employee?.workScheduled?.shiftStart || '08:00', 'HH:mm'),
      dayjs(employee?.workScheduled?.shiftEnd || '17:00', 'HH:mm'),
    ],
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await form.validateFields();
      const formData: any = new FormData();
      const getData = await form.getFieldsValue();
      formData.append('workScheduleId', employee?.workScheduled._id);
      formData.append('employeeId', employee?._id ? employee?._id.toString() : '');
      formData.append('breakTime', getData?.break_time);
      formData.append('time_working', getData?.time_working);
      formData.append('type', 'personal_update');

      UpdateEmployeeWorkingTime(formData, {
        onSuccess: () => {
          setIsLoading(false);
          toggleModal();
          toast.success('Update thông tin thành công!');
          queryClient.invalidateQueries({queryKey: [QUERY_KEYS.GET_EMPLOYEES]});
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra!!');
            return;
          } else {
            toast.error('Có lỗi xảy ra');
          }
          setIsLoading(false);
        },
      });
    } catch (error) {
      toast.error('Có lỗi xảy ra');
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    return (
      <>
        <h1 className="my-2">{employee?.name}</h1>
        <Form form={form} name="customized_form_controls" layout="inline" initialValues={initialValues}>
          <Space wrap>
            <Form.Item name="time_working" rules={[{required: true, message: 'Không để trống mục này!'}]}>
              <TimePicker.RangePicker
                style={{width: '100%'}}
                prefix={<ClockCircleOutlined />}
                placeholder={['Bắt đầu', 'Kết thúc']}
                format={'HH:mm'}
              />
            </Form.Item>
            <Form.Item
              label="Thời gian nghỉ (min)"
              name="break_time"
              rules={[{required: true, message: 'Không để thời gian nghỉ'}]}
            >
              <InputNumber prefix={<ClockCircleOutlined />} min={0} max={60} />
            </Form.Item>
          </Space>
        </Form>
        <Form.Item>
          <div className="flex justify-end mt-4">
            {verifyDetailPermission(ROUTE_PATH.EMP_SCHEDULE) && (
              <Button
                type="primary"
                onClick={() => handleSubmit()}
                loading={isLoading ? {icon: <SyncOutlined spin />} : false}
              >
                Lưu
              </Button>
            )}
            <Button onClick={() => toggleModal()} className="ml-2">
              Hủy bỏ
            </Button>
          </div>
        </Form.Item>
      </>
    );
  };

  return (
    <ModalGlobal
      isModalVisible={isModalVisible}
      handleOk={toggleModal}
      handleCancel={toggleModal}
      title={'Cập nhật thời gian làm việc'}
      content={renderContent()}
      width="800px"
      footer={null}
    />
  );
};

export default ModalEmployeeWorkSchedule;
