/**
 * AIKA WORLD — Tactical Combat Engine
 * v1.0.0: Grid-based tactical battles with formations, abilities, and round simulation
 */

const GRID_ROWS = 6;
const GRID_COLS = 10;
const MAX_ROUNDS = 6;
const AUTO_RESOLVE_DELAY = 120; // seconds

const SHIP_COSTS = {
  fighter_s:  { m: 3000,   c: 1000   },
  fighter_l:  { m: 25000,  c: 7500   },
  cruiser:    { m: 50000,  c: 15000  },
  battleship: { m: 150000, c: 50000  },
  recycler:   { m: 10000,  c: 6000   },
  miner:      { m: 10000,  c: 20000  },
  colony:     { m: 10000,  c: 20000  },
};

const LARGE_SHIPS = ['battleship', 'cruiser'];
const SMALL_SHIPS = ['fighter_s', 'fighter_l', 'recycler', 'miner', 'colony'];

// ── Grid Placement ────────────────────────────────────────────────────────────

function autoPlaceFleet(fleet, side) {
  const grid = [];
  const frontRows = side === 'attacker' ? [0, 1, 2] : [0, 1, 2];
  const rearRows  = side === 'attacker' ? [3, 4, 5] : [3, 4, 5];

  let frontCol = 0;
  let rearCol  = 0;

  for (const ship of fleet) {
    if (ship.count <= 0) continue;
    const isLarge = LARGE_SHIPS.includes(ship.id);
    const rows = isLarge ? frontRows : rearRows;
    let col = isLarge ? frontCol : rearCol;
    const row = rows[col % rows.length];
    const actualCol = Math.floor(col / rows.length) % GRID_COLS;

    grid.push({
      shipType: ship.id,
      count: ship.count,
      hp: (ship.shield || 10) * ship.count,
      maxHp: (ship.shield || 10) * ship.count,
      shield: ship.shield || 10,
      attack: ship.attack || 0,
      abilities: ship.abilities ? JSON.parse(JSON.stringify(ship.abilities)) : [],
      abilityCooldowns: {},
      row,
      col: actualCol,
    });

    if (isLarge) frontCol++;
    else rearCol++;
  }

  return grid;
}

function autoPlaceDefense(defense) {
  const grid = [];
  let col = 0;
  const frontRows = [0, 1];

  for (const def of defense) {
    if (def.count <= 0) continue;
    const row = frontRows[col % frontRows.length];
    const actualCol = Math.floor(col / frontRows.length) % GRID_COLS;

    grid.push({
      shipType: def.id,
      count: def.count,
      hp: (def.shield || 50) * def.count,
      maxHp: (def.shield || 50) * def.count,
      shield: def.shield || 50,
      attack: def.attack || 0,
      abilities: [],
      abilityCooldowns: {},
      row,
      col: actualCol,
      isDefense: true,
    });
    col++;
  }

  return grid;
}

// ── Create Tactical Battle ────────────────────────────────────────────────────

export async function createTacticalBattle(env, missionId, attackerId, defenderId, attackerFleet, defenderFleet, defenderDefense, planetCoords) {
  const battleId = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const autoResolveAt = now + AUTO_RESOLVE_DELAY;

  const atkGrid = autoPlaceFleet(attackerFleet, 'attacker');
  const defGrid = [
    ...autoPlaceFleet(defenderFleet, 'defender'),
    ...autoPlaceDefense(defenderDefense || []),
  ];

  await env.DB.prepare(`
    INSERT INTO tactical_battles (id, mission_id, attacker_id, defender_id, attacker_fleet, defender_fleet, status, current_round, max_rounds, round_log, auto_resolve_at, planet_coords, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'pending_formation', 0, ?, '[]', ?, ?, unixepoch(), unixepoch())
  `).bind(
    battleId, missionId, attackerId, defenderId,
    JSON.stringify(atkGrid), JSON.stringify(defGrid),
    MAX_ROUNDS, autoResolveAt, planetCoords || null
  ).run();

  return battleId;
}

