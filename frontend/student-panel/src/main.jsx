import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: '#f1f5f9', fontFamily: 'monospace', padding: '2rem', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>⚠️ App Error</div>
          <div style={{ color: '#ef4444', fontSize: '0.9rem', maxWidth: 600, textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)' }}>
            {this.state.error.message}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.75rem', maxWidth: 600, overflow: 'auto', textAlign: 'left', whiteSpace: 'pre-wrap' }}>
            {this.state.error.stack}
          </div>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1.5rem', background: '#22c55e', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
