import React from 'react';
import { Glass } from './Glass';

export const EmptyState = ({ 
  icon = "⊕", 
  title = "No Data Found", 
  message = "Add items to get started.", 
  actionLabel, 
  onAction 
}) => {
  return (
    <Glass className="p-8 flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed border-separator border-opacity-50">
      <div className="text-4xl opacity-50 mb-2">{icon}</div>
      <div className="flex flex-col gap-1">
        <div className="text-lg font-bold text-primary">{title}</div>
        <div className="text-sm text-secondary max-w-[200px] mx-auto leading-relaxed">
          {message}
        </div>
      </div>
      
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="mt-4 py-2 px-5 rounded-full bg-blue text-white text-sm font-bold shadow-lg shadow-blue/20 active:scale-95 transition-transform"
        >
          {actionLabel}
        </button>
      )}
    </Glass>
  );
};
