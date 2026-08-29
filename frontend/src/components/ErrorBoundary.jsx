import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-lg w-full text-center border border-gray-200 dark:border-gray-700 shadow-xl">
            <span className="text-5xl">⚠️</span>
            <h2 className="mt-4 text-xl font-extrabold text-gray-900 dark:text-white">Something went wrong</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {this.state.error?.message || 'An unexpected error occurred while displaying this section.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md"
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
