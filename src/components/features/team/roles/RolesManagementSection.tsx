import { FC } from 'react';
import { Role } from '../../../../types';
import RolePermissionsCard from './RolePermissionsCard';

const RolesManagementSection: FC<{ roles: Role[] }> = ({ roles }) => (
  <div className="space-y-6">
    <div>
        <h2 className="text-2xl font-bold text-white">Role-Based Access Control</h2>
        <p className="text-secondary mt-1">Define what each role can see and do within this project.</p>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {roles.map(role => (
        <RolePermissionsCard key={role.name} role={role} />
      ))}
    </div>
  </div>
);

export default RolesManagementSection;
