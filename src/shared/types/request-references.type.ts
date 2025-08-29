export interface IGetRequestReferencesByUserRes {
  req_ref_id: number;
  request_employee_id: number;
  is_seen: number;
  req_ref_employee_id: number;
  fields: Record<string, any>;
  requester: string;
  request_type: string;
  request_code: string;
}
