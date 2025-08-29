import {ITimekeeping} from '@/shared/types/attendance.type';
import {create} from 'zustand';
import {devtools} from 'zustand/middleware';

export interface TimekeepingDetailType {
  employeeId: number;
  name: string;
  email: string;
  timekeeping: ITimekeeping;
}

interface UserTimekeepingStore {
  // State
  selectedTimekeeping: TimekeepingDetailType | null;
  // Actions
  setSelectedTimekeeping: (timekeeping: TimekeepingDetailType | null) => void;
  resetState: () => void;
}

export const useUserTimekeepingStore = create<UserTimekeepingStore>()(
  devtools(
    (set) => ({
      // Initial state
      selectedTimekeeping: null,
      // Actions
      setSelectedTimekeeping: (timekeeping) => set({selectedTimekeeping: timekeeping}),
      resetState: () => set({selectedTimekeeping: null}),
    }),
    {name: 'UserTimekeepingStore'},
  ),
);
