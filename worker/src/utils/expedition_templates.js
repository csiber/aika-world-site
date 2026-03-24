/**
 * AIKA WORLD — Expedition 2.0 Event Templates
 * Weighted RNG event system with choice-based encounters and chain expeditions.
 */

// ── Event Definitions ────────────────────────────────────────────────────────

export const EXPEDITION_EVENTS = [
  {
    type: 'empty_space',
    weight: 25,
    hasChoice: false,
    resolve(ships) {
      return {
        message_key: 'expedition.empty_space',
        loot: {},
        shipLoss: {},
        darkMatter: 0,
      };
    },
  },
  {
    type: 'resource_cache',
    weight: 20,
    hasChoice: false,
    resolve(ships) {
      const cargo = ships.reduce((s, u) => s + ((u.cargo || 0) * u.count), 0);
      return {
        message_key: 'expedition.resource_cache',
        loot: {
          metal: Math.floor(cargo * 0.4 * (0.3 + Math.random() * 0.7)),
          crystal: Math.floor(cargo * 0.2 * (0.3 + Math.random() * 0.7)),
          deus: Math.floor(cargo * 0.05 * Math.random()),
        },
        shipLoss: {},
        darkMatter: 0,
      };
    },
  },
  {
    type: 'abandoned_station',
    weight: 10,
    hasChoice: false,
    resolve(ships) {
      return {
        message_key: 'expedition.abandoned_station',
        loot: {
          metal: Math.floor(800 + Math.random() * 2200),
          crystal: Math.floor(400 + Math.random() * 1200),
        },
        shipLoss: {},
        darkMatter: 0,
        tempBonus: { type: 'research_speed', percent: 5, durationSeconds: 3600 },
      };
    },
  },
  {
    type: 'dark_matter_cloud',
    weight: 8,
    hasChoice: false,
    resolve(ships) {
      return {
        message_key: 'expedition.dark_matter_cloud',
        loot: {},
        shipLoss: {},
        darkMatter: Math.floor(5 + Math.random() * 16),
      };
    },
  },
  {
    type: 'alien_fleet',
    weight: 8,
    hasChoice: false,
    resolve(ships) {
      const lost = Math.random() < 0.3;
      if (lost) {
        const lossPct = 0.10 + Math.random() * 0.10; // 10-20%
        const shipLoss = {};
        ships.forEach(s => {
          const lost = Math.floor(s.count * lossPct);
          if (lost > 0) shipLoss[s.type || s.id] = lost;
        });
        return {
          message_key: 'expedition.alien_fleet_loss',
          loot: {},
          shipLoss,
          darkMatter: 0,
        };
      }
      const cargo = ships.reduce((s, u) => s + ((u.cargo || 0) * u.count), 0);
      return {
        message_key: 'expedition.alien_fleet_win',
        loot: {
          metal: Math.floor(cargo * 0.3 * Math.random()),
          crystal: Math.floor(cargo * 0.2 * Math.random()),
        },
        shipLoss: {},
        darkMatter: Math.floor(Math.random() * 5),
      };
    },
  },
  {
    type: 'black_hole',
    weight: 5,
    hasChoice: true,
    choices: ['investigate', 'avoid'],
    resolve(ships, choice) {
      if (choice === 'avoid') {
        return {
          message_key: 'expedition.black_hole_avoid',
          loot: {},
          shipLoss: {},
          darkMatter: 0,
        };
      }
      // investigate: 40% huge reward, 60% fleet loss
      if (Math.random() < 0.4) {
        return {
          message_key: 'expedition.black_hole_reward',
          loot: {
            metal: Math.floor(3000 + Math.random() * 5000),
            crystal: Math.floor(2000 + Math.random() * 3000),
            deus: Math.floor(200 + Math.random() * 500),
          },
          shipLoss: {},
          darkMatter: Math.floor(10 + Math.random() * 20),
        };
      }
      const lossPct = 0.20 + Math.random() * 0.30; // 20-50%
      const shipLoss = {};
      ships.forEach(s => {
        const lost = Math.floor(s.count * lossPct);
        if (lost > 0) shipLoss[s.type || s.id] = lost;
      });
      return {
        message_key: 'expedition.black_hole_loss',
        loot: {},
        shipLoss,
        darkMatter: 0,
      };
    },
  },
  {
    type: 'trading_caravan',
    weight: 7,
    hasChoice: true,
    choices: ['trade', 'ignore'],
    resolve(ships, choice) {
      if (choice === 'ignore') {
        return {
          message_key: 'expedition.trading_caravan_ignore',
          loot: {},
          shipLoss: {},
          darkMatter: 0,
        };
      }
      return {
        message_key: 'expedition.trading_caravan_trade',
        loot: {
          metal: Math.floor(500 + Math.random() * 2000),
          crystal: Math.floor(500 + Math.random() * 1500),
          deus: Math.floor(50 + Math.random() * 200),
        },
        shipLoss: {},
        darkMatter: 0,
      };
    },
  },
  {
    type: 'distress_signal',
    weight: 5,
    hasChoice: true,
    choices: ['rescue', 'ignore'],
    resolve(ships, choice) {
      if (choice === 'ignore') {
        return {
          message_key: 'expedition.distress_signal_ignore',
          loot: {},
          shipLoss: {},
          darkMatter: 0,
        };
      }
      return {
        message_key: 'expedition.distress_signal_rescue',
        loot: {},
        shipLoss: {},
        darkMatter: Math.floor(8 + Math.random() * 15),
      };
    },
  },
  {
    type: 'ancient_artifact',
    weight: 4,
    hasChoice: false,
    resolve(ships) {
      const resources = ['metal', 'crystal', 'deus'];
      const bonusResource = resources[Math.floor(Math.random() * resources.length)];
      return {
        message_key: 'expedition.ancient_artifact',
        loot: {},
        shipLoss: {},
        darkMatter: 0,
        permanentBonus: { resource: bonusResource, percent: 2 },
      };
    },
  },
  {
    type: 'wormhole',
    weight: 3,
    hasChoice: true,
    choices: ['enter', 'avoid'],
    resolve(ships, choice) {
      if (choice === 'avoid') {
        return {
          message_key: 'expedition.wormhole_avoid',
          loot: {},
          shipLoss: {},
          darkMatter: 0,
        };
      }
      return {
        message_key: 'expedition.wormhole_enter',
        loot: {
          metal: Math.floor(200 + Math.random() * 800),
          crystal: Math.floor(100 + Math.random() * 600),
        },
        shipLoss: {},
        darkMatter: 0,
        wormholeTarget: `${Math.floor(Math.random() * 5) + 1}:${Math.floor(Math.random() * 400) + 1}:${Math.floor(Math.random() * 15) + 1}`,
      };
    },
  },
];

