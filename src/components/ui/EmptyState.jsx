import React from 'react';
import { Glass } from './Glass';
import { OrbitButton } from './OrbitButton';

export const EmptyState = ({ 
  icon = "⊕", 
  title = "No Data Found", 
  message = "Add items to get started.", 
  actionLabel, 
  onAction 
}) => {
  return (
    <Glass className="p-8 flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed border-separator border-opacity-50">
      {icon && <div className="text-4xl opacity-50 mb-2">{icon}</div>}
      <div className="flex flex-col gap-1">
        <div className="text-lg font-bold text-primary">{title}</div>
        <div className="text-sm text-secondary max-w-[200px] mx-auto leading-relaxed">
          {message}
        </div>
      </div>
      
      {actionLabel && onAction && (
        <OrbitButton
          onClick={onAction}
          variant="primary"
          className="mt-4"
        >
          {actionLabel}
        </OrbitButton>
      )}
    </Glass>
  );
};
