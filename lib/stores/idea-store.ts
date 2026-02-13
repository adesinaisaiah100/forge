import { create } from "zustand";
import type { IdeaDocument } from "@/app/actions/ideas";

/**
 * Zustand Idea Store
 *
 * Caches the user's active idea in client memory so dashboard and AI pages
 * don't need to re-fetch from the database on every navigation.
 *
 * Flow:
 * 1. User submits onboarding form → server action saves to Appwrite DB
 * 2. Returned document is stored here via setIdea()
 * 3. Dashboard/AI pages read from this store first
 * 4. If store is empty (e.g., page refresh), call loadIdea() to fetch from DB
 */

interface IdeaState {
  // The cached idea document (null = not loaded yet)
  idea: IdeaDocument | null;

  // Loading state for async fetches
  isLoading: boolean;

  // Store an idea (after submission or fetch)
  setIdea: (idea: IdeaDocument) => void;

  // Clear the cached idea (e.g., on logout)
  clearIdea: () => void;

  // Load idea from DB via server action (for page refreshes)
  loadIdea: () => Promise<void>;
}

export const useIdeaStore = create<IdeaState>((set, get) => ({
  idea: null,
  isLoading: false,

  setIdea: (idea) => set({ idea }),

  clearIdea: () => set({ idea: null }),

  loadIdea: async () => {
    // Don't refetch if we already have it
    if (get().idea) return;

    set({ isLoading: true });

    try {
      // Dynamic import to avoid bundling server action in client chunk
      const { getUserIdea } = await import("@/app/actions/ideas");
      const idea = await getUserIdea();
      set({ idea, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
