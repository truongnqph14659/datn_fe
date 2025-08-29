import axiosCustom from '@/shared/configs/axios.config';
import {QUERY_KEYS} from '@/shared/constants/query-key';
import {ApiResponse} from '@/shared/types';
import {RequestType} from '@/shared/types/request.type';
import {useQuery, UseQueryResult} from '@tanstack/react-query';

const useGetAllRequest = (): UseQueryResult<ApiResponse<RequestType[]>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ALL_REQUESTS],
    queryFn: async () => {
      const fetchdata = await axiosCustom.get('/requests');
      return fetchdata.data;
    },
  });
};

export {useGetAllRequest};
