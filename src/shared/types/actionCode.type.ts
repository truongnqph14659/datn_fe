export enum ActionCode {
  //role
  ROLES_READ = 'role.read',
  ROLES_READ_DETAIL = 'role.read_detail',
  ROLES_CREATE = 'role.create',
  ROLES_UPDATE = 'role.update',
  ROLES_DELETE = 'role.delete',
  //role-permission
  ROLES_PERMISSION_READ = 'role-permission.read',
  ROLES_PERMISSION_READ_DETAIL = 'role-permission.read_detail',
  ROLES_PERMISSION_CREATE = 'role-permission.create',
  ROLES_PERMISSION_UPDATE = 'role-permission.update',
  ROLES_PERMISSION_DELETE = 'role-permission.delete',
}

export type RoleActionType = `${ActionCode}`;
