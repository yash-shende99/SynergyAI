// store/reportStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Draft, DraftStatus } from '../types';

// Remove initialDrafts and start with empty array
// Let persistence handle the data

interface ReportStore {
  drafts: Draft[];
  currentDraft: Draft | null;
  isLoading: boolean;
  error: string | null;

  // Core CRUD actions
  addDraft: (draft: Omit<Draft, 'id' | 'createdAt' | 'lastModified'>) => void;
  updateDraft: (id: string, updates: Partial<Draft>) => void;
  deleteDraft: (id: string) => void;
  duplicateDraft: (id: string) => void;

  // Additional actions
  setCurrentDraft: (draft: Draft | null) => void;
  updateDraftStatus: (id: string, status: DraftStatus) => void;
  updateDraftContent: (id: string, content: any) => void;
  getDraftsByProject: (projectId: string) => Draft[];
  getDraftsByStatus: (status: DraftStatus) => Draft[];

  // Async actions
  fetchProjectDrafts: (projectId: string) => Promise<void>;

  // Utility actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  // Add this to initialize with some data if empty
  initializeWithSampleData: () => void;
}

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      drafts: [], // Start with empty array
      currentDraft: null,
      isLoading: false,
      error: null,

      // Initialize with sample data if needed
      initializeWithSampleData: () => {
        const { drafts } = get();
        if (drafts.length === 0) {
          const sampleDrafts: Draft[] = [
            {
              id: 'draft-1',
              title: 'Acquisition Memo: Project Helios',
              createdBy: {
                name: 'Yash Shende',
                avatarUrl: 'https://placehold.co/24x24/E2E8F0/111827?text=YS'
              },
              lastModified: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }),
              status: 'Draft',
              projectId: 'project-1',
              createdAt: new Date().toISOString()
            },
            {
              id: 'draft-2',
              title: 'Risk Profile - TargetX',
              createdBy: {
                name: 'Priya Gupta',
                avatarUrl: 'https://placehold.co/24x24/FBCFE8/831843?text=PG'
              },
              lastModified: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }),
              status: 'Review',
              projectId: 'project-2',
              createdAt: new Date().toISOString()
            }
          ];
          set({ drafts: sampleDrafts });
        }
      },

      fetchProjectDrafts: async (projectId: string): Promise<void> => {
        set({ isLoading: true, error: null });
        try {
          console.log(`Fetching drafts for project: ${projectId}`);
          await new Promise(resolve => setTimeout(resolve, 500));

          // For now, just filter existing drafts
          const projectDrafts = get().drafts.filter(draft => draft.projectId === projectId);
          set({ isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch project drafts', isLoading: false });
          throw error;
        }
      },

      // ... rest of your methods (addDraft, updateDraft, etc.)
      // In your store's addDraft method
      addDraft: (draftData) => set((state) => {
        const newDraft: Draft = {
          ...draftData,
          id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          lastModified: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          createdAt: new Date().toISOString(),
          // Ensure avatarUrl is never empty
          createdBy: {
            ...draftData.createdBy,
            avatarUrl: draftData.createdBy.avatarUrl || '/default-avatar.png' // or use a data URL
          }
        };

        return {
          drafts: [newDraft, ...state.drafts],
          currentDraft: newDraft
        };
      }),

      updateDraft: (id, updates) => set((state) => ({
        drafts: state.drafts.map(draft =>
          draft.id === id
            ? {
              ...draft,
              ...updates,
              lastModified: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            }
            : draft
        ),
        currentDraft: state.currentDraft?.id === id
          ? { ...state.currentDraft, ...updates }
          : state.currentDraft
      })),

      updateDraftContent: (id, content) => {
        get().updateDraft(id, { content });
      },

      deleteDraft: (id) => set((state) => ({
        drafts: state.drafts.filter(d => d.id !== id),
        currentDraft: state.currentDraft?.id === id ? null : state.currentDraft
      })),

      duplicateDraft: (id) => set((state) => {
        const original = state.drafts.find(d => d.id === id);
        if (!original) return state;

        const newDraft: Draft = {
          ...original,
          id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: `${original.title} (Copy)`,
          status: 'Draft',
          lastModified: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          createdAt: new Date().toISOString()
        };

        return {
          drafts: [newDraft, ...state.drafts],
          currentDraft: newDraft
        };
      }),

      setCurrentDraft: (draft) => set({ currentDraft: draft }),

      updateDraftStatus: (id, status) => {
        get().updateDraft(id, { status });
      },

      getDraftsByProject: (projectId) => {
        return get().drafts.filter(draft => draft.projectId === projectId);
      },

      getDraftsByStatus: (status) => {
        return get().drafts.filter(draft => draft.status === status);
      },

      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'report-store',
      storage: createJSONStorage(() => localStorage), // Explicitly use localStorage
    }
  )
);

// Initialize sample data on first load
if (typeof window !== 'undefined') {
  const initializeStore = () => {
    const store = useReportStore.getState();
    store.initializeWithSampleData();
  };
  initializeStore();
}