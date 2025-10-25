"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ControlHint = {
  key: string;
  action: string;
};

type PlatformBattleDictionary = {
  title: string;
  intro: string;
  objective: string;
  controlsTitle: string;
  controls: ControlHint[];
  statusLabel: string;
  status: {
    idle: string;
    running: string;
    victory: string;
    defeat: string;
  };
  startLabel: string;
  resetLabel: string;
  attackLabel: string;
  attemptsLabel: string;
  droneLabel: string;
  shieldLabel: string;
  logsTitle: string;
  logAttackHit: string;
  logAttackMiss: string;
  logPlayerHit: string;
  logCooldown: string;
  hintTitle: string;
  hints: string[];
};

type GameStatus = "idle" | "running" | "victory" | "defeat";

type EntityState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type Projectile = {
  x: number;
  y: number;
  vx: number;
};

type VisualState = {
  playerX: number;
  playerY: number;
  playerShield: number;
  droneX: number;
  droneY: number;
  droneHealth: number;
  projectiles: Projectile[];
  attackActive: boolean;
};

const GAME_WIDTH = 360;
const GAME_HEIGHT = 200;
const PLAYER_WIDTH = 22;
const PLAYER_HEIGHT = 28;
const DRONE_SIZE = 24;
const GRAVITY = 1600;
const MOVE_SPEED = 180;
const JUMP_VELOCITY = -460;
const ATTACK_RANGE_X = 52;
const ATTACK_RANGE_Y = 36;
const ATTACK_COOLDOWN = 650;
const ATTACK_DURATION = 220;
const PROJECTILE_SPEED = 180;
const PLATFORM_HEIGHT = 12;
const GROUND_HEIGHT = 18;

const PLATFORMS = [
  { x: 40, y: 120, width: 120 },
  { x: 200, y: 80, width: 120 },
];

function createInitialState(): VisualState {
  return {
    playerX: 50,
    playerY: GAME_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT,
    playerShield: 100,
    droneX: 260,
    droneY: 80 - PLATFORM_HEIGHT - DRONE_SIZE,
    droneHealth: 100,
    projectiles: [],
    attackActive: false,
  };
}

type PlatformBattleGameProps = {
  dictionary: PlatformBattleDictionary;
};

