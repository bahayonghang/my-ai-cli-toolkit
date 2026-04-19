/**
 * Animations - React timeline helper for motion demos.
 * Load with:
 *   <script type="text/babel" src="animations.jsx"></script>
 */

const DesignArtifactAnimationsContext = React.createContext({ time: 0, duration: 1 });

function useTime() {
  return React.useContext(DesignArtifactAnimationsContext).time;
}

function useAnimationContext() {
  return React.useContext(DesignArtifactAnimationsContext);
}

const Easing = {
  linear: (value) => value,
  easeIn: (value) => value * value,
  easeOut: (value) => value * (2 - value),
  easeInOut: (value) => (value < 0.5 ? 2 * value * value : -1 + (4 - 2 * value) * value),
};

function interpolate(start, end, progress, easing = Easing.linear) {
  const clamped = Math.max(0, Math.min(1, progress));
  const eased = easing(clamped);
  return start + (end - start) * eased;
}

function Sprite({ children, start = 0, end = 1, style = {} }) {
  const { time } = React.useContext(DesignArtifactAnimationsContext);
  const visible = time >= start && time <= end;
  const fadeWindow = Math.min(0.25, Math.max((end - start) / 4, 0.01));

  let opacity = 0;
  if (visible) {
    if (time < start + fadeWindow) opacity = Easing.easeOut((time - start) / fadeWindow);
    else if (time > end - fadeWindow) opacity = Easing.easeIn((end - time) / fadeWindow);
    else opacity = 1;
  }

  return React.createElement(
    "div",
    {
      style: {
        position: "absolute",
        inset: 0,
        opacity,
        pointerEvents: visible ? "auto" : "none",
        ...style,
      },
      "data-sprite-start": start,
      "data-sprite-end": end,
    },
    children
  );
}

function Stage({ children, duration = 6, width = 1600, height = 900, storageKey = "design-artifact-motion-position" }) {
  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(() => {
    const saved = window.localStorage.getItem(storageKey);
    return saved === null ? 0 : Math.min(parseFloat(saved) || 0, duration);
  });
  const animationRef = React.useRef(null);
  const startRef = React.useRef(null);

  React.useEffect(() => {
    window.localStorage.setItem(storageKey, String(time));
  }, [storageKey, time]);

  React.useEffect(() => {
    if (!playing) return undefined;

    startRef.current = performance.now() - time * 1000;

    const tick = (now) => {
      const elapsed = (now - startRef.current) / 1000;
      if (elapsed >= duration) {
        setTime(duration);
        setPlaying(false);
        return;
      }
      setTime(elapsed);
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [duration, playing]);

  const scale = Math.min(window.innerWidth / width, window.innerHeight / height) * 0.88;

  const stageShellStyles = {
    width: "100vw",
    height: "100vh",
    background: "#020617",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "18px",
  };

  const stageCanvasStyles = {
    width: `${width}px`,
    height: `${height}px`,
    transform: `scale(${scale})`,
    transformOrigin: "center center",
    position: "relative",
    overflow: "hidden",
  };

  const stageControlsStyles = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#e2e8f0",
    fontFamily: "system-ui, sans-serif",
    fontSize: "13px",
  };

  return React.createElement(
    "div",
    { style: stageShellStyles },
    React.createElement(
      DesignArtifactAnimationsContext.Provider,
      { value: { time, duration } },
      React.createElement("div", { style: stageCanvasStyles }, children)
    ),
    React.createElement(
      "div",
      { style: stageControlsStyles },
      React.createElement(
        "button",
        {
          onClick: () => setPlaying((value) => !value),
          style: {
            padding: "8px 14px",
            borderRadius: "999px",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            background: "rgba(15, 23, 42, 0.72)",
            color: "#ffffff",
            cursor: "pointer",
          },
        },
        playing ? "Pause" : "Play"
      ),
      React.createElement("input", {
        type: "range",
        min: 0,
        max: duration,
        step: 0.01,
        value: time,
        onChange: (event) => {
          setPlaying(false);
          setTime(parseFloat(event.target.value));
        },
        style: { width: "320px", accentColor: "#ffffff" },
      }),
      React.createElement("span", null, `${time.toFixed(2)}s / ${duration.toFixed(2)}s`)
    )
  );
}

Object.assign(window, {
  Stage,
  Sprite,
  useTime,
  useAnimationContext,
  Easing,
  interpolate,
  DesignArtifactAnimationsContext,
});
