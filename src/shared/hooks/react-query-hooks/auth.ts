import {LoginData} from '@/modules/login/form-config';
import axiosCustom from '@/shared/configs/axios.config';
import {QUERY_KEYS} from '@/shared/constants/query-key';
import {ApiResponse} from '@/shared/types';
import {IAuthRes} from '@/shared/types/auth.type';
import {IEmployeeRes} from '@/shared/types/employee.type';
import {useMutation, UseMutationResult, useQuery, UseQueryResult} from '@tanstack/react-query';
import {toast} from 'react-toastify';

const useLogin = (): UseMutationResult<ApiResponse<IAuthRes>, Error, LoginData> => {
  return useMutation({
    mutationFn: async (data: LoginData) => {
      const fetchData = await axiosCustom.post('/auth/login', data);
      return fetchData.data;
    },
    onSuccess: () => {
      toast.success('Đăng nhập thành công');
    },
  });
};

const useGetProfile = (): UseQueryResult<ApiResponse<IEmployeeRes>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_PROFILE],
    queryFn: async () => {
      const fetchData = await axiosCustom.get('/auth/profile');
      return fetchData.data;
    },
  });
};

export {useLogin, useGetProfile};
