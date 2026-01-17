import React from "react";
import "../../styles/motion.css";
import "../../styles/tokens.css";

export default function Glass({
  children,
  className = "",
  as: Component = "div",
  ...props
}) {
  return (
    <Component
      className={`glass ${className}`}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '0.5px solid rgba(255,255,255,0.1)'
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

export { Glass };
