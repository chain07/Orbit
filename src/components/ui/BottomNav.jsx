import React, { useEffect, useRef } from "react";
import Glass from "./Glass";
import "../styles/motion.css";

export default function BottomNav({ tabs, activeIndex, onChange }) {
  const indicatorRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    const indicator = indicatorRef.current;
    const activeItem = itemRefs.current[activeIndex];
    if (!indicator || !activeItem) return;

    indicator.style.width = `${activeItem.offsetWidth}px`;
    indicator.style.transform = `translateX(${activeItem.offsetLeft}px)`;
  }, [activeIndex]);

  return (
    <div className="tab-bar-container">
      <Glass className="tab-bar">
        <div className="tab-indicator" ref={indicatorRef} />

        {tabs.map((tab, i) => (
          <div
            key={tab.id}
            ref={el => (itemRefs.current[i] = el)}
            className={`tab-item ${i === activeIndex ? "active" : ""}`}
            onClick={() => onChange(i)}
          >
            {tab.icon}
          </div>
        ))}
      </Glass>
    </div>
  );
}
