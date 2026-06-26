import { create } from "zustand";

type TrackedPlayerState = {
  activeTrackedPlayerId: number | null;
  setActiveTrackedPlayerId: (id: number | null) => void;
};

export const useTrackedPlayerStore = create<TrackedPlayerState>((set) => ({
  activeTrackedPlayerId: null,
  setActiveTrackedPlayerId: (id) => set({ activeTrackedPlayerId: id }),
}));
