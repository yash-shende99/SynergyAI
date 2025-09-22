import { Save, FileDown, Sparkles } from 'lucide-react';
import {Button} from '../../../ui/button'; // Ensure this path is correct

const ActionPanel = () => {
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50">
      <h3 className="font-bold text-white mb-4">Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button variant="secondary" size="sm">
          <Save size={16} className="mr-2"/>
          Save Model
        </Button>
        <Button variant="secondary" size="sm">
          <FileDown size={16} className="mr-2"/>
          Export to Excel
        </Button>
      </div>
       <Button variant="default" size="sm" className="w-full mt-2">
          <Sparkles size={16} className="mr-2"/>
          AI Adjust Assumptions
        </Button>
    </div>
  );
};

export default ActionPanel;