// ── Apply Formation ───────────────────────────────────────────────────────────

export async function applyFormation(env, battleId, userId, formation) {
  const battle = await env.DB.prepare('SELECT * FROM tactical_battles WHERE id = ?').bind(battleId).first();
  if (!battle) throw new Error('Csata nem található');
  if (battle.status !== 'pending_formation') throw new Error('Formáció már nem módosítható');

  // Validate formation
  if (!Array.isArray(formation)) throw new Error('Érvénytelen formáció');

  const isAttacker = battle.attacker_id === userId;
  const isDefender = battle.defender_id === userId;
  if (!isAttacker && !isDefender) throw new Error('Nincs jogosultság');

  const currentGrid = JSON.parse(isAttacker ? battle.attacker_fleet : battle.defender_fleet);

  // Validate all ships are placed and no duplicate cells
  const cellSet = new Set();
  for (const pos of formation) {
    if (pos.row < 0 || pos.row >= GRID_ROWS || pos.col < 0 || pos.col >= GRID_COLS) {
      throw new Error('Érvénytelen pozíció');
    }
    const key = `${pos.row}:${pos.col}`;
    if (cellSet.has(key)) throw new Error('Duplikált cella');
    cellSet.add(key);
  }

  // Map formation to grid units
  const newGrid = [];
  for (const pos of formation) {
    const unit = currentGrid.find(u => u.shipType === pos.shipType);
    if (!unit) throw new Error(`Ismeretlen hajótípus: ${pos.shipType}`);
    newGrid.push({ ...unit, row: pos.row, col: pos.col });
  }

  const column = isAttacker ? 'attacker_formation' : 'defender_formation';
  const fleetCol = isAttacker ? 'attacker_fleet' : 'defender_fleet';

  await env.DB.prepare(`UPDATE tactical_battles SET ${column} = ?, ${fleetCol} = ?, updated_at = unixepoch() WHERE id = ?`)
    .bind(JSON.stringify(formation), JSON.stringify(newGrid), battleId).run();

  // Check if both formations are submitted
  const updated = await env.DB.prepare('SELECT * FROM tactical_battles WHERE id = ?').bind(battleId).first();
  if (updated.attacker_formation && updated.defender_formation) {
    await env.DB.prepare("UPDATE tactical_battles SET status = 'simulating', updated_at = unixepoch() WHERE id = ?").bind(battleId).run();
  }

  return await env.DB.prepare('SELECT * FROM tactical_battles WHERE id = ?').bind(battleId).first();
}

// ── Target Selection ──────────────────────────────────────────────────────────

function selectTarget(units, priority, attackerRow, attackerCol) {
  const alive = units.filter(u => u.count > 0 && u.hp > 0);
  if (alive.length === 0) return null;

  if (priority === 'weakest_first') {
    return alive.reduce((w, u) => (u.hp < w.hp ? u : w), alive[0]);
  }
  if (priority === 'strongest_first') {
    return alive.reduce((s, u) => (u.hp > s.hp ? u : s), alive[0]);
  }
  // closest
  return alive.reduce((c, u) => {
    const dU = Math.abs(u.row - attackerRow) + Math.abs(u.col - attackerCol);
    const dC = Math.abs(c.row - attackerRow) + Math.abs(c.col - attackerCol);
    return dU < dC ? u : c;
  }, alive[0]);
}

// ── Simulate Round ────────────────────────────────────────────────────────────

