import axiosCustom from '@/shared/configs/axios.config';
import {QUERY_KEYS} from '@/shared/constants/query-key';
import {ApiResponseWithMeta} from '@/shared/types';
import {useQuery, UseQueryResult} from '@tanstack/react-query';

const useGetAllMenus = (): UseQueryResult<ApiResponseWithMeta<any[]>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_MENUS],
    queryFn: async () => {
      const fetchdata = await axiosCustom.get('/menus');
      return fetchdata.data;
    },
  });
};

export {useGetAllMenus};
