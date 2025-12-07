import { create } from 'zustand';

const useAppStore = create((set) => ({
  isChecked: false,
  toggleChecked: () => set((state) => ({ isChecked: !state.isChecked })),
  setIsChecked: (value) => set({ isChecked: value }),

  isLoggedIn: false,
  setIsLoggedIn: (value) => set({ isLoggedIn: value }),

  userInfo: {},
  setUserInfo: (value) => set({ userInfo: value }),
}));
export default useAppStore;
