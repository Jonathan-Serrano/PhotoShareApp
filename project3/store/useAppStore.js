import { create } from 'zustand';

const useAppStore = create((set) => ({
  isChecked: false,
  toggleChecked: () => set((state) => ({ isChecked: !state.isChecked })),
  setIsChecked: (value) => set({ isChecked: value }),
  isLoggedIn: false,
  setIsLoggedIn: (value) => set({ isLoggedIn: value }),
}));
export default useAppStore;
