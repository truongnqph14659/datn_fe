import LoginPage from '@/modules/login';
import AccessDenied from '@/pages/AccessDenied';
import NotFound from '@/pages/NotFound';
import RootLayout from '@/pages/RootLayout';
import allRoutes from '@/shared/routes/route';
import {IEmployeeRes} from '@/shared/types/employee.type';
import {useMemo} from 'react';
import {createBrowserRouter, Navigate} from 'react-router-dom';

const useAppRouter = (user: IEmployeeRes | null) => {
  const router = useMemo(() => {
    // ----- TRƯỜNG HỢP 1: Chưa đăng nhập -----
    if (!user?._id) {
      return createBrowserRouter([
        {
          path: '/login',
          element: <LoginPage />,
        },
        {
          // Quan trọng: Chuyển hướng tất cả các route khác về login
          path: '*',
          element: <Navigate to="/login" replace />,
        },
      ]);
    }

    // ----- TRƯỜNG HỢP 2: Đã đăng nhập nhưng không có quyền -----
    if (!user.roles?.acls || user.roles.acls.length === 0) {
      return createBrowserRouter([
        {
          path: '/login',
          element: <Navigate to="/access-denied" replace />,
        },
        {
          path: '/access-denied',
          element: <AccessDenied />,
        },
        {
          path: '*',
          element: <Navigate to="/access-denied" replace />,
        },
      ]);
    }
    // ----- TRƯỜNG HỢP 3: Có quyền đầy đủ -----
    const roleRoutes = user.roles.acls.map((item) => item.menu?.route);
    const layoutRoute = allRoutes.find((route) => route.path === '/');
    const filteredChildren = layoutRoute?.children?.filter((route) => {
      return roleRoutes.includes(route.path);
    });
    // Tạo router với redirect từ login về trang chủ
    return createBrowserRouter([
      {
        path: '/login',
        element: <Navigate to="/" replace />,
      },
      {
        path: '/access-denied',
        element: <AccessDenied />,
      },
      {
        path: '/',
        element: <RootLayout />,
        children: filteredChildren || [],
        errorElement: <NotFound />,
      },
      {
        // Route fallback cho các URL không hợp lệ
        path: '*',
        element: <NotFound />,
      },
    ]);
  }, [user]);
  return router;
};

export default useAppRouter;
