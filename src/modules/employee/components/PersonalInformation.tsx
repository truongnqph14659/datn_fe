import {forwardRef, useImperativeHandle} from 'react';
import {Form, Input, InputNumber, Select, TimePicker, Space} from 'antd';
import {
  ClockCircleOutlined,
  FieldNumberOutlined,
  InboxOutlined,
  InfoOutlined,
  LockOutlined,
  MailOutlined,
  SmileOutlined,
  UserOutlined,
} from '@ant-design/icons';
import Dragger from 'antd/es/upload/Dragger';
import dayjs from 'dayjs';
import {IEmployeeRes} from '@/shared/types/employee.type';
import {useGetRoles} from '@/shared/hooks/react-query-hooks/roles';
import {useGetDepartments} from '@/shared/hooks/react-query-hooks/department';
import {useAuthStore} from '@/store/authStore';

interface Employee {
  employee: IEmployeeRes | null;
  isUpdate?: boolean;
}

const PersonalInformation = forwardRef(({employee, isUpdate}: Employee, ref) => {
  const user = useAuthStore((s) => s.user);
  const [form] = Form.useForm();
  const {data: roleList} = useGetRoles({});
  const {data: departList} = useGetDepartments({});
  const optionRolesLits = roleList?.data.map((role) => {
    return {
      value: role._id,
      label: role.name,
    };
  });
  const optionDepartLits = departList?.data.map((depart) => {
    return {
      value: depart._id,
      label: depart.name_depart,
    };
  });

  useImperativeHandle(ref, () => ({
    validate: () => form.validateFields(),
    getData: () => form.getFieldsValue(),
  }));

  const handleBeforeUpload = (file: File) => {
    form.setFieldsValue({image: file});
    return false;
  };

  const initialValues = {
    break_time: employee?.workScheduled ? employee.workScheduled.break_time : 60,
    time_working: [dayjs('08:00', 'HH:mm'), dayjs('17:00', 'HH:mm')],
    address: employee?.address,
    ID: employee?.id_no,
    tax: employee?.tax_no,
    department: employee?.department._id,
    role_id: employee?.roleId,
    email: employee?.email,
    name: employee?.name,
    position_name: employee?.position_name,
    _id: employee?._id,
  };

  return (
    <>
      <Form form={form} layout="vertical" className="w-full" initialValues={initialValues}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Form.Item className="hidden" name="_id">
              <Input />
            </Form.Item>
            <Form.Item label="Họ và tên" name="name" rules={[{required: true, message: 'Please enter name'}]}>
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập họ tên"
                disabled={user?.roles.name !== 'Admin' ? true : false}
              />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[{required: true, type: 'email', message: 'Please enter email'}]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập email"
                disabled={user?.roles.name !== 'Admin' ? true : false}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{required: isUpdate ? false : true, message: 'Please enter Password'}]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item label="Địa chỉ" name="address" rules={[{required: true, message: 'Please enter address'}]}>
              <Input
                prefix={<InfoOutlined />}
                placeholder="Nhập địa chỉ"
                disabled={user?.roles.name !== 'Admin' ? true : false}
              />
            </Form.Item>

            <Form.Item
              label="Căn cước công dân"
              name="ID"
              rules={[
                {required: true, message: 'Please enter ID'},
                {pattern: /^[0-9]+$/, message: 'Mã số thuế chỉ được chứa số'},
              ]}
            >
              <Input
                placeholder="Nhập số CCCD"
                prefix={<FieldNumberOutlined disabled={user?.roles.name !== 'Admin' ? true : false} />}
              />
            </Form.Item>

            <Form.Item
              label="Mã số thuế cá nhân"
              name="tax"
              rules={[{pattern: /^[0-9]+$/, message: 'Mã số thuế chỉ được chứa số'}]}
            >
              <Input
                prefix={<FieldNumberOutlined />}
                placeholder="Nhập mã số thuế"
                disabled={user?.roles.name !== 'Admin' ? true : false}
              />
            </Form.Item>

            <Form.Item label="Vị trí công tác" name="position_name">
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập tên vị trí công tác"
                disabled={user?.roles.name !== 'Admin' ? true : false}
              />
            </Form.Item>
          </div>
          <div>
            <Space wrap>
              <Form.Item
                label="Thời gian làm việc"
                name="time_working"
                rules={[{required: true, message: 'Không để trống mục này!'}]}
              >
                <TimePicker.RangePicker
                  style={{width: '100%'}}
                  prefix={<SmileOutlined />}
                  placeholder={['Bắt đầu', 'Kết thúc']}
                  format={'HH:mm'}
                  disabled={user?.roles.name !== 'Admin' ? true : false}
                />
              </Form.Item>
              <Form.Item
                label="Thời gian nghỉ (min)"
                name="break_time"
                rules={[{required: true, message: 'Không để thời gian nghỉ'}]}
              >
                <InputNumber
                  prefix={<ClockCircleOutlined />}
                  min={0}
                  max={60}
                  disabled={user?.roles.name !== 'Admin' ? true : false}
                />
              </Form.Item>
            </Space>
            <Form.Item
              label="Phòng ban"
              rules={[{required: true, message: 'Vui lòng chọn phòng ban'}]}
              name="department"
            >
              <Select
                showSearch
                style={{width: '100%'}}
                placeholder="Search to Select"
                optionFilterProp="label"
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                }
                options={optionDepartLits}
                disabled={user?.roles.name !== 'Admin' ? true : false}
              />
            </Form.Item>
            <Form.Item label="Vai trò" rules={[{required: true, message: 'Vui lòng chọn vai trò'}]} name="role_id">
              <Select
                showSearch
                style={{width: '100%'}}
                placeholder="Search to Select"
                optionFilterProp="label"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={optionRolesLits}
                disabled={user?.roles.name !== 'Admin' ? true : false}
              />
            </Form.Item>
            <Form.Item
              label="Ảnh"
              rules={[{required: isUpdate ? false : true, message: 'Vui lòng chọn Avartar'}]}
              name="files"
              valuePropName="files"
              getValueFromEvent={(e) => e && e.fileList}
            >
              <Dragger
                multiple={false}
                beforeUpload={handleBeforeUpload}
                maxCount={1}
                name="files"
                onRemove={() => {
                  form.setFieldsValue({image: null});
                  form.validateFields(['files']);
                }}
                disabled={user?.roles.name !== 'Admin' ? true : false}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file để upload</p>
              </Dragger>
            </Form.Item>
          </div>
        </div>
      </Form>
    </>
  );
});

export default PersonalInformation;
