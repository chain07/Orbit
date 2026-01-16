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
      {...props}
    >
      {children}
    </Component>
  );
}
