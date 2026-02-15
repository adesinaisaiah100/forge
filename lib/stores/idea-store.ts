import { create } from "zustand";
import type { IdeaDocument } from "@/lib/ai/types";

/**
 * Zustand Idea Store
 *
 * Caches user ideas in client memory so dashboard pages
 * don't need to re-fetch from the database on every navigation.
 *
 * Flow:
 * 1. User submits onboarding form → server action saves to Appwrite DB
 * 2. Returned document is stored here via addIdea()
 * 3. Dashboard reads from this store first
 * 4. If store is empty (e.g., page refresh), call loadIdeas() to fetch from DB
 */

interface IdeaState {
  // All user ideas (empty = not loaded yet)
  ideas: IdeaDocument[];

  // Currently active/selected idea
  activeIdea: IdeaDocument | null;

  // Loading state for async fetches
  isLoading: boolean;

  // Add an idea (after submission)
  addIdea: (idea: IdeaDocument) => void;

  // Set the active idea (when navigating to a specific idea)
  setActiveIdea: (idea: IdeaDocument | null) => void;

  // Store all ideas (after fetch)
  setIdeas: (ideas: IdeaDocument[]) => void;

  // Clear everything (e.g., on logout)
  clearIdeas: () => void;

  // Load all ideas from DB via server action (for page refreshes)
  loadIdeas: () => Promise<void>;

  // Backwards compatibility — set single idea (used by onboarding)
  setIdea: (idea: IdeaDocument) => void;

  // Backwards compatibility — load single idea
  loadIdea: () => Promise<void>;

  // Backwards compatibility — get the first idea
  idea: IdeaDocument | null;
}

export const useIdeaStore = create<IdeaState>((set, get) => ({
  ideas: [],
  activeIdea: null,
  isLoading: false,

  // Backwards compatibility getter
  get idea() {
    return get().ideas[0] ?? null;
  },

  addIdea: (idea) =>
    set((state) => ({
      ideas: [idea, ...state.ideas],
      activeIdea: idea,
    })),

  setActiveIdea: (idea) => set({ activeIdea: idea }),

  setIdeas: (ideas) => set({ ideas }),

  clearIdeas: () => set({ ideas: [], activeIdea: null }),

  // Backwards compatibility
  setIdea: (idea) => {
    const state = get();
    const exists = state.ideas.some((i) => i.$id === idea.$id);
    if (!exists) {
      set({ ideas: [idea, ...state.ideas], activeIdea: idea });
    } else {
      set({ activeIdea: idea });
    }
  },

  clearIdea: () => set({ ideas: [], activeIdea: null }),

  loadIdeas: async () => {
    if (get().ideas.length > 0) return;
    set({ isLoading: true });
    try {
      const { getUserIdeas } = await import("@/app/actions/ideas");
      const ideas = await getUserIdeas();
      set({ ideas, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  // Backwards compatibility
  loadIdea: async () => {
    if (get().ideas.length > 0) return;
    set({ isLoading: true });
    try {
      const { getUserIdea } = await import("@/app/actions/ideas");
      const idea = await getUserIdea();
      if (idea) {
        set({ ideas: [idea], activeIdea: idea, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
