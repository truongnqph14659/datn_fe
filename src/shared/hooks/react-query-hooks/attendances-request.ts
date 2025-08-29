import axiosCustom from '@/shared/configs/axios.config';
import {QUERY_KEYS} from '@/shared/constants/query-key';
import {ApiResponse} from '@/shared/types';
import {IGetAttendanceDetailRes} from '@/shared/types/attendance.type';
import {useQuery, UseQueryResult} from '@tanstack/react-query';

const useGetAttendanceReqByAttendanceID = (
  attendanceId: number,
): UseQueryResult<ApiResponse<IGetAttendanceDetailRes>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ATTENDANCE_REQUEST_BY_ATTENDANCE_ID, attendanceId],
    queryFn: async () => {
      const fetchdata = await axiosCustom.get(`/attendances-requests/${attendanceId}`);
      return fetchdata.data;
    },
    enabled: !!attendanceId,
    retry: false,
  });
};

export {useGetAttendanceReqByAttendanceID};
