import menuItems, {MenuItem} from '@/shared/routes';
import {cn} from '@/shared/utils';
import {useSideBarStore} from '@/store';
import {useAuthStore} from '@/store/authStore';
import {Image, Layout, Menu} from 'antd';
import {useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

const {Sider} = Layout;

const Sidebar = () => {
  const isSideBarOpen = useSideBarStore((state) => state.isSideBarOpen);
  const navigate = useNavigate();
  const location = useLocation();
  const {user, isAuthenticated} = useAuthStore();

  const menus = useMemo(() => {
    // Nếu chưa xác thực hoặc không có quyền, trả về toàn bộ menu mặc định
    if (!isAuthenticated || !user?.roles?.acls) return;
    // Lọc ra các route được phép từ quyền người dùng
    const allowedRoutes = user.roles.acls.map((acl) => acl?.menu?.route)

    // Hàm đệ quy để lọc menu theo quyền
    const filterMenuByPermissions = (items: MenuItem[]): MenuItem[] => {
      return items.reduce<MenuItem[]>((result, item) => {
        if (!item) return result;
        const itemKey = item.key as string;
        // Nếu có submenu (children), kiểm tra các children trước
        if ('children' in item && Array.isArray(item.children)) {
          const visibleChildren = filterMenuByPermissions(item.children);
          if (visibleChildren.length > 0) {
            result.push({...item, children: visibleChildren});
            return result;
          }
        }
        // Nếu không có children, chỉ giữ lại nếu key nằm trong danh sách được phép
        if (allowedRoutes.includes(itemKey)) {
          result.push(item);
        }
        return result;
      }, []);
    };

    return filterMenuByPermissions(menuItems);
  }, [user, isAuthenticated]);

  const selectedKey = location.pathname || '/';

  const getOpenKeys = () => {
    // Lặp qua các menu item để tìm parent của selectedKey
    for (const item of menuItems || []) {
      if (item && 'children' in item && item.children) {
        for (const child of item.children) {
          if (child && 'key' in child && child.key === selectedKey) {
            return [item.key as string];
          }
        }
      }
    }
    return [];
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={isSideBarOpen}
      className={cn(
        `h-full flex flex-col overflow-auto ${
          !isSideBarOpen && '!w-[250px] !min-w-[250px] !max-w-[250px] !flex-[0_0_250px]'
        }`,
      )}
      style={{height: '100vh', position: 'sticky', top: 0, left: 0}}
    >
      <div className={`${isSideBarOpen ? 'w-20' : 'w-32'} mx-auto my-4 flex-shrink-0`}>
        <Image src="/logo.png" preview={false} />
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={getOpenKeys()}
        items={menus || []}
        onClick={({key}) => navigate(key)}
        className="flex-1 overflow-x-hidden overflow-y-auto"
      />
    </Sider>
  );
};

export default Sidebar;
