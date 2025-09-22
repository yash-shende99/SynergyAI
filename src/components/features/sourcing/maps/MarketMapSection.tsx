import { FC, useState } from 'react';
import { CompanyMapProfile, MarketMapFilters } from '../../../../types';
import MapFilterSidebar from './MapFilterSidebar';
import QuadrantMapCanvas from './QuadrantMapCanvas';
import CompanyDetailsModal from './CompanyDetailsModal';

interface MarketMapLayoutProps {
  companies: CompanyMapProfile[];
  filters: MarketMapFilters;
  setFilters: (filters: MarketMapFilters) => void;
}

const MarketMapLayout: FC<MarketMapLayoutProps> = ({ companies, filters, setFilters }) => {
  const [selectedCompany, setSelectedCompany] = useState<CompanyMapProfile | null>(null);

  return (
    <>
      <div className="flex h-[80vh] gap-6">
        <MapFilterSidebar filters={filters} setFilters={setFilters} />
        <QuadrantMapCanvas companies={companies} onCompanyClick={setSelectedCompany} />
      </div>
      <CompanyDetailsModal company={selectedCompany} onClose={() => setSelectedCompany(null)} />
    </>
  );
};
export default MarketMapLayout;