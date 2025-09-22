'use client';

import ProfileHeader from '../../../components/features/settings/ProfileHeader';
import ProfileInfoForm from '../../../components/features/settings/ProfileInfoForm';

// This is the default page for the Settings module.
// It renders the Profile section.
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <ProfileHeader />
      <ProfileInfoForm />
    </div>
  );
}