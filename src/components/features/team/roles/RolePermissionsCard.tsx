import { FC } from 'react';
import { Role, Permission } from '../../../../types';
import { ShieldCheck, Edit, Eye, ShieldOff, UserCog } from 'lucide-react';

const getAccessIcon = (access: Permission['access']) => {
    switch (access) {
        case 'Full': return <ShieldCheck size={16} className="text-green-400" />;
        case 'Edit': return <Edit size={16} className="text-blue-400" />;
        case 'View Only': return <Eye size={16} className="text-amber-400" />;
        case 'None': return <ShieldOff size={16} className="text-secondary" />;
    }
}

const RolePermissionsCard: FC<{ role: Role }> = ({ role }) => (
    <div className="p-6 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-1">
            <UserCog className="h-6 w-6 text-primary"/>
            <h3 className="text-lg font-bold text-white">{role.name}</h3>
        </div>
        <p className="text-sm text-secondary mb-4 flex-grow">{role.description}</p>
        <div className="space-y-2 pt-4 border-t border-border/50">
            {role.permissions.map(permission => (
                <div key={permission.feature} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">{permission.feature}</span>
                    <div className="flex items-center gap-2 font-semibold">
                        {getAccessIcon(permission.access)}
                        <span className="text-white">{permission.access}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default RolePermissionsCard;
