import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DocumentVersion, VersionHistory } from '../types';

interface VersionHistoryStore {
  histories: Record<string, VersionHistory>;
  
  // Actions
  initializeDocument: (documentId: string, initialContent: string, userId: string, userName: string) => void;
  saveVersion: (documentId: string, content: string, userId: string, userName: string, changes?: string[]) => void;
  getVersions: (documentId: string) => DocumentVersion[];
  getCurrentVersion: (documentId: string) => DocumentVersion | null;
  restoreVersion: (documentId: string, versionId: string) => string | null;
  compareVersions: (documentId: string, versionId1: string, versionId2: string) => { added: string[], removed: string[] };
  getVersionStats: (documentId: string) => { totalVersions: number, lastSaved: string | null };
  deleteVersion: (documentId: string, versionId: string) => void;
  clearHistory: (documentId: string) => void;
}

export const useVersionHistoryStore = create<VersionHistoryStore>()(
  persist(
    (set, get) => ({
      histories: {},

      initializeDocument: (documentId, initialContent, userId, userName) => {
        const { histories } = get();
        
        if (!histories[documentId]) {
          const initialVersion: DocumentVersion = {
            id: `v1-${Date.now()}`,
            documentId,
            version: 'v1.0',
            content: initialContent,
            createdAt: new Date().toISOString(),
            createdBy: {
              userId,
              userName,
            },
            changes: ['Initial version created'],
            wordCount: countWords(initialContent),
            characterCount: initialContent.length,
          };

          set({
            histories: {
              ...histories,
              [documentId]: {
                documentId,
                versions: [initialVersion],
                currentVersionId: initialVersion.id,
                autoSaveEnabled: true,
              },
            },
          });
        }
      },

      saveVersion: (documentId, content, userId, userName, changes = []) => {
        const { histories } = get();
        const history = histories[documentId];
        
        if (!history) {
          get().initializeDocument(documentId, content, userId, userName);
          return;
        }

        const currentVersion = history.versions.find(v => v.id === history.currentVersionId);
        const newChanges = changes.length > 0 ? changes : generateChanges(currentVersion?.content || '', content);

        // Only save if there are meaningful changes
        if (newChanges.length > 0 || !currentVersion) {
          const versionNumber = history.versions.length + 1;
          const newVersion: DocumentVersion = {
            id: `v${versionNumber}-${Date.now()}`,
            documentId,
            version: `v${versionNumber}.0`,
            content,
            createdAt: new Date().toISOString(),
            createdBy: {
              userId,
              userName,
            },
            changes: newChanges,
            wordCount: countWords(content),
            characterCount: content.length,
          };

          set({
            histories: {
              ...histories,
              [documentId]: {
                ...history,
                versions: [newVersion, ...history.versions].slice(0, 50), // Keep last 50 versions
                currentVersionId: newVersion.id,
              },
            },
          });
        }
      },

      getVersions: (documentId) => {
        const { histories } = get();
        return histories[documentId]?.versions || [];
      },

      getCurrentVersion: (documentId) => {
        const { histories } = get();
        const history = histories[documentId];
        if (!history) return null;
        
        return history.versions.find(v => v.id === history.currentVersionId) || null;
      },

      restoreVersion: (documentId, versionId) => {
        const { histories } = get();
        const history = histories[documentId];
        
        if (!history) return null;

        const versionToRestore = history.versions.find(v => v.id === versionId);
        if (!versionToRestore) return null;

        // Create a new version based on the restored content
        const restoredVersion: DocumentVersion = {
          ...versionToRestore,
          id: `restored-${Date.now()}`,
          version: `v${history.versions.length + 1}.0 (Restored)`,
          createdAt: new Date().toISOString(),
          changes: [`Restored from ${versionToRestore.version}`],
        };

        set({
          histories: {
            ...histories,
            [documentId]: {
              ...history,
              versions: [restoredVersion, ...history.versions],
              currentVersionId: restoredVersion.id,
            },
          },
        });

        return restoredVersion.content;
      },

      compareVersions: (documentId, versionId1, versionId2) => {
        const { histories } = get();
        const history = histories[documentId];
        
        if (!history) return { added: [], removed: [] };

        const version1 = history.versions.find(v => v.id === versionId1);
        const version2 = history.versions.find(v => v.id === versionId2);

        if (!version1 || !version2) return { added: [], removed: [] };

        return generateDiff(version1.content, version2.content);
      },

      getVersionStats: (documentId) => {
        const { histories } = get();
        const history = histories[documentId];
        
        if (!history) return { totalVersions: 0, lastSaved: null };

        return {
          totalVersions: history.versions.length,
          lastSaved: history.versions[0]?.createdAt || null,
        };
      },

      deleteVersion: (documentId, versionId) => {
        const { histories } = get();
        const history = histories[documentId];
        
        if (!history) return;

        const updatedVersions = history.versions.filter(v => v.id !== versionId);
        const newCurrentVersionId = updatedVersions[0]?.id || '';

        set({
          histories: {
            ...histories,
            [documentId]: {
              ...history,
              versions: updatedVersions,
              currentVersionId: newCurrentVersionId,
            },
          },
        });
      },

      clearHistory: (documentId) => {
        const { histories } = get();
        const { [documentId]: _, ...remainingHistories } = histories;
        
        set({ histories: remainingHistories });
      },
    }),
    {
      name: 'version-history-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Helper functions
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function generateChanges(oldContent: string, newContent: string): string[] {
  const changes: string[] = [];
  
  const oldWords = oldContent.split(/\s+/).filter(word => word.length > 0);
  const newWords = newContent.split(/\s+/).filter(word => word.length > 0);
  
  const wordDiff = newWords.length - oldWords.length;
  if (wordDiff > 0) {
    changes.push(`Added ${wordDiff} words`);
  } else if (wordDiff < 0) {
    changes.push(`Removed ${Math.abs(wordDiff)} words`);
  }
  
  // Simple content change detection
  if (oldContent.length !== newContent.length) {
    const charDiff = newContent.length - oldContent.length;
    if (Math.abs(charDiff) > 10) { // Only note significant changes
      changes.push(charDiff > 0 ? `Added ${charDiff} characters` : `Removed ${Math.abs(charDiff)} characters`);
    }
  }
  
  return changes.length > 0 ? changes : ['Content modified'];
}

function generateDiff(oldText: string, newText: string): { added: string[], removed: string[] } {
  // Simple diff implementation - in a real app you'd use a proper diff library
  const oldLines = oldText.split('\n').filter(line => line.trim());
  const newLines = newText.split('\n').filter(line => line.trim());
  
  const added = newLines.filter(line => !oldLines.includes(line));
  const removed = oldLines.filter(line => !newLines.includes(line));
  
  return { added, removed };
}