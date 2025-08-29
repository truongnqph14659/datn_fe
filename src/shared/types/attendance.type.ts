import {IQueryParamsDefault} from '@/shared/types';

export interface IAttendanceParams extends IQueryParamsDefault {
  filter?: {month?: number; year?: number; week?: number};
  employeeId?: number;
}

export interface ITimekeepingStatisticsParams extends IQueryParamsDefault {
  filter?: {month?: number; year?: number; week?: number; startDate?: string; endDate?: string};
  employeeId?: number;
}

export interface ITimekeeping {
  attendance_id: number | null;

  checkin: string;
  checkout: string;
  checkin_image: string | null;
  checkout_image: string | null;

  employee_req_id: number | null;
  holiday_name: string | null;
  is_penalty: 1 | 0;
  is_holiday: boolean;

  overtime: number;
  total_hours: number;
  total_request_hours: number;
  work_date: string;
  work_completion: number; // % hoàn thành công việc

  early_arrival: number; // số phút đi làm sớm
  early_departure: number; // số phút về sớm
  late_arrival: number; // số phút đi làm muộn
  late_departure: number; // số phút về muộn

  is_completed: boolean; // đã hoàn thành công việc hay chưa

  approved_requests_details:
    | {
        code: string;
        desc: string | null;
        employee_id: number;
        fields: Record<string, any>;
        finalStatusAproval: number;
        name: string;
        request_id: number;
        _id: number;
      }[]
    | null;
  check_in_out_list:
    | {
        _id: number;
        type: string;
        url_image: string;
        position_name: string;
        date_time: string;
        name: string;
      }[]
    | null;
}

interface IWorkSchedule {
  shift_end: string;
  shift_start: string;
  break_time: number;
  work_type_id: number;
  expected_hours: string;
}

export interface IAttendanceRes {
  _id: number;
  name: string;
  email: string;
  employeeId: number;
  timekeeping: ITimekeeping[];
  work_schedule: IWorkSchedule;
}

export interface IAttendanceRequestRes {
  _id: number;
  employee_id: number;
  final_status_aproval: number | null;
  request_code: string;
  request_name: string;
  request_id: number;
  fields: Record<string, any>;
}
export interface ICheckinoutDetail {
  earliest_checkin: string | null;
  latest_checkout: string | null;
}
export interface IGetAttendanceDetailRes {
  check_inout_detail: ICheckinoutDetail;
  employee: {
    _id: number;
    name: string;
    email: string;
  };
  requests: IAttendanceRequestRes[];
  work_schedule: IWorkSchedule & {
    employeeId: number;
    _id: number;
  };
}

export interface ITimekeepingStatistics {
  timekeeping: {
    employee_id: number;
    name: string;
    ngay_bat_dau_lam: string;
    so_ngay_lam_viec: number;
    so_ngay_lam_viec_co_cham_cong: number;
    di_muon: {
      co_don: number;
      khong_don: number;
      tong_so_lan_di_muon: number;
    };
    ve_som: {
      co_don: number;
      khong_don: number;
      thoi_gian: number;
    };
    tong_gio_lam: number;
    cong_thuc_te: number;
    cong_lam_them: number;
    cong_lam_them_trong_ngay_le: number;
    so_ngay_nghi_le: number;
    nghi_phep_co_luong: number;
    nghi_phep_khong_luong: number;
    cong_tinh_luong: number;
    ngay_phep_con_lai: number;
    so_ngay_cong_tac: number;
    ti_le_di_muon: number;
  }[];
  cong_thuc_te: number;
  cong_chuan_thang: number;
  cong_nghi_theo_cong_ty: number;
  cong_lam_bu_theo_cong_ty: number;
  period_info: {
    period_type: string;
    start_date: string;
    end_date: string;
    week?: string;
    month?: string;
    year?: string;
  };
}