export async function simulateRound(env, battleId) {
  const battle = await env.DB.prepare('SELECT * FROM tactical_battles WHERE id = ?').bind(battleId).first();
  if (!battle) throw new Error('Csata nem található');
  if (battle.status === 'resolved') throw new Error('Csata már lezárult');

  let atkUnits = JSON.parse(battle.attacker_fleet);
  let defUnits = JSON.parse(battle.defender_fleet);
  const atkOrders = JSON.parse(battle.attacker_orders || '{}');
  const defOrders = JSON.parse(battle.defender_orders || '{}');
  const roundLog = JSON.parse(battle.round_log || '[]');
  let currentRound = battle.current_round + 1;

  const roundEvents = [];

  // Process attacker units
  processUnitAttacks(atkUnits, defUnits, atkOrders, roundEvents, 'attacker');

  // Process defender units
  processUnitAttacks(defUnits, atkUnits, defOrders, roundEvents, 'defender');

  // Decrement ability cooldowns
  decrementCooldowns(atkUnits);
  decrementCooldowns(defUnits);

  // Clean up destroyed units
  atkUnits = atkUnits.map(u => ({ ...u, count: u.hp <= 0 ? 0 : u.count }));
  defUnits = defUnits.map(u => ({ ...u, count: u.hp <= 0 ? 0 : u.count }));

  const roundSummary = {
    round: currentRound,
    events: roundEvents,
    attackerRemaining: atkUnits.filter(u => u.count > 0).length,
    defenderRemaining: defUnits.filter(u => u.count > 0).length,
  };
  roundLog.push(roundSummary);

  const atkAlive = atkUnits.some(u => u.count > 0 && u.hp > 0);
  const defAlive = defUnits.some(u => u.count > 0 && u.hp > 0);
  const maxReached = currentRound >= battle.max_rounds;

  let newStatus = battle.status === 'pending_formation' ? 'simulating' : battle.status;
  if (!atkAlive || !defAlive || maxReached) {
    newStatus = 'resolved';
  }

  await env.DB.prepare(`
    UPDATE tactical_battles SET attacker_fleet = ?, defender_fleet = ?, current_round = ?, round_log = ?, status = ?, updated_at = unixepoch() WHERE id = ?
  `).bind(
    JSON.stringify(atkUnits), JSON.stringify(defUnits),
    currentRound, JSON.stringify(roundLog), newStatus, battleId
  ).run();

  if (newStatus === 'resolved') {
    return await resolveTacticalBattle(env, battleId);
  }

  return await env.DB.prepare('SELECT * FROM tactical_battles WHERE id = ?').bind(battleId).first();
}

