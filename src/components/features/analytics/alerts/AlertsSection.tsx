'use client';

import { useState } from 'react';
import AlertsFilterSidebar from './AlertsFilterSidebar';
import AlertsTable from './AlertsTable';
import AlertDetailsModal from './AlertDetailsModal';
import { Alert } from '../../../../types';

export default function AlertsSection() {
  // --- THIS IS THE NEW LOGIC ---
  // State to manage the currently selected alert for the modal
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <AlertsFilterSidebar />
        </div>
        <div className="lg:col-span-3">
          {/* We pass the setSelectedAlert function down to the table */}
          <AlertsTable onAlertSelect={setSelectedAlert} />
        </div>
      </div>

      {/* The modal is rendered here and controlled by the selectedAlert state */}
      <AlertDetailsModal 
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
      />
    </>
  );
}