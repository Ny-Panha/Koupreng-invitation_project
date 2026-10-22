import React, { Component } from "react";

/**
 * BlockErrorBoundary — Catches errors within an individual block and prevents page crashes.
 * If a block throws an unhandled error during render or lifecycle, it silently renders null
 * while logging the error in dev environments, allowing the rest of the page to render safely.
 */
export default class BlockErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env?.DEV) {
      console.error(
        `[BlockErrorBoundary] Crash caught in block "${this.props.blockId || "unknown"}":`,
        error,
        errorInfo
      );
    }
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}
