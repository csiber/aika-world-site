"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Dictionary } from "@/lib/i18n";

type SpaceBattleDictionary = Dictionary["miniGames"]["spaceBattle"];

type GameStatus = "idle" | "running" | "victory" | "defeat";

type InputState = {
  left: boolean;
  right: boolean;
  up: boolean;
  fire: boolean;
};

type PlayerState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  shield: number;
  fireCooldown: number;
  invulnerability: number;
};

type EnemyColor = "blue" | "red";

type EnemyState = {
  id: number;
  x: number;
  y: number;
  vx: number;
  patrolLeft: number;
  patrolRight: number;
  fireTimer: number;
  color: EnemyColor;
};

type Projectile = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  source: "player" | "enemy";
  damage: number;
};

type GameState = {
  status: GameStatus;
  wave: number;
  score: number;
  player: PlayerState;
  enemies: EnemyState[];
  playerShots: Projectile[];
  enemyShots: Projectile[];
  nextEnemyId: number;
  nextProjectileId: number;
};

type StepEvent =
  | { type: "player-shot" }
  | { type: "enemy-shot" }
  | { type: "enemy-destroyed" }
  | { type: "player-hit" }
  | { type: "victory" }
  | { type: "defeat" };

const GAME_WIDTH = 720;
const GAME_HEIGHT = 420;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 24;
const ENEMY_WIDTH = 28;
const ENEMY_HEIGHT = 22;
const PLAYER_ACCELERATION = 1300;
const PLAYER_MAX_SPEED = 320;
const PLAYER_FRICTION_GROUND = 0.82;
const PLAYER_FRICTION_AIR = 0.92;
const GRAVITY = 980;
const LIFT_FORCE = 1450;
const MAX_UPWARD_SPEED = -320;
const PLAYER_FIRE_COOLDOWN = 0.32;
const PLAYER_PROJECTILE_SPEED = 520;
const ENEMY_BASE_SPEED = 60;
const ENEMY_PROJECTILE_SPEED = 320;
const ENEMY_FIRE_BASE = 1.8;
const MAX_WAVES = 3;
const GROUND_LEVEL = GAME_HEIGHT - 28;

const PLATFORMS = [
  { x: 32, y: 340, width: 200, height: 16 },
  { x: 268, y: 304, width: 160, height: 16 },
  { x: 492, y: 344, width: 176, height: 16 },
  { x: 156, y: 248, width: 176, height: 16 },
  { x: 404, y: 212, width: 196, height: 16 },
  { x: 76, y: 164, width: 140, height: 16 },
  { x: 524, y: 156, width: 156, height: 16 },
];

const STARFIELD = Array.from({ length: 42 }).map((_, index) => ({
  id: index,
  x: (index * 67) % GAME_WIDTH,
  y: (index * 97) % GAME_HEIGHT,
  radius: 1 + ((index * 13) % 3),
}));

type WaveLayout = {
  x: number;
  y: number;
  left: number;
  right: number;
  direction: 1 | -1;
  color: EnemyColor;
};

const WAVE_LAYOUTS: WaveLayout[] = [
  { x: 520, y: PLATFORMS[0].y - ENEMY_HEIGHT, left: 460, right: 660, direction: -1, color: "blue" },
  { x: 120, y: PLATFORMS[0].y - ENEMY_HEIGHT, left: 48, right: 220, direction: 1, color: "blue" },
  { x: 332, y: PLATFORMS[1].y - ENEMY_HEIGHT, left: 268, right: 428, direction: -1, color: "blue" },
  { x: 580, y: PLATFORMS[2].y - ENEMY_HEIGHT, left: 520, right: 684, direction: -1, color: "red" },
  { x: 188, y: PLATFORMS[3].y - ENEMY_HEIGHT, left: 156, right: 312, direction: 1, color: "red" },
  { x: 444, y: PLATFORMS[4].y - ENEMY_HEIGHT, left: 404, right: 564, direction: -1, color: "blue" },
  { x: 108, y: PLATFORMS[5].y - ENEMY_HEIGHT, left: 76, right: 200, direction: 1, color: "red" },
];

