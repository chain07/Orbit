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
            <motion.div
              key={tab.id}
              className={`tab-item ${isActive ? "active" : ""}`}
              onClick={() => onChange(i)}
              style={{ position: 'relative' }}
              initial="idle"
              whileTap="active"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="tab-indicator-fluid"
                  transition={{ type: "spring", stiffness: 500, damping: 35, mass: 1 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '99px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    zIndex: -1
                  }}
                />
              )}
              <motion.div
                className="relative z-10"
                variants={{
                  idle: { scale: 1 },
                  active: { scale: 0.97 }
                }}
                transition={{ type: "spring", stiffness: 500, damping: 35, mass: 1 }}
              >
                {tab.icon}
              </motion.div>
            </motion.div>
          );
        })}
      </Glass>
    </div>
  );
}
