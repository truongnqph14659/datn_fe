import {HINH_THUC_NGHI_PHEP, LOAI_NGHI_PHEP} from '@/shared/constants';
import {DayInfo} from '@/shared/types';
import {useAuthStore} from '@/store/authStore';
import {type ClassValue, clsx} from 'clsx';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import {twMerge} from 'tailwind-merge';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getWeekFromDate = (date: Date) => {
  return dayjs(date).isoWeek();
};

export const formatFieldName = (name: string) => {
  switch (name) {
    case HINH_THUC_NGHI_PHEP.BUOI_CHIEU:
      return 'Buổi chiều';
    case HINH_THUC_NGHI_PHEP.BUOI_SANG:
      return 'Buổi sáng';
    case HINH_THUC_NGHI_PHEP.MOT_NGAY:
      return 'Một ngày';
    case HINH_THUC_NGHI_PHEP.NHIEU_NGAY:
      return 'Nhiều ngày';
    case LOAI_NGHI_PHEP.CO_LUONG:
      return 'Có lương';
    case LOAI_NGHI_PHEP.KHONG_LUONG:
      return 'Không lương';
    case 'DI_MUON':
      return 'Đi muộn';
    case 'VE_SOM':
      return 'Về sớm';
    default:
      return 'Không xác định';
  }
};

export function isWeekend(date: dayjs.Dayjs): boolean {
  return [0, 6].includes(date.day());
}

export function generateWeekDays(week: number, year: number): DayInfo[] {
  return Array.from({length: 7}, (_, i) => {
    const startOfWeek = dayjs().year(year).isoWeek(week).startOf('isoWeek');
    const date = startOfWeek.add(i, 'day');
    const status = isWeekend(date) ? 'off' : 'work';
    return {
      date: date.format('DD/MM'),
      day: date.format('ddd'),
      status,
      work_date: date.format('YYYY-MM-DD'),
    };
  });
}

export const isDateInRange = (workDate: string, fromDate: string, toDate: string) =>
  dayjs(workDate).isSameOrAfter(dayjs(fromDate), 'day') && dayjs(workDate).isSameOrBefore(dayjs(toDate), 'day');

export const isDateEqual = (date1: string, date2: string) => dayjs(date1).isSame(dayjs(date2), 'day');

export function convertDaysToHumanReadable(days: number): string {
  let years = Math.floor(days / 365);
  const remainingDaysAfterYears = days % 365;
  const approxDaysInMonth = 365 / 12;
  let months = Math.floor(remainingDaysAfterYears / approxDaysInMonth);
  let remainingDays = Math.round(remainingDaysAfterYears % approxDaysInMonth);
  if (months >= 12) {
    years += Math.floor(months / 12);
    months = months % 12;
  }
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} năm`);
  if (months > 0) parts.push(`${months} tháng`);
  if (remainingDays > 0 || parts.length === 0) parts.push(`${remainingDays} ngày`);
  return parts.join(' ');
}

export function verifyDetailPermission(route: string): Boolean {
  const {user} = useAuthStore();
  const menuItem = user?.roles.acls?.find((acl) => acl.menu?.route === route);
  if (menuItem?.isView && menuItem?.isEdit) return true;
  return false;
}
