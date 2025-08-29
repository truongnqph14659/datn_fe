import {RoleCreateData} from '@/modules/roles/components/ModalCreateRole/form-config';
import axiosCustom from '@/shared/configs/axios.config';
import {QUERY_KEYS} from '@/shared/constants/query-key';
import {ApiResponse, ApiResponseWithMeta} from '@/shared/types';
import {IPermissionRes} from '@/shared/types/permission.type';
import {DataRolePermission, ICreateUpdateRoleRes, IRoleParams, RoleWithPermissionData} from '@/shared/types/role.type';
import {
  QueryClient,
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import {toast} from 'react-toastify';

export interface IRoleRes {
  _id: number;
  name: string;
  desc: string;
  role_permissions_id?: number[];
  role_permissions?: IPermissionRes[];
}

const useGetRoles = (params: IRoleParams): UseQueryResult<ApiResponseWithMeta<IRoleRes[]>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ROLES, params],
    queryFn: async () => {
      const fetchData = await axiosCustom.get('/roles', {params});
      return fetchData.data;
    },
  });
};

const useGetRoleById = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_EMPLOYEES, id],
    queryFn: async () => {
      const fetchData = await axiosCustom.get(`/roles/${id}`);
      return fetchData.data;
    },
    enabled: !!id,
  });
};

const useCreateRole = (): UseMutationResult<ICreateUpdateRoleRes, Error, RoleCreateData> => {
  return useMutation({
    mutationFn: async (data: RoleCreateData) => {
      const fetchData = await axiosCustom.post('/roles', data);
      return fetchData.data;
    },
    onSuccess: () => {
      toast.success('Thêm nhóm quyền thành công');
    },
  });
};

const useUpdateRole = (): UseMutationResult<ICreateUpdateRoleRes, Error, {id: number; data: RoleCreateData}> => {
  return useMutation({
    mutationFn: async ({id, data}: {id: number; data: RoleCreateData}) => {
      const fetchData = await axiosCustom.patch(`/roles/${id}`, data);
      return fetchData.data;
    },
    onSuccess: () => {
      toast.success('Cập nhật nhóm quyền thành công');
    },
  });
};

const useDeleteRole = (): UseMutationResult<void, Error, number> => {
  return useMutation({
    mutationFn: async (id: number) => {
      const fetchData = await axiosCustom.delete(`/roles/${id}`);
      return fetchData.data;
    },
    onSuccess: () => {
      toast.success('Xóa nhóm quyền thành công');
    },
  });
};

const useCreateRoleWithPermission = (): UseMutationResult<any, Error, DataRolePermission> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: DataRolePermission) => {
      const fetchData = await axiosCustom.post('/roles/create-roles', data);
      return fetchData.data;
    },
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({queryKey: [QUERY_KEYS.GET_ROLES]});
    },
    onError: (error) => {
      toast.error('lỗi');
    },
  });
};

const useEditRoleWithPermission = (): UseMutationResult<any, Error, DataRolePermission> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: DataRolePermission) => {
      const fetchData = await axiosCustom.post('/roles/edit-roles', data);
      return fetchData.data;
    },
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({queryKey: [QUERY_KEYS.GET_ROLES]});
    },
    onError: (error) => {
      toast.error('lỗi');
    },
  });
};

const useGetRolesWithPermision = (params: any): UseQueryResult<ApiResponseWithMeta<RoleWithPermissionData>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ROLES_PERMISSIONS_V2, params],
    queryFn: async () => {
      const res = await axiosCustom.get('/roles/roles-permission-v2', {params});
      return res.data;
    },
  });
};

export {
  useCreateRole,
  useDeleteRole,
  useGetRoleById,
  useGetRoles,
  useUpdateRole,
  useCreateRoleWithPermission,
  useGetRolesWithPermision,
  useEditRoleWithPermission,
};
