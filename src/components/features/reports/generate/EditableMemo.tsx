'use client';

import { useState } from 'react';
import {Button} from '../../../ui/button';
import { Edit, Check, X } from 'lucide-react';

// Mock content for the memo
const initialSummaryContent = "The proposed acquisition of SolarTech Inc. presents a compelling strategic opportunity. The deal offers significant revenue synergy potential by cross-selling our existing products to their customer base. While the valuation appears fair, the primary risks are concentrated in the legal domain due to unverified IP for a core patent.";

const EditableMemo = () => {
  // State to manage the editing mode
  const [isEditing, setIsEditing] = useState(false);
  // State to hold the final, saved content
  const [content, setContent] = useState(initialSummaryContent);
  // State to hold the temporary content while editing
  const [tempContent, setTempContent] = useState(content);

  const handleEdit = () => {
    setTempContent(content); // Sync temp content before editing
    setIsEditing(true);
  };

  const handleSave = () => {
    setContent(tempContent); // Save the changes
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Discard changes by simply exiting edit mode
    setIsEditing(false);
  };

  return (
    <div className="p-8 rounded-xl border border-border bg-surface/80 h-full overflow-y-auto">
      <div className="prose prose-invert max-w-none">
        
        {/* --- EXECUTIVE SUMMARY SECTION (NOW FULLY INTERACTIVE) --- */}
        <div className="flex justify-between items-center mb-2">
          <h2>Executive Summary</h2>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button onClick={handleCancel} variant="secondary" size="sm">
                <X size={16} className="mr-2"/>Cancel
              </Button>
              <Button onClick={handleSave} variant="default" size="sm">
                <Check size={16} className="mr-2"/>Save
              </Button>
            </div>
          ) : (
            <Button onClick={handleEdit} variant="ghost" size="sm">
              <Edit size={16} className="mr-2"/>Edit
            </Button>
          )}
        </div>
        
        {isEditing ? (
          <textarea
            value={tempContent}
            onChange={(e) => setTempContent(e.target.value)}
            className="w-full h-40 p-3 bg-background/50 border border-primary rounded-md text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        ) : (
          <p className="text-secondary">{content}</p>
        )}
        
        {/* --- OTHER SECTIONS (PLACEHOLDERS) --- */}
        <h2 className="mt-8">Valuation Summary</h2>
        <div className="p-3 my-2 rounded-lg bg-background/50 border border-border/50">Valuation Potential: $45M - $60M (Sweet Spot $52M)</div>
        <p className="text-secondary">[More content for other sections would go here, each with its own edit functionality.]</p>
      </div>
    </div>
  );
};

export default EditableMemo;