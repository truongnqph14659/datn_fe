import ModalGlobal from '@/components/ModalGlobal';
import {MENU_INITIAL_OPTIONS} from '@/shared/constants';
import {ModalCreateRoleProps, PermissionItem, RoleFormData} from '@/shared/types/role.type';
import {SyncOutlined} from '@ant-design/icons';
import {Button, Checkbox, Form, Input, Table} from 'antd';
import Column from 'antd/es/table/Column';
import {useState} from 'react';

const ModalCreateRole = ({isModalVisible, toggleModal, handleData}: ModalCreateRoleProps) => {
  const [options, setOptions] = useState<PermissionItem[]>(MENU_INITIAL_OPTIONS);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isLoad, setIsLoad] = useState<boolean>(false);

  const rowSelection = {
    type: 'checkbox' as const,
    selectedRowKeys: selectedKeys,
    onSelect: (record: any, selected: any, selectedRows: any, nativeEvent: any) => {
      const isChecked = nativeEvent.target.checked;
      if (record.isParent && selected) {
        handleClick(record, 'rowCheckbox', isChecked);
      }
      if (record.isParent && !selected) {
        handleClick(record, 'rowCheckbox', isChecked);
      }
      if (!record.isParent && selected) {
        handleClick(record, 'rowCheckbox', isChecked);
      }
      if (!record.isParent && !selected) {
        handleClick(record, 'rowCheckbox', isChecked);
      }
    },
    getCheckboxProps: (record: any) => {
      const hasPermissions = ['isView', 'isEdit'].filter((key) => record[key]).length;
      const isChecked = hasPermissions === 2;
      const isIndeterminate = hasPermissions > 0 && !isChecked;
      return {
        indeterminate: isIndeterminate,
      };
    },
    onSelectAll: (selected: boolean, allRecord_: PermissionItem[]) => {
      const listSelectedAll = selected ? allRecord_.map((item) => item.key) : [];
      const allOptionRecord = selected
        ? options.map((record_) => {
            return {...record_, isView: true, isEdit: true};
          })
        : options.map((record_) => {
            return {...record_, isView: false, isEdit: false};
          });

      setSelectedKeys(listSelectedAll);
      setOptions(allOptionRecord);
    },
  };

  const handleClick = (record_: any, type: string, checked: boolean) => {
    switch (type) {
      case 'isView':
        if (record_.isParent) {
          const parentAndListchildrenWith = options.filter((item) => item.parent === record_.parent);
          const listKey = parentAndListchildrenWith.map((item) => item.key);
          const handleKey = checked
            ? [...selectedKeys, ...listKey]
            : selectedKeys.filter((key) => !listKey.includes(key));

          const updatedOptions = options.map((item) => {
            if (parentAndListchildrenWith.some((child) => child.key === item.key && child.id === item.id)) {
              return checked ? {...item, isView: checked} : {...item, isView: checked, isEdit: checked};
            }
            return item;
          });
          setSelectedKeys(handleKey);
          setOptions(updatedOptions);
        } else {
          const listOfIsViewChecked: boolean[] = [];
          const updatedOptions = options.map((item) =>
            item.key === record_.key
              ? checked
                ? {...item, isView: checked}
                : {...item, isView: checked, isEdit: checked}
              : item,
          );

          updatedOptions.forEach((item) => {
            if (!item.isParent && item.parent === record_.parent) listOfIsViewChecked.push(item.isView);
          });

          let handleKey = checked ? [...selectedKeys, record_.key] : selectedKeys.filter((key) => key !== record_.key);

          const lastHandleOption = listOfIsViewChecked.every(Boolean)
            ? updatedOptions.map((item) => {
                if (item.isParent && item.parent === record_.parent) {
                  handleKey = [...handleKey, item.key];
                  return {...item, isView: true};
                }
                return item;
              })
            : updatedOptions.map((item) => {
                if (item.isParent && item.parent === record_.parent) {
                  handleKey = handleKey.filter((key) => key !== item.key);
                  return {...item, isView: false, isEdit: false};
                }
                return item;
              });
          setSelectedKeys(handleKey);
          setOptions(lastHandleOption);
        }
        break;
      case 'isEdit':
        if (record_.isParent) {
          const parentAndListchildrenWith = options.filter((item) => item.parent === record_.parent);
          const listKey = parentAndListchildrenWith.map((item) => item.key);
          const handleKey = checked
            ? [...selectedKeys, ...listKey]
            : selectedKeys.filter((key) => !listKey.includes(key));
          const updatedOptions = options.map((item) => {
            if (checked && parentAndListchildrenWith.some((child) => child.key === item.key && child.id === item.id)) {
              return {...item, isView: checked, isEdit: checked};
            }
            if (!checked && parentAndListchildrenWith.some((child) => child.key === item.key && child.id === item.id)) {
              return {...item, isEdit: checked};
            }
            return item;
          });
          setSelectedKeys(handleKey);
          setOptions(updatedOptions);
        } else {
          const listOfIsEditChecked: boolean[] = [];
          const updatedOptions = options.map((item) =>
            item.key === record_.key
              ? checked
                ? {...item, isView: checked, isEdit: checked}
                : {...item, isEdit: checked}
              : item,
          );

          let handleKey = checked ? [...selectedKeys, record_.key] : selectedKeys.filter((key) => key !== record_.key);

          updatedOptions.forEach((item) => {
            if (!item.isParent && item.parent === record_.parent) listOfIsEditChecked.push(item.isEdit);
          });

          const lastHandleOption = listOfIsEditChecked.every(Boolean)
            ? updatedOptions.map((item) => {
                if (item.isParent && item.parent === record_.parent) {
                  handleKey = [...handleKey, item.key];
                  return {...item, isView: true, isEdit: true};
                }
                return item;
              })
            : updatedOptions.map((item) => {
                if (item.isParent && item.parent === record_.parent) {
                  handleKey = handleKey.filter((key) => key !== item.key);
                  return {...item, isEdit: false};
                }
                return item;
              });
          setSelectedKeys(handleKey);
          setOptions(lastHandleOption);
        }
        break;
      case 'rowCheckbox':
        if (record_.isParent) {
          const parentAndListchildrenWith = options.filter((item) => item.parent === record_.parent);
          const listKey = parentAndListchildrenWith.map((item) => item.key);
          const handleKey = checked
            ? [...selectedKeys, ...listKey]
            : selectedKeys.filter((key) => !listKey.includes(key));
          const updatedOptions = options.map((item) => {
            if (parentAndListchildrenWith.some((child) => child.key === item.key && child.id === item.id)) {
              return {...item, isView: checked, isEdit: checked};
            }
            return item;
          });
          setSelectedKeys(handleKey);
          setOptions(updatedOptions);
        } else {
          const listOfIsViewChecked: boolean[] = [];
          const updatedOptions = options.map((item) =>
            item.key === record_.key ? {...item, isView: checked, isEdit: checked} : item,
          );

          updatedOptions.forEach((item) => {
            if (!item.isParent && item.parent === record_.parent) listOfIsViewChecked.push(item.isView);
          });

          let handleKey = checked ? [...selectedKeys, record_.key] : selectedKeys.filter((key) => key !== record_.key);

          const lastHandleOption = listOfIsViewChecked.every(Boolean)
            ? updatedOptions.map((item) => {
                if (item.isParent && item.parent === record_.parent) {
                  handleKey = [...handleKey, item.key];
                  return {...item, isView: true, isEdit: true};
                }
                return item;
              })
            : updatedOptions.map((item) => {
                if (item.isParent && item.parent === record_.parent) {
                  handleKey = handleKey.filter((key) => key !== item.key);
                  return {...item, isView: false, isEdit: false};
                }
                return item;
              });

          setSelectedKeys(handleKey);
          setOptions(lastHandleOption);
        }
        break;
      default:
        break;
    }
  };

  const saveRolePermissionToDb = async (formData: RoleFormData) => {
    const dataToSave = {...formData, permissionList: options};
    setIsLoad(true);
    try {
      await handleData?.(dataToSave);
      setIsLoad(false);
      toggleModal();
    } catch (err) {
      setIsLoad(false);
    }
  };

  const renderContent = () => {
    return (
      <div className="p-5">
        <Form onFinish={saveRolePermissionToDb} autoComplete="off">
          <Form.Item name={['role', 'name']} rules={[{required: true, message: 'Tên vai trò không được để trống!'}]}>
            <Input placeholder="Tên vai trò" />
          </Form.Item>
          <Form.Item name={['role', 'desc']}>
            <Input.TextArea placeholder="Mô tả" />
          </Form.Item>
          <Form.Item
            labelCol={{span: 4, md: {}, lg: {}, xl: {}, xxl: {}}}
            wrapperCol={{md: {}, lg: {}, xl: {}, xxl: {}}}
            colon={false}
          >
            <div className="permission-settings">
              <Table<PermissionItem>
                bordered
                rowKey={(record) => record.id}
                rowSelection={rowSelection}
                showSorterTooltip={false}
                pagination={false}
                dataSource={options}
              >
                <Table.ColumnGroup title={<div className="columnGroup title-menu">Danh mục</div>}>
                  <Column
                    title={null}
                    dataIndex="labelParent"
                    render={(value, record) => {
                      return (
                        <div style={{width: 150}} className="label-parent">
                          {value || ''}
                        </div>
                      );
                    }}
                  />
                  <Column
                    title={null}
                    dataIndex="labelChildren"
                    render={(value, record) => (
                      <div style={{width: 200}} className="label-children">
                        {value || '-'}
                      </div>
                    )}
                  />
                </Table.ColumnGroup>
                <Column
                  title="Quyền xem"
                  align="center"
                  dataIndex="isView"
                  render={(value, record: any) => {
                    return (
                      <Checkbox
                        checked={record.isView}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          handleClick(record, 'isView', checked);
                        }}
                      />
                    );
                  }}
                  onCell={(record, rowIndex) => ({
                    align: 'center',
                  })}
                />
                <Column
                  title="Quyền sửa"
                  align="center"
                  dataIndex="isEdit"
                  render={(value, record: any) => {
                    return (
                      <Checkbox
                        checked={record.isEdit}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          handleClick(record, 'isEdit', checked);
                        }}
                      />
                    );
                  }}
                  onCell={() => ({
                    align: 'center',
                  })}
                />
              </Table>
            </div>
          </Form.Item>
          <Form.Item label={null}>
            <Button type="dashed" className="mr-4" danger onClick={toggleModal}>
              Huỷ bỏ
            </Button>
            <Button type="primary" htmlType="submit" loading={isLoad && {icon: <SyncOutlined spin />}}>
              Lưu
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  };

  return (
    <ModalGlobal
      isModalVisible={isModalVisible}
      handleOk={toggleModal}
      handleCancel={toggleModal}
      title={''}
      content={renderContent()}
      width="1200px"
      footer={null}
    />
  );
};

export default ModalCreateRole;
