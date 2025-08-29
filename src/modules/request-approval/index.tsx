import TableApprovedRequest from '@/modules/request-approval/components/TableApprovedRequest';
import TablePendingRequestApproval from '@/modules/request-approval/components/TablePendingRequestApproval';
import TableRequestReferences from '@/modules/request-approval/components/TableRequestReferences';
import {useGetRequestReferenceUnseenCount} from '@/shared/hooks/react-query-hooks/request-references';
import {cn} from '@/shared/utils';
import {Badge, Tabs} from 'antd';
import {useState} from 'react';
import './index.scss';
import { useAuthStore } from '@/store/authStore';

export default function RequestApproval() {
  const {user} = useAuthStore();
  const initStateFilter = user?.roles.name == 'Admin' ? 'user_approval' :'user_create'
  const [userFilter, setUserFilter] = useState<'user_create' | 'user_approval'>(initStateFilter);
  const {data: unseenCountData, refetch: refetchUnseenCountData} = useGetRequestReferenceUnseenCount();

  return (
    <>
      <Tabs
        defaultActiveKey="1"
        type="card"
        size="large"
        className="tabs-request-approval"
        tabBarExtraContent={
          user?.roles.name == 'Admin' ? <></> : (
          <div className="flex items-center overflow-hidden font-medium border border-gray-300 rounded-lg cursor-pointer">
            <div
              className={cn(
                'p-2 transition-all',
                userFilter === 'user_create' ? 'text-white bg-blue-600' : 'hover:bg-blue-400 hover:text-white',
              )}
              role="button"
              onClick={() => setUserFilter('user_create')}
            >
              Người tạo
            </div>
            <div
              className={cn(
                'p-2 transition-all',
                userFilter === 'user_approval' ? 'text-white bg-blue-600' : 'hover:bg-blue-400 hover:text-white',
              )}
              role="button"
              onClick={() => setUserFilter('user_approval')}
            >
              Người duyệt
            </div>
          </div>
          )
        }
        items={[
          {
            key: '1',
            label: (
              <Badge
              >
                Danh sách yêu cầu chờ duyệt
              </Badge>
            ),
            children: <TablePendingRequestApproval type={userFilter} />,
          },
          {
            key: '2',
            label: <Badge>Danh sách yêu cầu đã duyệt</Badge>,
            children: <TableApprovedRequest type={userFilter} />,
          },
          {
            key: '3',
            label: (
              <Badge 
              // count={unseenCountData?.data.count} offset={[10, 0]}
              >
                Danh sách CC/References
              </Badge>
            ),
            children: <TableRequestReferences refetchUnseenCountData={refetchUnseenCountData} />,
          },
        ]}
        onChange={() => {}}
      />
    </>
  );
}
