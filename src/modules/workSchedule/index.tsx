import ButtonGlobal from '@/components/ButtonGlobal';
import {ICEdit} from '@/components/Icon';
import {InputSearchGlobal} from '@/components/InputSearchGlobal';
import TableGlobal from '@/components/TableGlobal';
import {useExportExcelEmployeeWorkSchedule, useGetEmployees} from '@/shared/hooks/react-query-hooks/employee';
import useSearchParams, {paramsDefaultCommon} from '@/shared/hooks/useSearchParams';
import {IEmployeeRes} from '@/shared/types/employee.type';
import {Button, Card, Form, Select, Space, TableColumnsType, Upload, UploadProps} from 'antd';
import dayjs from 'dayjs';
import {useState} from 'react';
import ModalEmployeeWorkSchedule from './components';
import {DownloadOutlined, UploadOutlined} from '@ant-design/icons';
import {toast} from 'react-toastify';
import {saveAs} from 'file-saver';
import * as XLSX from 'xlsx';
import TableEmployeeSchedule from './components/TableEmployeeSchedule';
import {verifyDetailPermission} from '@/shared/utils';
import {ROUTE_PATH} from '@/shared/constants';
import {useGetDepartments} from '@/shared/hooks/react-query-hooks/department';
import {useGetRoles} from '@/shared/hooks/react-query-hooks/roles';

const MODAL_UPDATE_EMPLOYEE = 'modalUpdateEmployee';
const MODAL_UPDATE_TABLE = 'modalTableEmpSchedule';

const WorkScheduleManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState<string>('false');
  const [employee, setEmployee] = useState<IEmployeeRes | null>(null);
  const [dataUpload, setDataUpload] = useState<any>([]);
  const {params, handleChangePagination, handleSearch} = useSearchParams(paramsDefaultCommon);

  const filterOptions = {
    ...params,
  };

  const {refetch: exportExcel, isLoading: isExporting} = useExportExcelEmployeeWorkSchedule(filterOptions, {
    enabled: false,
  });

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

  const handleExport = async () => {
    try {
      const response = await exportExcel();
      if (response.data as Blob) {
        const fileName = `work_schedule_${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`;
        saveAs(new Blob([response.data]), fileName);
        toast.success('Xuất file excel thành công');
      }
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Có lỗi khi xuất file excel');
    }
  };

  const columns: TableColumnsType<IEmployeeRes> = [
    {
      key: 'STT',
      title: 'STT',
      dataIndex: 'STT',
      render: (_, __, index) => index + 1,
      align: 'center',
      width: 20,
    },
    {
      key: '_id',
      title: 'Mã nhân viên',
      dataIndex: '_id',
      align: 'center',
      width: 30,
    },
    {
      key: 'name',
      title: 'Họ tên',
      dataIndex: 'name',
      align: 'center',
      width: 100,
    },
    {
      key: 'department',
      title: 'Phòng ban',
      dataIndex: ['department', 'name_depart'],
      align: 'center',
      width: 30,
      render: (department) => department || '-',
    },
    {
      key: 'shiftStart',
      title: 'Thời gian bắt đầu',
      dataIndex: ['workScheduled', 'shiftStart'],
      align: 'center',
      width: 50,
      render: (start) => dayjs(start, 'HH:mm').format('HH:mm') || '-',
    },
    {
      key: 'shiftEnd',
      title: 'Thời gian kết thúc',
      dataIndex: ['workScheduled', 'shiftEnd'],
      align: 'center',
      width: 50,
      render: (end) => dayjs(end, 'HH:mm').format('HH:mm') || '-',
    },
    {
      key: 'break_time',
      title: 'Thời gian nghỉ (min)',
      dataIndex: ['workScheduled', 'break_time'],
      align: 'center',
      width: 50,
      render: (break_time) => break_time || 0,
    },
    {
      fixed: 'right',
      key: 'action',
      title: 'Thao tác',
      dataIndex: 'action',
      align: 'center',
      width: 30,
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

  const timeSerialToHHMM = (serial: number): string => {
    const totalMinutes = Math.round(1440 * serial);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const props: UploadProps = {
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryStr = e.target?.result;
        const workbook = XLSX.read(binaryStr, {type: 'binary'});
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        const rawData = data.slice(1);
        const formattedData = rawData.map((row: any) => ({
          employeeId: row['LỊCH LÀM VIỆC'],
          name: row['__EMPTY'],
          department: row['__EMPTY_1'],
          shiftStart: timeSerialToHHMM(row['__EMPTY_2']),
          shiftEnd: timeSerialToHHMM(row['__EMPTY_3']),
          breakTime: row['__EMPTY_4'],
        }));
        setIsModalVisible('modalTableEmpSchedule');
        setDataUpload(formattedData);
      };
      reader.readAsBinaryString(file);

      return false; // chặn upload tự động
    },
    showUploadList: false,
    accept: '.xlsx,.xls',
  };

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
      </Card>
      {verifyDetailPermission(ROUTE_PATH.EMP_SCHEDULE) && (
        <div className="flex justify-end my-5">
          <ButtonGlobal preIcon={<DownloadOutlined />} className="mx-2" onClick={handleExport}>
            Xuất file
          </ButtonGlobal>
          <Upload {...props}>
            <Button icon={<UploadOutlined />} className="py-[17px]">
              Tải thông tin
            </Button>
          </Upload>
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
      {employee && (
        <ModalEmployeeWorkSchedule
          isModalVisible={isModalVisible === MODAL_UPDATE_EMPLOYEE}
          toggleModal={() => {
            setIsModalVisible('');
            setEmployee(null);
          }}
          employee={employee}
        />
      )}
      {isModalVisible === MODAL_UPDATE_TABLE && (
        <TableEmployeeSchedule
          isModalVisible={isModalVisible === MODAL_UPDATE_TABLE}
          toggleModal={() => {
            setIsModalVisible('');
          }}
          dataUpload={dataUpload}
          dataEmpList={dataEmp}
        />
      )}
    </>
  );
};

export default WorkScheduleManagement;
