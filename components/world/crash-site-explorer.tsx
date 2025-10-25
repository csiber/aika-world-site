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
  soundTitle: string;
  soundDescription: string;
  soundToggle: { on: string; off: string };
  npcsTitle: string;
  npcsIntro: string;
  npcInteractionHint: string;
  npcs: {
    id: string;
    name: string;
    role: string;
    biography: string;
    dialogues: string[];
  }[];
};

const MAP_WIDTH = 960;
const MAP_HEIGHT = 600;
const PLAYER_RADIUS = 14;
const PLAYER_SPEED = 220; // px per second

const FEATURES = {
  cabin: { type: "rect" as const, x: 150, y: 360, width: 200, height: 140 },
  lake: { type: "ellipse" as const, x: 360, y: 300, width: 280, height: 190 },
  ship: { type: "rect" as const, x: 680, y: 340, width: 220, height: 140 },
  beacon: { type: "ellipse" as const, x: 760, y: 160, width: 160, height: 160 },
  monolith: { type: "rect" as const, x: 430, y: 140, width: 140, height: 220 },
};

type FeatureKey = keyof typeof FEATURES;

const NPCS = {
  mentor: {
    position: { x: 280, y: 450 },
    auraColor: "rgba(250, 204, 21, 0.25)",
    accent: "#fde047",
    suitPrimary: "#facc15",
    suitSecondary: "#f97316",
    interactionRadius: 58,
  },
  mechanic: {
    position: { x: 720, y: 380 },
    auraColor: "rgba(56, 189, 248, 0.22)",
    accent: "#38bdf8",
    suitPrimary: "#22d3ee",
    suitSecondary: "#0ea5e9",
    interactionRadius: 58,
  },
} as const;

type NpcKey = keyof typeof NPCS;

type Position = { x: number; y: number };

