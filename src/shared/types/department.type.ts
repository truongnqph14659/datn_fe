import {IQueryParamsDefault} from '@/shared/types';

export interface IDepartmentParams extends IQueryParamsDefault {}

export interface IDepartmentRes {
  _id: number;
  name_depart: string;
  employeeId: number | null;
  companyId: number | null;
  company: {
    _id: number;
    company_name: string;
  };
  teams: {
    _id: number;
    name: string;
  }[];
}
