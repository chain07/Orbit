import React from "react";
import "../styles/motion.css";
import "../styles/tokens.css"; // or your base css file

export default function Card({
  children,
  className = "",
  as: Component = "div",
  ...props
}) {
  return (
    <Component
      className={`card ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
