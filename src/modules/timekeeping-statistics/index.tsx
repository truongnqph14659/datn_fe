import LoadingGlobal from '@/components/LoadingGlobal';
import {useGetDepartments} from '@/shared/hooks/react-query-hooks/department';
import {useGetEmployees} from '@/shared/hooks/react-query-hooks/employee';
import {useExportExcelTimekeeping, useGetTimekeepingStatistics} from '@/shared/hooks/react-query-hooks/timekeeping';
import useSearchParams, {paramsDefaultCommon} from '@/shared/hooks/useSearchParams';
import {cn, convertDaysToHumanReadable, getWeekFromDate} from '@/shared/utils';
import {useAuthStore} from '@/store/authStore';
import {Button, Checkbox, DatePicker, Pagination, Select} from 'antd';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';
import {saveAs} from 'file-saver';
import {useEffect, useMemo, useState} from 'react';
import {toast} from 'react-toastify';

dayjs.extend(utc);
dayjs.extend(isoWeek);

export default function TimekeepingStatistics() {
  const user = useAuthStore((s) => s.user);
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [year, setYear] = useState(dayjs().year());
  const [week, setWeek] = useState<number>(getWeekFromDate(new Date(year, month - 1, 1)));
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'custom'>('month');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [showLateViolations, setShowLateViolations] = useState<boolean>(false);

  const isCurrentMonth = dayjs().month() + 1 === +month && dayjs().year() === +year;
  const {params, handleChangePagination} = useSearchParams(paramsDefaultCommon);

  const filterOptions = useMemo(() => {
    let filter = {};
    if (viewMode === 'month') {
      filter = {month, year};
    } else if (viewMode === 'week') {
      filter = {week, year};
    } else if (viewMode === 'custom') {
      filter = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      };
    }
    if (selectedDepartment) {
      filter = {...filter, departmentId: selectedDepartment};
    }
    if (selectedEmployee) {
      filter = {...filter, employeeId: selectedEmployee};
    }
    return {
      ...params,
      employeeId: user?._id || undefined,
      filter,
    };
  }, [params, viewMode, month, year, week, dateRange, selectedDepartment, selectedEmployee]);

  const {data, isLoading} = useGetTimekeepingStatistics(filterOptions);
  const {data: departmentsData} = useGetDepartments({disablePagination: true}, {enabled: !!data?.meta});
  const {data: employeesData} = useGetEmployees({disablePagination: true}, {enabled: !!data?.meta});
  const {refetch: exportExcel, isLoading: isExporting} = useExportExcelTimekeeping(filterOptions, {enabled: false});

  const departmentsOptions = useMemo(() => {
    const options =
      departmentsData?.data.map((item) => ({
        value: item._id,
        label: item.name_depart,
      })) || [];
    return [{value: null, label: 'Tất cả phòng ban'}, ...options];
  }, [departmentsData]);

  const employeesOptions = useMemo(() => {
    const options =
      employeesData?.data.map((item) => ({
        value: item._id,
        label: item.name,
      })) || [];
    return [{value: null, label: 'Tất cả nhân viên'}, ...options];
  }, [employeesData]);

  // Filtered data based on late violations checkbox
  const filteredTimekeeping = useMemo(() => {
    if (!data?.data?.timekeeping) return [];
    return showLateViolations
      ? data.data.timekeeping.filter((record) => record.di_muon.khong_don > 0)
      : data.data.timekeeping;
  }, [data?.data?.timekeeping, showLateViolations]);

  // Khi thay đổi viewMode, cập nhật lại dateRange
  useEffect(() => {
    if (viewMode === 'month') {
      setDateRange([dayjs(new Date(year, month - 1, 1)), dayjs(new Date(year, month - 1, 1)).endOf('month')]);
    } else if (viewMode === 'week') {
      setDateRange([
        dayjs().year(year).isoWeek(week).startOf('isoWeek'),
        dayjs().year(year).isoWeek(week).endOf('isoWeek'),
      ]);
    }
  }, [viewMode, month, year, week]);

  const dataWeeks = useMemo(() => {
    const firstDayOfMonth = dayjs(new Date(year, month - 1, 1));
    const lastDayOfMonth = firstDayOfMonth.endOf('month');
    let weeks = [];
    let currentDate = firstDayOfMonth;
    const seenWeeks = new Set();
    while (currentDate.isBefore(lastDayOfMonth) || currentDate.isSame(lastDayOfMonth, 'day')) {
      const weekNumber = currentDate.isoWeek();
      if (!seenWeeks.has(weekNumber)) {
        weeks.push({label: `Tuần ${weekNumber}`, value: weekNumber});
        seenWeeks.add(weekNumber);
      }
      currentDate = currentDate.add(1, 'day');
    }
    return weeks;
  }, [year, month]);

  const handleMonthChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setMonth(date.month() + 1);
      setYear(date.year());
    }
  };

  const handleViewChange = (value: 'week' | 'month' | 'custom') => {
    setViewMode(value);
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  const handleExport = async () => {
    try {
      const response = await exportExcel();
      if (response.data as Blob) {
        const fileName = `thong-ke-cham-cong_${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`;
        saveAs(new Blob([response.data]), fileName);
        toast.success('Xuất file excel thành công');
      }
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Có lỗi khi xuất file excel');
    }
  };

  const renderTimeRange = () => {
    if (viewMode === 'month') {
      const firstDayOfMonth = `${year}/${month.toString().padStart(2, '0')}/01`;
      const lastDayOfMonth = dayjs(new Date(year, month - 1, 1))
        .endOf('month')
        .format('YYYY/MM/DD');
      const currentDay = isCurrentMonth ? dayjs().format('YYYY/MM/DD') : lastDayOfMonth;
      return (
        <>
          <div>
            Dự kiến: Từ ngày {firstDayOfMonth} đến {lastDayOfMonth}
          </div>
          <div>
            Hiện tại: Từ ngày {firstDayOfMonth} đến {currentDay}
          </div>
        </>
      );
    }
    const periodInfo = data?.data?.period_info;
    if (!periodInfo) {
      if (viewMode === 'week') {
        const weekStart = dayjs().year(year).isoWeek(week).startOf('isoWeek').format('YYYY/MM/DD');
        const weekEnd = dayjs().year(year).isoWeek(week).endOf('isoWeek').format('YYYY/MM/DD');
        // Kiểm tra nếu là tuần hiện tại
        const isCurrentWeek = dayjs().year() === year && dayjs().isoWeek() === week;
        const currentDayOfWeek = isCurrentWeek ? dayjs().format('YYYY/MM/DD') : weekEnd;
        return (
          <>
            <div>
              Dự kiến: Từ ngày {weekStart} đến {weekEnd}
            </div>
            <div>
              Hiện tại: Từ ngày {weekStart} đến {isCurrentWeek ? currentDayOfWeek : weekEnd}
            </div>
          </>
        );
      } else {
        // Chế độ xem tùy chọn (custom)
        return (
          <>
            <div>
              Dự kiến: Từ ngày {dateRange[0].format('YYYY/MM/DD')} đến {dateRange[1].format('YYYY/MM/DD')}
            </div>
            <div>
              Hiện tại: Từ ngày {dateRange[0].format('YYYY/MM/DD')} đến {dateRange[1].format('YYYY/MM/DD')}
            </div>
          </>
        );
      }
    }
    return (
      <>
        <div>
          Dự kiến: Từ ngày {periodInfo.start_date} đến {periodInfo.end_date}
        </div>
        <div>
          Hiện tại: Từ ngày {periodInfo.start_date} đến {periodInfo.end_date}
        </div>
      </>
    );
  };

  return (
    <div className="p-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {data?.meta && (
          <>
            <Select
              value={selectedDepartment}
              onChange={(value) => {
                setSelectedDepartment(value);
              }}
              style={{width: 220}}
              options={departmentsOptions}
              placeholder="Chọn phòng ban"
              showSearch
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            />

            <Select
              value={selectedEmployee}
              onChange={(value) => {
                setSelectedEmployee(value);
              }}
              style={{width: 220}}
              options={employeesOptions}
              placeholder="Chọn nhân viên"
              showSearch
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            />
          </>
        )}

        {viewMode === 'week' && (
          <div className="flex items-center gap-1">
            <Select value={week} onChange={(value) => setWeek(value)} className="w-[120px]" options={dataWeeks} />
          </div>
        )}

        {viewMode === 'month' && (
          <DatePicker
            value={dayjs(`${year}-${month.toString().padStart(2, '0')}`)}
            onChange={handleMonthChange}
            format="YYYY-MM"
            picker="month"
            allowClear={false}
          />
        )}

        {viewMode === 'custom' && (
          <DatePicker.RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="YYYY-MM-DD"
            allowClear={false}
          />
        )}

        <div className="flex overflow-hidden border rounded">
          <Button
            type={viewMode === 'week' ? 'primary' : 'default'}
            onClick={() => handleViewChange('week')}
            className={cn('border-none rounded-none', viewMode === 'week' ? 'bg-blue-600' : '')}
          >
            Tuần
          </Button>
          <Button
            type={viewMode === 'month' ? 'primary' : 'default'}
            onClick={() => handleViewChange('month')}
            className={cn('border-none rounded-none', viewMode === 'month' ? 'bg-blue-600' : '')}
          >
            Tháng
          </Button>
          <Button
            type={viewMode === 'custom' ? 'primary' : 'default'}
            onClick={() => handleViewChange('custom')}
            className={cn('border-none rounded-none', viewMode === 'custom' ? 'bg-blue-600' : '')}
          >
            Tuỳ chỉnh
          </Button>
        </div>

        {data?.meta && (
          <Checkbox
            onChange={(e) => {
              setShowLateViolations(e.target.checked);
            }}
          >
            Vi phạm đi muộn
          </Checkbox>
        )}

        <Button
          type="primary"
          className="bg-purple-700"
          onClick={handleExport}
          loading={isExporting}
          disabled={isExporting}
        >
          Xuất báo cáo
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center pt-52">
          <LoadingGlobal />
        </div>
      )}

      {!isLoading && (
        <>
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border rounded shadow-sm">
              <div className="text-lg font-semibold">Thời gian thống kê</div>
              <div className="flex flex-col justify-between mt-3 md:flex-row">
                <div className="w-full">{renderTimeRange()}</div>
              </div>
            </div>

            {user?.roles.name !== 'Admin' && (
              <div className="p-4 border rounded shadow-sm">
                <div className="text-lg font-semibold">Công chuẩn</div>
                <div className="flex justify-between mt-3">
                  <div>
                    <div>Chuẩn tháng</div>
                    <div>Thực tế</div>
                  </div>
                  <div>
                    <div className="font-bold">{data?.data?.cong_chuan_thang || 0}</div>
                    <div className="font-bold">
                      {data?.meta ? data?.data?.cong_thuc_te : data?.data?.timekeeping[0]?.cong_thuc_te || 0}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* <div className="p-4 border rounded shadow-sm">
              <div className="text-lg font-semibold">Công nghỉ theo công ty</div>
              <div className="mt-3">{data?.data?.cong_nghi_theo_cong_ty || 0} công</div>
            </div>

            <div className="p-4 border rounded shadow-sm">
              <div className="text-lg font-semibold">Công làm bù theo công ty</div>
              <div className="mt-3">{data?.data?.cong_lam_bu_theo_cong_ty || 0} công</div>
            </div> */}
          </div>

          {/* Data Table */}
          <div className="w-full overflow-x-auto">
            <table className="min-w-full border border-separate border-gray-300 rounded-lg border-spacing">
              <thead>
                <tr className="bg-[#0092ff] text-white">
                  <th className="p-2 text-center border border-gray-300" rowSpan={2}>
                    Họ tên
                  </th>
                  <th className="p-2 text-center border border-gray-300" rowSpan={2}>
                    Ngày làm việc chính thức
                  </th>
                  <th className="p-2 text-center border border-gray-300" rowSpan={2}>
                    Số ngày đã làm việc chính thức
                  </th>
                  <th className="p-2 text-center border border-gray-300" colSpan={2}>
                    Đi muộn
                  </th>
                  <th className="p-2 text-center border border-gray-300" colSpan={2}>
                    Về sớm
                  </th>
                  <th className="p-2 text-center border border-gray-300" rowSpan={2}>
                    Tổng số giờ
                  </th>
                  <th className="p-2 text-center border border-gray-300" rowSpan={2}>
                    Công thực tế
                  </th>
                  <th className="p-2 text-center border border-gray-300" rowSpan={2}>
                    Công đăng ký làm thêm
                  </th>
                  <th className="p-2 text-center border border-gray-300" rowSpan={2}>
                    Nghỉ phép có lương
                  </th>
                  <th className="p-2 text-center border border-gray-300" rowSpan={2}>
                    Nghỉ phép không lương
                  </th>
                  <th className="p-2 text-center border border-gray-300" rowSpan={2}>
                    Đi công tác
                  </th>
                  <th className="p-2 text-center border border-gray-300" rowSpan={2}>
                    Công nghỉ toàn cty
                  </th>
                  <th className="p-2 text-center border border-gray-300" rowSpan={2}>
                    Công tính lương
                  </th>
                  <th className="p-2 text-center border border-gray-300" rowSpan={2}>
                    Tỉ lệ đi muộn
                  </th>
                </tr>
                <tr className="bg-[#0092ff] text-white">
                  {/* Đi muộn */}
                  <th className="p-2 text-center border border-gray-300">Không đơn</th>
                  <th className="p-2 text-center border border-gray-300">Có đơn</th>
                  {/* Về sớm */}
                  <th className="p-2 text-center border border-gray-300">Không đơn</th>
                  <th className="p-2 text-center border border-gray-300">Có đơn</th>
                  {/* <th className="p-2 text-center border border-gray-300">Thời gian</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredTimekeeping.length === 1 && (
                  <tr className="bg-white">
                    <td className="p-2 font-bold border border-gray-300">Total</td>
                    <td className="p-2 border border-gray-300"></td>
                    <td className="p-2 text-center border border-gray-300">
                      {user?.roles.name !== 'Admin'
                        ? filteredTimekeeping?.reduce((acc, row) => acc + row.so_ngay_lam_viec, 0) || 0
                        : undefined}
                    </td>
                    <td className="p-2 text-center border border-gray-300">
                      {filteredTimekeeping?.reduce((acc, row) => acc + row.di_muon.khong_don, 0) || 0}
                    </td>
                    <td className="p-2 text-center border border-gray-300">
                      {filteredTimekeeping?.reduce((acc, row) => acc + row.di_muon.co_don, 0) || 0}
                    </td>
                    <td className="p-2 text-center border border-gray-300">
                      {filteredTimekeeping?.reduce((acc, row) => acc + row.ve_som.khong_don, 0) || 0}
                    </td>
                    <td className="p-2 text-center border border-gray-300">
                      {filteredTimekeeping?.reduce((acc, row) => acc + row.ve_som.co_don, 0) || 0}
                    </td>
                    {/* <td className="p-2 text-center border border-gray-300">
                      {filteredTimekeeping?.reduce((acc, row) => acc + row.ve_som.thoi_gian, 0) || 0}
                    </td> */}
                    <td className="p-2 text-center border border-gray-300">
                      {filteredTimekeeping?.reduce((acc, row) => acc + row.tong_gio_lam, 0).toFixed(2) || 0}
                    </td>
                    <td className="p-2 text-center border border-gray-300">
                      {filteredTimekeeping?.reduce((acc, row) => acc + row.cong_thuc_te, 0).toFixed(2) || 0}
                    </td>
                    <td className="p-2 text-center border border-gray-300">
                      {filteredTimekeeping?.reduce(
                        (acc, row) => acc + row.cong_lam_them + row.cong_lam_them_trong_ngay_le,
                        0,
                      ) || 0}
                    </td>
                    <td className="p-2 text-center border border-gray-300">
                      {filteredTimekeeping?.reduce((acc, row) => acc + row.nghi_phep_co_luong, 0) || 0}
                    </td>
                    <td className="p-2 text-center border border-gray-300">
                      {filteredTimekeeping?.reduce((acc, row) => acc + row.nghi_phep_khong_luong, 0) || 0}
                    </td>
                    <td className="p-2 text-center border border-gray-300">
                      {filteredTimekeeping?.reduce((acc, row) => acc + row.so_ngay_cong_tac, 0) || 0}
                    </td>
                    <td className="p-2 text-center border border-gray-300">
                      {filteredTimekeeping?.[0]?.so_ngay_nghi_le || 0}
                    </td>
                    <td className="p-2 text-center border border-gray-300">
                      {filteredTimekeeping?.reduce((acc, row) => acc + row.cong_tinh_luong, 0).toFixed(2) || 0}
                    </td>
                    <td className="p-2 text-center border border-gray-300">
                      {filteredTimekeeping?.reduce((acc, row) => acc + row.ti_le_di_muon, 0) || 0}%
                    </td>
                  </tr>
                )}
                {filteredTimekeeping?.map((row) => (
                  <tr key={row.employee_id} className="bg-white">
                    <td className="p-2 font-semibold border border-gray-300">{row.name}</td>
                    <td className="p-2 text-center border border-gray-300">
                      {dayjs(row.ngay_bat_dau_lam).format('DD-MM-YYYY')}
                    </td>
                    <td className="p-2 text-center border border-gray-300">
                      {convertDaysToHumanReadable(row.so_ngay_lam_viec)}
                    </td>
                    <td className="p-2 text-center border border-gray-300">{row.di_muon.khong_don}</td>
                    <td className="p-2 text-center border border-gray-300">{row.di_muon.co_don}</td>
                    <td className="p-2 text-center border border-gray-300">{row.ve_som.khong_don}</td>
                    <td className="p-2 text-center border border-gray-300">{row.ve_som.co_don}</td>
                    {/* <td className="p-2 text-center border border-gray-300">{row.ve_som.thoi_gian}</td> */}
                    <td className="p-2 text-center border border-gray-300">{row.tong_gio_lam}</td>
                    <td className="p-2 text-center border border-gray-300">{row.cong_thuc_te}</td>
                    <td className="p-2 text-center border border-gray-300">
                      {row.cong_lam_them + row.cong_lam_them_trong_ngay_le}
                    </td>
                    <td className="p-2 text-center border border-gray-300">{row.nghi_phep_co_luong}</td>
                    <td className="p-2 text-center border border-gray-300">{row.nghi_phep_khong_luong}</td>
                    <td className="p-2 text-center border border-gray-300">{row.so_ngay_cong_tac}</td>
                    <td className="p-2 text-center border border-gray-300">{row.so_ngay_nghi_le}</td>
                    <td className="p-2 text-center border border-gray-300">{row.cong_tinh_luong}</td>
                    <td className="p-2 text-center border border-gray-300">{row.ti_le_di_muon}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data?.meta && (
            <div className="flex justify-end mt-4">
              <Pagination
                current={params.page}
                pageSize={params.limit}
                total={data?.meta?.totalItems || 0}
                showTotal={(total) => <span className="font-medium">Tổng {total} bản ghi</span>}
                onChange={(page, pageSize) => handleChangePagination({current: page, pageSize})}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
