import ModalGlobal from '@/components/ModalGlobal';
import TableGlobal from '@/components/TableGlobal';
import DetailRequestModalContent from '@/modules/request-approval/components/DetailRequestModalContent';

import {HINH_THUC_NGHI_PHEP, LOAI_DMVS, LOAI_NGHI_PHEP, REQUEST_CODE} from '@/shared/constants';
import {QUERY_KEYS} from '@/shared/constants/query-key';
import {useApproveRequest, useGetPendingApprovals} from '@/shared/hooks/react-query-hooks/request-approval';
import {
  useCancelRequestEmployee,
  useGetPendingRequestsByUser,
  useGetRequestEmployeeById,
  useRejectRequestEmployee,
} from '@/shared/hooks/react-query-hooks/request-employee';
import useSearchParams, {paramsDefaultCommon} from '@/shared/hooks/useSearchParams';
import {IGetPendingApprovalsRes} from '@/shared/types/request-approval.type';
import {IGetPendingRequestsByUserRes} from '@/shared/types/request_employee.type';
import {useAuthStore} from '@/store/authStore';
import {useQueryClient} from '@tanstack/react-query';
import {Button, TableColumnsType, Tag} from 'antd';
import {AxiosError} from 'axios';
import {useEffect, useMemo, useState} from 'react';
import {toast} from 'react-toastify';
import Swal from 'sweetalert2';

export interface TablePendingRequestApprovalProps {
  type: 'user_create' | 'user_approval';
}

