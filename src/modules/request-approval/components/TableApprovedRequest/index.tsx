import ModalGlobal from '@/components/ModalGlobal';
import TableGlobal from '@/components/TableGlobal';
import DetailRequestModalContent from '@/modules/request-approval/components/DetailRequestModalContent';
import {RequestInfoRenderer} from '@/modules/request-approval/components/TablePendingRequestApproval';
import {useGetApprovedRequests} from '@/shared/hooks/react-query-hooks/request-approval';
import {
  useGetApprovedRequestsByUser,
  useGetRequestEmployeeById,
} from '@/shared/hooks/react-query-hooks/request-employee';
import useSearchParams, {paramsDefaultCommon} from '@/shared/hooks/useSearchParams';
import {IGetPendingApprovalsRes} from '@/shared/types/request-approval.type';
import {IGetPendingRequestsByUserRes} from '@/shared/types/request_employee.type';
import {useAuthStore} from '@/store/authStore';
import {Button, TableColumnsType, Tag} from 'antd';
import {useEffect, useMemo, useState} from 'react';

export interface TableApprovedRequestProps {
  type: 'user_create' | 'user_approval';
}

export default function TableApprovedRequest({type}: TableApprovedRequestProps) {
  const auth = useAuthStore((s) => s.user);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dataSelected, setDataSelected] = useState<IGetPendingRequestsByUserRes | null>(null);
  const [selectedRequestEmployeeId, setSelectedRequestEmployeeId] = useState<number | null>(null);

  const {params, handleChangePagination} = useSearchParams(paramsDefaultCommon);

  const {data, isFetching} = useGetApprovedRequests(params, {
    enabled: type === 'user_approval',
  });

  const {data: dataApprovedRequest, isFetching: isFetchingApprovedRequests} = useGetApprovedRequestsByUser(params, {
    enabled: type === 'user_create',
  });

  const {data: requestDetailData, isLoading: isLoadingRequestDetail} = useGetRequestEmployeeById(
    selectedRequestEmployeeId || 0,
    {enabled: !!selectedRequestEmployeeId},
  );

  useEffect(() => {
    if (requestDetailData) {
      if (requestDetailData.data) {
        setDataSelected(requestDetailData.data);
        setIsModalVisible(true);
      }
      setSelectedRequestEmployeeId(null);
    }
  }, [requestDetailData]);

  const columns: TableColumnsType<IGetPendingApprovalsRes> = [
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
      render: (_, record) => {
        return <RequestInfoRenderer record={record} requestType="pendingApprovals" />;
      },
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
      render: (_, record) => {
        return record.status_approval === null || record.status_approval === 0 ? (
          <Tag color="red">Chờ duyệt</Tag>
        ) : (
          <Tag color="green">Đã duyệt</Tag>
        );
      },
    },
    {
      title: 'Ngày tạo yêu cầu',
      dataIndex: 'created_request',
      key: 'created_request',
      align: 'center',
      render: (_, record) => <span>{record.fields?.created_request || '-'}</span>,
    },
  ];

  const columnsApprovedRequests = useMemo<TableColumnsType<IGetPendingRequestsByUserRes>>(
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
            {record?.rqe_final_status_aproval ? 'Đã duyệt' : 'Bị từ chối'}
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

  const isLoading = isFetching || isFetchingApprovedRequests || isLoadingRequestDetail;

  const renderModalFooter = () => (
    <div className="flex justify-end">
      <Button onClick={() => setIsModalVisible(false)}>Đóng</Button>
    </div>
  );

  return (
    <>
      {type === 'user_approval' ? (
        <TableGlobal
          dataSource={
            data?.data.map((item, index) => {
              return {...item, key: index};
            }) || []
          }
          columns={columns}
          pagination={{
            pageSize: data?.meta?.limit,
            total: data?.meta?.totalItems,
            current: data?.meta?.page,
            showTotal: (total) => `Tổng ${total} yêu cầu`,
          }}
          onChange={handleChangePagination}
          loading={isLoading}
          onRow={(record) => ({
            onClick: () => {
              setSelectedRequestEmployeeId(record.request_employee_id);
            },
            className: 'cursor-pointer hover:bg-gray-100',
          })}
        />
      ) : (
        <TableGlobal
          dataSource={
            dataApprovedRequest?.data.map((item, index) => {
              return {...item, key: index};
            }) || []
          }
          columns={columnsApprovedRequests}
          pagination={{
            pageSize: dataApprovedRequest?.meta?.limit,
            total: dataApprovedRequest?.meta?.totalItems,
            current: dataApprovedRequest?.meta?.page,
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
      )}
      {isModalVisible && (
        <ModalGlobal
          content={<DetailRequestModalContent data={dataSelected} />}
          isModalVisible={isModalVisible}
          title={null}
          footer={renderModalFooter()}
          handleCancel={() => setIsModalVisible(false)}
          handleOk={() => setIsModalVisible(false)}
          width="800"
          subtractHeight={dataSelected?.fields?.reason?.length > 100 ? 200 : undefined}
          maskClosable={true}
          destroyOnClose
        />
      )}
    </>
  );
}
