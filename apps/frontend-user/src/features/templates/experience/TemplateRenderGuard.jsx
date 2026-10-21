import { Component, useState } from "react";

export function TemplateUnavailable() {
  return <div className="public-state" role="alert">
    <h2>មិនអាចបើកគំរូបាន / Template unavailable</h2>
    <p>The assigned design could not be loaded. Reload to retry, or contact support. Your saved invitation has not changed.</p>
    <button type="button" onClick={() => window.location.reload()}>ព្យាយាមម្ដងទៀត / Reload template</button>
  </div>;
}

class RendererBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <TemplateUnavailable /> : this.props.children; }
}

export default function TemplateRenderGuard({ id, children }) {
  const [missingImage, setMissingImage] = useState(false);
  return <RendererBoundary key={id}>
    <div data-template-id={id} data-template-renderer={id} style={{ display: "contents" }}
      onErrorCapture={event => { if (event.target.tagName === "IMG") setMissingImage(true); }}>
      {missingImage && <div role="alert" style={{ position: "relative", zIndex: 100, padding: 16, background: "#fff7e6", color: "#65491e", font: "14px/1.8 sans-serif" }}>
        រូបភាពមិនអាចផ្ទុកបាន / An invitation image could not be loaded. Check the image or reload this preview to retry.
      </div>}
      {children}
    </div>
  </RendererBoundary>;
}
