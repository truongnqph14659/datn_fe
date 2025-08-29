import ButtonGlobal from '@/components/ButtonGlobal';
import {ICAdd, ICEdit} from '@/components/Icon';
import {InputSearchGlobal} from '@/components/InputSearchGlobal';
import TableGlobal from '@/components/TableGlobal';
import ModalCreateRole from '@/modules/roles/components/ModalCreateRole';
import ModalEditRole from '@/modules/roles/components/ModalEditRole';
import {
  useCreateRoleWithPermission,
  useEditRoleWithPermission,
  useGetRoles,
} from '@/shared/hooks/react-query-hooks/roles';
// import {useRouteActions} from '@/shared/hooks/useRoleActions';
import {IRoleRes} from '@/shared/types/role.type';
import {Card, Space, TableColumnsType, TablePaginationConfig, Typography} from 'antd';
import {useState} from 'react';

const MODAL_CREATE_ROLE = 'modalCreateRole';
const MODAL_UPDATE_ROLE = 'modalUpdateRole';

const limit = 10;

const RolesPage = () => {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<string>('false');
  const [role, setRole] = useState<IRoleRes | null>(null);

  const {data, isFetching} = useGetRoles({
    limit: limit,
    page,
    disablePagination: false,
    search,
    searchFields: ['name', 'email'],
  });

  const {mutateAsync: CreateRolePermission} = useCreateRoleWithPermission();
  const {mutateAsync: EitRoleWithPermission} = useEditRoleWithPermission();

  const columns: TableColumnsType<IRoleRes> = [
    {
      key: 'STT',
      title: 'STT',
      dataIndex: 'STT',
      render: (_, __, index) => (page - 1) * limit + index + 1,
      align: 'center',
      width: 50,
    },
    {
      key: 'name',
      title: 'Tên vai trò',
      dataIndex: 'name',
      align: 'center',
    },
    {
      key: 'desc',
      title: 'Mô tả',
      dataIndex: 'desc',
      width: 500,
      render: (_) => {
        return <Typography.Paragraph ellipsis={{rows: 2, expandable: true, symbol: 'more'}}>{_}</Typography.Paragraph>;
      },
      align: 'center',
    },
    {
      key: 'action',
      title: 'Thao tác',
      dataIndex: 'action',
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size={'small'}>
          <ButtonGlobal
            preIcon={<ICEdit />}
            className="bg-gray-100"
            onClick={() => {
              setIsModalVisible(MODAL_UPDATE_ROLE);
              setRole(record);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <InputSearchGlobal
          placeholder="Tìm kiếm theo tên"
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          className="w-[300px]"
        />
      </Card>
      <div className="flex justify-end my-5">
        <ButtonGlobal preIcon={<ICAdd className="mr-1" />} onClick={() => setIsModalVisible(MODAL_CREATE_ROLE)}>
          Thêm nhóm quyền
        </ButtonGlobal>
      </div>

      <Card>
        <TableGlobal
          dataSource={data?.data}
          columns={columns}
          pagination={{
            pageSize: data?.meta.limit,
            total: data?.meta.totalItems,
            current: data?.meta.page,
            showTotal: (total) => `Tổng ${total} Nhóm quyền`,
          }}
          onChange={(pagi: TablePaginationConfig) => {
            setPage(pagi.current || 1);
          }}
          scroll={{x: 1500}}
          loading={isFetching}
        />
      </Card>

      {/* MODAL */}
      {isModalVisible === MODAL_CREATE_ROLE && (
        <ModalCreateRole
          isModalVisible={isModalVisible === MODAL_CREATE_ROLE}
          toggleModal={() => setIsModalVisible('')}
          handleData={CreateRolePermission}
        />
      )}

      {isModalVisible === MODAL_UPDATE_ROLE && (
        <ModalEditRole
          isModalVisible={isModalVisible === MODAL_UPDATE_ROLE}
          toggleModal={() => {
            setIsModalVisible('');
            setRole(null);
          }}
          record={role}
          handleData={EitRoleWithPermission}
        />
      )}
    </>
  );
};

export default RolesPage;
