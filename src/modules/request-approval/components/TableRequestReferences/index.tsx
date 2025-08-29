import ModalGlobal from '@/components/ModalGlobal';
import TableGlobal from '@/components/TableGlobal';
import DetailRequestModalContent from '@/modules/request-approval/components/DetailRequestModalContent';
import {RequestInfoRenderer} from '@/modules/request-approval/components/TablePendingRequestApproval';
import {useGetRequestEmployeeById} from '@/shared/hooks/react-query-hooks/request-employee';
import {
  useGetRequestReferencesByUser,
  useMarkReferenceAsSeen,
} from '@/shared/hooks/react-query-hooks/request-references';
import useSearchParams, {paramsDefaultCommon} from '@/shared/hooks/useSearchParams';
import {IGetPendingRequestsByUserRes} from '@/shared/types/request_employee.type';
import {useAuthStore} from '@/store/authStore';
import {Button, TableColumnsType, Tag} from 'antd';
import {useEffect, useMemo, useState} from 'react';

export interface TableRequestReferencesProps {
  refetchUnseenCountData?: () => void;
}

export default function TableRequestReferences({refetchUnseenCountData}: TableRequestReferencesProps) {
  const auth = useAuthStore((s) => s.user);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dataSelected, setDataSelected] = useState<IGetPendingRequestsByUserRes | null>(null);
  const [selectedRequestEmployeeId, setSelectedRequestEmployeeId] = useState<number | null>(null);
  const [selectedReferenceId, setSelectedReferenceId] = useState<number | null>(null);

  const {params, handleChangePagination} = useSearchParams(paramsDefaultCommon);
  const {data: referencesData, isFetching: isFetchingReferences, refetch} = useGetRequestReferencesByUser(params);
  const {mutate: markAsSeen} = useMarkReferenceAsSeen();

  const {
    data: requestDetailData,
    isLoading: isLoadingRequestDetail,
    refetch: refetchReqEmp,
  } = useGetRequestEmployeeById(selectedRequestEmployeeId || 0, {enabled: !!selectedRequestEmployeeId});

  useEffect(() => {
    if (requestDetailData) {
      if (requestDetailData.data) {
        setDataSelected(requestDetailData.data);
        setIsModalVisible(true);
        if (selectedReferenceId && auth?._id) {
          markAsSeen(
            {referenceId: selectedReferenceId, employeeId: auth._id},
            {
              onSuccess: () => {
                refetch();
                refetchReqEmp();
                refetchUnseenCountData?.();
              },
            },
          );
        }
      }
      setSelectedRequestEmployeeId(null);
      setSelectedReferenceId(null);
    }
  }, [requestDetailData, selectedReferenceId, auth, markAsSeen, refetch]);

  const columns = useMemo<TableColumnsType<any>>(
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
        render: (_, record) => record.creator?.name || record.requester || '-',
      },
      {
        title: 'Thông tin yêu cầu',
        dataIndex: 'fields',
        key: 'fields',
        align: 'center',
        render: (_, record) => {
          const adaptedRecord = {
            fields: record.fields,
            request_code: record.request_code,
          };
          return <RequestInfoRenderer record={adaptedRecord} requestType="pendingApprovals" />;
        },
      },
      {
        title: 'Lý do',
        dataIndex: 'fields.reason',
        key: 'reason',
        align: 'center',
        render: (_, record) => (
          <div className="max-w-[200px] truncate" title={record.fields?.reason}>
            {record.fields?.reason || '-'}
          </div>
        ),
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'created_at',
        key: 'created_at',
        align: 'center',
        render: (_, record) => {
          return record.fields?.created_request || record.created_at || '-';
        },
      },
      {
        title: 'Trạng thái đã xem',
        dataIndex: 'is_seen',
        key: 'is_seen',
        align: 'center',
        render: (isSeen) => {
          return isSeen ? <Tag color="green">Đã xem</Tag> : <Tag color="orange">Chưa xem</Tag>;
        },
      },
    ],
    [],
  );

  const isLoading = isFetchingReferences || isLoadingRequestDetail;

  const renderModalFooter = () => (
    <div className="flex justify-end">
      <Button onClick={() => setIsModalVisible(false)}>Đóng</Button>
    </div>
  );

  return (
    <div>
      <TableGlobal
        dataSource={
          referencesData?.data.map((item, index) => {
            return {...item, key: index};
          }) || []
        }
        columns={columns}
        pagination={{
          pageSize: referencesData?.meta?.limit,
          total: referencesData?.meta?.totalItems,
          current: referencesData?.meta?.page,
          showTotal: (total) => `Tổng ${total} yêu cầu`,
        }}
        onChange={handleChangePagination}
        loading={isLoading}
        onRow={(record) => ({
          onClick: () => {
            setSelectedRequestEmployeeId(record.request_employee_id);
            setSelectedReferenceId(record.req_ref_id);
          },
          className: `cursor-pointer hover:bg-gray-100 ${!record.is_seen ? 'bg-blue-50' : ''}`,
        })}
        rowClassName={(record) => (!record.is_seen ? 'bg-blue-50' : '')}
      />
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
    </div>
  );
}
