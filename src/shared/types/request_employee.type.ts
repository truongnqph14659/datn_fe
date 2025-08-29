export interface IGetPendingRequestsByUserRes {
  rqe_id: number;
  rqe_employee_id: number;
  rqe_request_id: number;
  rqe_final_status_aproval: number | null;
  fields: Record<string, any>;
  request: {
    _id: number;
    name: string;
    code: string;
  };
  approvers: {
    _id: number;
    step_order_aprrover: number;
    status_approval_id: number | null;
    is_seen: number | null;
    employee_id: number;
    request_employee_id: number;
    employee: {
      _id: number;
      name: string;
      email: string;
    };
    appover_feaback: string | null
  }[];
  references: {
    _id: number;
    request_employee_id: number;
    employee_id: number;
    is_seen: number | null;
    employee: {
      _id: number;
      name: string;
      email: string;
    };
  }[];
}
