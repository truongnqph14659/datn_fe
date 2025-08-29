import {HomeOutlined, SafetyOutlined, SolutionOutlined, UsergroupAddOutlined, UserOutlined} from '@ant-design/icons';
import {MenuProps} from 'antd';

export type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
  {
    key: '/',
    label: 'Dasboard',
    title: 'Dasboard',
    icon: <HomeOutlined />,
  },
  {
    key: 'employee',
    label: 'Quản lý nhân viên',
    title: 'Quản lý nhân viên',
    icon: <UsergroupAddOutlined />,
    children: [
      {
        key: '/general-info',
        label: 'Thông Tin Chung',
        title: 'Thông Tin Chung',
      },
      {
        key: '/work-schedule',
        label: 'Lịch Làm Việc',
        title: 'Lịch Làm Việc',
      },
    ],
  },
  {
    key: 'timekeepingParent',
    label: 'Quản lý chấm công',
    title: 'Quản lý chấm công',
    icon: <UserOutlined />,
    children: [
      {
        key: '/timekeeping',
        label: 'Bảng chấm công',
        title: 'Bảng chấm công',
      },
      {
        key: '/timekeeping-statistics',
        label: 'Bảng thống kê chấm công',
        title: 'Bảng thống kê chấm công',
      },
    ],
  },
  {
    key: '/roles',
    label: 'Quản lý nhóm quyền',
    title: 'Quản lý nhóm quyền',
    icon: <UsergroupAddOutlined />,
  },
  {
    key: '/request-approval',
    label: 'Quản lý yêu cầu phê duyệt',
    title: 'Quản lý yêu cầu phê duyệt',
    icon: <SolutionOutlined />,
  },
];

export default menuItems;