function processUnitAttacks(attackers, defenders, orders, events, side) {
  const priority = orders.target_priority || 'closest';
  const abilityUse = orders.abilities || [];

  // Sort attackers: front rows first
  const sorted = [...attackers].filter(u => u.count > 0 && u.hp > 0).sort((a, b) => a.row - b.row);

  for (const unit of sorted) {
    const target = selectTarget(defenders, priority, unit.row, unit.col);
    if (!target) break;

    // Position modifier: front (rows 0-2) = 1.0, rear (rows 3-5) = 0.8
    const posMod = unit.row <= 2 ? 1.0 : 0.8;
    let baseDmg = unit.attack * unit.count * posMod;

    // Check for ability usage
    const requestedAbility = abilityUse.find(a => a.shipType === unit.shipType);
    let abilityUsed = null;

    if (requestedAbility && unit.abilities && unit.abilities.length > 0) {
      const ability = unit.abilities.find(a => a.id === requestedAbility.abilityId);
      const cd = unit.abilityCooldowns?.[requestedAbility.abilityId] || 0;

      if (ability && cd <= 0) {
        // Apply ability
        if (ability.id === 'plasma_salvo') {
          // Target weakest
          const weakest = selectTarget(defenders, 'weakest_first', unit.row, unit.col);
          if (weakest) {
            const plasmaDmg = baseDmg * (ability.damage_mult || 2.5);
            weakest.hp -= plasmaDmg;
            const destroyed = weakest.hp <= 0 ? weakest.count : Math.floor(plasmaDmg / ((weakest.shield || 10) + 1));
            weakest.count = Math.max(0, weakest.count - destroyed);
            if (weakest.count <= 0) weakest.hp = 0;
            events.push({ side, unit: unit.shipType, ability: ability.id, target: weakest.shipType, damage: Math.floor(plasmaDmg), destroyed });
            abilityUsed = ability.id;
            unit.abilityCooldowns = unit.abilityCooldowns || {};
            unit.abilityCooldowns[ability.id] = ability.cooldown;
            continue; // Skip normal attack
          }
        }

        if (ability.id === 'shield_overcharge') {
          unit.hp = Math.min(unit.maxHp * (ability.shield_mult || 2.0), unit.hp * (ability.shield_mult || 2.0));
          events.push({ side, unit: unit.shipType, ability: ability.id, shieldBoost: true });
          abilityUsed = ability.id;
          unit.abilityCooldowns = unit.abilityCooldowns || {};
          unit.abilityCooldowns[ability.id] = ability.cooldown;
        }

        if (ability.id === 'evasive_maneuver') {
          // Mark for dodge check — applied on incoming damage
          unit._evasive = true;
          events.push({ side, unit: unit.shipType, ability: ability.id, dodgeActive: true });
          abilityUsed = ability.id;
          unit.abilityCooldowns = unit.abilityCooldowns || {};
          unit.abilityCooldowns[ability.id] = ability.cooldown;
        }
      }
    }

    // Check if target has evasive maneuver active
    if (target._evasive) {
      const dodgeRoll = Math.random();
      if (dodgeRoll < 0.4) {
        events.push({ side, unit: unit.shipType, target: target.shipType, dodged: true });
        continue;
      }
    }

    // Apply normal damage
    target.hp -= baseDmg;
    const destroyed = target.hp <= 0 ? target.count : Math.floor(baseDmg / ((target.shield || 10) + 1));
    target.count = Math.max(0, target.count - destroyed);
    if (target.count <= 0) target.hp = 0;

    events.push({ side, unit: unit.shipType, target: target.shipType, damage: Math.floor(baseDmg), destroyed, abilityUsed });
  }

  // Clear evasive flags
  defenders.forEach(u => { delete u._evasive; });
}

function decrementCooldowns(units) {
  for (const unit of units) {
    if (!unit.abilityCooldowns) continue;
    for (const key of Object.keys(unit.abilityCooldowns)) {
      if (unit.abilityCooldowns[key] > 0) unit.abilityCooldowns[key]--;
    }
  }
}

// ── Resolve Tactical Battle ──────────────────────────────────────────────────

