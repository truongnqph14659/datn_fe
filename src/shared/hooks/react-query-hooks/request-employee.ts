import {RequestCreateSchema} from '@/modules/timekeeping/components/ModalCreateRequest/form-config';
import axiosCustom from '@/shared/configs/axios.config';
import {QUERY_KEYS} from '@/shared/constants/query-key';
import {ApiResponse, ApiResponseWithMeta, IQueryParamsDefault} from '@/shared/types';
import {IGetPendingRequestsByUserRes} from '@/shared/types/request_employee.type';
import {useMutation, UseMutationResult, useQuery, UseQueryResult} from '@tanstack/react-query';
import {toast} from 'react-toastify';

const useCreateRequestEmployee = (): UseMutationResult<
  any,
  Error,
  RequestCreateSchema & {attendance_id: number; created_request: string}
> => {
  return useMutation({
    mutationFn: async (data: RequestCreateSchema & {attendance_id: number; created_request: string}) => {
      const fetchdata = await axiosCustom.post('/request-employee', data);
      return fetchdata.data;
    },
    onSuccess: () => {
      toast.success('Tạo yêu cầu thành công');
    },
  });
};

const useGetPendingRequestsByUser = (
  params: IQueryParamsDefault,
  options?: any,
): UseQueryResult<ApiResponseWithMeta<IGetPendingRequestsByUserRes[]>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_PENDING_REQUESTS_BY_USER, params],
    queryFn: async () => {
      const fetchdata = await axiosCustom.get('/request-employee/pending', {
        params,
      });
      return fetchdata.data;
    },
    ...options,
  });
};

const useGetApprovedRequestsByUser = (
  params: IQueryParamsDefault,
  options?: any,
): UseQueryResult<ApiResponseWithMeta<IGetPendingRequestsByUserRes[]>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_APPROVED_REQUESTS_EMPLOYEE, params],
    queryFn: async () => {
      const fetchdata = await axiosCustom.get('/request-employee/approved', {
        params,
      });
      return fetchdata.data;
    },
    ...options,
  });
};

const useGetRequestEmployeeById = (
  id: number,
  options = {},
): UseQueryResult<ApiResponse<IGetPendingRequestsByUserRes>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_REQUEST_EMPLOYEE_BY_ID, id],
    queryFn: async () => {
      const fetchData = await axiosCustom.get(`/request-employee/${id}/details`);
      return fetchData.data;
    },
    enabled: !!id && id > 0,
    ...options,
  });
};

//  Hàm này dùng cho hủy yêu cầu của người tạo đơn
const useCancelRequestEmployee = () => {
  return useMutation({
    mutationFn: async (data: {requestEmpId: number; employeeId: number}) => {
      const fetchdata = await axiosCustom.post('/request-employee/cancel', data);
      return fetchdata.data;
    },
  });
};

// Hàm này dùng cho từ chối yêu cầu của người duyệt đơn
const useRejectRequestEmployee = () => {
  return useMutation({
    mutationFn: async (data: {requestEmpId: number; employeeId: number,appover_feaback:string}) => {
      const fetchdata = await axiosCustom.post('/request-employee/reject', data);
      return fetchdata.data;
    },
  });
};

const useCountPendingRequestEmployee = (): UseQueryResult<ApiResponseWithMeta<{count: number}>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_COUNT_PENDING_REQUEST_EMPLOYEE],
    queryFn: async () => {
      const fetchdata = await axiosCustom.get('/request-employee/pending-count');
      return fetchdata.data;
    },
  });
};

export {
  useCancelRequestEmployee,
  useCountPendingRequestEmployee,
  useCreateRequestEmployee,
  useGetApprovedRequestsByUser,
  useGetPendingRequestsByUser,
  useGetRequestEmployeeById,
  useRejectRequestEmployee,
};
