import {LoginData} from '@/modules/login/form-config';
import {IEmployeeRes} from '@/shared/types/employee.type';

export interface IRoleParams {
  page?: number;
  limit?: number;
  disablePagination?: boolean;
  search?: string;
  searchFields?: string[];
}

export interface IAuthRes {
  user: IEmployeeRes;
  access_token: string;
}

export type ILoginDataRes = LoginData;
