// components/features/vdr/categories/FolderTreeView.tsx
import { FC } from 'react';
import { Folder } from 'lucide-react';
import { DocumentFolderKey } from '../../../../types';

interface Category {
  name: string;
  document_count: number;
}

interface FolderTreeViewProps {
  folders: Category[];
  selectedFolder: DocumentFolderKey;
  onSelectFolder: (folderName: DocumentFolderKey) => void;
  projectId?: string; // Optional projectId for context
}

const FolderTreeView: FC<FolderTreeViewProps> = ({ 
  folders, 
  selectedFolder, 
  onSelectFolder,
  projectId 
}) => {
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Categories</h3>
        {projectId && (
          <span className="text-xs text-secondary bg-surface px-2 py-1 rounded">
            Project: {projectId.substring(0, 8)}...
          </span>
        )}
      </div>
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {folders.map(folder => (
          <button
            key={folder.name}
            onClick={() => onSelectFolder(folder.name as DocumentFolderKey)}
            className={`w-full flex items-center justify-between p-2 text-sm rounded-md transition-colors group ${
              selectedFolder === folder.name
                ? 'bg-primary/20 text-primary font-semibold'
                : 'text-secondary hover:bg-surface'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Folder size={16} className="flex-shrink-0" />
              <span className="truncate" title={folder.name}>
                {folder.name}
              </span>
            </div>
            <span className="bg-surface px-2 py-1 rounded text-xs flex-shrink-0 ml-2">
              {folder.document_count}
            </span>
          </button>
        ))}
        
        {folders.length === 0 && (
          <div className="text-center text-secondary py-4">
            <p className="text-sm">No categories found</p>
            {projectId && (
              <p className="text-xs mt-1">Upload documents to see categories</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderTreeView;