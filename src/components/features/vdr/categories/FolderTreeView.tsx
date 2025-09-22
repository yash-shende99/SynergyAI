import { FC } from 'react';
import { Folder } from 'lucide-react';
import { DocumentFolderKey } from '../../../../types';

interface Category {
  name: string;
  document_count: number;
}

interface FolderTreeViewProps {
  folders: Category[];
  selectedFolder: DocumentFolderKey; // Updated type
  onSelectFolder: (folderName: DocumentFolderKey) => void; // Updated type
}

const FolderTreeView: FC<FolderTreeViewProps> = ({ folders, selectedFolder, onSelectFolder }) => {
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full">
      <h3 className="font-semibold text-white mb-4">Categories</h3>
      <div className="space-y-1 max-h-96 overflow-y-auto"> {/* Added scroll for many categories */}
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
            <div className="flex items-center gap-2 min-w-0 flex-1"> {/* Added flex styles */}
              <Folder size={16} className="flex-shrink-0" />
              <span className="truncate" title={folder.name}> {/* Added truncate and title */}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderTreeView;