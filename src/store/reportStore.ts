import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Draft, DraftStatus } from '../types';

interface ReportStore {
  drafts: Draft[];
  currentDraft: Draft | null;
  isLoading: boolean;
  error: string | null;

  // ✅ FIX: Return Draft from addDraft
  addDraft: (draft: Omit<Draft, 'id' | 'lastModified'>) => Draft; // Changed return type
  updateDraft: (id: string, updates: Partial<Draft>) => void;
  deleteDraft: (id: string) => void;
  duplicateDraft: (id: string) => void;

  // ... rest of your interface remains the same
  setCurrentDraft: (draft: Draft | null) => void;
  updateDraftStatus: (id: string, status: DraftStatus) => void;
  updateDraftContent: (id: string, content: any) => void;
  getDraftsByProject: (projectId: string) => Draft[];
  getDraftsByStatus: (status: DraftStatus) => Draft[];
  fetchProjectDrafts: (projectId: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initializeWithSampleData: () => void;
}

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      drafts: [],
      currentDraft: null,
      isLoading: false,
      error: null,

      // ✅ FIXED: addDraft now returns Draft
      addDraft: (draftData) => {
        const newDraft: Draft = {
          id: `draft-${Date.now()}`,
          title: draftData.title || 'Untitled Draft',
          content: draftData.content || { html: '<p>Start writing your report...</p>' },
          createdBy: draftData.createdBy || { name: 'You', avatarUrl: '' },
          status: 'Draft',
          lastModified: new Date().toLocaleDateString(),
          projectId: draftData.projectId || '',
          createdAt: new Date().toISOString() // ✅ Now this is allowed
        };

        set((state) => ({
          drafts: [newDraft, ...state.drafts]
        }));

        return newDraft; // ✅ Now returns Draft instead of void
      },

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
              createdAt: new Date().toISOString() // ✅ Now valid
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
              status: 'In Review',
              projectId: 'project-2',
              createdAt: new Date().toISOString() // ✅ Now valid
            }
          ];
          set({ drafts: sampleDrafts });
        }
      },

      // ✅ FIXED: duplicateDraft
      duplicateDraft: (id) => {
        const state = get();
        const original = state.drafts.find(d => d.id === id);
        if (!original) return;

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

        set({
          drafts: [newDraft, ...state.drafts],
          currentDraft: newDraft
        });

        return newDraft; // ✅ Return the duplicated draft
      },

      // ... rest of your methods remain the same
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

      fetchProjectDrafts: async (projectId: string): Promise<void> => {
        set({ isLoading: true, error: null });
        try {
          console.log(`Fetching drafts for project: ${projectId}`);
          await new Promise(resolve => setTimeout(resolve, 500));
          set({ isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch project drafts', isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'report-store',
      storage: createJSONStorage(() => localStorage),
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