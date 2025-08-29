import {create} from 'zustand';

export type EmployeeItem = {
  value: string;
  label: string;
};

type OrgChartState = {
  orgChartVisible: boolean;
  currentSelectionTarget: 'approvers' | 'referrers';
  expandedKeys: string[];
  checkedKeysMap: {
    approvers: React.Key[];
    referrers: React.Key[];
  };
  selectedUser: string;
  orderedEmployees: {
    approvers: EmployeeItem[];
    referrers: EmployeeItem[];
  };
  treeDataOrgChart: any[];
  setOrgChartVisible: (visible: boolean) => void;
  setCurrentSelectionTarget: (target: 'approvers' | 'referrers') => void;
  setExpandedKeys: (keys: string[]) => void;
  setCheckedKeysForTarget: (target: 'approvers' | 'referrers', keys: React.Key[]) => void;
  setSelectedUser: (userId: string) => void;
  setOrderedEmployees: (employees: {approvers: EmployeeItem[]; referrers: EmployeeItem[]}) => void;
  updateOrderedEmployees: (target: 'approvers' | 'referrers', employees: EmployeeItem[]) => void;
  setTreeDataOrgChart: (data: any[]) => void;
  resetStore: () => void;
};

export const useOrgChartStore = create<OrgChartState>((set) => ({
  orgChartVisible: false,
  currentSelectionTarget: 'approvers',
  expandedKeys: [],
  checkedKeysMap: {
    approvers: [],
    referrers: [],
  },
  selectedUser: '',
  orderedEmployees: {
    approvers: [],
    referrers: [],
  },
  treeDataOrgChart: [],
  setOrgChartVisible: (visible) => set(() => ({orgChartVisible: visible})),
  setCurrentSelectionTarget: (target) => set(() => ({currentSelectionTarget: target})),
  setExpandedKeys: (keys) => set(() => ({expandedKeys: keys})),
  setCheckedKeysForTarget: (target, keys) =>
    set((state) => ({
      checkedKeysMap: {
        ...state.checkedKeysMap,
        [target]: keys,
      },
    })),
  setSelectedUser: (userId) => set(() => ({selectedUser: userId})),
  setOrderedEmployees: (employees) => set(() => ({orderedEmployees: employees})),
  updateOrderedEmployees: (target, employees) =>
    set((state) => ({
      orderedEmployees: {
        ...state.orderedEmployees,
        [target]: employees,
      },
    })),
  setTreeDataOrgChart: (data) => set(() => ({treeDataOrgChart: data})),
  resetStore: () =>
    set(() => ({
      orgChartVisible: false,
      currentSelectionTarget: 'approvers',
      expandedKeys: [],
      checkedKeysMap: {
        approvers: [],
        referrers: [],
      },
      selectedUser: '',
      orderedEmployees: {
        approvers: [],
        referrers: [],
      },
    })),
}));
