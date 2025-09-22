import { create } from 'zustand';
import { Draft } from '../types';

// This is the initial data for our drafts
const initialDrafts: Draft[] = [
  { 
    id: 'draft-1', 
    title: 'Acquisition Memo: Project Helios', 
    createdBy: { 
      name: 'Yash Shende', 
      avatarUrl: 'https://placehold.co/24x24/E2E8F0/111827?text=YS' 
    }, 
    lastModified: 'Sep 5, 2025', 
    status: 'Draft' 
  },
  { 
    id: 'draft-2', 
    title: 'Risk Profile - TargetX', 
    createdBy: { 
      name: 'Priya Gupta', 
      avatarUrl: 'https://placehold.co/24x24/FBCFE8/831843?text=PG' 
    }, 
    lastModified: 'Sep 3, 2025', 
    status: 'Review' 
  },
  { 
    id: 'draft-3', 
    title: 'Valuation Report: AquaLogistics', 
    createdBy: { 
      name: 'Raj Mehta', 
      avatarUrl: 'https://placehold.co/24x24/BAE6FD/0C4A6E?text=RM' 
    }, 
    lastModified: 'Aug 28, 2025', 
    status: 'Final' 
  },
];

// Define the state and actions for our store
interface ReportStore {
  drafts: Draft[];
  addDraft: (draft: Draft) => void;
  deleteDraft: (id: string) => void;
  duplicateDraft: (id: string) => void;
}

export const useReportStore = create<ReportStore>((set) => ({
  drafts: initialDrafts,
  
  // This action adds a new draft to the TOP of the list
  addDraft: (newDraft) => set((state) => ({ 
    drafts: [newDraft, ...state.drafts] 
  })),

  // This action deletes a draft by its ID
  deleteDraft: (id) => set((state) => ({ 
    drafts: state.drafts.filter(d => d.id !== id) 
  })),

  // This action duplicates a draft and places the copy at the top
  duplicateDraft: (id) => set((state) => {
    const original = state.drafts.find(d => d.id === id);
    if (!original) return state; // Do nothing if not found
    const newDraft = { ...original, id: `draft-${Date.now()}`, title: `${original.title} (Copy)` };
    return { drafts: [newDraft, ...state.drafts] };
  }),
}));