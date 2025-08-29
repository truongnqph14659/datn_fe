import axiosCustom from '@/shared/configs/axios.config';
import {QUERY_KEYS} from '@/shared/constants/query-key';
import {ApiResponseWithMeta} from '@/shared/types';
import {ICreateUpdatePermissionRes, IPermissionParams, IPermissionRes} from '@/shared/types/permission.type';
import {useMutation, UseMutationResult, useQuery, UseQueryResult} from '@tanstack/react-query';
import {toast} from 'react-toastify';

const useGetPermission = (params: IPermissionParams): UseQueryResult<ApiResponseWithMeta<IPermissionRes[]>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ROLES_PERMISSIONS, params],
    queryFn: async () => {
      const fetchData = await axiosCustom.get('/roles-permissions', {params});
      return fetchData.data;
    },
  });
};

const useGetPermissionById = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_EMPLOYEES, id],
    queryFn: async () => {
      const fetchData = await axiosCustom.get(`/roles-permissions/${id}`);
      return fetchData.data;
    },
    enabled: !!id,
  });
};

const useDeletePermission = (): UseMutationResult<void, Error, number> => {
  return useMutation({
    mutationFn: async (id: number) => {
      const fetchData = await axiosCustom.delete(`/roles-permissions/${id}`);
      return fetchData.data;
    },
    onSuccess: () => {
      toast.success('Xóa quyền thành công');
    },
  });
};

export {useDeletePermission, useGetPermissionById, useGetPermission};
