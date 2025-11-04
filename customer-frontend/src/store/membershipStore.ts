import { create } from 'zustand';
import type { UserMembership } from '../api/membership';

interface MembershipStore {
  membership: UserMembership | null;
  setMembership: (membership: UserMembership | null) => void;
  clearMembership: () => void;
  decrementCoffees: () => void;
}

export const useMembershipStore = create<MembershipStore>((set) => ({
  membership: null,

  setMembership: (membership) => {
    set({ membership });
  },

  clearMembership: () => {
    set({ membership: null });
  },

  decrementCoffees: () => {
    set((state) => {
      if (!state.membership) return state;
      return {
        membership: {
          ...state.membership,
          coffees_remaining: Math.max(0, state.membership.coffees_remaining - 1),
        },
      };
    });
  },
}));
