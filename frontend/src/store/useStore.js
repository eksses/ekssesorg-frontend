import { create } from "zustand";

export const useStore = create((set) => ({
  // Modal tracking
  activeModal: null, // "project", "invoice", "client", "contract", null
  openModal: (modalName) => set({ activeModal: modalName }),
  closeModal: () => set({ activeModal: null }),

  // Data cache (saves prop drilling and double-fetches)
  dashboardData: null,
  setDashboardData: (data) => set({ dashboardData: data }),
  
  // Triggers for refetching across far apart components
  refetchTrigger: 0,
  triggerRefetch: () => set((state) => ({ refetchTrigger: state.refetchTrigger + 1 }))
}));
