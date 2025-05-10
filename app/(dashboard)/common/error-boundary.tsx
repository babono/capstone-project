import { GENERATE_RESULT_CAPTIONS } from "@/app/constants";
import React, { Component, ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReset = () => {
    // Reset the error state
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <h1 className="text-xl font-bold text-red-500">{GENERATE_RESULT_CAPTIONS.ERROR_TITLE}</h1>
          <p className="text-gray-700">{GENERATE_RESULT_CAPTIONS.ERROR_CAPTION}</p>
          <button
            onClick={this.handleReset}
            className="mt-4 px-4 py-2 bg-dt-primary text-white rounded"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
