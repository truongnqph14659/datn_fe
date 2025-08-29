// stores/authStore.ts
import {localStorageKeys} from '@/shared/constants';
import {IEmployeeRes} from '@/shared/types/employee.type';
import {create} from 'zustand';
import {persist, devtools} from 'zustand/middleware';

export interface AuthState {
  access_token: string | null;
  user: IEmployeeRes | null;
  isAuthenticated: boolean;
  setUser: (user: IEmployeeRes) => void;
  login: (token: string, user: IEmployeeRes) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        access_token: null,
        user: null,
        isAuthenticated: false,
        setUser: (user) => {
          set((s) => ({
            ...s,
            user,
          }));
        },
        login: (token, user) => {
          set({access_token: token, user, isAuthenticated: true});
        },
        logout: () => {
          localStorage.removeItem(localStorageKeys.ACCESS_TOKEN);
          set({access_token: null, user: null, isAuthenticated: false});
        },
      }),
      {
        name: 'auth-storage', // key trong localStorage
        partialize: (state) => ({
          access_token: state.access_token,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    {name: 'AuthStore'},
  ),
);
