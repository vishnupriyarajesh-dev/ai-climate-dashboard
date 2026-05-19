// src/components/common/ErrorBoundary.jsx
import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="card p-8 max-w-lg w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-aurora-red/20 flex items-center justify-center mx-auto">
            <AlertTriangle size={24} className="text-aurora-red" />
          </div>

          <h1 className="text-xl font-semibold text-slate-900 mt-5">
            Dashboard failed to render
          </h1>

          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            A component received unexpected data. Refresh the dashboard or check the console for
            the exact error.
          </p>

          {this.state.error?.message && (
            <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-3 text-left">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Error
              </p>
              <p className="text-xs font-mono text-slate-700 mt-2 break-words">
                {this.state.error.message}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={this.handleReload}
            className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-aurora-teal to-aurora-violet text-white text-sm font-semibold shadow-lg shadow-aurora-teal/20"
          >
            <RefreshCw size={15} />
            Refresh dashboard
          </button>
        </div>
      </div>
    )
  }
}