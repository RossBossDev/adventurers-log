import { create } from "zustand";

type MockAuthState = {
  isAuthenticated: boolean;
  viewAsLoggedInUser: () => void;
  signOut: () => void;
};

export const useMockAuthStore = create<MockAuthState>((set) => ({
  isAuthenticated: false,
  viewAsLoggedInUser: () => set({ isAuthenticated: true }),
  signOut: () => set({ isAuthenticated: false }),
}));
