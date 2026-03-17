import { create } from "zustand";

interface CampusState {
  activeCampusId: string | null;
  setActiveCampusId: (id: string | null) => void;
}

export const useCampusStore = create<CampusState>()((set) => ({
  activeCampusId: null,
  setActiveCampusId: (id) => set({ activeCampusId: id }),
}));
