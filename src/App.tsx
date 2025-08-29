import useAppRouter from '@/shared/hooks/useAppRouter';
import ReactQueryProvider from '@/shared/libs/react-query/provider';
import {useAuthStore} from '@/store/authStore';
import {RouterProvider} from 'react-router-dom';

export default function App() {
  const {user} = useAuthStore();
  const router = useAppRouter(user);
  return (
    <ReactQueryProvider>
      <RouterProvider router={router} />
    </ReactQueryProvider>
  );
}