export default function TablePendingRequestApproval({type}: TablePendingRequestApprovalProps) {
  const auth = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dataSelected, setDataSelected] = useState<IGetPendingRequestsByUserRes | null>(null);
  const [selectedRequestEmployeeId, setSelectedRequestEmployeeId] = useState<number | null>(null);
  const [currentApprover, setCurrentApprover] = useState<{
    approverId: number;
    requestEmployeeId: number;
  } | null>(null);

  const {params, handleChangePagination} = useSearchParams(paramsDefaultCommon);

  const {mutate: ApproveRequestMutation, isPending: isPendingApprove} = useApproveRequest();
  const {mutate: CancelRequestMutation, isPending: isPendingCancel} = useCancelRequestEmployee();
  const {mutate: RejectRequestMutation, isPending: isPendingReject} = useRejectRequestEmployee();
  const {
    data: dataPendingApprovals,
    refetch,
    isFetching: isFetchingPendingApprovals,
  } = useGetPendingApprovals({employeeId: auth?._id, type});

  const {data: dataPendingRequests, isFetching: isFetchingPendingRequests} = useGetPendingRequestsByUser(params, {
    enabled: type === 'user_create',
  });

  // Lấy chi tiết của request employee
  const {
    data: requestDetailData,
    isLoading: isLoadingRequestDetail,
    refetch: refetchGetRequestEmployeeById,
  } = useGetRequestEmployeeById(selectedRequestEmployeeId || 0, {enabled: !!selectedRequestEmployeeId});

  useEffect(() => {
    if (requestDetailData) {
      if (requestDetailData.data) {
        setDataSelected(requestDetailData.data);
        setIsModalVisible(true);
      }
      setSelectedRequestEmployeeId(null);
    }
  }, [requestDetailData]);

  const handleApprove = () => {
    if (!currentApprover || !auth) return;
    Swal.fire({
      title: `Bạn có chắc chắn muốn duyệt yêu cầu này không?`,
      // icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        ApproveRequestMutation(
          {
            approverId: currentApprover.approverId,
            employeeId: auth._id,
            requestEmployeeId: currentApprover.requestEmployeeId,
          },
          {
            onSuccess: () => {
              refetch();
              setIsModalVisible(false);
            },
            onError: () => toast.error('Duyệt yêu cầu thất bại'),
          },
        );
      }
    });
  };

  const handleCancelRequest = (cancellerType: 'creator' | 'approver') => {
    if (!dataSelected || !auth) return;

    const title =
      cancellerType === 'creator'
        ? 'Bạn có chắc chắn muốn hủy yêu cầu này không?'
        : 'Bạn có chắc chắn muốn từ chối yêu cầu này không?';
    Swal.fire({
      title,
      ...(cancellerType === 'creator'
        ? {}
        : {
            input: 'text',
            inputPlaceholder: 'Lý do từ chối ...',
            preConfirm: (value) => {
              if (!value) {
                Swal.showValidationMessage('Vui lòng nhập lý do từ chối');
                return false;
              }
              return value;
            },
          }),
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Đóng',
    }).then((result) => {
      if (result.isConfirmed) {
        if (cancellerType === 'creator') {
          // Người tạo hủy đơn
          CancelRequestMutation(
            {requestEmpId: dataSelected.rqe_id, employeeId: auth._id},
            {
              onSuccess: () => {
                refetchGetRequestEmployeeById();
                queryClient.invalidateQueries([QUERY_KEYS.GET_PENDING_APPOVALS] as any);
                toast.success('Hủy yêu cầu thành công');
                setIsModalVisible(false);
              },
              onError: (error) => {
                if (error && error instanceof AxiosError) {
                  toast.error(error?.response?.data?.message || 'Hủy yêu cầu thất bại!');
                  return;
                }
                toast.error('Hủy yêu cầu thất bại');
              },
            },
          );
        } else {
          RejectRequestMutation(
            {
              employeeId: auth._id,
              requestEmpId: currentApprover?.requestEmployeeId || 0,
              appover_feaback: result?.value,
            },
            {
              onSuccess: () => {
                refetchGetRequestEmployeeById();
                queryClient.invalidateQueries([QUERY_KEYS.GET_PENDING_APPOVALS] as any);
                toast.success('Từ chối yêu cầu thành công');
                setIsModalVisible(false);
              },
              onError: () => toast.error('Từ chối yêu cầu thất bại'),
            },
          );
        }
      }
    });
  };

  const columnsPendingRequests = useMemo<TableColumnsType<IGetPendingRequestsByUserRes>>(
    () => [
      {
        title: 'Loại yêu cầu',
        dataIndex: ['request', 'name'],
        key: 'request_type',
        align: 'center',
      },
      {
        title: 'Người yêu cầu',
        dataIndex: 'requester',
        key: 'requester',
        align: 'center',
        render: (_, record) => (record?.rqe_employee_id === auth?._id ? auth?.name : '-'),
      },
      {
        title: 'Thông tin yêu cầu',
        dataIndex: 'fields',
        key: 'fields',
        align: 'center',
        render: (_, record) => <RequestInfoRenderer record={record} requestType="pendingRequests" />,
      },
      {
        title: 'Lý do',
        dataIndex: 'reason',
        key: 'reason',
        align: 'center',
        render: (_, record) => (
          <div className="max-w-[200px] truncate" title={record.fields?.reason}>
            {record.fields?.reason || '-'}
          </div>
        ),
      },
      {
        title: 'Trạng thái duyệt',
        dataIndex: 'rqe_final_status_aproval',
        key: 'rqe_final_status_aproval',
        align: 'center',
        render: (_, record) => (
          <Tag color={record?.rqe_final_status_aproval ? 'magenta' : 'red'}>
            {record?.rqe_final_status_aproval ? 'Đã duyệt' : 'Chờ duyệt'}
          </Tag>
        ),
      },
      {
        title: 'Ngày tạo yêu cầu',
        dataIndex: 'created_request',
        key: 'created_request',
        align: 'center',
        render: (_, record) => record.fields?.created_request || '-',
      },
    ],
    [auth],
  );

  const columnsPendingApprovals = useMemo<TableColumnsType<IGetPendingApprovalsRes>>(
    () => [
      {
        title: 'Loại yêu cầu',
        dataIndex: 'request_type',
        key: 'request_type',
        align: 'center',
      },
      {
        title: 'Người yêu cầu',
        dataIndex: 'requester',
        key: 'requester',
        align: 'center',
      },
      {
        title: 'Thông tin yêu cầu',
        dataIndex: 'fields',
        key: 'fields',
        align: 'center',
        render: (_, record) => <RequestInfoRenderer record={record} requestType="pendingApprovals" />,
      },
      {
        title: 'Lý do',
        dataIndex: 'reason',
        key: 'reason',
        align: 'center',
        render: (_, record) => (
          <div className="max-w-[200px] truncate" title={record.fields?.reason}>
            {record.fields?.reason || '-'}
          </div>
        ),
      },
      {
        title: 'Trạng thái duyệt',
        dataIndex: 'statusApproval_id',
        key: 'statusApproval_id',
        align: 'center',
        render: (_, record) => (
          <Tag color={record.status_approval === null ? 'red' : 'green'}>
            {record.status_approval === null ? 'Chờ duyệt' : 'Đã duyệt'}
          </Tag>
        ),
      },
      {
        title: 'Ngày tạo yêu cầu',
        dataIndex: 'created_request',
        key: 'created_request',
        align: 'center',
        render: (_, record) => record.fields?.created_request || '-',
      },
    ],
    [],
  );

  const isLoading = isFetchingPendingApprovals || isFetchingPendingRequests || isLoadingRequestDetail;

  const renderModalFooter = () => {
    // Xác định người đăng nhập có phải là người tạo đơn không
    const isCreator = dataSelected?.rqe_employee_id === auth?._id;
    // Xác định người đăng nhập có phải là người duyệt không
    const isApprover = !!dataSelected?.approvers?.find(
      (approver) => approver.employee_id === auth?._id && approver.status_approval_id === null,
    );
    return (
      <div className="flex justify-end">
        <Button onClick={() => setIsModalVisible(false)} className="mr-2">
          Đóng
        </Button>
        {/* Nút Hủy yêu cầu - hiển thị cho cả người tạo đơn và người duyệt */}
        {(isCreator || (type === 'user_approval' && isApprover)) && (
          <Button
            danger
            onClick={() => handleCancelRequest(isCreator ? 'creator' : 'approver')}
            className="mr-2"
            loading={isPendingCancel || isPendingReject}
            disabled={isPendingCancel || isPendingReject}
          >
            {isCreator ? 'Hủy yêu cầu của tôi' : 'Từ chối yêu cầu'}
          </Button>
        )}
        {/* Nút Duyệt yêu cầu - chỉ hiển thị cho người duyệt */}
        {type === 'user_approval' && isApprover && (
          <Button type="primary" onClick={handleApprove} loading={isPendingApprove} disabled={isPendingApprove}>
            Duyệt yêu cầu
          </Button>
        )}
      </div>
    );
  };

  return (
    <div>
      {type === 'user_approval' ? (
        <TableGlobal
          dataSource={
            dataPendingApprovals?.data.map((item, index) => {
              return {...item, key: index};
            }) || []
          }
          columns={columnsPendingApprovals}
          pagination={false}
          loading={isLoading}
          onRow={(record) => ({
            onClick: () => {
              setSelectedRequestEmployeeId(record.request_employee_id);
              setCurrentApprover({
                approverId: record.approval_id,
                requestEmployeeId: record.request_employee_id,
              });
            },
            className: 'cursor-pointer hover:bg-gray-100',
          })}
        />
      ) : (
        <>
          <TableGlobal
            dataSource={
              dataPendingRequests?.data.map((item, index) => {
                return {...item, key: index};
              }) || []
            }
            columns={columnsPendingRequests}
            pagination={{
              pageSize: dataPendingRequests?.meta?.limit,
              total: dataPendingRequests?.meta?.totalItems,
              current: dataPendingRequests?.meta?.page,
              showTotal: (total) => `Tổng ${total} yêu cầu`,
            }}
            onChange={handleChangePagination}
            loading={isLoading}
            onRow={(record) => ({
              onClick: () => {
                setDataSelected(record);
                setIsModalVisible(true);
              },
              className: 'cursor-pointer hover:bg-gray-100',
            })}
          />
        </>
      )}

      {/* Modal hiển thị chi tiết (dùng chung cho cả 2 loại table) */}
      {isModalVisible && (
        <ModalGlobal
          content={<DetailRequestModalContent data={dataSelected} />}
          isModalVisible={isModalVisible}
          title={null}
          footer={renderModalFooter()}
          handleCancel={() => setIsModalVisible(false)}
          handleOk={() => setIsModalVisible(false)}
          width="800"
          subtractHeight={dataSelected?.fields?.reason.length > 100 ? 200 : undefined}
          maskClosable={true}
          destroyOnClose
        />
      )}
    </div>
  );
}

