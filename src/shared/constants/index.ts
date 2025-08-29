export const localStorageKeys = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  AUTH_STORE: 'auth-storage',
};

export const monthOptions = [
  {label: '1', value: 1},
  {label: '2', value: 2},
  {label: '3', value: 3},
  {label: '4', value: 4},
  {label: '5', value: 5},
  {label: '6', value: 6},
  {label: '7', value: 7},
  {label: '8', value: 8},
  {label: '9', value: 9},
  {label: '10', value: 10},
  {label: '11', value: 11},
  {label: '12', value: 12},
];

export const REQUEST_CODE = {
  DI_MUON_VE_SOM: 'DMVS',
  NGHI_PHEP: 'NGHI_PHEP',
  NGHI_VIEC: 'NGHI_VIEC',
  DANG_KY_LAM_CONG: 'LAM_CONG',
  DANG_KY_LAM_NO_LUC: 'LAM_NO_LUC',
  DI_CONG_TAC: 'CONG_TAC',
  THAY_DOI_GIO_CHAM_CONG: 'CHAM_CONG',
} as const;

export const LOAI_NGHI_PHEP = {
  CO_LUONG: 'CO_LUONG',
  KHONG_LUONG: 'KHONG_LUONG',
} as const;

export const HINH_THUC_NGHI_PHEP = {
  MOT_NGAY: 'MOT_NGAY',
  NHIEU_NGAY: 'NHIEU_NGAY',
  BUOI_SANG: 'BUOI_SANG',
  BUOI_CHIEU: 'BUOI_CHIEU',
} as const;

export const REQUEST_TYPE = {
  DI_MUON_VE_SOM: 3,
  NGHI_PHEP: 4,
  NGHI_VIEC: 5,
  DANG_KY_LAM_CONG: 6,
  DANG_KY_LAM_NO_LUC: 7,
  DI_CONG_TAC: 8,
  THAY_DOI_GIO_CHAM_CONG: 9,
} as const;

export const LOAI_DMVS = {
  DI_MUON: 'DI_MUON',
  VE_SOM: 'VE_SOM',
} as const;

export const MENU_INITIAL_OPTIONS = [
  {
    id: '8',
    key: '8',
    code: 'dasboard',
    parent: 'dasboard',
    labelParent: 'Dasboard',
    isParent: true,
    labelChildren: '',
    isView: false,
    isEdit: false,
  },
  {
    id: '1',
    key: '1',
    code: 'employee',
    parent: 'employee',
    labelParent: 'Quản Lý Nhân Viên',
    isParent: true,
    labelChildren: '',
    isView: false,
    isEdit: false,
  },
   {
    id: '9',
    key: '9',
    code: 'generalInfo',
    parent: 'employee',
    labelParent: '',
    isParent: false,
    labelChildren: 'Thông Tin Chung',
    isView: false,
    isEdit: false,
  },
   {
    id: '10',
    key: '10',
    code: 'workSchedule',
    parent: 'employee',
    labelParent: '',
    isParent: false,
    labelChildren: 'Lịch Làm Việc',
    isView: false,
    isEdit: false,
  },
  {
    id: '2',
    key: '2',
    isParent: true,
    code: 'timeWorking',
    parent: 'timeWorking',
    labelParent: 'Quản Lý Chấm Công',
    labelChildren: '',
    isView: false,
    isEdit: false,
  },
  {
    id: '3',
    key: '3',
    isParent: false,
    code: 'timekeeping',
    parent: 'timeWorking',
    labelParent: '',
    labelChildren: 'Bảng Chấm Công',
    isView: false,
    isEdit: false,
  },
  {
    id: '4',
    key: '4',
    isParent: false,
    code: 'timekeepingStatistics',
    parent: 'timeWorking',
    labelParent: '',
    labelChildren: 'Bảng Thống Kê Chấm Công',
    isView: false,
    isEdit: false,
  },
  {
    id: '5',
    key: '5',
    isParent: true,
    code: 'role',
    parent: 'role',
    labelParent: 'Quản Lý Nhóm Quyền',
    labelChildren: '',
    isView: false,
    isEdit: false,
  },
  {
    id: '7',
    key: '7',
    isParent: true,
    code: 'requestApproval',
    parent: 'requestApproval',
    labelParent: 'Quản Lý Yêu Cầu Phê Duyệt',
    labelChildren: '',
    isView: false,
    isEdit: false,
  },
];

export const ROUTE_PATH = {
  EMP_INFO: '/general-info',
  EMP_SCHEDULE: '/work-schedule',
} as const;