const WAVE_PATTERNS: Record<number, number[]> = {
  1: [0, 1, 2],
  2: [0, 1, 2, 3, 4],
  3: [0, 1, 2, 3, 4, 5, 6],
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function createPlayer(): PlayerState {
  return {
    x: 96,
    y: GROUND_LEVEL - PLAYER_HEIGHT,
    vx: 0,
    vy: 0,
    facing: 1,
    shield: 100,
    fireCooldown: 0,
    invulnerability: 0,
  };
}

function createWave(wave: number, startId: number): { enemies: EnemyState[]; nextId: number } {
  const layoutIndexes = WAVE_PATTERNS[wave] ?? WAVE_PATTERNS[3];
  const enemies: EnemyState[] = layoutIndexes.map((layoutIndex, order) => {
    const layout = WAVE_LAYOUTS[layoutIndex];
    const speed = ENEMY_BASE_SPEED + wave * 12 + (layout.color === "red" ? 28 : 0);
    const fireWindow = Math.max(0.7, ENEMY_FIRE_BASE - wave * 0.35 + Math.random() * 0.6);
    return {
      id: startId + order,
      x: layout.x,
      y: layout.y,
      vx: speed * layout.direction,
      patrolLeft: layout.left,
      patrolRight: layout.right,
      fireTimer: fireWindow,
      color: layout.color,
    };
  });

  return { enemies, nextId: startId + enemies.length };
}

function createInitialState(status: GameStatus = "idle"): GameState {
  const { enemies, nextId } = createWave(1, 1);
  return {
    status,
    wave: 1,
    score: 0,
    player: createPlayer(),
    enemies,
    playerShots: [],
    enemyShots: [],
    nextEnemyId: nextId,
    nextProjectileId: 1,
  };
}

function stepGame(state: GameState, input: InputState, delta: number): { state: GameState; events: StepEvent[] } {
  if (state.status !== "running") {
    return { state, events: [] };
  }

  const events: StepEvent[] = [];
  const player: PlayerState = { ...state.player };
  let enemies: EnemyState[] = state.enemies.map((enemy) => ({ ...enemy }));
  let playerShots: Projectile[] = state.playerShots.map((shot) => ({ ...shot }));
  let enemyShots: Projectile[] = state.enemyShots.map((shot) => ({ ...shot }));
  let nextProjectileId = state.nextProjectileId;
  let nextEnemyId = state.nextEnemyId;
  let wave = state.wave;
  let score = state.score;
  let status: GameStatus = state.status;

  player.fireCooldown = Math.max(0, player.fireCooldown - delta);
  player.invulnerability = Math.max(0, player.invulnerability - delta);

  const horizontalInput = (input.left ? -1 : 0) + (input.right ? 1 : 0);
  if (horizontalInput !== 0) {
    player.vx += horizontalInput * PLAYER_ACCELERATION * delta;
    player.facing = horizontalInput > 0 ? 1 : -1;
  } else {
    const friction = player.y + PLAYER_HEIGHT >= GROUND_LEVEL - 0.5 ? PLAYER_FRICTION_GROUND : PLAYER_FRICTION_AIR;
    player.vx *= friction;
  }

  player.vx = clamp(player.vx, -PLAYER_MAX_SPEED, PLAYER_MAX_SPEED);

  if (input.up) {
    player.vy -= LIFT_FORCE * delta;
    if (player.vy < MAX_UPWARD_SPEED) {
      player.vy = MAX_UPWARD_SPEED;
    }
  }

  player.vy += GRAVITY * delta;

  let nextX = player.x + player.vx * delta;
  let nextY = player.y + player.vy * delta;

  let onPlatform = false;

  for (const platform of PLATFORMS) {
    const platformTop = platform.y;
    const platformBottom = platform.y + platform.height;
    const platformRight = platform.x + platform.width;
    if (
      player.y + PLAYER_HEIGHT <= platformTop &&
      nextY + PLAYER_HEIGHT >= platformTop &&
      nextX + PLAYER_WIDTH > platform.x &&
      nextX < platformRight
    ) {
      nextY = platformTop - PLAYER_HEIGHT;
      player.vy = 0;
      onPlatform = true;
    } else if (
      player.y >= platformBottom &&
      nextY <= platformBottom &&
      nextX + PLAYER_WIDTH > platform.x &&
      nextX < platformRight
    ) {
      nextY = platformBottom;
      if (player.vy < 0) {
        player.vy = 0;
      }
    }
  }

  if (nextY + PLAYER_HEIGHT >= GROUND_LEVEL) {
    nextY = GROUND_LEVEL - PLAYER_HEIGHT;
    player.vy = 0;
    onPlatform = true;
  }

  if (nextY < 12) {
    nextY = 12;
    if (player.vy < 0) {
      player.vy = 0;
    }
  }

  if (nextX < 0) {
    nextX = 0;
    if (player.vx < 0) {
      player.vx = 0;
    }
  }

  if (nextX + PLAYER_WIDTH > GAME_WIDTH) {
    nextX = GAME_WIDTH - PLAYER_WIDTH;
    if (player.vx > 0) {
      player.vx = 0;
    }
  }

  player.x = nextX;
  player.y = nextY;

  if (onPlatform && !input.up && Math.abs(player.vy) < 16) {
    player.vy = 0;
  }

  if (input.fire && player.fireCooldown <= 0) {
    const shotX = player.facing === 1 ? player.x + PLAYER_WIDTH - 4 : player.x - 6;
    const shotY = player.y + PLAYER_HEIGHT / 2 - 2;
    playerShots.push({
      id: nextProjectileId++,
      x: shotX,
      y: shotY,
      vx: player.facing * PLAYER_PROJECTILE_SPEED,
      vy: 0,
      width: 8,
      height: 3,
      source: "player",
      damage: 0,
    });
    player.fireCooldown = PLAYER_FIRE_COOLDOWN;
    events.push({ type: "player-shot" });
  }

  const destroyedEnemies = new Set<number>();
  const survivingPlayerShots: Projectile[] = [];
  for (const shot of playerShots) {
    const nextShot = { ...shot };
    nextShot.x += nextShot.vx * delta;
    nextShot.y += nextShot.vy * delta;

    if (nextShot.x < -24 || nextShot.x > GAME_WIDTH + 24) {
      continue;
    }

    let hitEnemy = false;
    for (const enemy of enemies) {
      if (destroyedEnemies.has(enemy.id)) {
        continue;
      }
      if (
        nextShot.x + nextShot.width > enemy.x &&
        nextShot.x < enemy.x + ENEMY_WIDTH &&
        nextShot.y + nextShot.height > enemy.y &&
        nextShot.y < enemy.y + ENEMY_HEIGHT
      ) {
        destroyedEnemies.add(enemy.id);
        score += 160 + wave * 45 + (enemy.color === "red" ? 90 : 0);
        events.push({ type: "enemy-destroyed" });
        hitEnemy = true;
        break;
      }
    }

    if (!hitEnemy) {
      survivingPlayerShots.push(nextShot);
    }
  }

  playerShots = survivingPlayerShots;
  enemies = enemies.filter((enemy) => !destroyedEnemies.has(enemy.id));

  for (const enemy of enemies) {
    enemy.x += enemy.vx * delta;
    if (enemy.x < enemy.patrolLeft) {
      enemy.x = enemy.patrolLeft;
      enemy.vx = Math.abs(enemy.vx);
    }
    if (enemy.x + ENEMY_WIDTH > enemy.patrolRight) {
      enemy.x = enemy.patrolRight - ENEMY_WIDTH;
      enemy.vx = -Math.abs(enemy.vx);
    }

    enemy.fireTimer -= delta;
    if (enemy.fireTimer <= 0) {
      const playerCenterX = player.x + PLAYER_WIDTH / 2;
      const playerCenterY = player.y + PLAYER_HEIGHT / 2;
      const enemyCenterX = enemy.x + ENEMY_WIDTH / 2;
      const enemyCenterY = enemy.y + ENEMY_HEIGHT / 2;
      const dx = playerCenterX - enemyCenterX;
      const dy = playerCenterY - enemyCenterY;
      const distance = Math.hypot(dx, dy) || 1;
      const projectileSpeed = ENEMY_PROJECTILE_SPEED + wave * 30 + (enemy.color === "red" ? 45 : 0);
      enemyShots.push({
        id: nextProjectileId++,
        x: enemyCenterX - 3,
        y: enemyCenterY - 3,
        vx: (dx / distance) * projectileSpeed,
        vy: (dy / distance) * projectileSpeed,
        width: 6,
        height: 6,
        source: "enemy",
        damage: enemy.color === "red" ? 26 : 18,
      });
      enemy.fireTimer = Math.max(0.65, ENEMY_FIRE_BASE - wave * 0.35 + Math.random() * 0.6);
      events.push({ type: "enemy-shot" });
    }
  }

  const survivingEnemyShots: Projectile[] = [];
  for (const shot of enemyShots) {
    const nextShot = { ...shot };
    nextShot.x += nextShot.vx * delta;
    nextShot.y += nextShot.vy * delta;

    if (
      nextShot.x + nextShot.width < -24 ||
      nextShot.x > GAME_WIDTH + 24 ||
      nextShot.y + nextShot.height < -24 ||
      nextShot.y > GAME_HEIGHT + 24
    ) {
      continue;
    }

    let keepShot = true;
    if (player.invulnerability <= 0) {
      if (
        nextShot.x + nextShot.width > player.x &&
        nextShot.x < player.x + PLAYER_WIDTH &&
        nextShot.y + nextShot.height > player.y &&
        nextShot.y < player.y + PLAYER_HEIGHT
      ) {
        player.shield = clamp(player.shield - nextShot.damage, 0, 100);
        player.invulnerability = 0.75;
        keepShot = false;
        events.push({ type: "player-hit" });
      }
    }

    if (keepShot) {
      survivingEnemyShots.push(nextShot);
    }
  }

  enemyShots = survivingEnemyShots;

  if (player.invulnerability <= 0) {
    for (const enemy of enemies) {
      if (
        enemy.x + ENEMY_WIDTH > player.x &&
        enemy.x < player.x + PLAYER_WIDTH &&
        enemy.y + ENEMY_HEIGHT > player.y &&
        enemy.y < player.y + PLAYER_HEIGHT
      ) {
        player.shield = clamp(player.shield - 24, 0, 100);
        player.invulnerability = 0.85;
        events.push({ type: "player-hit" });
        enemy.vx = -enemy.vx;
      }
    }
  }

  if (player.shield <= 0 && status === "running") {
    player.shield = 0;
    status = "defeat";
    events.push({ type: "defeat" });
  }

  if (enemies.length === 0 && status === "running") {
    if (wave >= MAX_WAVES) {
      status = "victory";
      events.push({ type: "victory" });
    } else {
      wave += 1;
      const { enemies: nextWaveEnemies, nextId } = createWave(wave, nextEnemyId);
      nextEnemyId = nextId;
      enemies = nextWaveEnemies;
      player.shield = clamp(player.shield + 18, 0, 100);
      score += 200;
    }
  }

  return {
    state: {
      status,
      wave,
      score: Math.round(score),
      player,
      enemies,
      playerShots,
      enemyShots,
      nextEnemyId,
      nextProjectileId,
    },
    events,
  };
}

type SpaceBattleGameProps = {
  dictionary: SpaceBattleDictionary;
};

export function SpaceBattleGame({ dictionary }: SpaceBattleGameProps) {
  const initialState = useMemo(() => createInitialState(), []);
  const [gameState, setGameState] = useState<GameState>(initialState);
  const inputRef = useRef<InputState>({ left: false, right: false, up: false, fire: false });
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);

  const ensureAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType, gainValue = 0.18) => {
      const context = ensureAudioContext();
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(gainValue, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(now + duration);
    },
    [ensureAudioContext],
  );

  const playPlayerShot = useCallback(() => {
    playTone(740, 0.12, "square", 0.22);
  }, [playTone]);

  const playEnemyShot = useCallback(() => {
    playTone(420, 0.14, "sawtooth", 0.16);
  }, [playTone]);

  const playExplosion = useCallback(() => {
    playTone(160, 0.3, "triangle", 0.24);
  }, [playTone]);

  const playDamage = useCallback(() => {
    playTone(220, 0.25, "sawtooth", 0.28);
  }, [playTone]);

  const playVictory = useCallback(() => {
    playTone(660, 0.28, "triangle", 0.2);
    setTimeout(() => playTone(880, 0.32, "sine", 0.18), 120);
  }, [playTone]);

  const playDefeat = useCallback(() => {
    playTone(160, 0.36, "sine", 0.22);
  }, [playTone]);

  const startRun = useCallback(() => {
    ensureAudioContext();
    inputRef.current = { left: false, right: false, up: false, fire: false };
    lastTimeRef.current = undefined;
    setGameState(createInitialState("running"));
  }, [ensureAudioContext]);

  useEffect(() => {
    if (gameState.status !== "running") {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
        lastTimeRef.current = undefined;
      }
      return;
    }

    const loop = (time: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }
      const delta = clamp((time - lastTimeRef.current) / 1000, 0, 0.05);
      lastTimeRef.current = time;

      setGameState((prev) => {
        const { state, events } = stepGame(prev, inputRef.current, delta);
        for (const event of events) {
          switch (event.type) {
            case "player-shot":
              playPlayerShot();
              break;
            case "enemy-shot":
              playEnemyShot();
              break;
            case "enemy-destroyed":
              playExplosion();
              break;
            case "player-hit":
              playDamage();
              break;
            case "victory":
              playVictory();
              break;
            case "defeat":
              playDefeat();
              break;
            default:
              break;
          }
        }
        return state;
      });

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }
    };
  }, [gameState.status, playDamage, playDefeat, playEnemyShot, playExplosion, playPlayerShot, playVictory]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      if (
        key === "ArrowLeft" ||
        key === "ArrowRight" ||
        key === "ArrowUp" ||
        key === " " ||
        key === "Space" ||
        key === "space" ||
        key === "w" ||
        key === "W" ||
        key === "a" ||
        key === "A" ||
        key === "d" ||
        key === "D"
      ) {
        event.preventDefault();
      }

      switch (key) {
        case "ArrowLeft":
        case "a":
        case "A":
          inputRef.current.left = true;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          inputRef.current.right = true;
          break;
        case "ArrowUp":
        case "w":
        case "W":
          inputRef.current.up = true;
          break;
        case " ":
        case "Space":
        case "space":
        case "Spacebar":
          inputRef.current.fire = true;
          break;
        case "r":
        case "R":
          startRun();
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key;
      switch (key) {
        case "ArrowLeft":
        case "a":
        case "A":
          inputRef.current.left = false;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          inputRef.current.right = false;
          break;
        case "ArrowUp":
        case "w":
        case "W":
          inputRef.current.up = false;
          break;
        case " ":
        case "Space":
        case "space":
        case "Spacebar":
          inputRef.current.fire = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [startRun]);

  const thrusterActive = gameState.player.vy < -40;
  const shieldPercent = clamp(gameState.player.shield, 0, 100);

  const statusCard = (() => {
    if (gameState.status === "victory") {
      return (
        <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-emerald-200">
          <h3 className="text-lg font-semibold">{dictionary.victoryTitle}</h3>
          <p className="text-sm text-emerald-100/80">{dictionary.victoryDescription}</p>
        </div>
      );
    }
    if (gameState.status === "defeat") {
      return (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-rose-200">
          <h3 className="text-lg font-semibold">{dictionary.defeatTitle}</h3>
          <p className="text-sm text-rose-100/80">{dictionary.defeatDescription}</p>
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        {dictionary.objective}
      </div>
    );
  })();

  const buttonLabel = gameState.status === "running" ? dictionary.restartLabel : dictionary.startLabel;

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-gradient-to-b from-[#0b1120]/80 to-black/90 p-6 text-white shadow-xl shadow-purple-500/10">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold md:text-3xl">{dictionary.title}</h2>
        <p className="text-sm text-white/70 md:text-base">{dictionary.intro}</p>
        <p className="text-sm text-white/60 md:text-base">{dictionary.objective}</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            <div>
              <span>{dictionary.statusLabels.score}</span>
              <p className="mt-2 text-2xl font-bold tracking-normal text-white">{gameState.score}</p>
            </div>
            <div>
              <span>{dictionary.statusLabels.shield}</span>
              <div className="mt-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-sky-400 via-purple-400 to-fuchsia-500 transition-[width] duration-150"
                  style={{ width: `${shieldPercent}%` }}
                />
              </div>
              <p className="mt-1 text-sm font-medium tracking-normal text-white/70">{Math.round(shieldPercent)}%</p>
            </div>
            <div>
              <span>{dictionary.statusLabels.wave}</span>
              <p className="mt-2 text-2xl font-bold tracking-normal text-white">
                {gameState.wave}/{MAX_WAVES}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/70">
            <svg
              viewBox={`0 0 ${GAME_WIDTH} ${GAME_HEIGHT}`}
              className="h-72 w-full"
              role="img"
              aria-label={dictionary.title}
            >
              <defs>
                <linearGradient id="space-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10172a" />
                  <stop offset="100%" stopColor="#050510" />
                </linearGradient>
                <linearGradient id="thrust-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <rect width={GAME_WIDTH} height={GAME_HEIGHT} fill="url(#space-gradient)" />
              {STARFIELD.map((star) => (
                <circle key={star.id} cx={star.x} cy={star.y} r={star.radius} fill="rgba(255,255,255,0.15)" />
              ))}
              {PLATFORMS.map((platform, index) => (
                <rect
                  key={index}
                  x={platform.x}
                  y={platform.y}
                  width={platform.width}
                  height={platform.height}
                  fill="rgba(59,130,246,0.18)"
                  stroke="rgba(148,163,184,0.35)"
                  strokeWidth={1}
                  rx={6}
                />
              ))}

              {gameState.enemyShots.map((shot) => (
                <rect
                  key={`enemy-shot-${shot.id}`}
                  x={shot.x}
                  y={shot.y}
                  width={shot.width}
                  height={shot.height}
                  fill="rgba(248,113,113,0.9)"
                  rx={2}
                />
              ))}

              {gameState.playerShots.map((shot) => (
                <rect
                  key={`player-shot-${shot.id}`}
                  x={shot.x}
                  y={shot.y}
                  width={shot.width}
                  height={shot.height}
                  fill="rgba(96,165,250,0.95)"
                  rx={2}
                />
              ))}

              {gameState.enemies.map((enemy) => (
                <g key={enemy.id}>
                  <rect
                    x={enemy.x}
                    y={enemy.y}
                    width={ENEMY_WIDTH}
                    height={ENEMY_HEIGHT}
                    fill={enemy.color === "red" ? "rgba(248,113,113,0.9)" : "rgba(96,165,250,0.85)"}
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth={1.5}
                    rx={6}
                  />
                  <circle
                    cx={enemy.x + ENEMY_WIDTH / 2}
                    cy={enemy.y + ENEMY_HEIGHT / 2}
                    r={4}
                    fill="rgba(255,255,255,0.7)"
                  />
                </g>
              ))}

              {thrusterActive && (
                <polygon
                  points={`${gameState.player.x - 10},${gameState.player.y + PLAYER_HEIGHT / 2} ${gameState.player.x},${gameState.player.y} ${gameState.player.x},${gameState.player.y + PLAYER_HEIGHT}`}
                  fill="url(#thrust-gradient)"
                  opacity={0.9}
                />
              )}

              <polygon
                points={
                  gameState.player.facing === 1
                    ? `${gameState.player.x + PLAYER_WIDTH},${gameState.player.y + PLAYER_HEIGHT / 2} ${gameState.player.x + 10},${gameState.player.y} ${gameState.player.x},${gameState.player.y + PLAYER_HEIGHT / 2} ${gameState.player.x + 10},${gameState.player.y + PLAYER_HEIGHT}`
                    : `${gameState.player.x},${gameState.player.y + PLAYER_HEIGHT / 2} ${gameState.player.x + PLAYER_WIDTH - 10},${gameState.player.y + PLAYER_HEIGHT} ${gameState.player.x + PLAYER_WIDTH},${gameState.player.y + PLAYER_HEIGHT / 2} ${gameState.player.x + PLAYER_WIDTH - 10},${gameState.player.y}`
                }
                fill="rgba(148,163,184,0.9)"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={1.5}
              />

              <circle
                cx={gameState.player.x + PLAYER_WIDTH / 2}
                cy={gameState.player.y + PLAYER_HEIGHT / 2}
                r={8}
                fill="rgba(37,99,235,0.6)"
                stroke="rgba(165,180,252,0.9)"
                strokeWidth={1.2}
              />

              {gameState.status === "victory" && (
                <text
                  x={GAME_WIDTH / 2}
                  y={GAME_HEIGHT / 2}
                  textAnchor="middle"
                  className="fill-emerald-200"
                  fontSize={28}
                  fontWeight={600}
                >
                  {dictionary.victoryTitle}
                </text>
              )}

              {gameState.status === "defeat" && (
                <text
                  x={GAME_WIDTH / 2}
                  y={GAME_HEIGHT / 2}
                  textAnchor="middle"
                  className="fill-rose-200"
                  fontSize={28}
                  fontWeight={600}
                >
                  {dictionary.defeatTitle}
                </text>
              )}
            </svg>

            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <button
            type="button"
            onClick={startRun}
            className="w-full rounded-full bg-gradient-to-r from-sky-500/80 via-indigo-500/80 to-purple-500/80 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:from-sky-400 hover:to-purple-400"
          >
            {buttonLabel}
          </button>

          {statusCard}
        </div>

        <div className="w-full max-w-sm space-y-4 rounded-3xl border border-white/10 bg-black/60 p-5 text-sm text-white/70">
          <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">{dictionary.controlsTitle}</h3>
          <ul className="space-y-2">
            {dictionary.controls.map((control) => (
              <li key={control.key} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="font-mono text-xs text-white/80">{control.key}</span>
                <span className="text-xs text-white/60">{control.action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/60 p-5 text-sm text-white/70">
        <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">{dictionary.hintTitle}</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          {dictionary.hints.map((hint, index) => (
            <li key={index}>{hint}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

