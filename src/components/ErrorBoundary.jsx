import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card-white rounded-custom shadow-custom p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-text-dark mb-2">Something went wrong</h1>
            <p className="text-text-muted mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-text-muted mb-2">Error details</summary>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors"
            >
              <RefreshCw size={18} />
              Go to Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