// ── Chain Expeditions ────────────────────────────────────────────────────────

export const CHAIN_EXPEDITIONS = [
  {
    id: 'ancient_civilization',
    totalSteps: 3,
    triggerChance: 0.03,
    steps: [
      {
        type: 'chain_ancient_civ_1',
        hasChoice: false,
        resolve(ships) {
          return {
            message_key: 'expedition.chain.ancient_civ_step1',
            loot: { metal: 500, crystal: 300 },
            shipLoss: {},
            darkMatter: 0,
          };
        },
      },
      {
        type: 'chain_ancient_civ_2',
        hasChoice: true,
        choices: ['explore_deeper', 'take_loot_and_leave'],
        resolve(ships, choice) {
          if (choice === 'take_loot_and_leave') {
            return {
              message_key: 'expedition.chain.ancient_civ_step2_leave',
              loot: { metal: 1500, crystal: 1000, deus: 200 },
              shipLoss: {},
              darkMatter: 5,
            };
          }
          return {
            message_key: 'expedition.chain.ancient_civ_step2_explore',
            loot: { metal: 300, crystal: 200 },
            shipLoss: {},
            darkMatter: 0,
          };
        },
      },
      {
        type: 'chain_ancient_civ_3',
        hasChoice: false,
        resolve(ships) {
          return {
            message_key: 'expedition.chain.ancient_civ_step3',
            loot: { metal: 5000, crystal: 3000, deus: 500 },
            shipLoss: {},
            darkMatter: 20,
            permanentBonus: { resource: 'deus', percent: 2 },
          };
        },
      },
    ],
  },
];

// ── Weighted Random Selection ────────────────────────────────────────────────

function weightedRandom(events) {
  const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const event of events) {
    roll -= event.weight;
    if (roll <= 0) return event;
  }
  return events[events.length - 1];
}

// ── Main Roll Function ───────────────────────────────────────────────────────

/**
 * Roll an expedition event.
 * @param {Array} ships - fleet ships array
 * @param {string} userId - user ID
 * @param {object|null} existingChain - { chainId, chainStep, chainDefId } if continuing a chain
 * @returns {object} event object with type, hasChoice, choices, resolve, chainId, chainStep
 */
export function rollExpeditionEvent(ships, userId, existingChain = null) {
  // 1. Continue existing chain
  if (existingChain) {
    const chainDef = CHAIN_EXPEDITIONS.find(c => c.id === existingChain.chainDefId);
    if (chainDef && existingChain.chainStep < chainDef.totalSteps) {
      const step = chainDef.steps[existingChain.chainStep];
      return {
        ...step,
        chainId: existingChain.chainId,
        chainDefId: chainDef.id,
        chainStep: existingChain.chainStep,
        isChain: true,
      };
    }
  }

  // 2. 3% chance to start a new chain
  if (Math.random() < 0.03) {
    const chainDef = CHAIN_EXPEDITIONS[Math.floor(Math.random() * CHAIN_EXPEDITIONS.length)];
    const chainId = crypto.randomUUID();
    const step = chainDef.steps[0];
    return {
      ...step,
      chainId,
      chainDefId: chainDef.id,
      chainStep: 0,
      isChain: true,
    };
  }

  // 3. Normal weighted random event
  const event = weightedRandom(EXPEDITION_EVENTS);
  return {
    type: event.type,
    hasChoice: event.hasChoice,
    choices: event.choices || [],
    resolve: event.resolve,
    isChain: false,
    chainId: null,
    chainStep: 0,
  };
}