export async function resolveTacticalBattle(env, battleId) {
  const battle = await env.DB.prepare('SELECT * FROM tactical_battles WHERE id = ?').bind(battleId).first();
  if (!battle) throw new Error('Csata nem található');

  const atkUnits = JSON.parse(battle.attacker_fleet);
  const defUnits = JSON.parse(battle.defender_fleet);
  const roundLog = JSON.parse(battle.round_log || '[]');

  // Calculate remaining attack power per side
  const atkPower = atkUnits.reduce((s, u) => s + (u.attack * u.count), 0);
  const defPower = defUnits.reduce((s, u) => s + (u.attack * u.count), 0);
  const attackerWins = atkPower > defPower;

  // Calculate losses
  let lostMetal = 0;
  let lostCrystal = 0;

  // We need to figure out initial vs remaining to compute losses
  // Since we track count changes through rounds, compute from remaining
  // We'll use a simplified approach based on current counts vs max possible
  const calcLosses = (units) => {
    const losses = [];
    for (const u of units) {
      const maxCount = u.maxHp > 0 ? Math.ceil(u.maxHp / ((u.shield || 10) || 1)) : 0;
      const lost = Math.max(0, maxCount - u.count);
      if (lost > 0) {
        const cost = SHIP_COSTS[u.shipType] || { m: 0, c: 0 };
        lostMetal += lost * cost.m;
        lostCrystal += lost * cost.c;
        losses.push({ id: u.shipType, count: lost });
      }
    }
    return losses;
  };

  const attackerLosses = calcLosses(atkUnits);
  const defenderLosses = calcLosses(defUnits);

  // Rebuild remaining fleet arrays in runBattle-compatible format
  const attackerRemainingFleet = atkUnits.filter(u => !u.isDefense).map(u => ({
    id: u.shipType, count: u.count, attack: u.attack, shield: u.shield,
    cargo: u.cargo || 0, icon: u.icon || '', name: u.name || u.shipType,
  }));

  const defenderRemainingFleet = defUnits.filter(u => !u.isDefense).map(u => ({
    id: u.shipType, count: u.count, attack: u.attack, shield: u.shield,
    cargo: u.cargo || 0, icon: u.icon || '', name: u.name || u.shipType,
  }));

  const defenderRemainingDefense = defUnits.filter(u => u.isDefense).map(u => ({
    id: u.shipType, count: u.count, attack: u.attack, shield: u.shield,
  }));

  // Calculate loot (same formula as runBattle in combat_logic.js)
  let loot = { metal: 0, crystal: 0, deus: 0 };

  if (attackerWins) {
    const cargo = attackerRemainingFleet.reduce((s, u) => s + ((u.cargo || 0) * u.count), 0);
    // We don't have defender resources here — the mission_resolver will handle that
    loot.metal = Math.floor(cargo / 2.5);
    loot.crystal = Math.floor(cargo / 2.5);
    loot.deus = Math.floor(cargo / 10);
  }

  // Debris: 30% of lost ships' resources
  const debris = {
    metal: Math.floor(lostMetal * 0.3),
    crystal: Math.floor(lostCrystal * 0.3),
  };

  const debrisTotal = (lostMetal + lostCrystal) * 0.3;
  const moonChance = Math.min(20, Math.floor(debrisTotal / 100000));
  const moonCreated = Math.random() * 100 < moonChance;

  // Result in runBattle-compatible format
  const result = {
    attackerWins,
    attackerName: '',  // Filled by mission_resolver
    defenderName: '',  // Filled by mission_resolver
    initialAtkFleet: [],
    initialDefFleet: [],
    initialDefDefense: [],
    attackerRemainingFleet,
    defenderRemainingFleet,
    defenderRemainingDefense,
    defenderResources: {},  // Filled by mission_resolver
    loot,
    rounds: roundLog,
    debris,
    moonChance,
    moonCreated,
    tactical: true,
    battleId,
  };

  await env.DB.prepare(`
    UPDATE tactical_battles SET status = 'resolved', result = ?, updated_at = unixepoch() WHERE id = ?
  `).bind(JSON.stringify(result), battleId).run();

  return result;
}

// ── Auto-Resolve ──────────────────────────────────────────────────────────────

export async function autoResolveBattle(env, battleId) {
  const battle = await env.DB.prepare('SELECT * FROM tactical_battles WHERE id = ?').bind(battleId).first();
  if (!battle) throw new Error('Csata nem található');
  if (battle.status === 'resolved') {
    return JSON.parse(battle.result);
  }

  // Ensure status allows simulation
  if (battle.status === 'pending_formation') {
    await env.DB.prepare("UPDATE tactical_battles SET status = 'simulating', updated_at = unixepoch() WHERE id = ?").bind(battleId).run();
  }

  // Run all rounds instantly
  let result = null;
  for (let i = 0; i < MAX_ROUNDS; i++) {
    const updated = await env.DB.prepare('SELECT * FROM tactical_battles WHERE id = ?').bind(battleId).first();
    if (updated.status === 'resolved') {
      result = JSON.parse(updated.result);
      break;
    }
    result = await simulateRound(env, battleId);
  }

  // If still not resolved after max rounds, force resolve
  const final = await env.DB.prepare('SELECT * FROM tactical_battles WHERE id = ?').bind(battleId).first();
  if (final.status !== 'resolved') {
    result = await resolveTacticalBattle(env, battleId);
  }

  return result;
}
