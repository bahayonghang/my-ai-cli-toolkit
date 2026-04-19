/**
 * Design Canvas - React helper for presenting multiple directions side by side.
 * Load with:
 *   <script type="text/babel" src="design_canvas.jsx"></script>
 */

function DesignCanvas({ labels = [], children, columns, gap = 20, background = "#f3f4f6" }) {
  const childCount = React.Children.count(children);
  const resolvedColumns = columns || Math.min(Math.max(childCount, 1), 3);

  const designCanvasStyles = {
    display: "grid",
    gridTemplateColumns: `repeat(${resolvedColumns}, minmax(0, 1fr))`,
    gap: `${gap}px`,
    padding: `${gap}px`,
    minHeight: "100vh",
    background,
    boxSizing: "border-box",
  };

  const designCanvasCellStyles = {
    background: "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    position: "relative",
  };

  const designCanvasLabelStyles = {
    position: "absolute",
    top: "12px",
    left: "12px",
    zIndex: 2,
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(15, 23, 42, 0.78)",
    color: "#ffffff",
    fontFamily: "system-ui, sans-serif",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.02em",
  };

  return React.createElement(
    "div",
    { style: designCanvasStyles },
    React.Children.map(children, (child, index) =>
      React.createElement(
        "div",
        { key: index, style: designCanvasCellStyles },
        labels[index] ? React.createElement("div", { style: designCanvasLabelStyles }, labels[index]) : null,
        child
      )
    )
  );
}

Object.assign(window, { DesignCanvas });
