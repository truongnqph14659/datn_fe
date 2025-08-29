import {create} from 'zustand';
import {devtools, persist} from 'zustand/middleware';

interface SideBarStore {
  isSideBarOpen: boolean;
  toggleSideBar: () => void;
}

export const useSideBarStore = create<SideBarStore>()(
  devtools(
    persist(
      (set) => ({
        isSideBarOpen: false,
        toggleSideBar: () => set((state) => ({isSideBarOpen: !state.isSideBarOpen})),
      }),
      {
        name: 'sidebar-store', // Key lưu vào localStorage
      },
    ),
    {name: 'SidebarStore'}, // Tên hiển thị trong Redux DevTools
  ),
);
