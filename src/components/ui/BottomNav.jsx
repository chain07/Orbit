import React from "react";
import Glass from "./Glass";
import "../../styles/motion.css";

export default function BottomNav({ tabs, activeIndex, onChange }) {
  return (
    <div className="tab-bar-container">
      <Glass className="tab-bar">
        {tabs.map((tab, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={tab.id}
              className={`tab-item ${isActive ? "active" : ""}`}
              onClick={() => onChange(i)}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              {isActive && (
                <div
                  className="tab-indicator-fluid"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '99px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    zIndex: -1,
                    transition: 'all 0.3s var(--ease-spring)'
                  }}
                />
              )}
              <div
                className="relative z-10 transition-transform duration-200 ease-out active:scale-95"
                style={{
                   transform: isActive ? 'scale(1)' : 'scale(1)'
                }}
              >
                {tab.icon}
              </div>
            </div>
          );
        })}
      </Glass>
    </div>
  );
}
