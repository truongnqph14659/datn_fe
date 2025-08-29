import {RoleCreateData} from '@/modules/roles/components/ModalCreateRole/form-config';
import {IMenu, IPermissionRes} from '@/shared/types/permission.type';

export interface IRoleParams {
  page?: number;
  limit?: number;
  disablePagination?: boolean;
  search?: string;
  searchFields?: string[];
}

export interface IRoleRes {
  _id: number;
  name: string;
  desc: string;
  isDeleted: boolean;
  acls?: IPermissionRes[];
}

export interface RoleFormData {
  role: {
    name: string;
    desc?: string;
  };
}

export interface DataRolePermission {
  role: {
    name: string;
    desc?: string;
  };
  permissionList: Array<{
    code: string;
    id: string;
    isEdit: boolean;
    isParent: boolean;
    isView: boolean;
    key: string;
    labelChildren: string;
    labelParent: string;
    parent: string;
  }>;
}

export interface RecordRole {
  code: string;
  id: string;
  isEdit: boolean;
  isParent: boolean;
  isView: boolean;
  key: string;
  labelChildren: string;
  labelParent: string;
  parent: string;
}

export interface PermissionItem {
  id: string;
  key: string;
  code: string;
  parent: string;
  labelParent: string;
  labelChildren: string;
  isParent: boolean;
  isView: boolean; // hoặc boolean nếu bạn convert về true/false ở frontend
  isEdit: boolean;
}

// Dữ liệu chính trong "data"
export interface RoleWithPermissionData {
  role_name: string;
  desc: string;
  role_id: number;
  permissionData: PermissionItem[];
}

export interface ModalCreateRoleProps {
  isModalVisible: boolean;
  toggleModal: () => void;
  handleData?: (data: DataRolePermission) => Promise<any>;
}

export type ICreateUpdateRoleRes = RoleCreateData;

export type NewRoleData = RoleCreateData;
