import {HINH_THUC_NGHI_PHEP, LOAI_DMVS, LOAI_NGHI_PHEP, REQUEST_CODE} from '@/shared/constants';
import {IGetPendingRequestsByUserRes} from '@/shared/types/request_employee.type';
import {CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, UserOutlined} from '@ant-design/icons';
import {Avatar, Button, Card, Descriptions, Divider, Empty, Space, Tag, Timeline, Typography} from 'antd';
import dayjs from 'dayjs';
import {useState} from 'react';

const {Title, Text, Paragraph} = Typography;

interface DetailRequestModalContentProps {
  data: IGetPendingRequestsByUserRes | null;
}

export default function DetailRequestModalContent({data}: DetailRequestModalContentProps) {
  const fields = data?.fields;
  const requestType = data?.request?.code;

  const getDetailTitle = () => {
    switch (requestType) {
      case REQUEST_CODE.NGHI_PHEP:
        return 'Chi tiết yêu cầu nghỉ phép';
      case REQUEST_CODE.DI_MUON_VE_SOM:
        return 'Chi tiết yêu cầu đi muộn/về sớm';
      case REQUEST_CODE.DI_CONG_TAC:
        return 'Chi tiết yêu cầu đi công tác';
      case REQUEST_CODE.DANG_KY_LAM_CONG:
        return 'Chi tiết yêu cầu đăng ký làm công';
      case REQUEST_CODE.DANG_KY_LAM_NO_LUC:
        return 'Chi tiết yêu cầu đăng ký làm nỗ lực';
      default:
        return 'Chi tiết yêu cầu';
    }
  };

  const renderRequestDetails = () => {
    switch (requestType) {
      case REQUEST_CODE.NGHI_PHEP:
        return (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Loại yêu cầu">Nghỉ phép</Descriptions.Item>
            <Descriptions.Item label="Hình thức">
              {fields?.hinh_thuc === HINH_THUC_NGHI_PHEP.MOT_NGAY
                ? 'Một ngày'
                : fields?.hinh_thuc === HINH_THUC_NGHI_PHEP.BUOI_SANG
                  ? 'Buổi sáng'
                  : fields?.hinh_thuc === HINH_THUC_NGHI_PHEP.BUOI_CHIEU
                    ? 'Buổi chiều'
                    : 'Nhiều ngày'}
            </Descriptions.Item>
            {fields?.hinh_thuc === HINH_THUC_NGHI_PHEP.NHIEU_NGAY ? (
              <>
                <Descriptions.Item label="Từ ngày">{dayjs(fields?.from_date).format('DD/MM/YYYY')}</Descriptions.Item>
                <Descriptions.Item label="Đến ngày">{dayjs(fields?.to_date).format('DD/MM/YYYY')}</Descriptions.Item>
                <Descriptions.Item label="Số ngày nghỉ">
                  {dayjs(fields?.to_date).diff(dayjs(fields?.from_date), 'day') + 1} ngày
                </Descriptions.Item>
              </>
            ) : (
              <Descriptions.Item label="Ngày nghỉ">{dayjs(fields?.date).format('DD/MM/YYYY')}</Descriptions.Item>
            )}
            <Descriptions.Item label="Loại nghỉ phép">
              <Tag color={fields?.loai_nghi === LOAI_NGHI_PHEP.CO_LUONG ? 'green' : 'orange'}>
                {fields?.loai_nghi === LOAI_NGHI_PHEP.CO_LUONG ? 'Có lương' : 'Không lương'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Lý do" className="reason-item">
              <ReasonDisplay reason={fields?.reason || ''} />
            </Descriptions.Item>
          </Descriptions>
        );

      case REQUEST_CODE.DI_MUON_VE_SOM:
        return (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Loại yêu cầu">Đi muộn/Về sớm</Descriptions.Item>
            <Descriptions.Item label="Ngày">{dayjs(fields?.date).format('DD/MM/YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Thời gian">{fields?.start_time}</Descriptions.Item>
            <Descriptions.Item label="Hình thức">
              <Tag color={fields?.loai_nghi === LOAI_DMVS.DI_MUON ? 'blue' : 'purple'}>
                {fields?.loai_nghi === LOAI_DMVS.DI_MUON ? 'Đi muộn' : 'Về sớm'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Lý do" className="reason-item">
              <ReasonDisplay reason={fields?.reason || ''} />
            </Descriptions.Item>
          </Descriptions>
        );

      case REQUEST_CODE.DI_CONG_TAC:
        return (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Loại yêu cầu">Đi công tác</Descriptions.Item>
            <Descriptions.Item label="Từ ngày">{dayjs(fields?.from_date).format('DD/MM/YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Đến ngày">{dayjs(fields?.to_date).format('DD/MM/YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Số ngày">
              {dayjs(fields?.to_date).diff(dayjs(fields?.from_date), 'day') + 1} ngày
            </Descriptions.Item>
            <Descriptions.Item label="Địa điểm">{fields?.location || 'Không có'}</Descriptions.Item>
            <Descriptions.Item label="Lý do" className="reason-item">
              <ReasonDisplay reason={fields?.reason || ''} />
            </Descriptions.Item>
          </Descriptions>
        );

      case REQUEST_CODE.DANG_KY_LAM_CONG:
      case REQUEST_CODE.DANG_KY_LAM_NO_LUC:
        return (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Loại yêu cầu">
              {requestType === REQUEST_CODE.DANG_KY_LAM_CONG ? 'Đăng ký làm công' : 'Đăng ký làm nỗ lực'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày">{dayjs(fields?.date).format('DD/MM/YYYY')}</Descriptions.Item>
            {fields?.start_time && (
              <Descriptions.Item label="Thời gian">
                {fields?.start_time} {fields?.end_time && ` - ${fields?.end_time}`}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Lý do" className="reason-item">
              <ReasonDisplay reason={fields?.reason || ''} />
            </Descriptions.Item>
          </Descriptions>
        );

      default:
        return (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Loại yêu cầu">{data?.request?.name}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {dayjs(fields?.created_request).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Lý do" className="reason-item">
              <ReasonDisplay reason={fields?.reason || ''} />
            </Descriptions.Item>
          </Descriptions>
        );
    }
  };

  const renderApprovalProcess = () => {
    if (!data?.approvers || data.approvers.length === 0) {
      return <Empty description="Không có thông tin người duyệt" />;
    }
    // Sắp xếp người duyệt theo thứ tự bước
    const sortedApprovers = [...data.approvers].sort((a, b) => a.step_order_aprrover - b.step_order_aprrover);
    return (
      <>
        <Timeline mode="left">
          {sortedApprovers.map((approver, index) => (
            <Timeline.Item
              key={index}
              color={approver.status_approval_id === 1 ? 'green' : approver.status_approval_id === 2 ? 'red' : 'blue'}
              dot={
                approver.status_approval_id === 1 ? (
                  <CheckCircleOutlined className="text-green-500" />
                ) : approver.status_approval_id === 2 ? (
                  <CloseCircleOutlined className="text-red-500" />
                ) : (
                  <ClockCircleOutlined className="text-blue-500" />
                )
              }
            >
              <Space direction="vertical" size={0}>
                <Text strong>Người duyệt {approver.step_order_aprrover}</Text>
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <Text>{approver.employee?.name || 'Không xác định'}</Text>
                </Space>
                <Text type="secondary">
                  {approver.status_approval_id === 1
                    ? 'Đã duyệt'
                    : approver.status_approval_id === 2
                      ? 'Từ chối'
                      : 'Chờ duyệt'}
                </Text>
              </Space>
            </Timeline.Item>
          ))}
        </Timeline>
        {sortedApprovers[0].appover_feaback !== null && <Text>Ghi chú: {sortedApprovers[0].appover_feaback}</Text>}
      </>
    );
  };

  const renderReferences = () => {
    if (!data?.references || data.references.length === 0) {
      return <Empty description="Không có người được tham chiếu" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    return (
      <div className="mt-2 references-container">
        <div className="flex flex-wrap gap-2">
          {data.references.map((reference, index) => (
            <div key={index} className="flex items-center px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
              <Avatar size="small" icon={<UserOutlined />} className="mr-2" style={{backgroundColor: '#1890ff'}} />
              <div>
                <div className="text-sm font-medium">{reference.employee?.name || 'Không xác định'}</div>
                <div className="text-xs text-gray-500">{reference.employee?.email}</div>
              </div>
              {reference.is_seen ? (
                <Tag color="green" className="ml-2 text-xs">
                  Đã xem
                </Tag>
              ) : (
                <Tag color="orange" className="ml-2 text-xs">
                  Chưa xem
                </Tag>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div className="p-2 overflow-hidden">
      <Title level={4} className="mb-4 text-center">
        {getDetailTitle()}
      </Title>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="Thông tin yêu cầu" variant={'outlined'} className="h-full">
          {renderRequestDetails()}
        </Card>

        <Card title="Trạng thái duyệt" variant={'outlined'} className="h-full max-h-[380px] overflow-y-auto">
          <div className="pb-1">
            <Tag
              color={
                data?.rqe_final_status_aproval && data?.rqe_final_status_aproval === 1
                  ? 'success'
                  : data?.rqe_final_status_aproval === 0
                    ? 'error'
                    : 'processing'
              }
              className="px-2 py-1 text-sm"
            >
              {data?.rqe_final_status_aproval && data?.rqe_final_status_aproval === 1
                ? 'Đã duyệt hoàn tất'
                : data?.rqe_final_status_aproval === 0
                  ? 'Bị từ chối'
                  : 'Đang chờ duyệt'}
            </Tag>
          </div>

          <Divider orientation="left">Quy trình duyệt</Divider>
          {renderApprovalProcess()}
        </Card>
      </div>

      {data?.references && data.references.length > 0 && (
        <Card
          title={
            <div className="flex items-center">
              <span>Người được tham chiếu</span>
              <Tag className="ml-2" color="blue">
                {data.references.length}
              </Tag>
            </div>
          }
          variant={'outlined'}
          className="mt-4 h-full max-h-[250px] overflow-y-auto"
        >
          {renderReferences()}
        </Card>
      )}
      <div className="mt-4">
        <Paragraph className="italic text-gray-500">
          Yêu cầu được tạo vào {dayjs(fields?.created_request).format('DD/MM/YYYY HH:mm')}
        </Paragraph>
      </div>
    </div>
  );
}

const ReasonDisplay = ({reason}: {reason: string}) => {
  const [expanded, setExpanded] = useState(false);

  const isLongReason = reason && reason.length > 100;

  return (
    <div className="reason-container">
      {!reason && <span className="italic text-gray-400">Không có</span>}

      {reason && !isLongReason && <span>{reason}</span>}

      {reason && isLongReason && (
        <>
          <div className="break-words whitespace-pre-wrap">{expanded ? reason : `${reason.substring(0, 100)}...`}</div>
          <Button type="link" onClick={() => setExpanded(!expanded)} className="h-auto p-0 mt-1">
            {expanded ? 'Thu gọn' : 'Xem thêm'}
          </Button>
        </>
      )}
    </div>
  );
};
