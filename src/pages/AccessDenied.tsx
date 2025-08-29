import {useAuthStore} from '@/store/authStore';
import {Button, Result} from 'antd';
import {useNavigate} from 'react-router-dom';

const AccessDenied = () => {
  const {logout} = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Result
        status="403"
        title="Không có quyền truy cập"
        subTitle="Xin lỗi, bạn không có quyền truy cập ứng dụng này."
        extra={
          <Button type="primary" onClick={handleLogout}>
            Đăng xuất
          </Button>
        }
      />
    </div>
  );
};

export default AccessDenied;
