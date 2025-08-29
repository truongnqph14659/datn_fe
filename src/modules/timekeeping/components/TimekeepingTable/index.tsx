import {ICCalenderCheck} from '@/components/Icon';
import {MODAL_DETAIL_TIMEKEEPING} from '@/modules/timekeeping';
import {HINH_THUC_NGHI_PHEP, LOAI_NGHI_PHEP, REQUEST_CODE} from '@/shared/constants';
import {DayInfo} from '@/shared/types';
import {IAttendanceRes, ITimekeeping} from '@/shared/types/attendance.type';
import {cn, generateWeekDays, isDateEqual, isDateInRange, isWeekend} from '@/shared/utils';
import {useUserTimekeepingStore} from '@/store';
import dayjs from 'dayjs';
import {useCallback, useMemo} from 'react';

interface TimekeepingTableProps {
  data: IAttendanceRes[] | [];
  setIsModalVisible: (value: string) => void;
  isModalVisible?: string;
  week?: number;
  year?: number;
  viewType: 'week' | 'month';
}

const TimekeepingTable = ({data, setIsModalVisible, week, year, viewType}: TimekeepingTableProps) => {
  const {setSelectedTimekeeping} = useUserTimekeepingStore();
  const daysArray = useMemo(() => {
    if (!data || data.length === 0 || !data[0].timekeeping || data[0].timekeeping.length === 0) {
      if (viewType === 'week' && week && year) {
        return generateWeekDays(week, year);
      }
      return [];
    }
    const timekeepingEntries = [...data[0].timekeeping];
    // Sort lại theo work_date
    const sortedEntries = timekeepingEntries.sort((a, b) => {
      return dayjs(a.work_date).diff(dayjs(b.work_date));
    });

    return sortedEntries.map((entry) => {
      const date = dayjs(entry.work_date);
      return {
        date: date.format('DD/MM'),
        day: date.format('ddd'),
        status: isWeekend(date) ? 'off' : 'work',
        work_date: entry.work_date,
      };
    });
  }, [data, week, year, viewType]);

  const handleCellClick = (userData: IAttendanceRes, workEntry: ITimekeeping | undefined) => {
    if (workEntry) {
      setSelectedTimekeeping({
        email: userData.email,
        employeeId: userData.employeeId,
        name: userData.name,
        timekeeping: workEntry,
      });
      setIsModalVisible(MODAL_DETAIL_TIMEKEEPING);
    } else {
      setSelectedTimekeeping(null);
      setIsModalVisible('');
    }
  };

  const checkIsOnLeave = (workEntry: ITimekeeping | undefined) => {
    if (!workEntry?.approved_requests_details?.length) return false;
    // Kiểm tra xem có yêu cầu nghỉ phép/công tác đã được phê duyệt cho ngày này không
    return workEntry.approved_requests_details.some((req) => {
      const isApproved = req.finalStatusAproval && req.finalStatusAproval !== 0;
      if (!isApproved) return false;
      const workDate = workEntry.work_date;
      // Trường hợp 1: Nghỉ nhiều ngày hoặc công tác (có from_date và to_date)
      if (
        (req.fields.hinh_thuc === HINH_THUC_NGHI_PHEP.NHIEU_NGAY || req.code === REQUEST_CODE.DI_CONG_TAC) &&
        req.fields.from_date &&
        req.fields.to_date
      ) {
        return isDateInRange(workDate, req.fields.from_date, req.fields.to_date);
      }
      // Trường hợp 2: Nghỉ một ngày cụ thể hoặc một buổi
      if ([HINH_THUC_NGHI_PHEP.MOT_NGAY].includes(req.fields.hinh_thuc) && req.fields.date) {
        return isDateEqual(workDate, req.fields.date);
      }
      return false;
    });
  };

  const checkIsBusinessTrip = (workEntry: ITimekeeping | undefined) => {
    if (!workEntry?.approved_requests_details?.length) return false;
    return workEntry.approved_requests_details.some((req) => {
      const isApproved = req.finalStatusAproval && req.finalStatusAproval !== 0;
      if (!isApproved) return false;
      //Kiểm tra xem có phải đi công tác không
      if (req.code === REQUEST_CODE.DI_CONG_TAC && req.fields.from_date && req.fields.to_date) {
        return isDateInRange(workEntry.work_date, req.fields.from_date, req.fields.to_date);
      }
      return false;
    });
  };

  const renderWeekViewContent = useCallback(
    (workEntry: ITimekeeping) => (
      <div className="flex flex-col items-center justify-start h-full">
        <div className="text-lg font-bold">{workEntry.work_completion}</div>
        <div className="flex items-center justify-center gap-1 font-semibold">
          {dayjs(workEntry.checkin).format('HH:mm')} -{' '}
          {workEntry.checkout ? dayjs(workEntry.checkout).format('HH:mm') : 'Chưa checkout'}
          <ICCalenderCheck className="size-4" />
        </div>
        <div className="mt-2 text-[12px] text-start">
          {workEntry.approved_requests_details && workEntry.approved_requests_details?.length > 0 ? (
            <div>
              <p className="font-medium">Yêu cầu:</p>
              <ul className="pl-4 list-disc">
                {workEntry.approved_requests_details.map((request, index) => (
                  <li key={index}>{request.code === REQUEST_CODE.DI_CONG_TAC ? 'Đi công tác' : `${request.name}`}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Yêu cầu: 0</p>
          )}
        </div>
      </div>
    ),
    [],
  );
  
  const renderMonthViewContent = useCallback(
    (workEntry: ITimekeeping) => (
      <div className="flex flex-col items-center justify-start w-full h-full">
        <div className="flex items-center justify-center w-full h-6 text-base font-bold">
          {workEntry.work_completion}
        </div>
        <div className="flex flex-col items-center justify-center w-full h-12 font-medium">
          <div className="leading-6">{dayjs(workEntry.checkin).format('HH:mm')}</div>
          <div className="leading-6">{workEntry.checkout ? dayjs(workEntry.checkout).format('HH:mm') : '--'}</div>
        </div>
        {workEntry.approved_requests_details && workEntry.approved_requests_details?.length > 0 && (
          <div className="flex items-center justify-center w-full h-4 mt-1 text-xs italic">
            {workEntry.approved_requests_details.length} yêu cầu
          </div>
        )}
      </div>
    ),
    [],
  );

  const renderApprovedRequestsList = useCallback(
    (workEntry: ITimekeeping) => (
      <div className="flex flex-col justify-center h-full">
        <span className="text-base font-medium">Yêu cầu đã duyệt:</span>
        <ul className="pl-4 mt-1 list-disc text-[13px] text-start">
          {workEntry.approved_requests_details &&
            workEntry.approved_requests_details.map((request, index) => (
              <li key={index}>{request.code === REQUEST_CODE.DI_CONG_TAC ? 'Đi công tác' : `${request.name} `}</li>
            ))}
        </ul>
      </div>
    ),
    [],
  );

  const renderCellContent = (workEntry: ITimekeeping | undefined, day: DayInfo) => {
    if (!workEntry) return null;
    // Trường hợp ngày nghỉ lễ có check-in
    if (workEntry.is_holiday && !workEntry.checkin) {
      return <span className="font-bold">{workEntry.holiday_name || 'Ngày nghỉ lễ'}</span>;
    }
    // Kiểm tra xem có yêu cầu nghỉ phép/công tác đã được phê duyệt cho ngày này không
    const isOnLeave = checkIsOnLeave(workEntry);
    // Nếu nhân viên đang trong thời gian nghỉ phép được chấp thuận
    if (isOnLeave) {
      const leaveRequest =
        workEntry.approved_requests_details &&
        workEntry.approved_requests_details.find((request) => {
          // Business trip check
          if (request.code === REQUEST_CODE.DI_CONG_TAC && request.fields.from_date && request.fields.to_date) {
            return isDateInRange(workEntry.work_date, request.fields.from_date, request.fields.to_date);
          }
          // Multi-day leave
          if (
            request.fields.hinh_thuc === HINH_THUC_NGHI_PHEP.NHIEU_NGAY &&
            request.fields.from_date &&
            request.fields.to_date
          ) {
            return isDateInRange(workEntry.work_date, request.fields.from_date, request.fields.to_date);
          }
          // Single day leave
          if ([HINH_THUC_NGHI_PHEP.MOT_NGAY].includes(request.fields.hinh_thuc) && request.fields.date) {
            return isDateEqual(workEntry.work_date, request.fields.date);
          }
          return false;
        });
      if (leaveRequest) {
        // Nếu có check-in, ưu tiên hiển thị thông tin check-in
        if (workEntry.checkin) {
          return viewType === 'week' ? renderWeekViewContent(workEntry) : renderMonthViewContent(workEntry);
        }
        if (leaveRequest.code === REQUEST_CODE.DI_CONG_TAC) {
          return (
            <div className="flex flex-col justify-center h-full">
              <span className="font-bold">Đi công tác</span>
            </div>
          );
        }
        const leaveType = leaveRequest.fields.loai_nghi === LOAI_NGHI_PHEP.CO_LUONG ? 'có lương' : 'không lương';
        return (
          <div className="flex flex-col justify-center h-full">
            <span className="font-bold">{leaveRequest.name}</span>
            <span className="text-sm">{leaveType}</span>
          </div>
        );
      }
    }
    // Hiển thị thông tin check-in nếu có
    if (workEntry.checkin) {
      // Nếu là ngày nghỉ lễ có check-in, hiển thị thêm thông tin đó
      // const holidayInfo = workEntry.is_holiday ? (
      //   <div className="text-xs font-bold text-yellow-300">{workEntry.holiday_name || 'Ngày nghỉ lễ'}</div>
      // ) : null;
      if (viewType === 'week') {
        return (
          <>
            {/* {holidayInfo} */}
            {renderWeekViewContent(workEntry)}
          </>
        );
      } else {
        return (
          <>
            {/* {holidayInfo} */}
            {renderMonthViewContent(workEntry)}
          </>
        );
      }
    }
    // Trường hợp khi có approved_requests_details nhưng không có checkin
    if (workEntry.approved_requests_details && workEntry.approved_requests_details?.length > 0) {
      if (viewType === 'week') {
        return renderApprovedRequestsList(workEntry);
      }
      if (viewType === 'month' && day.status === 'off') {
        return (
          <div>
            <span className="font-bold">Ngày Nghỉ</span>
            <div className="mt-1 text-xs italic">{workEntry.approved_requests_details.length} yêu cầu</div>
          </div>
        );
      }
    }
    return day.status === 'off' ? <span className="font-bold">Ngày Nghỉ</span> : <span>--</span>;
  };

  const getCellClassNames = (day: DayInfo, workEntry?: ITimekeeping) => {
    const isOnLeave = checkIsOnLeave(workEntry);
    const isBusinessTrip = checkIsBusinessTrip(workEntry);
    const hasCompletedWork = workEntry?.is_completed && workEntry?.checkin;
    return cn(
      'p-2 border text-center rounded-lg cursor-pointer',
      viewType === 'month' ? '!w-[70px] !max-w-[70px] !min-w-[70px] !h-[80px]' : '!h-[117px]',
      isBusinessTrip
        ? 'bg-purple-600 text-white'
        : isOnLeave
          ? 'bg-blue-600 text-white'
          : hasCompletedWork
            ? 'bg-green-600 text-white'
            : day.status === 'off'
              ? 'bg-gray-300'
              : workEntry?.is_holiday
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white',
    );
  };

  return (
    <table
      className={cn(
        'border-separate rounded-lg border-spacing-2',
        viewType === 'month' ? 'w-max' : 'w-full table-fixed',
      )}
    >
      <thead>
        <tr className="bg-gray-200">
          <th className={cn('p-2 text-left border rounded-lg', viewType === 'month' ? 'w-48' : 'w-1/7')}>
            <span>Checkin</span>
            <br />
            <span>Checkout</span>
          </th>
          {daysArray.map((day, index) => (
            <th
              key={index}
              className={cn(
                'p-1.5 border text-center rounded-lg',
                viewType === 'month' && '!w-[70px] !max-w-[70px] !min-w-[70px]',
                day.status === 'off' && 'text-red-500',
              )}
            >
              {day.day}
              <br />
              <span className="text-xl">{day.date}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((user) => (
          <tr key={user._id} className="border">
            <td
              className={cn('p-2 font-semibold bg-gray-100 border rounded-lg', viewType === 'month' ? 'w-48' : 'w-1/7')}
            >
              {user.name}
            </td>
            {daysArray.map((day, index) => {
              const workEntry = user.timekeeping.find(
                (entry) => dayjs(entry.work_date).format('YYYY-MM-DD') === dayjs(day.work_date).format('YYYY-MM-DD'),
              );
              return (
                <td
                  key={index}
                  className={getCellClassNames(day, workEntry)}
                  onClick={() => handleCellClick(user, workEntry)}
                >
                  {renderCellContent(workEntry, day)}
                </td>
              );
            })}
          </tr>
        ))}

        {(!data || data.length === 0) && (
          <tr>
            <td colSpan={daysArray.length + 1} className="p-4 text-center">
              <div className="size-[350px] mx-auto">
                <img src="/nodata.jpg" alt="" className="object-contain size-full" />
              </div>
              <span className="text-2xl font-bold">Không có dữ liệu chấm công</span>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default TimekeepingTable;
