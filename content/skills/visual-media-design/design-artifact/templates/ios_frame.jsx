/**
 * IOS Frame - React shell for mobile artifact concepts.
 * Load with:
 *   <script type="text/babel" src="ios_frame.jsx"></script>
 */

function IOSFrame({ children, shellColor = "#0f172a", showNotch = true }) {
  const iosFrameShellStyles = {
    width: "393px",
    height: "852px",
    borderRadius: "52px",
    border: "4px solid #0f172a",
    background: shellColor,
    boxShadow: "0 32px 80px rgba(15, 23, 42, 0.28)",
    overflow: "hidden",
    position: "relative",
  };

  const iosFrameNotchStyles = {
    position: "absolute",
    top: "0",
    left: "50%",
    transform: "translateX(-50%)",
    width: "128px",
    height: "34px",
    background: "#020617",
    borderRadius: "0 0 20px 20px",
    zIndex: 3,
  };

  const iosFrameStatusStyles = {
    height: "54px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: "0 28px 8px",
    color: "#ffffff",
    fontFamily: "system-ui, sans-serif",
    fontSize: "15px",
    fontWeight: 600,
    boxSizing: "border-box",
  };

  const iosFrameBatteryStyles = {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  };

  const iosFrameBatteryBodyStyles = {
    width: "20px",
    height: "10px",
    borderRadius: "3px",
    border: "1.5px solid rgba(255, 255, 255, 0.8)",
    padding: "1px",
    boxSizing: "border-box",
  };

  const iosFrameBatteryFillStyles = {
    width: "100%",
    height: "100%",
    borderRadius: "1px",
    background: "#ffffff",
  };

  const iosFrameBatteryCapStyles = {
    width: "2px",
    height: "6px",
    borderRadius: "0 2px 2px 0",
    background: "rgba(255, 255, 255, 0.85)",
  };

  const iosFrameContentStyles = {
    height: "calc(100% - 54px)",
    overflow: "auto",
    position: "relative",
    background: "#ffffff",
  };

  const iosFrameHomeIndicatorStyles = {
    position: "absolute",
    left: "50%",
    bottom: "8px",
    transform: "translateX(-50%)",
    width: "136px",
    height: "5px",
    borderRadius: "999px",
    background: "rgba(255, 255, 255, 0.34)",
  };

  return React.createElement(
    "div",
    { style: iosFrameShellStyles },
    showNotch ? React.createElement("div", { style: iosFrameNotchStyles }) : null,
    React.createElement(
      "div",
      { style: iosFrameStatusStyles },
      React.createElement("span", null, "09:41"),
      React.createElement(
        "div",
        { style: iosFrameBatteryStyles },
        React.createElement("span", null, "5G"),
        React.createElement(
          "div",
          { style: iosFrameBatteryStyles },
          React.createElement(
            "div",
            { style: iosFrameBatteryBodyStyles },
            React.createElement("div", { style: iosFrameBatteryFillStyles })
          ),
          React.createElement("div", { style: iosFrameBatteryCapStyles })
        )
      )
    ),
    React.createElement("div", { style: iosFrameContentStyles }, children),
    React.createElement("div", { style: iosFrameHomeIndicatorStyles })
  );
}

Object.assign(window, { IOSFrame });
