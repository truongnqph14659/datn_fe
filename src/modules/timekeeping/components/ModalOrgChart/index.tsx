import {cn} from '@/shared/utils';
import {useOrgChartStore} from '@/store';
import {EmployeeItem} from '@/store/orgChartStore';
import {ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined} from '@ant-design/icons';
import {Button, Modal, Tree} from 'antd';
import React, {Key} from 'react';
import {useFormContext} from 'react-hook-form';
import './index.scss';

interface OrgChartModalProps {
  onSave?: (target: 'approvers' | 'referrers', employees: EmployeeItem[]) => void;
}

const OrgChartModal: React.FC<OrgChartModalProps> = ({onSave}) => {
  const {
    orgChartVisible,
    currentSelectionTarget,
    expandedKeys,
    checkedKeysMap,
    selectedUser,
    orderedEmployees,
    treeDataOrgChart,
    setOrgChartVisible,
    setExpandedKeys,
    setCheckedKeysForTarget,
    setSelectedUser,
    updateOrderedEmployees,
  } = useOrgChartStore();

  const {setValue} = useFormContext();

  // Lấy checkedKeys của target hiện tại
  const checkedKeys = checkedKeysMap[currentSelectionTarget];

  // Hàm xử lý khi check/uncheck node
  const handleCheck = (checkedKeysValue: React.Key[] | {checked: Key[]; halfChecked: Key[]}) => {
    // Xác định danh sách các key được check
    const checked = Array.isArray(checkedKeysValue) ? checkedKeysValue : checkedKeysValue.checked;
    // Tìm key mới được check/uncheck so với trạng thái trước đó
    const prevCheckedKeys = [...checkedKeys];
    // Xử lý theo logic tự định nghĩa
    const newlyCheckedKeys = checked.filter((key: React.Key) => !prevCheckedKeys.includes(key));
    const newlyUncheckedKeys = prevCheckedKeys.filter((key) => !checked.includes(key));

    // Xử lý các node mới được check
    let updatedCheckedKeys = [...checked];

    if (newlyCheckedKeys.length > 0) {
      // Xử lý cho mỗi key mới được check
      newlyCheckedKeys.forEach((key) => {
        if (typeof key === 'string' && key.startsWith('department-')) {
          // Nếu check node cha, thêm tất cả con vào danh sách
          const childrenKeys =
            treeDataOrgChart.find((dept) => dept.key === key)?.children?.map((child: any) => child.key as string) || [];
          updatedCheckedKeys = [...updatedCheckedKeys, ...childrenKeys];
        } else if (typeof key === 'string' && key.startsWith('employee-')) {
          // Nếu check node con, tự động check node cha
          const employeeKey = key;
          // Tìm department chứa employee này
          const departmentKey = treeDataOrgChart.find((dept) =>
            dept.children?.some((child: any) => child.key === employeeKey),
          )?.key as string;
          // Thêm department (node cha) vào danh sách nếu chưa có
          if (departmentKey && !updatedCheckedKeys.includes(departmentKey)) {
            updatedCheckedKeys.push(departmentKey);
          }
        }
      });
    }

    // Xử lý các node mới bị uncheck
    if (newlyUncheckedKeys.length > 0) {
      newlyUncheckedKeys.forEach((key) => {
        if (typeof key === 'string' && key.startsWith('department-')) {
          // Nếu uncheck node cha, bỏ tất cả node con
          const childrenKeys =
            treeDataOrgChart.find((dept) => dept.key === key)?.children?.map((child: any) => child.key as string) || [];

          updatedCheckedKeys = updatedCheckedKeys.filter((k) => !childrenKeys.includes(k as string));
        } else if (typeof key === 'string' && key.startsWith('employee-')) {
          // Nếu uncheck node con, kiểm tra xem còn node con nào được check không
          const employeeKey = key;
          // Tìm department chứa employee này
          const departmentKey = treeDataOrgChart.find((dept) =>
            dept.children?.some((child: any) => child.key === employeeKey),
          )?.key as string;
          if (departmentKey) {
            const allEmployeesInDept =
              treeDataOrgChart
                .find((dept) => dept.key === departmentKey)
                ?.children?.map((child: any) => child.key as string) || [];
            // Kiểm tra xem còn employee nào khác trong department này được chọn không
            const hasOtherCheckedEmployees = allEmployeesInDept.some(
              (empKey: string) => empKey !== key && updatedCheckedKeys.includes(empKey),
            );
            // Nếu không còn employee nào được chọn, bỏ check department
            if (!hasOtherCheckedEmployees && updatedCheckedKeys.includes(departmentKey)) {
              updatedCheckedKeys = updatedCheckedKeys.filter((k) => k !== departmentKey);
            }
          }
        }
      });
    }

    // Loại bỏ các key trùng lặp
    updatedCheckedKeys = Array.from(new Set(updatedCheckedKeys));

    // Cập nhật state
    setCheckedKeysForTarget(currentSelectionTarget, updatedCheckedKeys);

    // Sau khi đã cập nhật updatedCheckedKeys, cần cập nhật orderedEmployees
    // Lấy danh sách employees đã được chọn
    const selectedEmployees = updatedCheckedKeys
      .filter((key): key is string => typeof key === 'string' && key.startsWith('employee-'))
      .map((key) => {
        const employee = treeDataOrgChart
          .flatMap((item) => item.children || [])
          .find((child: any) => child.key === key);

        return employee
          ? {
              value: String(key).replace('employee-', ''),
              label: employee.title,
            }
          : null;
      })
      .filter(Boolean) as EmployeeItem[];

    // Lấy danh sách hiện tại để giữ lại thứ tự của các phần tử đã có
    const currentList = [...orderedEmployees[currentSelectionTarget]];

    // Tìm các phần tử mới được thêm vào
    const newItems = selectedEmployees.filter((emp) => !currentList.some((item) => item.value === emp.value));

    // Lọc bỏ các phần tử đã bị xóa
    const remainingItems = currentList.filter((item) => selectedEmployees.some((emp) => emp.value === item.value));

    // Cập nhật danh sách với thứ tự được bảo toàn, các phần tử mới được thêm vào cuối
    updateOrderedEmployees(currentSelectionTarget, [...remainingItems, ...newItems]);
  };

  const handleMoveDown = () => {
    if (!selectedUser) return;

    // Lấy danh sách hiện tại từ state orderedEmployees
    const currentList = [...orderedEmployees[currentSelectionTarget]];

    // Tìm vị trí của user được chọn trong danh sách
    const selectedIndex = currentList.findIndex((emp) => `employee-${emp.value}` === selectedUser);

    // Nếu không tìm thấy hoặc đã ở cuối danh sách, không làm gì cả
    if (selectedIndex === -1 || selectedIndex === currentList.length - 1) {
      return;
    }

    // Hoán đổi vị trí với phần tử kế tiếp
    const temp = currentList[selectedIndex];
    currentList[selectedIndex] = currentList[selectedIndex + 1];
    currentList[selectedIndex + 1] = temp;

    // Cập nhật danh sách đã sắp xếp lại
    updateOrderedEmployees(currentSelectionTarget, currentList);

    // Cập nhật selection
    const nextItem = currentList[selectedIndex + 1];
    setSelectedUser(`employee-${nextItem.value}`);
  };

  const handleMoveUp = () => {
    if (!selectedUser) return;

    // Lấy danh sách hiện tại từ state orderedEmployees
    const currentList = [...orderedEmployees[currentSelectionTarget]];

    // Tìm vị trí của user được chọn trong danh sách
    const selectedIndex = currentList.findIndex((emp) => `employee-${emp.value}` === selectedUser);

    // Nếu không tìm thấy hoặc đã ở đầu danh sách, không làm gì cả
    if (selectedIndex <= 0) {
      return;
    }

    // Hoán đổi vị trí với phần tử kế trước
    const temp = currentList[selectedIndex];
    currentList[selectedIndex] = currentList[selectedIndex - 1];
    currentList[selectedIndex - 1] = temp;

    // Cập nhật danh sách đã sắp xếp lại
    updateOrderedEmployees(currentSelectionTarget, currentList);

    // Cập nhật selection
    const prevItem = currentList[selectedIndex - 1];
    setSelectedUser(`employee-${prevItem.value}`);
  };

  const handleDelete = () => {
    // Xóa key hiện tại từ danh sách đã chọn
    const newCheckedKeys = checkedKeys.filter((item) => item !== selectedUser);
    // Tìm department key (phòng ban) chứa employee này
    const employeeKey = selectedUser;
    const departmentKey = treeDataOrgChart.find((dept) =>
      dept.children?.some((child: any) => child.key === employeeKey),
    )?.key as string;

    // Kiểm tra xem còn employee nào của department này được chọn không
    if (departmentKey) {
      const allEmployeesInDept =
        treeDataOrgChart
          .find((dept) => dept.key === departmentKey)
          ?.children?.map((child: any) => child.key as string) || [];

      // Kiểm tra xem còn employee nào khác trong department này được chọn không
      const hasOtherCheckedEmployees = allEmployeesInDept.some(
        (empKey: string) => empKey !== selectedUser && newCheckedKeys.includes(empKey),
      );

      // Nếu còn employee khác được chọn nhưng department không được chọn, thêm department vào
      if (hasOtherCheckedEmployees && !newCheckedKeys.includes(departmentKey)) {
        newCheckedKeys.push(departmentKey);
      }
      // Nếu không còn employee nào được chọn nhưng department được chọn, bỏ department
      else if (!hasOtherCheckedEmployees && newCheckedKeys.includes(departmentKey)) {
        const departmentIndex = newCheckedKeys.indexOf(departmentKey);
        if (departmentIndex > -1) {
          newCheckedKeys.splice(departmentIndex, 1);
        }
      }
    }

    // Cập nhật state với danh sách đã được xử lý
    setCheckedKeysForTarget(currentSelectionTarget, newCheckedKeys);

    // Cập nhật orderedEmployees
    const updatedList = orderedEmployees[currentSelectionTarget].filter(
      (emp) => `employee-${emp.value}` !== selectedUser,
    );
    updateOrderedEmployees(currentSelectionTarget, updatedList);

    // Reset selectedUser nếu mục đã chọn bị xóa
    setSelectedUser('');
  };

  const handleSave = () => {
    setValue(currentSelectionTarget, orderedEmployees[currentSelectionTarget]);

    if (onSave) {
      onSave(currentSelectionTarget, orderedEmployees[currentSelectionTarget]);
    }

    setOrgChartVisible(false);
  };

  return (
    <Modal
      title="Sơ đồ tổ chức"
      open={orgChartVisible}
      onCancel={() => setOrgChartVisible(false)}
      footer={[
        <Button key="close" onClick={() => setOrgChartVisible(false)}>
          Hủy bỏ
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Lưu
        </Button>,
      ]}
      width={500}
    >
      <div className="org-chart-modal">
        <div className="mb-4" style={{height: '300px', overflowY: 'auto'}}>
          <Tree
            showIcon
            defaultExpandAll
            checkable
            selectable={false}
            checkedKeys={checkedKeysMap[currentSelectionTarget]}
            onCheck={handleCheck}
            showLine
            treeData={treeDataOrgChart}
            expandedKeys={expandedKeys}
            onExpand={(expanded) => setExpandedKeys(expanded as string[])}
            checkStrictly={true}
          />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <h4 className="mb-2 text-base font-bold text-blue-800">Danh sách đã chọn</h4>
            <div className="flex items-center gap-2">
              <Button icon={<ArrowDownOutlined />} disabled={!selectedUser} onClick={handleMoveDown} />
              <Button icon={<ArrowUpOutlined />} disabled={!selectedUser} onClick={handleMoveUp} />
              <Button icon={<DeleteOutlined />} disabled={!selectedUser} onClick={handleDelete} />
            </div>
          </div>
          <div className="mt-2 border border-gray-300 h-[150px] overflow-y-auto">
            {orderedEmployees[currentSelectionTarget].map((employee) => {
              const employeeKey = `employee-${employee.value}`;
              return (
                <div
                  key={employeeKey}
                  className={cn(
                    'flex items-center gap-2 px-2 py-0.5',
                    selectedUser === employeeKey ? 'bg-blue-200' : 'hover:bg-blue-50',
                  )}
                  role="button"
                  onClick={() => setSelectedUser(employeeKey)}
                >
                  <span>{employee.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OrgChartModal;