type CrashSiteExplorerProps = {
  dictionary: MiniGameDictionary;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createStartPosition(): Position {
  return { x: MAP_WIDTH * 0.22, y: MAP_HEIGHT * 0.74 };
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

const STARFIELD = createStarfield(140);
const NEON_ARCS = createNeonArcs();

type AudioControls = {
  context: AudioContext;
  masterGain: GainNode;
  ambientGain: GainNode;
  ambientOscillators: OscillatorNode[];
  footstepGain: GainNode;
  footstepOscillator: OscillatorNode;
  footstepFilter: BiquadFilterNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
};

function createStarfield(count: number) {
  let seed = 1337;
  const stars: { x: number; y: number; size: number; alpha: number }[] = [];
  for (let index = 0; index < count; index += 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const x = (seed / 233280) * MAP_WIDTH;
    seed = (seed * 9301 + 49297) % 233280;
    const y = (seed / 233280) * MAP_HEIGHT * 0.6;
    seed = (seed * 9301 + 49297) % 233280;
    const size = 0.5 + ((seed / 233280) * 2.5);
    seed = (seed * 9301 + 49297) % 233280;
    const alpha = 0.2 + ((seed / 233280) * 0.65);
    stars.push({ x, y, size, alpha });
  }
  return stars;
}

function createNeonArcs() {
  const arcs: { x: number; y: number; radius: number; start: number; end: number; color: string }[] = [];
  for (let index = 0; index < 6; index += 1) {
    const baseRadius = 220 + index * 30;
    arcs.push({
      x: 470,
      y: 240,
      radius: baseRadius,
      start: Math.PI * 0.15 * (index % 2 === 0 ? 1 : -1),
      end: Math.PI * (0.55 + index * 0.05),
      color: index % 2 === 0 ? "rgba(59, 130, 246, 0.12)" : "rgba(244, 114, 182, 0.1)",
    });
  }
  return arcs;
}

function drawScene(
  context: CanvasRenderingContext2D,
  position: Position,
  activeFeature: FeatureKey | null,
  activeNpcId: string | null,
) {
  context.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  const skyGradient = context.createLinearGradient(0, 0, 0, MAP_HEIGHT);
  skyGradient.addColorStop(0, "#020617");
  skyGradient.addColorStop(0.45, "#0f172a");
  skyGradient.addColorStop(1, "#111827");
  context.fillStyle = skyGradient;
  context.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  context.save();
  context.globalCompositeOperation = "lighter";
  STARFIELD.forEach((star, index) => {
    const twinkle = 0.8 + Math.sin((Date.now() / 400 + index) % Math.PI) * 0.2;
    context.fillStyle = `rgba(148, 163, 184, ${star.alpha * twinkle})`;
    context.beginPath();
    context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    context.fill();
  });
  context.restore();

  context.save();
  context.globalAlpha = 0.7;
  const horizonGradient = context.createLinearGradient(0, MAP_HEIGHT * 0.35, 0, MAP_HEIGHT * 0.55);
  horizonGradient.addColorStop(0, "rgba(59, 130, 246, 0.18)");
  horizonGradient.addColorStop(0.6, "rgba(12, 74, 110, 0.65)");
  horizonGradient.addColorStop(1, "rgba(15, 23, 42, 1)");
  context.fillStyle = horizonGradient;
  context.fillRect(0, MAP_HEIGHT * 0.32, MAP_WIDTH, MAP_HEIGHT * 0.2);
  context.restore();

  context.save();
  context.strokeStyle = "rgba(125, 211, 252, 0.07)";
  context.lineWidth = 1;
  for (let x = 0; x < MAP_WIDTH; x += 40) {
    context.beginPath();
    context.moveTo(x, MAP_HEIGHT * 0.45);
    context.lineTo(x + 80, MAP_HEIGHT);
    context.stroke();
  }
  for (let y = MAP_HEIGHT * 0.45; y < MAP_HEIGHT; y += 36) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(MAP_WIDTH, y);
    context.stroke();
  }
  context.restore();

  context.save();
  NEON_ARCS.forEach((arc) => {
    context.strokeStyle = arc.color;
    context.lineWidth = 3;
    context.beginPath();
    context.arc(arc.x, arc.y, arc.radius, arc.start, arc.end, false);
    context.stroke();
  });
  context.restore();

  const basinGradient = context.createLinearGradient(0, MAP_HEIGHT * 0.45, 0, MAP_HEIGHT);
  basinGradient.addColorStop(0, "#0f172a");
  basinGradient.addColorStop(0.45, "#1e293b");
  basinGradient.addColorStop(1, "#020617");
  context.fillStyle = basinGradient;
  context.fillRect(0, MAP_HEIGHT * 0.45, MAP_WIDTH, MAP_HEIGHT * 0.55);

  context.save();
  context.fillStyle = "rgba(30, 64, 175, 0.28)";
  context.beginPath();
  context.ellipse(500, 380, 220, 120, 0.2, 0, Math.PI * 2);
  context.fill();
  context.restore();

  context.save();
  const lakeGradient = context.createRadialGradient(500, 360, 20, 500, 360, 180);
  lakeGradient.addColorStop(0, "rgba(56, 189, 248, 0.8)");
  lakeGradient.addColorStop(0.55, "rgba(14, 165, 233, 0.65)");
  lakeGradient.addColorStop(1, "rgba(7, 89, 133, 0.85)");
  context.fillStyle = lakeGradient;
  context.beginPath();
  context.ellipse(500, 380, 150, 110, 0.1, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "rgba(56, 189, 248, 0.45)";
  context.lineWidth = 4;
  context.stroke();
  context.restore();

  context.save();
  context.translate(240, 400);
  context.fillStyle = "#422006";
  context.fillRect(-110, -70, 220, 140);
  context.fillStyle = "#fbbf24";
  context.beginPath();
  context.moveTo(-130, -70);
  context.lineTo(0, -150);
  context.lineTo(130, -70);
  context.closePath();
  context.fill();
  context.fillStyle = "#f59e0b";
  context.fillRect(-40, -20, 80, 100);
  context.fillStyle = "#0f172a";
  context.fillRect(-20, 10, 40, 70);
  context.restore();

  context.save();
  context.translate(720, 360);
  context.fillStyle = "#1e293b";
  context.beginPath();
  context.moveTo(-120, 30);
  context.lineTo(140, 80);
  context.lineTo(110, -40);
  context.lineTo(-150, -80);
  context.closePath();
  context.fill();
  context.fillStyle = "#94a3b8";
  context.fillRect(-30, -35, 120, 40);
  context.fillStyle = "#38bdf8";
  context.fillRect(-10, -22, 80, 20);
  context.restore();

  context.save();
  context.translate(780, 220);
  const beaconGradient = context.createRadialGradient(0, 0, 10, 0, 0, 90);
  beaconGradient.addColorStop(0, "rgba(244, 114, 182, 0.85)");
  beaconGradient.addColorStop(0.6, "rgba(139, 92, 246, 0.5)");
  beaconGradient.addColorStop(1, "rgba(30, 64, 175, 0)");
  context.fillStyle = beaconGradient;
  context.beginPath();
  context.ellipse(0, 0, 90, 90, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "rgba(236, 72, 153, 0.6)";
  context.fillRect(-12, -80, 24, 160);
  context.restore();

  context.save();
  context.translate(500, 210);
  context.fillStyle = "#1f2937";
  context.fillRect(-40, -100, 80, 200);
  context.fillStyle = "#6366f1";
  context.fillRect(-28, -80, 56, 160);
  context.fillStyle = "rgba(99, 102, 241, 0.6)";
  context.fillRect(-28, -10, 56, 20);
  context.restore();

  if (activeFeature) {
    const feature = FEATURES[activeFeature];
    context.save();
    context.strokeStyle = "rgba(125, 211, 252, 0.9)";
    context.lineWidth = 4;
    if (feature.type === "ellipse") {
      context.beginPath();
      context.ellipse(
        feature.x + feature.width / 2,
        feature.y + feature.height / 2,
        feature.width / 2 + 16,
        feature.height / 2 + 16,
        0,
        0,
        Math.PI * 2,
      );
      context.stroke();
    } else {
      context.strokeRect(feature.x - 16, feature.y - 16, feature.width + 32, feature.height + 32);
    }
    context.restore();
  }

  context.save();
  (Object.entries(NPCS) as [NpcKey, (typeof NPCS)[NpcKey]][]).forEach(([id, npc]) => {
    const isActive = id === activeNpcId;
    context.fillStyle = npc.auraColor;
    context.beginPath();
    context.ellipse(npc.position.x, npc.position.y + 6, 26, 14, 0, 0, Math.PI * 2);
    context.fill();

    if (isActive) {
      const pulse = 0.4 + Math.sin(Date.now() / 250) * 0.25;
      context.fillStyle = `rgba(125, 211, 252, ${0.3 + pulse * 0.4})`;
      context.beginPath();
      context.ellipse(npc.position.x, npc.position.y - 24, 30 + pulse * 12, 36 + pulse * 12, 0, 0, Math.PI * 2);
      context.fill();
    }

    context.fillStyle = npc.suitSecondary;
    context.fillRect(npc.position.x - 8, npc.position.y - 20, 16, 28);
    context.fillStyle = npc.suitPrimary;
    context.beginPath();
    context.arc(npc.position.x, npc.position.y - 32, 12, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#0f172a";
    context.beginPath();
    context.arc(npc.position.x, npc.position.y - 32, 6, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = npc.accent;
    context.fillRect(npc.position.x - 9, npc.position.y - 10, 18, 6);
  });
  context.restore();

  context.save();
  context.fillStyle = "rgba(15, 23, 42, 0.55)";
  context.beginPath();
  context.ellipse(position.x, position.y + PLAYER_RADIUS, PLAYER_RADIUS * 1.4, PLAYER_RADIUS * 0.7, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();

  const suitGradient = context.createLinearGradient(position.x - 10, position.y - PLAYER_RADIUS * 2, position.x + 10, position.y + PLAYER_RADIUS);
  suitGradient.addColorStop(0, "#38bdf8");
  suitGradient.addColorStop(1, "#0ea5e9");
  context.fillStyle = suitGradient;
  context.beginPath();
  context.arc(position.x, position.y - PLAYER_RADIUS * 0.4, PLAYER_RADIUS, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#0f172a";
  context.beginPath();
  context.arc(position.x, position.y - PLAYER_RADIUS * 0.85, PLAYER_RADIUS * 0.55, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "rgba(125, 211, 252, 0.8)";
  context.lineWidth = 3;
  context.beginPath();
  context.arc(position.x, position.y - PLAYER_RADIUS * 0.45, PLAYER_RADIUS + 2, 0, Math.PI * 2);
  context.stroke();
}

export function CrashSiteExplorer({ dictionary }: CrashSiteExplorerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const pressedKeysRef = useRef(new Set<string>());
  const positionRef = useRef<Position>(createStartPosition());
  const activeFeatureRef = useRef<FeatureKey | null>(null);
  const activeNpcIdRef = useRef<string | null>(null);
  const movementStateRef = useRef(false);
  const audioControlsRef = useRef<AudioControls | null>(null);
  const soundEnabledRef = useRef(false);
  const [activeFeature, setActiveFeature] = useState<FeatureKey | null>(null);
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const npcDialogueSeed = useMemo(() => {
    const initial: Record<string, number> = {};
    dictionary.npcs.forEach((npc) => {
      initial[npc.id] = 0;
    });
    return initial;
  }, [dictionary.npcs]);

  const [npcDialogueIndex, setNpcDialogueIndex] = useState<Record<string, number>>(npcDialogueSeed);
  const npcDialogueIndexRef = useRef<Record<string, number>>(npcDialogueSeed);

  useEffect(() => {
    setNpcDialogueIndex({ ...npcDialogueSeed });
    npcDialogueIndexRef.current = { ...npcDialogueSeed };
  }, [npcDialogueSeed]);

  const npcMap = useMemo(
    () => Object.fromEntries(dictionary.npcs.map((npc) => [npc.id, npc] as const)),
    [dictionary.npcs],
  );

  const activeNpc = activeNpcId ? npcMap[activeNpcId] ?? null : null;
  const activeDialogue =
    activeNpc && activeNpc.dialogues.length > 0
      ? activeNpc.dialogues[npcDialogueIndex[activeNpc.id] ?? 0] ?? activeNpc.dialogues[0]
      : null;

  const ensureAudioControls = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }
    if (audioControlsRef.current) {
      return audioControlsRef.current;
    }

    try {
      const context = new window.AudioContext();
      const masterGain = context.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(context.destination);

      const ambientGain = context.createGain();
      ambientGain.gain.value = 0.0001;
      ambientGain.connect(masterGain);

      const ambientPrimary = context.createOscillator();
      ambientPrimary.type = "sine";
      ambientPrimary.frequency.value = 74;
      ambientPrimary.connect(ambientGain);
      ambientPrimary.start();

      const ambientSecondary = context.createOscillator();
      ambientSecondary.type = "triangle";
      ambientSecondary.frequency.value = 36;
      ambientSecondary.detune.value = 110;
      ambientSecondary.connect(ambientGain);
      ambientSecondary.start();

      const footstepGain = context.createGain();
      footstepGain.gain.value = 0.001;
      footstepGain.connect(masterGain);

      const footstepFilter = context.createBiquadFilter();
      footstepFilter.type = "bandpass";
      footstepFilter.frequency.value = 480;
      footstepFilter.Q.value = 1.2;
      footstepFilter.connect(footstepGain);

      const footstepOscillator = context.createOscillator();
      footstepOscillator.type = "sawtooth";
      footstepOscillator.frequency.value = 210;
      footstepOscillator.connect(footstepFilter);
      footstepOscillator.start();

      const lfo = context.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 2.2;
      const lfoGain = context.createGain();
      lfoGain.gain.value = 85;
      lfo.connect(lfoGain);
      lfoGain.connect(footstepOscillator.frequency);
      lfo.start();

      const controls: AudioControls = {
        context,
        masterGain,
        ambientGain,
        ambientOscillators: [ambientPrimary, ambientSecondary],
        footstepGain,
        footstepOscillator,
        footstepFilter,
        lfo,
        lfoGain,
      };
      audioControlsRef.current = controls;
      return controls;
    } catch (error) {
      console.error("Nem sikerült inicializálni a hangrendszert", error);
      return null;
    }
  }, []);

  const updateMovementSound = useCallback(
    (moving: boolean) => {
      const controls = audioControlsRef.current;
      if (!controls) {
        return;
      }
      const { context, footstepGain } = controls;
      const target = moving && soundEnabledRef.current ? 0.18 : 0.001;
      footstepGain.gain.cancelScheduledValues(context.currentTime);
      footstepGain.gain.linearRampToValueAtTime(target, context.currentTime + 0.12);
    },
    [],
  );

  const playNpcChime = useCallback(() => {
    if (!soundEnabledRef.current) {
      return;
    }
    const controls = audioControlsRef.current ?? ensureAudioControls();
    if (!controls) {
      return;
    }
    const { context, masterGain } = controls;
    const chime = context.createOscillator();
    const chimeGain = context.createGain();
    chime.type = "triangle";
    chime.frequency.setValueAtTime(660, context.currentTime);
    chime.frequency.linearRampToValueAtTime(880, context.currentTime + 0.25);
    chimeGain.gain.value = 0.0001;
    chime.connect(chimeGain).connect(masterGain);
    chime.start();
    chimeGain.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.08);
    chimeGain.gain.linearRampToValueAtTime(0.0001, context.currentTime + 0.45);
    chime.stop(context.currentTime + 0.5);
  }, [ensureAudioControls]);

  const cycleNpcDialogue = useCallback(
    (npcId: string) => {
      const npc = npcMap[npcId];
      if (!npc) {
        return;
      }
      setNpcDialogueIndex((previous) => {
        const current = previous[npcId] ?? 0;
        const next = npc.dialogues.length > 0 ? (current + 1) % npc.dialogues.length : 0;
        const updated = { ...previous, [npcId]: next };
        npcDialogueIndexRef.current = updated;
        return updated;
      });

      if (soundEnabledRef.current) {
        const controls = audioControlsRef.current ?? ensureAudioControls();
        if (controls) {
          const { context, masterGain } = controls;
          const blip = context.createOscillator();
          const blipGain = context.createGain();
          blip.type = "square";
          blip.frequency.setValueAtTime(420, context.currentTime);
          blip.frequency.linearRampToValueAtTime(520, context.currentTime + 0.1);
          blipGain.gain.value = 0.0001;
          blip.connect(blipGain).connect(masterGain);
          blip.start();
          blipGain.gain.linearRampToValueAtTime(0.12, context.currentTime + 0.04);
          blipGain.gain.linearRampToValueAtTime(0.0001, context.currentTime + 0.2);
          blip.stop(context.currentTime + 0.24);
        }
      }
    },
    [ensureAudioControls, npcMap],
  );

  const handleReset = useCallback(() => {
    const startPosition = createStartPosition();
    positionRef.current = startPosition;
    activeFeatureRef.current = null;
    activeNpcIdRef.current = null;
    setActiveFeature(null);
    setActiveNpcId(null);
    lastFrameRef.current = null;
    movementStateRef.current = false;
    pressedKeysRef.current.clear();
    setNpcDialogueIndex({ ...npcDialogueSeed });
    npcDialogueIndexRef.current = { ...npcDialogueSeed };
    updateMovementSound(false);
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) {
      const devicePixelRatio = window.devicePixelRatio || 1;
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      drawScene(context, startPosition, null, null);
    }
  }, [npcDialogueSeed, updateMovementSound]);

  const handleToggleSound = useCallback(() => {
    if (soundEnabled) {
      setSoundEnabled(false);
      return;
    }
    const controls = ensureAudioControls();
    if (!controls) {
      return;
    }
    controls.context.resume().catch(() => {});
    setSoundEnabled(true);
  }, [ensureAudioControls, soundEnabled]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    const controls = audioControlsRef.current;
    if (!controls) {
      if (soundEnabled) {
        const created = ensureAudioControls();
        if (created) {
          created.context.resume().catch(() => {});
          created.masterGain.gain.setValueAtTime(0, created.context.currentTime);
          created.masterGain.gain.linearRampToValueAtTime(0.8, created.context.currentTime + 0.6);
          created.ambientGain.gain.setValueAtTime(0.0001, created.context.currentTime);
          created.ambientGain.gain.linearRampToValueAtTime(0.18, created.context.currentTime + 1);
        }
      }
      return;
    }

    if (soundEnabled) {
      controls.context.resume().catch(() => {});
      controls.masterGain.gain.cancelScheduledValues(controls.context.currentTime);
      controls.masterGain.gain.linearRampToValueAtTime(0.8, controls.context.currentTime + 0.6);
      controls.ambientGain.gain.cancelScheduledValues(controls.context.currentTime);
      controls.ambientGain.gain.linearRampToValueAtTime(0.18, controls.context.currentTime + 1);
    } else {
      controls.footstepGain.gain.cancelScheduledValues(controls.context.currentTime);
      controls.footstepGain.gain.linearRampToValueAtTime(0.001, controls.context.currentTime + 0.1);
      controls.ambientGain.gain.cancelScheduledValues(controls.context.currentTime);
      controls.ambientGain.gain.linearRampToValueAtTime(0.0001, controls.context.currentTime + 0.3);
      controls.masterGain.gain.cancelScheduledValues(controls.context.currentTime);
      controls.masterGain.gain.linearRampToValueAtTime(0, controls.context.currentTime + 0.5);
      controls.context.suspend().catch(() => {});
    }
  }, [ensureAudioControls, soundEnabled]);

  useEffect(() => {
    if (activeNpcId) {
      playNpcChime();
    }
  }, [activeNpcId, playNpcChime]);

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
      if (key === "Space" || key === "Enter") {
        const npcId = activeNpcIdRef.current;
        if (npcId) {
          event.preventDefault();
          cycleNpcDialogue(npcId);
          return;
        }
      }
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"].includes(key)) {
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

      let hasMoved = false;
      if (moveX !== 0 || moveY !== 0) {
        const magnitude = Math.hypot(moveX, moveY) || 1;
        moveX /= magnitude;
        moveY /= magnitude;

        const nextPosition: Position = {
          x: clamp(
            positionRef.current.x + moveX * PLAYER_SPEED * delta,
            PLAYER_RADIUS + 40,
            MAP_WIDTH - PLAYER_RADIUS - 40,
          ),
          y: clamp(
            positionRef.current.y + moveY * PLAYER_SPEED * delta,
            PLAYER_RADIUS + 48,
            MAP_HEIGHT - PLAYER_RADIUS - 48,
          ),
        };

        if (
          Math.abs(nextPosition.x - positionRef.current.x) > 0.01 ||
          Math.abs(nextPosition.y - positionRef.current.y) > 0.01
        ) {
          positionRef.current = nextPosition;
          hasMoved = true;
        }
      }

      if (hasMoved !== movementStateRef.current) {
        movementStateRef.current = hasMoved;
        updateMovementSound(hasMoved);
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

      let detectedNpc: string | null = null;
      (Object.entries(NPCS) as [NpcKey, (typeof NPCS)[NpcKey]][]).forEach(([id, npc]) => {
        const distance = Math.hypot(
          npc.position.x - positionRef.current.x,
          npc.position.y - positionRef.current.y,
        );
        if (distance <= npc.interactionRadius) {
          detectedNpc = id;
        }
      });

      if (detectedNpc !== activeNpcIdRef.current) {
        activeNpcIdRef.current = detectedNpc;
        setActiveNpcId(detectedNpc);
      }

      drawScene(context, positionRef.current, activeFeatureRef.current, activeNpcIdRef.current);
      animationFrameRef.current = requestAnimationFrame(step);
    };

    drawScene(context, positionRef.current, activeFeatureRef.current, activeNpcIdRef.current);
    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [cycleNpcDialogue, handleReset, updateMovementSound]);

  useEffect(() => {
    return () => {
      if (audioControlsRef.current) {
        audioControlsRef.current.context.close().catch(() => {});
        audioControlsRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-6 rounded-3xl border border-sky-300/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-white shadow-2xl shadow-sky-500/20">
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-[0.35em] text-sky-200/70">{dictionary.title}</span>
        <p className="text-sm text-white/75">{dictionary.intro}</p>
        <p className="text-base font-medium text-white">{dictionary.objective}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-sky-400/20 bg-[#060a17] p-3 shadow-inner shadow-sky-500/20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_60%)]" aria-hidden />
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={dictionary.objective}
              className="h-auto w-full rounded-xl border border-sky-400/10"
            />
            <div className="pointer-events-none absolute inset-x-6 bottom-6 flex justify-center">
              <div className="max-w-xl rounded-2xl border border-white/10 bg-black/60 p-4 text-xs text-white/80 backdrop-blur-sm">
                {activeNpc && activeDialogue ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.3em] text-sky-200/80">
                      <span>{activeNpc.name}</span>
                      <span className="text-white/30">•</span>
                      <span>{activeNpc.role}</span>
                    </div>
                    <p className="text-sm text-white/90">{activeDialogue}</p>
                    <p className="text-[0.65rem] uppercase tracking-[0.25em] text-white/40">
                      {dictionary.npcInteractionHint}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center text-[0.7rem] uppercase tracking-[0.3em] text-white/40">
                    <span>{dictionary.npcsIntro}</span>
                    <span className="font-mono text-white/50">{dictionary.hints[0]}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {activeLegend ? (
            <div className="rounded-2xl border border-sky-400/40 bg-sky-500/10 p-4 text-sm text-sky-100 shadow-lg shadow-sky-500/20">
              <p className="text-base font-semibold text-sky-50">{activeLegend.name}</p>
              <p className="mt-1 text-xs text-sky-100/80">{activeLegend.description}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
              {dictionary.hints[0]}
            </div>
          )}

          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 md:grid-cols-2">
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
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center rounded-full border border-sky-400/50 px-4 py-2 text-xs font-semibold text-sky-100 transition hover:border-sky-300 hover:bg-sky-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                {dictionary.resetLabel}
              </button>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${
                  soundEnabled
                    ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-200"
                    : "border-white/20 bg-black/30 text-white/70"
                }`}
              >
                {soundEnabled ? dictionary.soundToggle.on : dictionary.soundToggle.off}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/80 shadow-lg shadow-sky-500/10">
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
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <h3 className="text-xs uppercase tracking-[0.35em] text-white/50">{dictionary.hintTitle}</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-white/70">
              {dictionary.hints.map((hint, index) => (
                <li key={index}>{hint}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4 text-sm text-sky-100">
            <h3 className="text-xs uppercase tracking-[0.35em] text-sky-200/80">{dictionary.npcsTitle}</h3>
            <div className="mt-3 space-y-3">
              {dictionary.npcs.map((npc) => (
                <div
                  key={npc.id}
                  className={`rounded-xl border p-3 transition ${
                    activeNpcId === npc.id
                      ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-100"
                      : "border-sky-400/20 bg-slate-900/60 text-sky-100/90"
                  }`}
                >
                  <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-[0.3em]">
                    <span>{npc.name}</span>
                    <span className="text-white/40">{npc.role}</span>
                  </div>
                  <p className="mt-2 text-xs text-white/80">{npc.biography}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/70">
            <h3 className="text-xs uppercase tracking-[0.35em] text-white/40">{dictionary.soundTitle}</h3>
            <p className="mt-2 text-white/70">{dictionary.soundDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
