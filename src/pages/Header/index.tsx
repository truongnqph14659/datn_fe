import menuItems from '@/shared/routes';
import {useSideBarStore} from '@/store';
import {useAuthStore} from '@/store/authStore';
import {MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined} from '@ant-design/icons';
import {Avatar, Button, Dropdown, Layout, MenuProps, Space} from 'antd';
import {ItemType} from 'antd/es/menu/interface';
import {useEffect, useState} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';

const {Header} = Layout;

const HeaderLayout = () => {
  const [currentRouteName, setCurrentRouteName] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSideBar = useSideBarStore((state) => state.toggleSideBar);
  const collapsed = useSideBarStore((state) => state.isSideBarOpen);

  const {user, isAuthenticated, logout} = useAuthStore();

  useEffect(() => {
    const findRouteName = (items: MenuProps['items'], pathname: string): string => {
      if (!items) return '';
      if (pathname === '/' || pathname === '') {
        const homeItem = items.find((item) => item && 'key' in item && item.key === '/');
        return homeItem && 'label' in homeItem ? String(homeItem.label) : '';
      }
      // Tìm kiếm qua tất cả items
      for (const item of items) {
        if (!item) continue;
        // Kiểm tra nếu item hiện tại khớp với pathname
        if ('key' in item && item.key === pathname && 'label' in item) {
          return String(item.label);
        }
        // Đệ quy tìm kiếm trong children
        if ('children' in item && item.children) {
          const childName = findRouteName(item.children, pathname);
          if (childName) return childName;
        }
      }
      return '';
    };
    const name = findRouteName(menuItems, location.pathname);
    setCurrentRouteName(name);
  }, [location.pathname]);

  const handleMenuClick: MenuProps['onClick'] = ({key}) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  const userMenu: ItemType[] = [{key: 'logout', label: 'Đăng xuất'}];

  return (
    <Header className="p-0 bg-white shadow">
      <div className="flex items-center justify-between pr-5">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => toggleSideBar()}
            className="text-xl size-16"
          />
          <h3 className="text-xl font-semibold">{currentRouteName}</h3>
        </div>
        <div className="cursor-pointer">
          <Space size={'large'}>
            {isAuthenticated ? (
              <Dropdown menu={{items: userMenu, onClick: handleMenuClick}} trigger={['click']}>
                <div className="flex items-center justify-center gap-1">
                  <Avatar icon={<UserOutlined />} />
                  <span className="font-medium">{user?.name ?? 'Nguyễn Quang Trường'}</span>
                </div>
              </Dropdown>
            ) : (
              <a href="/login">Đăng nhập</a>
            )}
          </Space>
        </div>
      </div>
    </Header>
  );
};

export default HeaderLayout;
