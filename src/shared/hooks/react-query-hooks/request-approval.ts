import axiosCustom from '@/shared/configs/axios.config';
import {QUERY_KEYS} from '@/shared/constants/query-key';
import {ApiResponse, ApiResponseWithMeta, IQueryParamsDefault} from '@/shared/types';
import {IGetPendingApprovalsRes} from '@/shared/types/request-approval.type';
import {useMutation, useQuery, UseQueryResult} from '@tanstack/react-query';
import {toast} from 'react-toastify';

const useGetPendingApprovals = (params: {
  employeeId?: number;
  type: 'user_create' | 'user_approval';
}): UseQueryResult<ApiResponse<IGetPendingApprovalsRes[]>, Error> => {
  const {type, ...otherParams} = params;
  return useQuery({
    queryKey: [QUERY_KEYS.GET_PENDING_APPOVALS, otherParams],
    queryFn: async () => {
      const fetchdata = await axiosCustom.get('/approver-list/pending', {params: otherParams});
      return fetchdata.data;
    },
    enabled: !!params.employeeId && params.type === 'user_approval',
  });
};

const useGetApprovedRequests = (
  params: IQueryParamsDefault,
  options?: any,
): UseQueryResult<ApiResponseWithMeta<IGetPendingApprovalsRes[]>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_APPROVED_REQUESTS, params],
    queryFn: async () => {
      const fetchdata = await axiosCustom.get('/approver-list/approved', {params});
      return fetchdata.data;
    },
    ...options,
  });
};

const useApproveRequest = () => {
  return useMutation({
    mutationFn: async (data: {approverId: number; employeeId: number; requestEmployeeId: number}) => {
      const fetchdata = await axiosCustom.post('/approver-list/approve', data);
      return fetchdata.data;
    },
    onSuccess: () => {
      toast.success('Duyệt yêu cầu thành công');
    },
  });
};

const useCountPendingApproveRequest = (): UseQueryResult<ApiResponseWithMeta<{count: number}>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_COUNT_PENDING_APPROVE_REQUEST],
    queryFn: async () => {
      const fetchdata = await axiosCustom.get('/approver-list/pending-count');
      return fetchdata.data;
    },
  });
};

export {useApproveRequest, useCountPendingApproveRequest, useGetApprovedRequests, useGetPendingApprovals};
