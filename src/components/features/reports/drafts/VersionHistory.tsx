'use client';

import { FC, useState } from 'react';
import { DocumentVersion } from '../../../../types';
import { Clock, RotateCcw, Eye, Trash2, Users, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '../../../ui/button';
import { useVersionHistoryStore } from '../../../../store/versionHistoryStore';

interface VersionHistoryProps {
  documentId: string;
  onRestoreVersion?: (content: string) => void;
}

const VersionHistory: FC<VersionHistoryProps> = ({ documentId, onRestoreVersion }) => {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [version1, setVersion1] = useState<string | null>(null);
  const [version2, setVersion2] = useState<string | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState<string | null>(null);
  
  const {
    getVersions,
    getCurrentVersion,
    restoreVersion,
    compareVersions,
    getVersionStats,
    deleteVersion,
  } = useVersionHistoryStore();

  const versions = getVersions(documentId);
  const currentVersion = getCurrentVersion(documentId);
  const stats = getVersionStats(documentId);

  const handleRestoreVersion = (versionId: string) => {
    const content = restoreVersion(documentId, versionId);
    if (content && onRestoreVersion) {
      onRestoreVersion(content);
      setRestoreConfirm(null);
    } else {
      console.error('Failed to restore version');
    }
  };

  const handleRestoreClick = (versionId: string, versionName: string) => {
    setRestoreConfirm(versionId);
  };

  const handleCancelRestore = () => {
    setRestoreConfirm(null);
  };

  const handleCompare = () => {
    if (version1 && version2) {
      const diff = compareVersions(documentId, version1, version2);
      console.log('Version comparison:', diff);
      // You could display this in a modal or separate view
      alert(`Comparison result:\nAdded: ${diff.added.length} items\nRemoved: ${diff.removed.length} items`);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const formatDetailedDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (compareMode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Compare Versions</h3>
          <Button variant="ghost" size="sm" onClick={() => setCompareMode(false)}>
            Back to History
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-secondary mb-2 block">Version 1</label>
            <select 
              value={version1 || ''}
              onChange={(e) => setVersion1(e.target.value)}
              className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-white"
            >
              <option value="">Select version...</option>
              {versions.map(version => (
                <option key={version.id} value={version.id}>
                  {version.version} - {formatTimeAgo(version.createdAt)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm text-secondary mb-2 block">Version 2</label>
            <select 
              value={version2 || ''}
              onChange={(e) => setVersion2(e.target.value)}
              className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-white"
            >
              <option value="">Select version...</option>
              {versions.map(version => (
                <option key={version.id} value={version.id}>
                  {version.version} - {formatTimeAgo(version.createdAt)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <Button 
          onClick={handleCompare}
          disabled={!version1 || !version2}
          className="w-full"
        >
          Compare Versions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <div className="bg-background/30 rounded-lg p-4 border border-border/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock size={18} />
            Version History
          </h3>
          <div className="text-sm text-secondary">
            {stats.totalVersions} versions
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="text-center">
            <div className="text-secondary">Current</div>
            <div className="text-white font-semibold">{currentVersion?.version || 'v1.0'}</div>
          </div>
          <div className="text-center">
            <div className="text-secondary">Last Saved</div>
            <div className="text-white font-semibold">
              {stats.lastSaved ? formatTimeAgo(stats.lastSaved) : 'Never'}
            </div>
          </div>
        </div>
      </div>


      {/* Versions List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={48} className="text-secondary mx-auto mb-3 opacity-50" />
            <p className="text-secondary text-sm">No version history yet</p>
            <p className="text-secondary text-xs mt-1">Versions will appear here as you save changes</p>
          </div>
        ) : (
          versions.map((version) => (
            <div
              key={version.id}
              className={`bg-background/30 rounded-lg p-3 border ${
                version.id === currentVersion?.id 
                  ? 'border-primary/50 bg-primary/10' 
                  : 'border-border/50'
              } ${
                restoreConfirm === version.id ? 'border-yellow-500 bg-yellow-500/10' : ''
              }`}
            >
              {restoreConfirm === version.id ? (
                // Restore Confirmation
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <AlertTriangle size={16} />
                    <span className="text-sm font-semibold">Confirm Restore</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    Restore version <strong>{version.version}</strong>? This will replace your current content.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleRestoreVersion(version.id)}
                      className="flex-1"
                    >
                      <RotateCcw size={14} className="mr-1" />
                      Yes, Restore
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelRestore}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // Normal Version Display
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">
                          {version.version}
                        </span>
                        {version.id === currentVersion?.id && (
                          <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-secondary">
                        <Users size={12} />
                        <span>{version.createdBy.userName}</span>
                        <span>•</span>
                        <span>{formatDetailedDate(version.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {version.id !== currentVersion?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestoreClick(version.id, version.version)}
                          className="h-6 px-2 text-xs text-green-400 hover:text-green-300"
                          title="Restore this version"
                        >
                          <RotateCcw size={12} />
                        </Button>
                      )}
                      {versions.length > 1 && version.id !== currentVersion?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteVersion(documentId, version.id)}
                          className="h-6 px-2 text-xs text-red-400 hover:text-red-300"
                          title="Delete this version"
                        >
                          <Trash2 size={12} />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Version Details */}
                  <div className="space-y-2">
                    {version.changes.length > 0 && (
                      <div className="text-xs text-secondary">
                        <strong>Changes:</strong> {version.changes.join(', ')}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-secondary">
                      <span>{version.wordCount} words</span>
                      <span>{version.characterCount} chars</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VersionHistory;