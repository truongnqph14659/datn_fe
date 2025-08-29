import ButtonGlobal from '@/components/ButtonGlobal';
import {ICAdd, ICEdit} from '@/components/Icon';
import TableGlobal from '@/components/TableGlobal';
import ModalEmployee from '@/modules/employee/components';
import {ROUTE_PATH} from '@/shared/constants';
import {useGetDepartments} from '@/shared/hooks/react-query-hooks/department';
import {useGetEmployees} from '@/shared/hooks/react-query-hooks/employee';
import {useGetRoles} from '@/shared/hooks/react-query-hooks/roles';
import useSearchParams, {paramsDefaultCommon} from '@/shared/hooks/useSearchParams';
import {IEmployeeRes} from '@/shared/types/employee.type';
import {verifyDetailPermission} from '@/shared/utils';
import {Button, Card, Form, Select, Space, TableColumnsType, Image} from 'antd';
import {useState} from 'react';

const MODAL_CREATE_EMPLOYEE = 'modalCreateEmployee';
const MODAL_UPDATE_EMPLOYEE = 'modalUpdateEmployee';

const EmployeeManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState<string>('false');
  const [employee, setEmployee] = useState<IEmployeeRes | null>(null);
  const {params, handleChangePagination, handleSearch} = useSearchParams(paramsDefaultCommon);
  const filterOptions = {
    ...params,
  };
  const {data: departmentsData} = useGetDepartments({disablePagination: true});
  const {data: dataRole} = useGetRoles({});
  const {data: dataEmp, isFetching} = useGetEmployees(filterOptions);

  const dataDepartmentHandler = [
    {
      value: '',
      label: 'TÂT CẢ PHÒNG BAN',
    },
    ...(departmentsData?.data.map((depart) => ({
      value: depart._id,
      label: depart.name_depart,
    })) || []),
  ];

  const dataRoleHandler = [
    {
      value: '',
      label: 'TÂT CẢ VAI TRÒ',
    },
    ...(dataRole?.data.map((role) => ({
      value: role._id,
      label: role.name,
    })) || []),
  ];

  const dataEmployeeHandler = [
    {
      value: '',
      label: 'TÂT CẢ NHÂN VIÊN',
    },
    ...(dataEmp?.data.map((emp) => ({
      value: emp._id,
      label: emp.name,
    })) || []),
  ];

  const columns: TableColumnsType<IEmployeeRes> = [
    {
      key: 'STT',
      title: 'STT',
      dataIndex: 'STT',
      render: (_, __, index) => index + 1,
      align: 'center',
      width: 50,
    },
    {
      key: 'img',
      title: 'Ảnh',
      dataIndex: 'img',
      align: 'center',
      width: 100,
      render: (_, record) => {
        return (
          <>
            <Image
              width={50}
              height={50}
              style={{borderRadius: 5, objectFit: 'cover'}}
              src={record?.images[0]?.image}
              fallback="data:image/png;base64,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"
            />
          </>
        );
      },
    },
    {
      key: 'name',
      title: 'Họ tên',
      dataIndex: 'name',
      align: 'center',
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      align: 'center',
    },
    {
      key: 'company_name',
      title: 'Công ty',
      dataIndex: ['department', 'company', 'company_name'],
      align: 'center',
      render: (company) => company || '-',
    },
    {
      key: 'department',
      title: 'Phòng ban',
      dataIndex: ['department', 'name_depart'],
      align: 'center',
      render: (department) => department || '-',
    },
    {
      key: 'position_name',
      title: 'Vai trò',
      dataIndex: 'position_name',
      align: 'center',
    },
    {
      fixed: 'right',
      key: 'action',
      title: 'Thao tác',
      dataIndex: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size={'small'}>
          <ButtonGlobal
            preIcon={<ICEdit />}
            className="bg-gray-100"
            onClick={() => {
              setIsModalVisible(MODAL_UPDATE_EMPLOYEE);
              setEmployee(record);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <Form
          name="basic"
          layout="inline"
          onFinish={(valuesForm) => {
            handleSearch(valuesForm);
          }}
          autoComplete="off"
          style={{marginRight: 16}}
        >
          <Form.Item label="Phòng ban" name="department" style={{padding: 5}}>
            <Select
              allowClear
              showSearch
              style={{width: 200}}
              options={dataDepartmentHandler}
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>

          <Form.Item label="Vai trò" name="role_id" style={{padding: 5}}>
            <Select
              allowClear
              showSearch
              style={{width: 200}}
              options={dataRoleHandler}
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item label="Nhân Viên" name="employee_id" style={{padding: 5}}>
            <Select
              allowClear
              showSearch
              style={{width: 200}}
              options={dataEmployeeHandler}
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>

          <Form.Item label={null} style={{padding: 5}}>
            <Button type="primary" htmlType="submit">
              Tìm kiếm
            </Button>
          </Form.Item>
        </Form>
        {/* <InputSearchGlobal placeholder="Tìm kiếm theo họ tên, email" onSearch={handleSearch} className="w-[300px]" /> */}
      </Card>
      {verifyDetailPermission(ROUTE_PATH.EMP_INFO) && (
        <div className="flex justify-end my-5">
          <ButtonGlobal preIcon={<ICAdd className="mr-1" />} onClick={() => setIsModalVisible(MODAL_CREATE_EMPLOYEE)}>
            Thêm nhân viên
          </ButtonGlobal>
        </div>
      )}
      <Card>
        <TableGlobal
          dataSource={dataEmp?.data}
          columns={columns}
          pagination={{
            pageSize: dataEmp?.meta.limit,
            total: dataEmp?.meta.totalItems,
            current: dataEmp?.meta.page,
            showTotal: (total) => <span className="font-medium">Tổng {total} bản ghi</span>,
          }}
          onChange={handleChangePagination}
          scroll={{x: 1500}}
          loading={isFetching}
        />
      </Card>

      {isModalVisible === MODAL_CREATE_EMPLOYEE && (
        <ModalEmployee
          isModalVisible={isModalVisible === MODAL_CREATE_EMPLOYEE}
          toggleModal={() => setIsModalVisible('')}
          employee={null}
          isUpdate={false}
        />
      )}

      {employee && isModalVisible === MODAL_UPDATE_EMPLOYEE && (
        <ModalEmployee
          isModalVisible={isModalVisible === MODAL_UPDATE_EMPLOYEE}
          toggleModal={() => {
            setIsModalVisible('');
            setEmployee(null);
          }}
          employee={employee}
          isUpdate={true}
        />
      )}
    </>
  );
};

export default EmployeeManagement;
