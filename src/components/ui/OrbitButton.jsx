import React, { useState } from 'react';
import '../../styles/buttons.css';

/**
 * OrbitButton - The Standard Button Component
 *
 * Implements the nested .btn-orbit > .btn-core structure for proper
 * squash-and-stretch physics.
 *
 * Props:
 * @param {string} variant - 'primary' | 'secondary' | 'destructive'
 * @param {React.ReactNode} icon - Optional icon element to render left of text
 * @param {React.ReactNode} children - Button label/content
 * @param {function} onClick - Click handler
 * @param {string} className - Additional classes (e.g. width overrides)
 * @param {string} type - Button type (button, submit, reset)
 * @param {boolean} disabled - Disabled state
 */
export const OrbitButton = ({
  variant = 'primary',
  icon,
  children,
  onClick,
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // Map variant prop to CSS class
  const variantClass = `btn-${variant}`;

  return (
    <button
      type={type}
      className={`btn-orbit ${variantClass} ${isPressed ? 'is-pressed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') setIsPressed(true);
      }}
      onKeyUp={() => setIsPressed(false)}
      {...props}
    >
      <div className="btn-core">
        {icon && <span className="btn-icon">{icon}</span>}
        {children}
      </div>
    </button>
  );
};
