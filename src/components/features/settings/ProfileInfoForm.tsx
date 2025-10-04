// components/features/settings/ProfileInfoForm.tsx
'use client';

import { FC, useState, useEffect } from 'react';
import { UserProfile } from '../../../types';
import {Button} from '../../ui/button';

interface ProfileInfoFormProps {
  user: UserProfile;
  onSave: (updatedUser: Partial<UserProfile>) => void;
}

const ProfileInfoForm: FC<ProfileInfoFormProps> = ({ user, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    job_title: user.job_title || '',
    contact_number: user.contact_number || '',
  });

  // Re-sync form data if the user prop changes (e.g., after a save)
  useEffect(() => {
    setFormData({
      name: user.name || '',
      job_title: user.job_title || '',
      contact_number: user.contact_number || '',
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveChanges = () => {
    onSave(formData);
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50">
      <h3 className="font-semibold text-white mb-4">Profile Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
              <label className="text-xs text-secondary">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 bg-background border border-border rounded-md p-2"/>
          </div>
          <div>
              <label className="text-xs text-secondary">Job Title</label>
              <input type="text" name="job_title" value={formData.job_title} onChange={handleChange} className="w-full mt-1 bg-background border border-border rounded-md p-2"/>
          </div>
          <div>
              <label className="text-xs text-secondary">Email Address</label>
              <input type="email" value={user.email} className="w-full mt-1 bg-background/50 border-border/50 rounded-md p-2 text-secondary" disabled/>
          </div>
           <div>
              <label className="text-xs text-secondary">Contact Number</label>
              <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder="+91..." className="w-full mt-1 bg-background border border-border rounded-md p-2"/>
          </div>
      </div>
      <div className="flex justify-end mt-6 border-t border-border pt-4">
        <Button onClick={handleSaveChanges} variant="default" size="sm">Save Changes</Button>
      </div>
    </div>
  );
};
export default ProfileInfoForm;