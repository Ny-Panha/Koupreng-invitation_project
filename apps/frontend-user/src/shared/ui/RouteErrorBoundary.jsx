import { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { IoAlertCircleOutline, IoRefreshOutline, IoHomeOutline, IoCalendarOutline } from "react-icons/io5";
import "./RouteErrorBoundary.css";

/**
 * RouteErrorBoundary catches unexpected runtime rendering errors in routed components
 * and presents a branded, localized recovery screen instead of a blank screen.
 */
export default class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    if (import.meta.env.DEV) {
      console.error("[RouteErrorBoundary] Caught error:", error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof this.props.onReset === "function") {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isKhmer = document.documentElement.lang === "km" || localStorage.getItem("koupreng_lang") === "km";
    const title = isKhmer ? "មានបញ្ហាក្នុងការបង្ហាញទំព័រនេះ" : "Something went wrong loading this page";
    const description = isKhmer
      ? "កម្មវិធីបានជួបប្រទះបញ្ហាបច្ចេកទេសដែលមិនរំពឹងទុក។ សូមព្យាយាមផ្ទុកទំព័រឡើងវិញ ឬត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង។"
      : "An unexpected technical error occurred while rendering this page. Please try reloading or return to your events.";

    return (
      <div className="route-error-boundary" role="alert" aria-live="assertive">
        <div className="route-error-card">
          <div className="route-error-icon-box">
            <IoAlertCircleOutline className="route-error-icon" aria-hidden="true" />
          </div>

          <h2 className="route-error-title">{title}</h2>
          <p className="route-error-desc">{description}</p>

          <div className="route-error-actions">
            <button
              type="button"
              className="route-error-btn route-error-btn-primary"
              onClick={this.handleRetry}
            >
              <IoRefreshOutline aria-hidden="true" />
              <span>{isKhmer ? "ព្យាយាមម្ដងទៀត" : "Try Again"}</span>
            </button>

            <Link
              to="/app/events"
              className="route-error-btn route-error-btn-secondary"
              onClick={() => this.setState({ hasError: false })}
            >
              <IoCalendarOutline aria-hidden="true" />
              <span>{isKhmer ? "កម្មវិធីរបស់ខ្ញុំ" : "My Events"}</span>
            </Link>

            <Link
              to="/"
              className="route-error-btn route-error-btn-ghost"
              onClick={() => this.setState({ hasError: false })}
            >
              <IoHomeOutline aria-hidden="true" />
              <span>{isKhmer ? "ទំព័រដើម" : "Home"}</span>
            </Link>
          </div>

          {import.meta.env.DEV && this.state.error && (
            <details className="route-error-dev-details">
              <summary>Developer Diagnostics (Dev Only)</summary>
              <pre className="route-error-dev-stack">
                {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

RouteErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onReset: PropTypes.func,
};
