'use client';

import { useState } from 'react';
import { Alert, AlertPriority, AlertType } from '../../../../types';
import AlertsFilterSidebar from './AlertsFilterSidebar';
import AlertsTable from './AlertsTable';
import AlertDetailsModal from './AlertDetailsModal';

interface AlertsSectionProps {
    alerts: Alert[];
    filters: { priorities: AlertPriority[], types: AlertType[] };
    setFilters: (filters: { priorities: AlertPriority[], types: AlertType[] }) => void;
}

const AlertsSection: React.FC<AlertsSectionProps> = ({ alerts, filters, setFilters }) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <AlertsFilterSidebar filters={filters} setFilters={setFilters} />
        </div>
        <div className="lg:col-span-3">
          <AlertsTable alerts={alerts} onAlertSelect={setSelectedAlert} />
        </div>
      </div>
      <AlertDetailsModal 
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
      />
    </>
  );
}
export default AlertsSection;