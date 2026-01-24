import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Glass } from '../ui/Glass';
import { Icons } from '../ui/Icons';
import { OrbitButton } from '../ui/OrbitButton';

export default function UpdateManager() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <Glass className="p-4 mb-4 flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange/20">
          <Icons.Download size={20} className="text-orange" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-primary">Update Available</span>
          <span className="text-xs text-secondary">New version ready</span>
        </div>
      </div>

      <OrbitButton
        onClick={() => updateServiceWorker(true)}
        variant="primary"
        className="!h-8 !px-3 !text-xs !w-auto"
      >
        Refresh
      </OrbitButton>
    </Glass>
  );
}