export function PlatformBattleGame({ dictionary }: PlatformBattleGameProps) {
  const [status, setStatus] = useState<GameStatus>("idle");
  const [attempts, setAttempts] = useState(0);
  const initialState = useMemo(() => createInitialState(), []);
  const [visualState, setVisualState] = useState<VisualState>(() => initialState);
  const [logs, setLogs] = useState<string[]>([]);
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const attackCooldownRef = useRef(0);
  const attackTimerRef = useRef(0);
  const droneCooldownRef = useRef(1500);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playerRef = useRef<EntityState>({
    x: initialState.playerX,
    y: initialState.playerY,
    vx: 0,
    vy: 0,
  });
  const droneRef = useRef<EntityState>({
    x: initialState.droneX,
    y: initialState.droneY,
    vx: -60,
    vy: 0,
  });
  const projectilesRef = useRef<Projectile[]>([]);
  const shieldsRef = useRef(initialState.playerShield);
  const healthRef = useRef(initialState.droneHealth);
  const inputRef = useRef({ left: false, right: false, jump: false, attack: false });
  const runningRef = useRef(false);

  const stopLoop = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = undefined;
    }
    runningRef.current = false;
  };

  const pushLog = (entry: string) => {
    setLogs((prev) => {
      const next = [entry, ...prev];
      return next.slice(0, 6);
    });
  };

  const playTone = (frequency: number, duration: number) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const context = audioContextRef.current;
    if (context.state === "suspended") {
      void context.resume();
    }
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gain.gain.setValueAtTime(0.18, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  };

  const resetState = () => {
    stopLoop();
    lastTimeRef.current = undefined;
    attackCooldownRef.current = 0;
    attackTimerRef.current = 0;
    droneCooldownRef.current = 1500;
    inputRef.current = { left: false, right: false, jump: false, attack: false };
    const nextState = createInitialState();
    playerRef.current = {
      x: nextState.playerX,
      y: nextState.playerY,
      vx: 0,
      vy: 0,
    };
    droneRef.current = {
      x: nextState.droneX,
      y: nextState.droneY,
      vx: -60,
      vy: 0,
    };
    shieldsRef.current = nextState.playerShield;
    healthRef.current = nextState.droneHealth;
    projectilesRef.current = [];
    setVisualState(nextState);
  };

  const endRound = (nextStatus: GameStatus) => {
    setStatus(nextStatus);
    stopLoop();
  };

  const handleStart = () => {
    if (status === "running") {
      return;
    }
    resetState();
    setLogs([]);
    setStatus("running");
    setAttempts((prev) => prev + 1);
    runningRef.current = true;
    const context = audioContextRef.current;
    if (context && context.state === "suspended") {
      void context.resume();
    }
    requestRef.current = requestAnimationFrame(step);
  };

  const handleReset = () => {
    resetState();
    setLogs([]);
    setStatus("idle");
  };

  const triggerAttack = () => {
    if (status !== "running") {
      return;
    }
    if (attackCooldownRef.current > 0) {
      pushLog(dictionary.logCooldown);
      return;
    }
    attackCooldownRef.current = ATTACK_COOLDOWN;
    attackTimerRef.current = ATTACK_DURATION;
    playTone(520, 0.18);
    const drone = droneRef.current;
    const player = playerRef.current;
    const withinX = Math.abs(player.x - drone.x) <= ATTACK_RANGE_X;
    const withinY = Math.abs(player.y - drone.y) <= ATTACK_RANGE_Y;
    if (withinX && withinY) {
      healthRef.current = Math.max(0, healthRef.current - 30);
      pushLog(dictionary.logAttackHit.replace("{{value}}", String(healthRef.current)));
      playTone(720, 0.2);
      if (healthRef.current <= 0) {
        setVisualState((prev) => ({
          ...prev,
          droneHealth: 0,
          attackActive: true,
        }));
        endRound("victory");
        return;
      }
    } else {
      pushLog(dictionary.logAttackMiss);
    }
    setVisualState((prev) => ({ ...prev, attackActive: true }));
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.repeat) {
      return;
    }
    switch (event.code) {
      case "ArrowLeft":
      case "KeyA":
        inputRef.current.left = true;
        break;
      case "ArrowRight":
      case "KeyD":
        inputRef.current.right = true;
        break;
      case "ArrowUp":
      case "KeyW":
      case "Space":
        inputRef.current.jump = true;
        break;
      case "KeyK":
      case "KeyF":
        inputRef.current.attack = true;
        triggerAttack();
        break;
      default:
        break;
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    switch (event.code) {
      case "ArrowLeft":
      case "KeyA":
        inputRef.current.left = false;
        break;
      case "ArrowRight":
      case "KeyD":
        inputRef.current.right = false;
        break;
      case "ArrowUp":
      case "KeyW":
      case "Space":
        inputRef.current.jump = false;
        break;
      case "KeyK":
      case "KeyF":
        inputRef.current.attack = false;
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      stopLoop();
      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const step = (timestamp: number) => {
    if (!runningRef.current) {
      return;
    }
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }
    const deltaMs = timestamp - lastTimeRef.current;
    const delta = deltaMs / 1000;
    lastTimeRef.current = timestamp;

    attackCooldownRef.current = Math.max(0, attackCooldownRef.current - deltaMs);
    attackTimerRef.current = Math.max(0, attackTimerRef.current - deltaMs);
    const attackActive = attackTimerRef.current > 0;

    const player = playerRef.current;
    const drone = droneRef.current;

    // Player horizontal control
    player.vx = 0;
    if (inputRef.current.left) {
      player.vx -= MOVE_SPEED;
    }
    if (inputRef.current.right) {
      player.vx += MOVE_SPEED;
    }

    // Jump logic
    const onGround = isOnGround(player.y);
    const onPlatform = getSupportingPlatform(player.x, player.y);
    const isSupported = onGround || Boolean(onPlatform);
    if (inputRef.current.jump && isSupported) {
      player.vy = JUMP_VELOCITY;
      inputRef.current.jump = false;
      playTone(360, 0.12);
    }

    // Apply gravity
    player.vy += GRAVITY * delta;

    // Integrate position
    player.x += player.vx * delta;
    player.y += player.vy * delta;

    // Boundaries
    if (player.x < 10) {
      player.x = 10;
    }
    if (player.x > GAME_WIDTH - PLAYER_WIDTH - 10) {
      player.x = GAME_WIDTH - PLAYER_WIDTH - 10;
    }

    // Collision with platforms and ground
    if (player.y + PLAYER_HEIGHT >= GAME_HEIGHT - GROUND_HEIGHT) {
      player.y = GAME_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT;
      player.vy = 0;
    } else {
      const support = getSupportingPlatform(player.x, player.y);
      if (support && player.vy >= 0 && player.y + PLAYER_HEIGHT >= support.y - PLATFORM_HEIGHT) {
        player.y = support.y - PLATFORM_HEIGHT - PLAYER_HEIGHT;
        player.vy = 0;
      }
    }

    // Drone movement along its platform
    const dronePlatform = PLATFORMS[1];
    drone.x += drone.vx * delta;
    if (drone.x < dronePlatform.x) {
      drone.x = dronePlatform.x;
      drone.vx = Math.abs(drone.vx);
    }
    if (drone.x > dronePlatform.x + dronePlatform.width - DRONE_SIZE) {
      drone.x = dronePlatform.x + dronePlatform.width - DRONE_SIZE;
      drone.vx = -Math.abs(drone.vx);
    }

    // Drone firing logic
    droneCooldownRef.current -= delta * 1000;
    if (droneCooldownRef.current <= 0) {
      droneCooldownRef.current = 1800;
      const direction = player.x + PLAYER_WIDTH / 2 < drone.x + DRONE_SIZE / 2 ? -1 : 1;
      projectilesRef.current.push({
        x: drone.x + DRONE_SIZE / 2,
        y: drone.y + DRONE_SIZE / 2,
        vx: direction * PROJECTILE_SPEED,
      });
    }

    // Update projectiles
    const nextProjectiles: Projectile[] = [];
    for (const projectile of projectilesRef.current) {
      const nextX = projectile.x + projectile.vx * delta;
      const nextY = projectile.y;
      const playerCenterX = player.x + PLAYER_WIDTH / 2;
      const playerCenterY = player.y + PLAYER_HEIGHT / 2;
      const distance = Math.hypot(nextX - playerCenterX, nextY - playerCenterY);
      if (distance < 20) {
        shieldsRef.current = Math.max(0, shieldsRef.current - 20);
        pushLog(dictionary.logPlayerHit.replace("{{value}}", String(shieldsRef.current)));
        playTone(180, 0.18);
        if (shieldsRef.current <= 0) {
          endRound("defeat");
          break;
        }
        continue;
      }
      if (nextX < 0 || nextX > GAME_WIDTH) {
        continue;
      }
      nextProjectiles.push({ ...projectile, x: nextX, y: nextY });
    }
    projectilesRef.current = nextProjectiles;

    if (status === "running") {
      setVisualState({
        playerX: player.x,
        playerY: player.y,
        playerShield: shieldsRef.current,
        droneX: drone.x,
        droneY: drone.y,
        droneHealth: healthRef.current,
        projectiles: projectilesRef.current,
        attackActive,
      });
    }

    if (runningRef.current) {
      requestRef.current = requestAnimationFrame(step);
    }
  };

  const isOnGround = (y: number) => y + PLAYER_HEIGHT >= GAME_HEIGHT - GROUND_HEIGHT - 0.5;

  const getSupportingPlatform = (x: number, y: number) => {
    const playerCenter = x + PLAYER_WIDTH / 2;
    return PLATFORMS.find((platform) => {
      const platformTop = platform.y - PLATFORM_HEIGHT;
      const withinX =
        playerCenter >= platform.x && playerCenter <= platform.x + platform.width;
      const nearTop = y + PLAYER_HEIGHT >= platformTop - 2 && y + PLAYER_HEIGHT <= platformTop + PLATFORM_HEIGHT;
      return withinX && nearTop;
    });
  };

  const hintsToShow = useMemo(() => {
    if (dictionary.hints.length === 0) {
      return [] as string[];
    }
    if (attempts >= 6) {
      return dictionary.hints;
    }
    if (attempts >= 4) {
      return dictionary.hints.slice(0, Math.min(2, dictionary.hints.length));
    }
    if (attempts >= 2) {
      return dictionary.hints.slice(0, 1);
    }
    return [] as string[];
  }, [attempts, dictionary.hints]);

  return (
    <div className="space-y-6 rounded-3xl border border-purple-400/30 bg-black/70 p-6 text-white shadow-xl shadow-purple-500/20">
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-[0.35em] text-purple-200/70">{dictionary.title}</span>
        <p className="text-sm text-white/80">{dictionary.intro}</p>
        <p className="text-base font-semibold text-white">{dictionary.objective}</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-purple-900/40 to-black/80 p-4">
            <svg
              viewBox={`0 0 ${GAME_WIDTH} ${GAME_HEIGHT}`}
              role="img"
              aria-label={dictionary.objective}
              className="h-56 w-full"
            >
              <defs>
                <linearGradient id="platformGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.9" />
                </linearGradient>
                <radialGradient id="attackPulse" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#facc15" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width={GAME_WIDTH} height={GAME_HEIGHT} fill="#020617" rx="12" ry="12" />
              <g opacity="0.6">
                <path
                  d={`M0 ${GAME_HEIGHT - GROUND_HEIGHT} H${GAME_WIDTH}`}
                  stroke="#1d4ed8"
                  strokeWidth={3}
                  strokeDasharray="6 8"
                />
              </g>

              {PLATFORMS.map((platform, index) => (
                <rect
                  key={index}
                  x={platform.x}
                  y={platform.y - PLATFORM_HEIGHT}
                  width={platform.width}
                  height={PLATFORM_HEIGHT}
                  fill="url(#platformGradient)"
                  opacity={0.8}
                  rx={6}
                />
              ))}

              {visualState.attackActive && (
                <circle
                  cx={visualState.playerX + PLAYER_WIDTH / 2}
                  cy={visualState.playerY + PLAYER_HEIGHT / 2}
                  r={50}
                  fill="url(#attackPulse)"
                />
              )}

              <g transform={`translate(${visualState.playerX} ${visualState.playerY})`}>
                <rect
                  width={PLAYER_WIDTH}
                  height={PLAYER_HEIGHT}
                  rx={6}
                  fill="#38bdf8"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                />
                <rect x={4} y={6} width={14} height={10} rx={2} fill="#082f49" />
                <rect x={6} y={8} width={10} height={6} rx={1} fill="#f0f9ff" />
              </g>

              <g transform={`translate(${visualState.droneX} ${visualState.droneY})`}>
                <rect
                  width={DRONE_SIZE}
                  height={DRONE_SIZE}
                  rx={8}
                  fill="#f472b6"
                  stroke="#f9a8d4"
                  strokeWidth={2}
                />
                <rect x={6} y={8} width={12} height={8} rx={3} fill="#4a044e" />
                <rect x={9} y={10} width={6} height={4} rx={2} fill="#fdf2f8" />
              </g>

              {visualState.projectiles.map((projectile, index) => (
                <circle key={index} cx={projectile.x} cy={projectile.y} r={4} fill="#f97316" />
              ))}

              <g opacity="0.3">
                <circle cx={40} cy={26} r={14} fill="#1d4ed8" />
                <circle cx={80} cy={16} r={8} fill="#0f172a" />
                <circle cx={110} cy={30} r={12} fill="#1e293b" />
              </g>
            </svg>
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">{dictionary.statusLabel}</p>
              <p className="text-base font-semibold text-white">
                {status === "running"
                  ? dictionary.status.running
                  : status === "victory"
                  ? dictionary.status.victory
                  : status === "defeat"
                  ? dictionary.status.defeat
                  : dictionary.status.idle}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">{dictionary.attemptsLabel}</p>
              <p className="text-base font-semibold text-white">{attempts}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">{dictionary.droneLabel}</p>
              <p className="text-base font-semibold text-white">{visualState.droneHealth}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">{dictionary.shieldLabel}</p>
              <p className="text-base font-semibold text-white">{visualState.playerShield}%</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleStart}
              className="rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-200"
            >
              {dictionary.startLabel}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-200"
            >
              {dictionary.resetLabel}
            </button>
            <button
              type="button"
              onClick={triggerAttack}
              className="rounded-full bg-yellow-400/90 px-5 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
            >
              {dictionary.attackLabel}
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <p className="text-base font-semibold text-white">{dictionary.controlsTitle}</p>
            <ul className="space-y-1">
              {dictionary.controls.map((control) => (
                <li key={control.key} className="flex items-center justify-between rounded-xl bg-black/40 px-3 py-2">
                  <span className="font-semibold text-white">{control.key}</span>
                  <span>{control.action}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <p className="text-base font-semibold text-white">{dictionary.logsTitle}</p>
            {logs.length === 0 ? (
              <p className="text-xs text-white/60">—</p>
            ) : (
              <ul className="space-y-1">
                {logs.map((entry, index) => (
                  <li key={index} className="rounded-xl bg-black/40 px-3 py-2">
                    {entry}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {hintsToShow.length > 0 && (
            <div className="space-y-2 rounded-2xl border border-purple-300/30 bg-purple-500/10 p-4 text-sm text-purple-100">
              <p className="text-base font-semibold text-purple-100">{dictionary.hintTitle}</p>
              <ul className="list-disc space-y-1 pl-5">
                {hintsToShow.map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
