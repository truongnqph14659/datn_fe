import ButtonGlobal from '@/components/ButtonGlobal';
import ModalGlobal from '@/components/ModalGlobal';
import ModalCreateRequest from '@/modules/timekeeping/components/ModalCreateRequest';
import {HINH_THUC_NGHI_PHEP, LOAI_DMVS, LOAI_NGHI_PHEP, REQUEST_TYPE} from '@/shared/constants';
import {useGetAttendanceReqByAttendanceID} from '@/shared/hooks/react-query-hooks/attendances-request';
import {IAttendanceRequestRes, ICheckinoutDetail} from '@/shared/types/attendance.type';
import {useUserTimekeepingStore} from '@/store';
import {UserOutlined} from '@ant-design/icons';
import {Avatar, Image} from 'antd';
import dayjs from 'dayjs';
import {useState} from 'react';
import './index.scss';

export interface ModalDetailTimekeepingProps {
  isModalVisible: boolean;
  toggleModal: () => void;
}

const MODAL_CREATE_REQUEST = 'modalCreateRequest';

export default function ModalDetailTimekeeping(_props: ModalDetailTimekeepingProps) {
  const [isModalVisible, setIsModalVisible] = useState<string>('');
  const {selectedTimekeeping} = useUserTimekeepingStore();

  const {data: attendanceDetail} = useGetAttendanceReqByAttendanceID(
    selectedTimekeeping?.timekeeping.attendance_id || 0,
  );

  const hasCheckIn = selectedTimekeeping?.timekeeping.checkin;
  const hasCheckOut = selectedTimekeeping?.timekeeping.checkout;

  const renderContentTime = (request: IAttendanceRequestRes, check_inout_detail: ICheckinoutDetail) => {
    let content = '';
    switch (request.request_id) {
      case REQUEST_TYPE.DI_CONG_TAC:
        content = `Đi công tác từ ${request.fields.from_date} đến ${request.fields.to_date}`;
        break;

      case REQUEST_TYPE.THAY_DOI_GIO_CHAM_CONG:
        if (!check_inout_detail || (!check_inout_detail.earliest_checkin && !check_inout_detail.latest_checkout)) {
          content = `Thay đổi giờ chấm công thành ${request.fields.start_time}`;
          if (request.fields.end_time) {
            content += ` - ${request.fields.end_time}`;
          }
          break;
        }
        // Lấy thời gian gốc
        const originalCheckin = check_inout_detail.earliest_checkin ? dayjs(check_inout_detail.earliest_checkin) : null;
        const originalCheckout = check_inout_detail.latest_checkout ? dayjs(check_inout_detail.latest_checkout) : null;
        // Format thời gian giữ giờ và phút, bỏ giây
        const originalCheckinFormatted = originalCheckin ? originalCheckin.format('HH:mm') : null;
        const originalCheckoutFormatted = originalCheckout ? originalCheckout.format('HH:mm') : null;
        // Thời gian mới
        const newStartTime = request.fields.start_time;
        const newEndTime = request.fields.end_time;
        // Chỉ xử lý trường hợp có 1 thời gian (hoặc checkin hoặc checkout)
        if (originalCheckin && !originalCheckout) {
          // Chỉ hiển thị khi thời gian thay đổi khác với thời gian ban đầu
          if (originalCheckinFormatted !== newStartTime) {
            content = `Thay đổi giờ check-in từ ${originalCheckinFormatted} thành ${newStartTime}`;
          } else {
            content = 'Không có thay đổi giờ check-in';
          }
          break;
        }
        if (!originalCheckin && originalCheckout) {
          // Chỉ hiển thị khi thời gian thay đổi khác với thời gian ban đầu
          if (originalCheckoutFormatted !== newStartTime) {
            content = `Thay đổi giờ check-out từ ${originalCheckoutFormatted} thành ${newStartTime}`;
          } else {
            content = 'Không có thay đổi giờ check-out';
          }
          break;
        }
        // Trường hợp có cả check-in và check-out
        if (originalCheckin && originalCheckout) {
          // Tính khoảng cách thời gian bằng phút
          const fullNewStartTime = dayjs(`${request.fields.date} ${newStartTime}`);
          const checkinDiff = Math.abs(fullNewStartTime.diff(originalCheckin, 'minute'));
          const checkoutDiff = Math.abs(fullNewStartTime.diff(originalCheckout, 'minute'));
          const isChangingCheckin = checkinDiff < checkoutDiff;
          // Xây dựng nội dung thông báo
          let hasChanges = false;
          if (isChangingCheckin) {
            // Thay đổi check-in
            if (originalCheckinFormatted !== newStartTime) {
              content = `Thay đổi giờ check-in từ ${originalCheckinFormatted} thành ${newStartTime}`;
              hasChanges = true;
            }
            // Thêm thông tin về check-out nếu có thay đổi
            if (newEndTime && originalCheckoutFormatted !== newEndTime) {
              if (hasChanges) {
                content += ` và check-out từ ${originalCheckoutFormatted} thành ${newEndTime}`;
              } else {
                content = `Thay đổi giờ check-out từ ${originalCheckoutFormatted} thành ${newEndTime}`;
                hasChanges = true;
              }
            }
          } else {
            // Thay đổi check-out
            if (originalCheckoutFormatted !== newStartTime) {
              content = `Thay đổi giờ check-out từ ${originalCheckoutFormatted} thành ${newStartTime}`;
              hasChanges = true;
            }
          }
          // Nếu không có thay đổi nào
          if (!hasChanges) {
            content = 'Không có thay đổi giờ chấm công';
          }
        } else {
          // Trường hợp không có dữ liệu so sánh
          content = `Thay đổi giờ chấm công thành ${newStartTime}`;
          if (newEndTime) {
            content += ` - ${newEndTime}`;
          }
        }
        break;

      case REQUEST_TYPE.DI_MUON_VE_SOM:
        if (request.fields.loai_nghi && request.fields.loai_nghi === LOAI_DMVS.DI_MUON) {
          content = `(Đi muộn) Thời gian đi muộn ${request.fields.start_time}`;
        }
        if (request.fields.loai_nghi && request.fields.loai_nghi === LOAI_DMVS.VE_SOM) {
          content = `(Về sớm) Thời gian về sớm ${request.fields.start_time}`;
        }
        break;

      case REQUEST_TYPE.NGHI_PHEP:
        const isSalary =
          request.fields.loai_nghi === LOAI_NGHI_PHEP.CO_LUONG
            ? 'Có lương'
            : request.fields.loai_nghi === LOAI_NGHI_PHEP.KHONG_LUONG
              ? 'Không lương'
              : 'Không xác định';
        if (request.fields.hinh_thuc === HINH_THUC_NGHI_PHEP.MOT_NGAY) {
          content = `(${isSalary}) Nghỉ phép ngày ${request.fields.date}`;
        }
        if (request.fields.hinh_thuc === HINH_THUC_NGHI_PHEP.NHIEU_NGAY) {
          content = `(${isSalary}) Nghỉ phép từ ${request.fields.from_date} đến ${request.fields.to_date}`;
        }
        if (request.fields.hinh_thuc === HINH_THUC_NGHI_PHEP.BUOI_SANG) {
          content = `(${isSalary}) Nghỉ phép buổi sáng ngày ${request.fields.date}`;
        }
        if (request.fields.hinh_thuc === HINH_THUC_NGHI_PHEP.BUOI_CHIEU) {
          content = `(${isSalary}) Nghỉ phép buổi chiều ngày ${request.fields.date}`;
        }
        break;

      default:
        content = `Ngày làm ${request.fields.date}`;
        if (request.fields.start_time) {
          content += ` - ${request.fields.start_time}`;
        }
        if (request.fields.end_time) {
          content += ` - ${request.fields.end_time}`;
        }
        break;
    }
    return content;
  };

  const renderContent = () => {
    const checkin = hasCheckIn ? (
      dayjs(hasCheckIn).format('HH:mm:ss')
    ) : (
      <span className="font-bold text-red-500">Chưa checkin</span>
    );
    const checkout = hasCheckOut ? (
      dayjs(hasCheckOut).format('HH:mm:ss')
    ) : (
      <span className="font-bold text-red-500">Chưa checkout</span>
    );

    if (!selectedTimekeeping) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 mt-1 text-4xl font-bold text-center text-red-600">
          <div className="size-[500px] flex-1">
            <img srcSet="/nodata.jpg 2x" alt="No-data" />
          </div>
          <span>Không có dữ liệu</span>
        </div>
      );
    }

    return (
      <div>
        <ButtonGlobal onClick={() => setIsModalVisible(MODAL_CREATE_REQUEST)}>Tạo yêu cầu</ButtonGlobal>
        {attendanceDetail && !!attendanceDetail?.data?.requests?.length && (
          <table className="w-full mt-4 text-sm table-fixed">
            <thead>
              <tr className="border-b border-b-gray-300">
                <th className="p-2 text-center w-[20%]">Loại yêu cầu</th>
                <th className="p-2 text-center w-[20%]">Thời gian</th>
                <th className="p-2 text-center w-[35%]">Lý do</th>
                <th className="p-2 text-center w-[10%]">Trạng thái</th>
                <th className="p-2 text-center w-[15%]">Phản hồi</th>
              </tr>
            </thead>
            <tbody>
              {attendanceDetail.data.requests.map((item, i) => (
                <tr key={`${item._id}${i}`} className="border-b border-b-gray-300">
                  <td className="p-2 text-center">{item.request_name}</td>
                  <td className="p-2 text-center">
                    {renderContentTime(item, attendanceDetail.data.check_inout_detail)}
                  </td>
                  <td className="p-2 text-center break-words">{item.fields.reason}</td>
                  <td className="p-2 text-center">
                    {item.final_status_aproval
                      ? 'Đã duyệt'
                      : item.final_status_aproval == 0
                        ? 'Đã từ chối'
                        : 'Đang chờ duyệt'}
                  </td>
                  <td className="p-2 text-center">{/* phản hồi */}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {hasCheckIn && (
          <div className="my-2 text-lg">
            Time: {checkin} - {''} {checkout}{' '}
            {hasCheckOut && <span className="font-bold text-red-500">(Đã bấm checkout lúc: {checkout})</span>}
          </div>
        )}
        <br />
        <table className="w-full mt-2 text-base">
          <thead>
            <tr className="border-b border-b-gray-300">
              <th className="p-2 text-center">Thời gian</th>
              <th className="p-2 text-center">Người thực hiện</th>
              <th className="p-2 text-center">Tên camera</th>
              <th className="p-2 text-center">Chức danh</th>
              <th className="p-2 text-center">Hình ảnh</th>
            </tr>
          </thead>
          <tbody>
            {selectedTimekeeping?.timekeeping?.check_in_out_list?.map((checkin_out_time) => {
              return (
                <tr className="border-b border-b-gray-300" key={checkin_out_time._id}>
                  <td className="p-2 text-center">{checkin_out_time.date_time}</td>
                  <td className="p-2 text-center">{checkin_out_time.name}</td>
                  <td className="p-2 text-center">{checkin_out_time.type == 'check-in' ? 'Check-In' : 'Check-Out'}</td>
                  <td className="p-2 text-center">{checkin_out_time.position_name}</td>
                  <td className="flex items-center justify-center p-2 text-center">
                    {checkin_out_time?.url_image ? (
                      <Image src={checkin_out_time?.url_image} className="!size-24 rounded-full object-cover"></Image>
                    ) : (
                      <Avatar icon={<UserOutlined />} className="size-24" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  const title = selectedTimekeeping ? `${selectedTimekeeping?.name} - ` : '';
  return (
    <>
      <ModalGlobal
        className="modal-detail-timekeeping"
        isModalVisible={_props.isModalVisible}
        handleOk={_props.toggleModal}
        handleCancel={_props.toggleModal}
        title={`${title} Chi tiết chấm công ngày ${dayjs(selectedTimekeeping?.timekeeping.work_date).format(
          'DD/MM/YYYY',
        )}`}
        subtractHeight={hasCheckIn || hasCheckOut ? 500 : 0}
        content={renderContent()}
        width={selectedTimekeeping ? '1200px' : '800px'}
        footer={null}
        maskClosable={true}
      />

      {isModalVisible === MODAL_CREATE_REQUEST && (
        <ModalCreateRequest
          isModalVisible={isModalVisible === MODAL_CREATE_REQUEST}
          toggleModal={() => setIsModalVisible('')}
          selectedTimekeeping={selectedTimekeeping}
          handleCancel={_props.toggleModal}
        />
      )}
    </>
  );
}
