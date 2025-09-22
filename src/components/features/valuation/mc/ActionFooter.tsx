import {Button} from '../../../ui/button';
import { Save, Download } from 'lucide-react';

const ActionFooter = () => (
  <div className="flex-shrink-0 flex justify-end items-center gap-2 mt-6">
    <Button variant="secondary" size="sm"><Download size={16} className="mr-2"/>Export as PDF</Button>
    <Button variant="default" size="sm"><Save size={16} className="mr-2"/>Save Results</Button>
  </div>
);
export default ActionFooter;