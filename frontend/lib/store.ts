import { create } from 'zustand';

export interface UserProfileState {
  id: string;
  phone: string;
  name: string;
  email?: string | null;
  age?: number | null;
  language: string;
  state: string;
  district: string;
  lgdDistrictCode?: string | null;
  isRural?: boolean | null;
  jurisdiction?: 'rural' | 'peri_urban' | string | null;
  gender?: string | null;
  socialCategory?: string | null;
  isDifferentlyAbled?: boolean | null;
  isExServiceman?: boolean | null;
  isTraditionalArtisan?: boolean | null;
  isStreetVendor?: boolean | null;
  isStartup?: boolean | null;
}

export interface BusinessProfileState {
  id: string;
  sector?: string | null;
  type: string;
  activity?: string | null;
  stage?: string | null;
  description?: string | null;
  isNewBusiness?: boolean | null;
  projectCost?: number | null;
  estimatedCapital: number;
  requestedFinancing?: number | null;
  promoterContribution?: number | null;
  annualIncome?: number | null;
  annualTurnover?: number | null;
  monthlyIncome?: number | null;
  monthlyExpenses?: number | null;
  existingDebt?: number | null;
  existingMonthlyEmi?: number | null;
}

interface AppStoreState {
  // Existing contributor state
  user: UserProfileState | any | null;
  business: BusinessProfileState | any | null;
  selectedBusinessId: string | null;

  setUser: (user: any) => void;
  setBusiness: (business: any) => void;
  setProfile: (user: any, business: any) => void;
  setSelectedBusinessId: (id: string | null) => void;
  clearProfile: () => void;
  logout: () => void;

  // UI state required by the polished sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  // Existing contributor state
  user: null,
  business: null,
  selectedBusinessId: null,

  setUser: (user) => set({ user }),
  setBusiness: (business) => set({ business }),
  setProfile: (user, business) =>
    set({
      user,
      business,
      selectedBusinessId: business?.id || null,
    }),
  setSelectedBusinessId: (id) => set({ selectedBusinessId: id }),
  clearProfile: () =>
    set({
      user: null,
      business: null,
      selectedBusinessId: null,
    }),
  logout: () =>
    set({
      user: null,
      business: null,
      selectedBusinessId: null,
    }),

  // UI state
  sidebarCollapsed: true,
  toggleSidebar: () =>
    set((state) => ({
      sidebarCollapsed: !state.sidebarCollapsed,
    })),
  setSidebarCollapsed: (collapsed) =>
    set({
      sidebarCollapsed: collapsed,
    }),
  mobileSidebarOpen: false,
  setMobileSidebarOpen: (open) =>
    set({
      mobileSidebarOpen: open,
    }),
}));