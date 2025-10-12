import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Comment, DocumentAnnotation } from '../types';

interface CommentsStore {
  annotations: DocumentAnnotation[];
  currentDocumentId: string | null;
  
  // Actions
  setCurrentDocument: (documentId: string) => void;
  addAnnotation: (annotation: Omit<DocumentAnnotation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addComment: (annotationId: string, comment: Omit<Comment, 'id'>) => void;
  addReply: (annotationId: string, parentCommentId: string, reply: Omit<Comment, 'id'>) => void;
  resolveAnnotation: (annotationId: string) => void;
  deleteComment: (annotationId: string, commentId: string) => void;
  getAnnotationsForDocument: (documentId: string) => DocumentAnnotation[];
  getUnresolvedCount: (documentId: string) => number;
}

export const useCommentsStore = create<CommentsStore>()(
  persist(
    (set, get) => ({
      annotations: [],
      currentDocumentId: null,

      setCurrentDocument: (documentId) => set({ currentDocumentId: documentId }),

      addAnnotation: (annotationData) => {
        const newAnnotation: DocumentAnnotation = {
          id: `annotation-${Date.now()}`,
          ...annotationData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          annotations: [newAnnotation, ...state.annotations]
        }));

        return newAnnotation;
      },

      addComment: (annotationId, commentData) => {
        const newComment: Comment = {
          id: `comment-${Date.now()}`,
          ...commentData,
        };

        set((state) => ({
          annotations: state.annotations.map(annotation =>
            annotation.id === annotationId
              ? {
                  ...annotation,
                  commentThread: [...annotation.commentThread, newComment],
                  updatedAt: new Date().toISOString(),
                }
              : annotation
          )
        }));
      },

      addReply: (annotationId, parentCommentId, replyData) => {
        const newReply: Comment = {
          id: `reply-${Date.now()}`,
          ...replyData,
        };

        set((state) => ({
          annotations: state.annotations.map(annotation =>
            annotation.id === annotationId
              ? {
                  ...annotation,
                  commentThread: annotation.commentThread.map(comment =>
                    comment.id === parentCommentId
                      ? {
                          ...comment,
                          replies: [...(comment.replies || []), newReply],
                        }
                      : comment
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : annotation
          )
        }));
      },

      resolveAnnotation: (annotationId) => {
        set((state) => ({
          annotations: state.annotations.map(annotation =>
            annotation.id === annotationId
              ? {
                  ...annotation,
                  resolved: true,
                  updatedAt: new Date().toISOString(),
                }
              : annotation
          )
        }));
      },

      deleteComment: (annotationId, commentId) => {
        set((state) => ({
          annotations: state.annotations.map(annotation =>
            annotation.id === annotationId
              ? {
                  ...annotation,
                  commentThread: annotation.commentThread.filter(
                    comment => comment.id !== commentId
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : annotation
          )
        }));
      },

      getAnnotationsForDocument: (documentId) => {
        return get().annotations.filter(annotation => 
          annotation.documentId === documentId && !annotation.resolved
        );
      },

      getUnresolvedCount: (documentId) => {
        return get().annotations.filter(annotation => 
          annotation.documentId === documentId && !annotation.resolved
        ).length;
      },
    }),
    {
      name: 'comments-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);