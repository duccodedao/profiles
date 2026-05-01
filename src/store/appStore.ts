import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  maintenanceMode: boolean;
  setMaintenanceMode: (status: boolean) => void;
  maintenanceTabs: { [key: string]: boolean };
  setMaintenanceTabs: (tabs: { [key: string]: boolean }) => void;
  isOnline: boolean;
  setOnlineStatus: (status: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  maintenanceMode: false,
  setMaintenanceMode: (status) => set({ maintenanceMode: status }),
  maintenanceTabs: {
    tools: false,
    features: false,
    products: false,
    utilities: false,
    games: false,
    files: false,
    news: false,
    market: false,
    banks: false,
    exchanges: false,
  },
  setMaintenanceTabs: (tabs) => set({ maintenanceTabs: tabs }),
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  setOnlineStatus: (status) => set({ isOnline: status }),
}));
