import {IQueryParamsDefault} from '@/shared/types';
import {IRoleRes} from '@/shared/types/role.type';

export interface IEmployeeParams extends IQueryParamsDefault {}

export interface IEmployeeRes {
  _id: number;
  name: string;
  email: string;
  address: string | null;
  id_no: string | null;
  tax_no: string | null;
  start_working: string | null;
  end_working: string | null;
  status: string | null;
  isActive: number;
  roleId: number;
  position_name: string;
  department: {
    _id: number;
    companyId: number;
    name_depart: string;
    company: {
    _id: number;
    company_name: string;
  };
  };
  company: {
    _id: number;
    company_name: string;
  };
  roles: IRoleRes;
  contract: any;
  workScheduled: any;
  images: any;
  message?: string;
}

export interface IGetOrganizationChartRes {
  id_depart: number;
  name_depart: string;
  children: {
    _id: number;
    name: string;
    email: string;
    position_name: string;
    company: {
      _id: number;
      company_name: string;
    };
  }[];
}

export interface IUpdateEmployeeWorkScheduleInput {
  workScheduleId?: string;
  employeeId?: number;
  time_working?: string;
  breakTime?: number;
  data?: Array<any>;
  type: string;
}

export type ICreateUpdateEmployeeRes = Omit<IEmployeeRes, 'team' | 'department' | 'company'>;

// export type NewEmployeeData = Omit<EmployeeCreateData, 'id_no'> & {id_no: number | null};
