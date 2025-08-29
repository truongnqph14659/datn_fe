import axiosCustom from '@/shared/configs/axios.config';
import {QUERY_KEYS} from '@/shared/constants/query-key';
import {ApiResponseWithMeta} from '@/shared/types';
import {
  IAttendanceParams,
  IAttendanceRes,
  ITimekeepingStatistics,
  ITimekeepingStatisticsParams,
} from '@/shared/types/attendance.type';
import {useQuery, UseQueryResult} from '@tanstack/react-query';

const useGetAllTimekeeping = (
  params: IAttendanceParams,
): UseQueryResult<ApiResponseWithMeta<IAttendanceRes[]>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ALL_TIMEKEEPING, params],
    queryFn: async () => {
      const fetchdata = await axiosCustom.get('/attendances', {params});
      return fetchdata.data;
    },
  });
};

const useGetTimekeepingStatistics = (
  params: ITimekeepingStatisticsParams,
): UseQueryResult<ApiResponseWithMeta<ITimekeepingStatistics>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_TIMEKEEPING_STATISTICS, params],
    queryFn: async () => {
      const fetchdata = await axiosCustom.get('/attendances/timekeeping', {params});
      return fetchdata.data;
    },
  });
};

const useExportExcelTimekeeping = (params: IAttendanceParams, options = {}): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.EXPORT_EXCEL_TIMEKEEPING, params],
    queryFn: async () => {
      const response = await axiosCustom.get('/attendances/export-excel', {
        params,
        responseType: 'blob', // Quan trọng để nhận file blob
      });
      return response.data;
    },
    ...options,
  });
};

export {useExportExcelTimekeeping, useGetAllTimekeeping, useGetTimekeepingStatistics};
