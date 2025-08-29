import axiosCustom from '@/shared/configs/axios.config';
import {QUERY_KEYS} from '@/shared/constants/query-key';
import {ApiResponseWithMeta, IQueryParamsDefault} from '@/shared/types';
import {IGetRequestReferencesByUserRes} from '@/shared/types/request-references.type';
import {useMutation, useQuery, UseQueryResult} from '@tanstack/react-query';

const useGetRequestReferencesByUser = (
  params: IQueryParamsDefault,
  options?: any,
): UseQueryResult<ApiResponseWithMeta<IGetRequestReferencesByUserRes[]>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_REQUEST_REFERENCES_BY_USER, params],
    queryFn: async () => {
      const fetchdata = await axiosCustom.get('/request-references', {params});
      return fetchdata.data;
    },
    ...options,
  });
};

const useMarkReferenceAsSeen = () => {
  return useMutation({
    mutationFn: async (params: {referenceId: number; employeeId: number}) => {
      const response = await axiosCustom.put(`/request-references/${params.referenceId}/mark-seen`, {
        employeeId: params.employeeId,
      });
      return response.data;
    },
  });
};

const useGetRequestReferenceUnseenCount = (): UseQueryResult<ApiResponseWithMeta<{count: number}>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_UNSEEN_COUNT_REQ_REF],
    queryFn: async () => {
      const fetchdata = await axiosCustom.get('/request-references/unseen-count');
      return fetchdata.data;
    },
  });
};

export {useGetRequestReferencesByUser, useGetRequestReferenceUnseenCount, useMarkReferenceAsSeen};
