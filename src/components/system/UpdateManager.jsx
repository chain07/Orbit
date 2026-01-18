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
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(var(--safe-bottom) + var(--nav-height) + 16px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 150,
        width: '90%',
        maxWidth: '400px',
        animation: 'slideInSpring 0.6s var(--ease-spring) forwards',
        pointerEvents: 'auto'
      }}
    >
      <style>{`
        @keyframes slideInSpring {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>

      <Glass
        className="flex items-center justify-between !mb-0 !p-3"
        style={{
             backdropFilter: 'blur(20px) saturate(180%)',
             WebkitBackdropFilter: 'blur(20px) saturate(180%)'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{
                background: 'var(--orange)',
                boxShadow: '0 2px 8px rgba(255, 149, 0, 0.3)'
            }}
          >
            <Icons.Download size={20} color="white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-primary">Update Available</span>
            <span className="text-xs text-secondary">New version ready</span>
          </div>
        </div>

        <OrbitButton
          onClick={() => updateServiceWorker(true)}
          variant="primary"
          className="!h-10 !px-4 !text-xs !w-auto"
          icon={<Icons.RotateCcw size={14} strokeWidth={2.5} />}
        >
          Refresh
        </OrbitButton>
      </Glass>
    </div>
  );
}
