'use client';

import { FC, useState } from 'react';
import { Project } from '../../../../types';
import {Button} from '../../../ui/button';
import ConfirmationModal from './ConfirmationModal';
import { Archive, Trash2, AlertTriangle } from 'lucide-react';

interface DangerZoneSectionProps {
  project: Project;
  onArchive: () => Promise<void>;
  onDelete: () => Promise<void>;
}

const DangerZoneSection: FC<DangerZoneSectionProps> = ({ project, onArchive, onDelete }) => {
  const [modalType, setModalType] = useState<'archive' | 'delete' | null>(null);

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500"/>
              <div>
                  <h2 className="text-2xl font-bold text-white">Danger Zone</h2>
                  <p className="text-secondary">These actions are irreversible. Please proceed with caution.</p>
              </div>
          </div>
          <div className="p-6 rounded-xl border border-red-500/30 bg-red-500/10 space-y-4">
              <div className="flex justify-between items-center">
                  <div>
                      <h4 className="font-semibold text-white">Archive Project</h4>
                      <p className="text-sm text-secondary">Mark this project as archived and read-only.</p>
                  </div>
                  <Button variant="outline" onClick={() => setModalType('archive')}><Archive size={16} className="mr-2"/>Archive</Button>
              </div>
              <div className="flex justify-between items-center">
                  <div>
                      <h4 className="font-semibold text-white">Delete Project</h4>
                      <p className="text-sm text-secondary">Permanently delete this project and all of its data.</p>
                  </div>
                  <Button variant="destructive" onClick={() => setModalType('delete')}><Trash2 size={16} className="mr-2"/>Delete</Button>
              </div>
          </div>
      </div>

      <ConfirmationModal
        isOpen={modalType === 'archive'}
        onClose={() => setModalType(null)}
        onConfirm={onArchive}
        title="Archive Project?"
        description={`Are you sure you want to archive "${project.name}"? The project and its data will become read-only.`}
        confirmText="Archive"
        confirmVariant="destructive"
      />
      <ConfirmationModal
        isOpen={modalType === 'delete'}
        onClose={() => setModalType(null)}
        onConfirm={onDelete}
        title="Delete Project?"
        description={`This action is irreversible. To confirm, please type the project name below: "${project.name}"`}
        confirmText="Delete"
        confirmVariant="destructive"
        requiresConfirmationText={project.name}
      />
    </>
  );
};
export default DangerZoneSection;
