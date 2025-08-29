import axiosCustom from '@/shared/configs/axios.config';
import {QUERY_KEYS} from '@/shared/constants/query-key';
import {ApiResponse, ApiResponseWithMeta} from '@/shared/types';
import {
  ICreateUpdateEmployeeRes,
  IEmployeeParams,
  IEmployeeRes,
  IGetOrganizationChartRes,
  IUpdateEmployeeWorkScheduleInput,
} from '@/shared/types/employee.type';
import {useMutation, UseMutationResult, useQuery, UseQueryResult} from '@tanstack/react-query';
import {toast} from 'react-toastify';

const useGetEmployees = (
  params: IEmployeeParams,
  options?: any,
): UseQueryResult<ApiResponseWithMeta<IEmployeeRes[]>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_EMPLOYEES, params],
    queryFn: async () => {
      const fetchdata = await axiosCustom.get('/employee', {params});
      const handleData = fetchdata.data.data.map((employees: IEmployeeRes) => ({...employees, key: employees._id}));
      return {...fetchdata.data, data: handleData};
    },
    ...options,
  });
};

const useGetEmployeeById = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_EMPLOYEES, id],
    queryFn: async () => {
      const fetchdata = await axiosCustom.get(`/employee/${id}`);
      return fetchdata.data;
    },
    enabled: !!id,
  });
};

const useCreateEmployee = (): UseMutationResult<ICreateUpdateEmployeeRes, Error, any> => {
  return useMutation({
    mutationFn: async (data: any) => {
      const fetchdata = await axiosCustom.post('/employee', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return fetchdata.data;
    },
  });
};

const useUpdateEmployee = (): UseMutationResult<ICreateUpdateEmployeeRes, Error, any> => {
  return useMutation({
    mutationFn: async (data) => {
      const fetchdata = await axiosCustom.post(`/employee/update-emp`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return fetchdata.data;
    },
    onSuccess: () => {
      toast.success('Cập nhật nhân viên thành công');
    },
  });
};

const useDeleteEmployee = (): UseMutationResult<void, Error, number> => {
  return useMutation({
    mutationFn: async (id: number) => {
      const fetchdata = await axiosCustom.delete(`/employee/${id}`);
      return fetchdata.data;
    },
    onSuccess: () => {
      toast.success('Xóa nhân viên thành công');
    },
  });
};

const useGetOrganizationChart = (): UseQueryResult<ApiResponse<IGetOrganizationChartRes[]>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ORGANIZATION_CHART],
    queryFn: async () => {
      const fetchdata = await axiosCustom.get('/employee/organization-chart');
      return fetchdata.data;
    },
  });
};

const useGetEmployeesSchedule = (
  params: IEmployeeParams,
  options?: any,
): UseQueryResult<ApiResponseWithMeta<IEmployeeRes[]>, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_EMPLOYEES_SCHEDULE, params],
    queryFn: async () => {
      const fetchdata = await axiosCustom.get('/employee-schedule', {params});
      const handleData = fetchdata.data.data.map((employees: IEmployeeRes) => ({...employees, key: employees._id}));
      return {...fetchdata.data, data: handleData};
    },
    ...options,
  });
};

const useUpdateEmployeeWorkSchedule = (): UseMutationResult<
  ICreateUpdateEmployeeRes,
  Error,
  IUpdateEmployeeWorkScheduleInput
> => {
  return useMutation({
    mutationFn: async (formData) => {
      const fetchdata = await axiosCustom.post('/employee/schedule', formData);
      return fetchdata.data;
    },
  });
};

const useExportExcelEmployeeWorkSchedule = (params: any, options = {}): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.EXPORT_EXCEL_WORK_SCHEDULE, params],
    queryFn: async () => {
      const response = await axiosCustom.get('/work-schedules/export-excel', {
        params,
        responseType: 'blob',
      });
      return response.data;
    },
    ...options,
  });
};

export {
  useCreateEmployee,
  useDeleteEmployee,
  useGetEmployeeById,
  useGetEmployees,
  useGetOrganizationChart,
  useUpdateEmployee,
  useGetEmployeesSchedule,
  useUpdateEmployeeWorkSchedule,
  useExportExcelEmployeeWorkSchedule,
};
