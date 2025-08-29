export type IPermissionType = 'action' | 'menu';
export type CheckboxOption = 'edit' | 'process' | 'delete';

export interface IPermissionParams {
  page?: number;
  limit?: number;
  disablePagination?: boolean;
  search?: string;
  searchFields?: string[];
  filter?: Partial<Omit<IPermissionRes, 'createdAt' | 'updatedAt' | 'isDeleted' | '_id'>>;
}

export interface IPermissionRes {
  _id: number;
  role_id: number;
  menu_id: number;
  isView: number;
  isEdit: number;
  menu: IMenu | null;
}

export interface IMenu {
  _id: number;
  code: string;
  name: string;
  order: number;
  parent: string;
  route: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  createdBy: number;
  updatedBy: number;
}

export type ParentItem = {
  _id_parent?: number;
  first: string;
  second: string;
  'checkbox-group': CheckboxOption[];
};

export type DataSourceParents = {
  path_parent: ParentItem[];
};
