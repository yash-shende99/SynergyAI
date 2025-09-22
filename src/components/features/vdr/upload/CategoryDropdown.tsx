'use client';

import { FC, useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

interface CategoryDropdownProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryDropdown: FC<CategoryDropdownProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const categories = [
    "Financials",
    "Legal & Compliance", 
    "Human Resources",
    "Intellectual Property",
    "General",
    "Contracts",
    "Reports",
    "Presentations",
    "Research",
    "Marketing"
  ];

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      onCategoryChange(newCategory.trim());
      setNewCategory('');
      setShowAddInput(false);
      setIsOpen(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    onCategoryChange(category);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-white mb-2">
        Category
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-lg bg-background border border-border text-white hover:border-primary/50 transition-colors"
      >
        <span>{selectedCategory}</span>
        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Add New Category Option */}
          {showAddInput ? (
            <div className="p-2 border-b border-border">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category"
                className="w-full p-2 bg-background text-white rounded border border-border"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleAddCategory}
                  className="flex-1 p-1 bg-primary text-white rounded text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddInput(false)}
                  className="flex-1 p-1 bg-border text-white rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddInput(true)}
              className="w-full flex items-center gap-2 p-3 text-primary hover:bg-surface/50"
            >
              <Plus size={14} />
              Add New Category
            </button>
          )}
          
          {/* Existing Categories */}
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`w-full text-left p-3 hover:bg-surface/50 transition-colors ${
                selectedCategory === category ? 'bg-primary/20 text-primary' : 'text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;