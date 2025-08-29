import axiosCustom from '@/shared/configs/axios.config';
import {QUERY_KEYS} from '@/shared/constants/query-key';
import {ApiResponseWithMeta} from '@/shared/types';
import {IDepartmentParams, IDepartmentRes} from '@/shared/types/department.type';
import {useQuery, UseQueryResult} from '@tanstack/react-query';

const useGetDepartments = (
  params: IDepartmentParams,
  options?: any,
): UseQueryResult<ApiResponseWithMeta<IDepartmentRes[]>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ALL_DEPARTMENT, params],
    queryFn: async () => {
      const fetchdata = await axiosCustom.get('/departments', {params});
      return fetchdata.data;
    },
    ...options,
  });
};

export {useGetDepartments};
