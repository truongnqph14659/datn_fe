import Dasboard from '@/modules/dasboard';
import WorkScheduleManagement from '@/modules/workSchedule';
import RootLayout from '@/pages/RootLayout';
import {lazy} from 'react';
import {RouteObject} from 'react-router-dom';

const EmployeeManagement = lazy(() => import('@/modules/employee'));
const TimekeepingManagement = lazy(() => import('@/modules/timekeeping'));
const TimekeepingStatistics = lazy(() => import('@/modules/timekeeping-statistics'));
const LoginPage = lazy(() => import('@/modules/login'));
const RolesPage = lazy(() => import('@/modules/roles'));
const RequestApproval = lazy(() => import('@/modules/request-approval'));

const allRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Dasboard />,
      },
      {
        path: '/general-info',
        element: <EmployeeManagement />,
      },
      {
        path: '/work-schedule',
        element: <WorkScheduleManagement />,
      },
      {
        path: '/timekeeping',
        element: <TimekeepingManagement />,
      },
      {
        path: '/timekeeping-statistics',
        element: <TimekeepingStatistics />,
      },
      {
        path: '/roles',
        element: <RolesPage />,
      },
      {
        path: '/request-approval',
        element: <RequestApproval />,
      },
    ],
  },
];

export default allRoutes;
