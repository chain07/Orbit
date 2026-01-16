import React from "react";
import { motion } from "framer-motion";
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
              style={{ position: 'relative' }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="tab-indicator-fluid"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '99px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    zIndex: -1
                  }}
                />
              )}
              {tab.icon}
            </div>
          );
        })}
      </Glass>
    </div>
  );
}
