import ModalDetailTimekeeping from '@/modules/timekeeping/components/ModalDetailTimekeeping';
import TimekeepingTable from '@/modules/timekeeping/components/TimekeepingTable';
import {monthOptions} from '@/shared/constants';
import {useGetDepartments} from '@/shared/hooks/react-query-hooks/department';
import {useGetAllTimekeeping} from '@/shared/hooks/react-query-hooks/timekeeping';
import useSearchParams, {paramsDefaultCommon} from '@/shared/hooks/useSearchParams';
import {cn, getWeekFromDate} from '@/shared/utils';
import {useAuthStore} from '@/store/authStore';
import {Card, Pagination, Select, Spin} from 'antd';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';
import {useEffect, useMemo, useState} from 'react';

dayjs.extend(utc);
dayjs.extend(isoWeek);
export const MODAL_DETAIL_TIMEKEEPING = 'modalDetailTimekeeping';

const TimekeepingManagement = () => {
  const user = useAuthStore((s) => s.user);
  const date = new Date();
  const [month, setMonth] = useState<number>(date.getMonth() + 1);
  const [year, setYear] = useState<number>(date.getFullYear());
  const [week, setWeek] = useState<number>(getWeekFromDate(new Date(year, month - 1, 1)));
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [isModalVisible, setIsModalVisible] = useState<string>('');
  const {params, handleChangePagination, handleSearch, setPage} = useSearchParams(paramsDefaultCommon);

  const filterOptions = {
    ...params,
    filter: viewMode === 'month' ? {month: month, year: year} : {week: week, year: year},
    employeeId: user?._id,
  };
  const {data: attendances, isFetching} = useGetAllTimekeeping(filterOptions);
  const {data: departmentsData} = useGetDepartments({disablePagination: true});
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

  useEffect(() => {
    if (viewMode === 'week') {
      const firstDayOfMonth = new Date(year, month - 1, 1);
      const firstWeekOfMonth = getWeekFromDate(firstDayOfMonth);
      if (firstWeekOfMonth !== week) {
        setWeek(firstWeekOfMonth);
      }
    }
  }, [month, year, viewMode]);

  const dataYear = () => {
    const year = [];
    for (let i = 2022; i <= date.getFullYear(); i++) {
      year.push({label: i.toString(), value: i});
    }
    return year;
  };

  const dataWeeks = useMemo(() => {
    // Đảm bảo month được sử dụng đúng (0-11)
    const firstDayOfMonth = dayjs(new Date(year, month - 1, 1));
    const lastDayOfMonth = firstDayOfMonth.endOf('month');
    let weeks = [];
    let currentDate = firstDayOfMonth;
    const seenWeeks = new Set(); // Để tránh thêm tuần trùng lặp
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

  return (
    <>
      <Card>
        <div className="flex justify-between">
          {/* FILTER */}
          <div className="flex items-center gap-7">
            <div className="flex items-center gap-2">
              {user?.roles.name === 'Admin' && (
                <div className="flex items-center gap-1">
                  <span>Phòng Ban: </span>
                  <Select
                    allowClear
                    showSearch
                    style={{width: 200}}
                    defaultValue={''}
                    options={dataDepartmentHandler}
                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                    onChange={(value) => {
                      handleSearch([value]);
                    }}
                  />
                </div>
              )}
              {viewMode === 'week' && (
                <div className="flex items-center gap-1">
                  <span>Tuần: </span>
                  <Select value={week} onChange={(value) => setWeek(value)} className="w-[120px]" options={dataWeeks} />
                </div>
              )}

              <div className="flex items-center gap-1">
                <span>Tháng: </span>
                <Select
                  defaultValue={month}
                  onChange={(value) => {
                    setMonth(value);
                    setPage(1);
                  }}
                  className="w-[80px]"
                  options={monthOptions}
                />
              </div>
              <div className="flex items-center gap-1">
                <span>Năm: </span>
                <Select
                  defaultValue={year}
                  onChange={(value) => {
                    setYear(value);
                    setPage(1);
                  }}
                  className="w-[100px]"
                  options={dataYear()}
                />
              </div>
            </div>
            <div className="flex items-center overflow-hidden border border-gray-300 rounded-lg cursor-pointer">
              <p
                className={cn(
                  'px-4 py-1.5 transition-all',
                  viewMode === 'week' ? 'text-white bg-blue-600' : 'hover:text-blue-600 hover:bg-gray-200',
                )}
                onClick={() => setViewMode('week')}
              >
                Tuần
              </p>
              <p
                className={cn(
                  'px-4 py-1.5 transition-all',
                  viewMode === 'month' ? 'text-white bg-blue-600' : 'hover:text-blue-600 hover:bg-gray-200',
                )}
                onClick={() => setViewMode('month')}
              >
                Tháng
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mt-5">
        {isFetching ? (
          <>
            <div className="flex items-center justify-center h-60">
              <Spin size="large" />
            </div>
          </>
        ) : (
          <>
            <div className="p-4 overflow-x-auto bg-white rounded-lg shadow-md">
              <TimekeepingTable
                week={week}
                year={year}
                data={attendances?.data || []}
                setIsModalVisible={setIsModalVisible}
                viewType={viewMode}
              />
            </div>

            {attendances?.meta && (
              <div className="flex justify-end mt-4">
                <Pagination
                  current={params.page}
                  pageSize={params.limit}
                  total={attendances?.meta?.totalItems || 0}
                  showTotal={(total) => <span className="font-medium">Tổng {total} bản ghi</span>}
                  onChange={(page, pageSize) => handleChangePagination({current: page, pageSize})}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {isModalVisible === MODAL_DETAIL_TIMEKEEPING && (
        <ModalDetailTimekeeping
          isModalVisible={isModalVisible === MODAL_DETAIL_TIMEKEEPING}
          toggleModal={() => setIsModalVisible('')}
        />
      )}
    </>
  );
};

export default TimekeepingManagement;
