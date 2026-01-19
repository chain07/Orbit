import React, { useRef, useEffect, useState } from "react";
import Glass from "./Glass";
import "../../styles/motion.css";

export default function BottomNav({ tabs, activeIndex, onChange }) {
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, transform: 'translateX(0px)' });
  const itemsRef = useRef([]);

  useEffect(() => {
    const activeItem = itemsRef.current[activeIndex];
    if (activeItem) {
      // Calculate position relative to the container (which has padding: 6px)
      // The indicator absolute position is top: 6px, left: 6px.
      // So translateX should be (item.offsetLeft - 6)
      const offsetLeft = activeItem.offsetLeft;
      const width = activeItem.offsetWidth;

      setIndicatorStyle({
        width: `${width}px`,
        transform: `translateX(${offsetLeft - 6}px)`
      });
    }
  }, [activeIndex, tabs]);

  return (
    <div className="tab-bar-container">
      {/*
         We use Glass but we override its styles in layout.css via .tab-bar class.
         We remove the inline styles that Glass component usually adds if they conflict.
         However, Glass adds backdropFilter which we want.
         The className "tab-bar" handles the geometry overrides.
      */}
      <Glass className="tab-bar">
        <div
            className="tab-indicator"
            style={indicatorStyle}
        />
        {tabs.map((tab, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={tab.id || i}
              ref={el => itemsRef.current[i] = el}
              className={`tab-item ${isActive ? "active" : ""}`}
              onClick={() => onChange(i)}
              role="button"
              aria-label={tab.label || tab.id || `Tab ${i + 1}`}
              aria-selected={isActive}
            >
              <div className="relative z-10 active:scale-95 transition-transform duration-200">
                {tab.icon}
              </div>
            </div>
          );
        })}
      </Glass>
    </div>
  );
}
