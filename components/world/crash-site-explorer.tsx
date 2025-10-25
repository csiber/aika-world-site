"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type MiniGameDictionary = {
  title: string;
  intro: string;
  objective: string;
  controlsTitle: string;
  controls: { key: string; action: string }[];
  legendTitle: string;
  legendItems: { id: string; name: string; description: string }[];
  resetLabel: string;
  hintTitle: string;
  hints: string[];
};

const MAP_WIDTH = 480;
const MAP_HEIGHT = 320;
const PLAYER_RADIUS = 8;
const PLAYER_SPEED = 120; // px per second

const FEATURES = {
  cabin: { type: "rect" as const, x: 70, y: 110, width: 100, height: 80 },
  lake: { type: "ellipse" as const, x: 190, y: 170, width: 200, height: 120 },
  ship: { type: "rect" as const, x: 315, y: 185, width: 90, height: 60 },
};

type FeatureKey = keyof typeof FEATURES;

type Position = { x: number; y: number };

type CrashSiteExplorerProps = {
  dictionary: MiniGameDictionary;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createStartPosition(): Position {
  return { x: MAP_WIDTH / 2, y: MAP_HEIGHT - 90 };
}

function isInsideFeature(feature: (typeof FEATURES)[FeatureKey], position: Position) {
  if (feature.type === "ellipse") {
    const centerX = feature.x + feature.width / 2;
    const centerY = feature.y + feature.height / 2;
    const radiusX = feature.width / 2;
    const radiusY = feature.height / 2;
    const normalised =
      ((position.x - centerX) ** 2) / radiusX ** 2 + ((position.y - centerY) ** 2) / radiusY ** 2;
    return normalised <= 1;
  }

  return (
    position.x >= feature.x &&
    position.x <= feature.x + feature.width &&
    position.y >= feature.y &&
    position.y <= feature.y + feature.height
  );
}

function drawScene(
  context: CanvasRenderingContext2D,
  position: Position,
  activeFeature: FeatureKey | null,
) {
  context.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  const skyGradient = context.createLinearGradient(0, 0, 0, MAP_HEIGHT);
  skyGradient.addColorStop(0, "#0b0f1e");
  skyGradient.addColorStop(0.4, "#10162b");
  skyGradient.addColorStop(1, "#1a213d");
  context.fillStyle = skyGradient;
  context.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  context.fillStyle = "#1f283f";
  context.fillRect(0, 100, MAP_WIDTH, MAP_HEIGHT - 100);

  context.fillStyle = "#2d344f";
  context.fillRect(0, 220, MAP_WIDTH, 40);

  context.fillStyle = "#413733";
  context.fillRect(0, 180, MAP_WIDTH, 24);

  context.save();
  context.globalAlpha = 0.25;
  context.fillStyle = "#7dd3fc";
  for (let i = 0; i < 60; i += 1) {
    const x = (i * 73) % MAP_WIDTH;
    const y = ((i * 41) % 120) + 20;
    context.fillRect(x, y, 2, 2);
  }
  context.restore();

  const lakeGradient = context.createLinearGradient(210, 170, 330, 260);
  lakeGradient.addColorStop(0, "#2563eb");
  lakeGradient.addColorStop(1, "#1d4ed8");
  context.fillStyle = lakeGradient;
  context.beginPath();
  context.ellipse(290, 230, 90, 50, 0, 0, Math.PI * 2);
  context.fill();

  context.save();
  context.translate(325, 205);
  context.fillStyle = "#1e293b";
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(54, 10);
  context.lineTo(64, 36);
  context.lineTo(10, 24);
  context.closePath();
  context.fill();
  context.fillStyle = "#94a3b8";
  context.fillRect(10, 14, 28, 12);
  context.fillStyle = "#f8fafc";
  context.fillRect(20, 18, 10, 4);
  context.restore();

  context.save();
  context.translate(110, 150);
  context.fillStyle = "#4a3128";
  context.fillRect(-35, -20, 70, 50);
  context.fillStyle = "#b45309";
  context.beginPath();
  context.moveTo(-45, -20);
  context.lineTo(0, -50);
  context.lineTo(45, -20);
  context.closePath();
  context.fill();
  context.fillStyle = "#facc15";
  context.fillRect(-10, 0, 20, 30);
  context.restore();

  if (activeFeature) {
    const feature = FEATURES[activeFeature];
    context.save();
    context.strokeStyle = "rgba(125, 211, 252, 0.9)";
    context.lineWidth = 3;
    if (feature.type === "ellipse") {
      context.beginPath();
      context.ellipse(
        feature.x + feature.width / 2,
        feature.y + feature.height / 2,
        feature.width / 2 + 6,
        feature.height / 2 + 6,
        0,
        0,
        Math.PI * 2,
      );
      context.stroke();
    } else {
      context.strokeRect(feature.x - 6, feature.y - 6, feature.width + 12, feature.height + 12);
    }
    context.restore();
  }

  context.save();
  context.fillStyle = "rgba(15, 23, 42, 0.5)";
  context.beginPath();
  context.ellipse(position.x, position.y + PLAYER_RADIUS, PLAYER_RADIUS * 1.3, PLAYER_RADIUS * 0.6, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();

  context.fillStyle = "#f1f5f9";
  context.beginPath();
  context.arc(position.x, position.y, PLAYER_RADIUS, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "#38bdf8";
  context.lineWidth = 2;
  context.stroke();

  context.fillStyle = "#38bdf8";
  context.beginPath();
  context.arc(position.x, position.y - 3, 3, 0, Math.PI * 2);
  context.fill();
}

export function CrashSiteExplorer({ dictionary }: CrashSiteExplorerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const pressedKeysRef = useRef(new Set<string>());
  const positionRef = useRef<Position>(createStartPosition());
  const activeFeatureRef = useRef<FeatureKey | null>(null);
  const [activeFeature, setActiveFeature] = useState<FeatureKey | null>(null);

  const handleReset = useCallback(() => {
    const startPosition = createStartPosition();
    positionRef.current = startPosition;
    activeFeatureRef.current = null;
    setActiveFeature(null);
    lastFrameRef.current = null;
    pressedKeysRef.current.clear();
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) {
      const devicePixelRatio = window.devicePixelRatio || 1;
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      drawScene(context, startPosition, null);
    }
  }, []);

  const activeLegend = useMemo(
    () => dictionary.legendItems.find((item) => item.id === activeFeature) ?? null,
    [activeFeature, dictionary.legendItems],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = MAP_WIDTH * devicePixelRatio;
    canvas.height = MAP_HEIGHT * devicePixelRatio;
    canvas.style.width = `${MAP_WIDTH}px`;
    canvas.style.height = `${MAP_HEIGHT}px`;
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.code;
      if (key === "KeyR") {
        handleReset();
        return;
      }
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
        event.preventDefault();
      }
      pressedKeysRef.current.add(key);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeysRef.current.delete(event.code);
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);

    const step = (timestamp: number) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = timestamp;
      }
      const delta = (timestamp - lastFrameRef.current) / 1000;
      lastFrameRef.current = timestamp;

      const pressed = pressedKeysRef.current;
      let moveX = 0;
      let moveY = 0;

      if (pressed.has("ArrowUp") || pressed.has("KeyW")) {
        moveY -= 1;
      }
      if (pressed.has("ArrowDown") || pressed.has("KeyS")) {
        moveY += 1;
      }
      if (pressed.has("ArrowLeft") || pressed.has("KeyA")) {
        moveX -= 1;
      }
      if (pressed.has("ArrowRight") || pressed.has("KeyD")) {
        moveX += 1;
      }

      if (moveX !== 0 || moveY !== 0) {
        const magnitude = Math.hypot(moveX, moveY) || 1;
        moveX /= magnitude;
        moveY /= magnitude;

        const nextPosition: Position = {
          x: clamp(
            positionRef.current.x + moveX * PLAYER_SPEED * delta,
            PLAYER_RADIUS + 12,
            MAP_WIDTH - PLAYER_RADIUS - 12,
          ),
          y: clamp(
            positionRef.current.y + moveY * PLAYER_SPEED * delta,
            PLAYER_RADIUS + 12,
            MAP_HEIGHT - PLAYER_RADIUS - 12,
          ),
        };

        if (
          Math.abs(nextPosition.x - positionRef.current.x) > 0.01 ||
          Math.abs(nextPosition.y - positionRef.current.y) > 0.01
        ) {
          positionRef.current = nextPosition;
        }
      }

      let detectedFeature: FeatureKey | null = null;
      (Object.keys(FEATURES) as FeatureKey[]).forEach((key) => {
        if (isInsideFeature(FEATURES[key], positionRef.current)) {
          detectedFeature = key;
        }
      });

      if (detectedFeature !== activeFeatureRef.current) {
        activeFeatureRef.current = detectedFeature;
        setActiveFeature(detectedFeature);
      }

      drawScene(context, positionRef.current, activeFeatureRef.current);
      animationFrameRef.current = requestAnimationFrame(step);
    };

    drawScene(context, positionRef.current, activeFeatureRef.current);
    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleReset]);

  return (
    <div className="space-y-6 rounded-3xl border border-sky-300/30 bg-black/60 p-6 text-white shadow-xl shadow-sky-500/20">
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-[0.35em] text-sky-200/70">{dictionary.title}</span>
        <p className="text-sm text-white/75">{dictionary.intro}</p>
        <p className="text-base font-medium text-white">{dictionary.objective}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,260px)]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e1a] p-3">
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={dictionary.objective}
              className="h-auto w-full rounded-xl"
            />
          </div>

          {activeLegend ? (
            <div className="rounded-2xl border border-sky-400/40 bg-sky-500/10 p-4 text-sm text-sky-100">
              <p className="text-base font-semibold text-sky-50">{activeLegend.name}</p>
              <p className="mt-1 text-xs text-sky-100/80">{activeLegend.description}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
              {dictionary.hints[0]}
            </div>
          )}

          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-white/50">{dictionary.controlsTitle}</span>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs md:text-sm">
                {dictionary.controls.map((control) => (
                  <div key={control.key} className="font-mono text-white">
                    {control.key}
                    <span className="ml-2 text-white/60">{control.action}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-full border border-sky-400/50 px-4 py-2 text-xs font-semibold text-sky-100 transition hover:border-sky-300 hover:bg-sky-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              {dictionary.resetLabel}
            </button>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          <div>
            <h3 className="text-xs uppercase tracking-[0.35em] text-white/50">{dictionary.legendTitle}</h3>
            <ul className="mt-3 space-y-3">
              {dictionary.legendItems.map((item) => (
                <li
                  key={item.id}
                  className={`rounded-xl border p-3 transition ${
                    activeFeature === item.id
                      ? "border-sky-400/70 bg-sky-400/10 text-white"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="mt-1 text-xs text-white/70">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-[0.35em] text-white/50">{dictionary.hintTitle}</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-white/70">
              {dictionary.hints.map((hint, index) => (
                <li key={index}>{hint}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
