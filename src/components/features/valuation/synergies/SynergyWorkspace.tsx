import { FC } from 'react';
import { SynergyProfile } from '../../../../types';
import InputPanel from './InputPanel';
import OutputPanel from './OutputPanel';
import WorkspaceHeader from './WorkspaceHeader';

interface SynergyWorkspaceProps {
  profile: SynergyProfile;
  setProfile: (profile: SynergyProfile) => void;
}

const SynergyWorkspace: FC<SynergyWorkspaceProps> = ({ profile, setProfile }) => {
  return (
    <div className="space-y-6">
      <WorkspaceHeader profile={profile} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InputPanel profile={profile} setProfile={setProfile} />
        <OutputPanel profile={profile} />
      </div>
    </div>
  );
};
export default SynergyWorkspace;