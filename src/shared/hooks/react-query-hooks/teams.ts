import axiosCustom from '@/shared/configs/axios.config';
import {QUERY_KEYS} from '@/shared/constants/query-key';
import {ApiResponse} from '@/shared/types';
import {useQuery, UseQueryResult} from '@tanstack/react-query';

export interface ITeamRes {
  _id: string;
  name: string;
  departId: string;
  employeeId: string | null;
}

const useGetTeams = (): UseQueryResult<ApiResponse<ITeamRes[]>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_TEAMS],
    queryFn: async () => {
      const fetchdata = await axiosCustom.get('/teams');
      return fetchdata.data;
    },
  });
};

export {useGetTeams};
