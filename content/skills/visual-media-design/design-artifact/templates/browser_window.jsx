/**
 * Browser Window - React shell for desktop product and page concepts.
 * Load with:
 *   <script type="text/babel" src="browser_window.jsx"></script>
 */

function BrowserWindow({
  children,
  url = "https://artifact.local",
  width = 1280,
  height = 820,
  background = "#ffffff",
}) {
  const browserWindowShellStyles = {
    width: `${width}px`,
    height: `${height}px`,
    borderRadius: "18px",
    overflow: "hidden",
    border: "1px solid rgba(15, 23, 42, 0.12)",
    boxShadow: "0 30px 80px rgba(15, 23, 42, 0.18)",
    background,
    display: "flex",
    flexDirection: "column",
  };

  const browserWindowTopBarStyles = {
    height: "42px",
    background: "#e5e7eb",
    borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 14px",
    flexShrink: 0,
  };

  const browserWindowDotStyles = (color) => ({
    width: "12px",
    height: "12px",
    borderRadius: "999px",
    background: color,
    border: "1px solid rgba(15, 23, 42, 0.08)",
    flexShrink: 0,
  });

  const browserWindowTabStyles = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 12px",
    background: "#ffffff",
    borderRadius: "10px 10px 0 0",
    fontFamily: "system-ui, sans-serif",
    fontSize: "12px",
    color: "#111827",
    marginLeft: "8px",
  };

  const browserWindowToolbarStyles = {
    height: "44px",
    background: "#f8fafc",
    borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 14px",
    flexShrink: 0,
  };

  const browserWindowAddressStyles = {
    flex: 1,
    height: "30px",
    borderRadius: "999px",
    background: "#ffffff",
    border: "1px solid rgba(15, 23, 42, 0.12)",
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    fontFamily: "system-ui, sans-serif",
    fontSize: "12px",
    color: "#475569",
  };

  const browserWindowContentStyles = {
    flex: 1,
    overflow: "auto",
    position: "relative",
  };

  return React.createElement(
    "div",
    { style: browserWindowShellStyles },
    React.createElement(
      "div",
      { style: browserWindowTopBarStyles },
      React.createElement("div", { style: browserWindowDotStyles("#fb7185") }),
      React.createElement("div", { style: browserWindowDotStyles("#fbbf24") }),
      React.createElement("div", { style: browserWindowDotStyles("#4ade80") }),
      React.createElement(
        "div",
        { style: browserWindowTabStyles },
        React.createElement("span", null, "Artifact"),
        React.createElement("span", { style: { color: "#94a3b8" } }, url.replace(/^https?:\/\//, ""))
      )
    ),
    React.createElement(
      "div",
      { style: browserWindowToolbarStyles },
      React.createElement("span", { style: { color: "#94a3b8", fontSize: "14px" } }, "<"),
      React.createElement("span", { style: { color: "#94a3b8", fontSize: "14px" } }, ">"),
      React.createElement("span", { style: { color: "#94a3b8", fontSize: "14px" } }, "o"),
      React.createElement("div", { style: browserWindowAddressStyles }, url)
    ),
    React.createElement("div", { style: browserWindowContentStyles }, children)
  );
}

Object.assign(window, { BrowserWindow });
