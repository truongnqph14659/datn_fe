export interface IGetPendingApprovalsRes {
  approval_id: number;
  is_seen: number;
  request_code: string;
  request_employee_id: number;
  requester: string;
  request_type: string;
  step_order: number;
  status_approval: number | null;
  fields: Record<string, any>;
}
