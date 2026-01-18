import React from 'react';

/**
 * GlobalErrorBoundary
 *
 * A high-level error boundary designed to catch crashes that occur
 * in Context Providers or the App shell itself.
 *
 * Styled with inline styles to ensure visibility even if CSS fails to load.
 */
export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical System Failure:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#1C1C1E', // Dark Grey
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, sans-serif',
          padding: '20px',
          zIndex: 99999
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💥</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Critical System Failure</h1>
          <p style={{ color: '#8E8E93', marginBottom: '24px' }}>The application has encountered an unrecoverable error.</p>

          <pre style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '12px',
            maxWidth: '100%',
            overflowX: 'auto',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            {this.state.error?.toString()}
          </pre>

          <button
            onClick={() => window.location.reload()}
            className="btn-liquid variant-primary"
            style={{ marginTop: '24px', boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)' }}
          >
            Reboot System
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