export const RequestInfoRenderer = ({
  record,
  requestType,
}: {
  record: any;
  requestType: 'pendingRequests' | 'pendingApprovals';
}) => {
  const fields = record.fields;
  const code = requestType === 'pendingRequests' ? record?.request?.code : record?.request_code;

  if (code === REQUEST_CODE.DI_MUON_VE_SOM) {
    return (
      <>
        <p>Hình thức: Đi muộn về sớm</p>
        <p>Ngày: {fields?.date}</p>
        <p>Thời gian: {fields?.start_time}</p>
        <p>Loại: {fields?.loai_nghi === LOAI_DMVS.DI_MUON ? 'Đi muộn' : 'Về sớm'}</p>
      </>
    );
  }

  if (code === REQUEST_CODE.NGHI_PHEP) {
    if (fields?.hinh_thuc === HINH_THUC_NGHI_PHEP.NHIEU_NGAY) {
      return (
        <>
          <p>Hình thức: Nhiều ngày</p>
          <p>Ngày bắt đầu: {fields?.from_date}</p>
          <p>Ngày kết thúc: {fields?.to_date}</p>
          <p>Loại: {fields?.loai_nghi === LOAI_NGHI_PHEP.CO_LUONG ? 'Có lương' : 'Không lương'}</p>
        </>
      );
    }
    return (
      <>
        <p>
          Hình thức:{' '}
          {fields?.hinh_thuc === HINH_THUC_NGHI_PHEP.MOT_NGAY
            ? 'Một ngày'
            : fields?.hinh_thuc === HINH_THUC_NGHI_PHEP.BUOI_SANG
              ? 'Buổi sáng'
              : 'Buổi chiều'}
        </p>
        <p>Ngày: {fields?.date}</p>
        <p>Loại: {fields?.loai_nghi === LOAI_NGHI_PHEP.CO_LUONG ? 'Có lương' : 'Không lương'}</p>
      </>
    );
  }

  if (code === REQUEST_CODE.DI_CONG_TAC) {
    return (
      <>
        <p>Hình thức: Đi công tác</p>
        <p>Ngày bắt đầu: {fields?.from_date}</p>
        <p>Ngày kết thúc: {fields?.to_date}</p>
      </>
    );
  }

  return (
    <>
      <p>
        Hình thức:{' '}
        {code === REQUEST_CODE.DANG_KY_LAM_CONG
          ? 'Đăng ký làm công'
          : code === REQUEST_CODE.DANG_KY_LAM_NO_LUC
            ? 'Đăng ký làm nỗ lực'
            : code === REQUEST_CODE.NGHI_PHEP
              ? 'Nghỉ phép'
              : 'Không xác định'}
      </p>
      <p>Ngày: {fields?.date}</p>
      {fields?.start_time && (
        <p>
          Thời gian: {fields?.start_time} {fields?.end_time && ` - ${fields?.end_time}`}
        </p>
      )}
    </>
  );
};
