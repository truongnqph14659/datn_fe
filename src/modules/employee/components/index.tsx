import ModalGlobal from '@/components/ModalGlobal';
import {QUERY_KEYS} from '@/shared/constants/query-key';
import {useCreateEmployee, useUpdateEmployee} from '@/shared/hooks/react-query-hooks/employee';
import {useQueryClient} from '@tanstack/react-query';
import {Button, Tabs} from 'antd';
import {AxiosError} from 'axios';
import {useRef, useState} from 'react';
import {toast} from 'react-toastify';
import PersonalInformation from './PersonalInformation';
import Contract from './Contract';
import {SyncOutlined} from '@ant-design/icons';
import {IEmployeeRes} from '@/shared/types/employee.type';
import WorkHistoryPDF from './MyPDF';
import {pdf} from '@react-pdf/renderer';
import {saveAs} from 'file-saver';
interface ModalEmployeeProps {
  isModalVisible: boolean;
  toggleModal: () => void;
  employee: IEmployeeRes | null;
  isUpdate?: boolean;
}

const ModalEmployee = ({isModalVisible, toggleModal, employee, isUpdate}: ModalEmployeeProps) => {
  const {mutateAsync: CreateEmployee} = useCreateEmployee();
  const {mutateAsync: UpdateEmployee} = useUpdateEmployee();
  const [isContractOpen, setIsContractOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const renderContent = () => {
    const refGetPersonalInfo = useRef<any>({});
    const refContract = useRef<any>({});

    const handleContractMounted = () => {
      setIsContractOpen(false);
    };

    const tabItems = [
      {
        key: '1',
        label: 'Thông tin cá nhân',
        children: <PersonalInformation employee={employee} ref={refGetPersonalInfo} isUpdate={isUpdate} />,
      },
      {
        key: '2',
        label: 'Hợp đồng',
        children: <Contract ref={refContract} employee={employee} onMounted={handleContractMounted} />,
      },
    ];

    const handleSubmit = async () => {
      try {
        await refGetPersonalInfo.current.validate();
        const data = await refGetPersonalInfo?.current?.getData();
        const {contract} = await refContract?.current?.getData();
        const formData = new FormData();
        if (!isUpdate) {
          const {sub_contract} = contract[0];
          formData.append('_id', data?._id);
          formData.append('name', data?.name);
          formData.append('email', data?.email);
          formData.append('roleId', data?.role_id);
          formData.append('deprId', data?.department);
          formData.append('break_time', data?.break_time);
          formData.append('time_working', data?.time_working);
          formData.append('id_no', data?.ID);
          formData.append('tax_no', data?.tax);
          formData.append('address', data?.address);
          formData.append('position_name', data?.position_name);
          formData.append('password', data?.password);
          formData.append('files', data?.files[0]?.originFileObj);
          formData.append('contract_type', contract[0]?.contract_type);
          formData.append('contract_note', contract[0]?.note);
          formData.append('contract_range_picker', contract[0]?.['range-picker']);
          formData.append('contract_files', contract[0]?.contract_files[0]?.originFileObj);
          formData.append('sub_contract_files', sub_contract[0]?.sub_contract_files[0]?.originFileObj);
          formData.append('sub_contract_sub_type', sub_contract[0]?.sub_contract_type);
          formData.append('sub_contract_note', sub_contract[0]?.sub_note);
        } else {
          formData.append('_id', data?._id);
          formData.append('name', data?.name);
          formData.append('email', data?.email);
          formData.append('roleId', data?.role_id);
          formData.append('deprId', data?.department);
          formData.append('break_time', data?.break_time);
          formData.append('time_working', data?.time_working);
          formData.append('id_no', data?.ID);
          formData.append('tax_no', data?.tax);
          formData.append('address', data?.address);
          formData.append('position_name', data?.position_name);
          formData.append('password', data?.password);
          if (data?.files) formData.append('files', data?.files[0]?.originFileObj);
          if (contract && contract[0]?.contract_type) {
            const {sub_contract} = contract[0];
            formData.append('contract_type', contract[0]?.contract_type);
            formData.append('contract_note', contract[0]?.note);
            formData.append('contract_range_picker', contract[0]?.['range-picker']);
            formData.append('contract_files', contract[0]?.contract_files[0]?.originFileObj);
            formData.append('sub_contract_files', sub_contract[0]?.sub_contract_files[0]?.originFileObj);
            formData.append('sub_contract_sub_type', sub_contract[0]?.sub_contract_type);
            formData.append('sub_contract_note', sub_contract[0]?.sub_note);
          }
        }
        setIsLoading(true);
        if (!isUpdate) {
          CreateEmployee(formData, {
            onSuccess: () => {
              setIsLoading(false);
              toggleModal();
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
        } else {
          UpdateEmployee(formData, {
            onSuccess: () => {
              setIsLoading(false);
              toggleModal();
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
        }
      } catch (error) {
        toast.error('Thiếu trường thông tin, Kiểm tra lại!');
      }
    };

    const exportPDF = async () => {
      const sortedData =
        employee?.contract
          ?.sort((a: any, b: any) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          })
          ?.map((contract: any) => {
            return {
              contract_type: contract?.contract_commond?.name,
              time: `Từ ${contract?.start_date} đến ${contract?.end_date}`,
              position: contract?.current_position,
              description: contract?.note,
            };
          }) || [];

      const data = {
        name: employee?.name,
        idNumber: employee?.id_no,
        address: employee?.address,
        company: employee?.department?.company.company_name,
        department: employee?.department.name_depart,
        position: employee?.position_name,
        workHistory: sortedData,
      };
      const blob = await pdf(<WorkHistoryPDF data={data} />).toBlob();
      saveAs(blob, `QTCT_${employee?.name}`);
    };

    console.log(employee);

    return (
      <>
        <Tabs defaultActiveKey="1" type="card" size="middle" style={{marginBottom: 32}} items={tabItems} />
        <div className="flex justify-end mt-4">
          {employee && employee?.contract.length > 0 && (
            <Button type="primary" onClick={() => exportPDF()} className="mr-2">
              Quá trình công tác
            </Button>
          )}
          <Button
            type="primary"
            onClick={() => handleSubmit()}
            disabled={isContractOpen}
            loading={isLoading ? {icon: <SyncOutlined spin />} : false}
          >
            Lưu
          </Button>
          <Button onClick={() => toggleModal()} className="ml-2">
            Hủy bỏ
          </Button>
        </div>
      </>
    );
  };

  return (
    <ModalGlobal
      isModalVisible={isModalVisible}
      handleOk={toggleModal}
      handleCancel={toggleModal}
      title={'Thay đổi thông tin nhân viên'}
      content={renderContent()}
      width="1200px"
      footer={null}
    />
  );
};

export default ModalEmployee;
