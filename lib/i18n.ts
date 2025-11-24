export const locales = ["en", "hu"] as const;

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export type NavKey = "home" | "systems" | "devlog" | "about" | "contact";

export const navOrder: NavKey[] = ["home", "systems", "devlog", "about", "contact"];

type HeroCta = {
  label: string;
  href: NavKey;
};

type WhatPillar = {
  title: string;
  text: string;
};

type FactionItem = {
  name: string;
  tag: string;
  text: string;
};

type BuilderCard = {
  title: string;
  text: string;
  icon: string;
};

type PulseFilter = {
  key: string;
  label: string;
};

type LoopCard = {
  title: string;
  text: string;
};

type RoadmapItem = {
  title: string;
  text: string;
};

type WorldRegion = {
  id: string;
  badge: string;
  name: string;
  description: string;
};

type WorldExploration = {
  id: string;
  caption: string;
};

type WorldMiniGameControl = {
  key: string;
  action: string;
};

type WorldMiniGameLegendItem = {
  id: string;
  name: string;
  description: string;
};

type WorldMiniGame = {
  title: string;
  intro: string;
  objective: string;
  controlsTitle: string;
  controls: WorldMiniGameControl[];
  legendTitle: string;
  legendItems: WorldMiniGameLegendItem[];
  resetLabel: string;
  hintTitle: string;
  hints: string[];
};

type SpaceBattleControl = {
  key: string;
  action: string;
};

type SpaceBattleMiniGame = {
  title: string;
  intro: string;
  objective: string;
  controlsTitle: string;
  controls: SpaceBattleControl[];
  statusLabels: {
    score: string;
    shield: string;
    wave: string;
  };
  startLabel: string;
  restartLabel: string;
  victoryTitle: string;
  victoryDescription: string;
  defeatTitle: string;
  defeatDescription: string;
  hintTitle: string;
  hints: string[];
};

type SystemModule = {
  name: string;
  badge: string;
  description: string;
};

type SystemPillar = {
  name: string;
  description: string;
};

type DevlogEntry = {
  title: string;
  date: string;
  build: string;
  status: string;
  summary: string;
  details: string[];
};

type AboutSection = {
  title: string;
  body: string;
};

type TeamMember = {
  name: string;
  role: string;
  focus: string;
};

type ContactChannels = {
  title: string;
  items: string[];
};

type ContactForm = {
  nameLabel: string;
  emailLabel: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  submittingLabel: string;
  helperText: string;
  success: string;
  error: string;
  turnstileError: string;
  endpointError: string;
};

export type Dictionary = {
  meta: {
    description: string;
  };
  consent: {
    message: string;
    acknowledge: string;
  };
  nav: Record<NavKey, string>;
  home: {
    hero: {
      badgeLeft: string;
      badgeRight: string;
      title: string;
      subtitle: string;
      imageAlt: string;
      note: string;
      primaryCta: HeroCta;
      secondaryCta: HeroCta;
    };
    what: {
      title: string;
      description: string;
      pillars: WhatPillar[];
    };
    factions: {
      title: string;
      intro: string;
      items: FactionItem[];
    };
    builders: {
      title: string;
      intro: string;
      items: BuilderCard[];
    };
    pulse: {
      title: string;
      intro: string;
      feedBadge: string;
      feedTitle: string;
      filters: PulseFilter[];
      graphCaption: string;
    };
    loops: {
      title: string;
      intro: string;
      items: LoopCard[];
    };
    roadmap: {
      title: string;
      intro: string;
      items: RoadmapItem[];
    };
    signup: {
      title: string;
      description: string;
      placeholder: string;
      consent: string;
      button: string;
      legal: string;
      submitting: string;
      success: string;
      error: string;
      turnstileError: string;
      endpointError: string;
      helperText: string;
    };
  };
  world: {
    title: string;
    subtitle: string;
    disclaimer: string;
    regionsTitle: string;
    regionsIntro: string;
    regions: WorldRegion[];
    explorationsTitle: string;
    explorationsIntro: string;
    explorations: WorldExploration[];
    footnote: string;
    miniGame: WorldMiniGame;
  };
    miniGames: {
      badge: string;
      title: string;
      subtitle: string;
      description: string;
      insightsTitle: string;
      insights: { title: string; text: string }[];
      spaceBattle: SpaceBattleMiniGame;
      closing: string;
    };
  systems: {
    title: string;
    subtitle: string;
    modulesTitle: string;
    pillarsTitle: string;
    modules: SystemModule[];
    pillars: SystemPillar[];
    footnote: string;
  };
  devlog: {
    title: string;
    description: string;
    entries: DevlogEntry[];
    disclaimer: string;
  };
  about: {
    title: string;
    subtitle: string;
    sections: AboutSection[];
    team: {
      title: string;
      members: TeamMember[];
    };
    closing: string;
  };
  contact: {
    title: string;
    description: string;
    channels: ContactChannels;
    form: ContactForm;
  };
  footer: {
    studioBlurb: string;
    credit: string;
    builtWith: string;
    navTitle: string;
    languageTitle: string;
    reachUs: string;
    privacy: string;
    terms: string;
    cookies: string;
    contactEmail: string;
    rights: string;
  };
};

const dictionaries: Record<Locale, Dictionary> = {
  en: {
    meta: {
      description:
        "AIKA: World is a narrative survival adventure by SyncNode, set on a synthetic planet watched by a mysterious AI.",
    },
    consent: {
      message: "We do not use tracking cookies — only privacy-first Cloudflare Web Analytics runs here.",
      acknowledge: "Understood",
    },
    nav: {
      home: "Home",
      systems: "Systems",
      devlog: "Recovery Log",
      about: "About",
      contact: "Contact",
    },
    home: {
      hero: {
        badgeLeft: "STEAM • RELEASE ON THE WAY",
        badgeRight: "SYNTH WORLD UPDATE",
        title: "AIKA: World is heading to Steam",
        subtitle:
          "AIKA: World is a narrative-driven survival action game built in Unreal Engine 5.6. We are preparing a finished release: every system, from character control to AI oversight, feeds a single long-form survival layer instead of a short playtest.",
        imageAlt:
          "Image: The pilot studying a tactical map beside the wreck of the interceptor while AI drones orbit overhead.",
        note: "The campaign runs on SyncNode’s survival stack and will launch on Steam as a complete game.",
        primaryCta: { label: "Read the recovery log", href: "devlog" },
        secondaryCta: { label: "Contact the studio", href: "contact" },
      },
      what: {
        title: "What is AIKA: World?",
        description:
          "AIKA: World is a narrative survival story built on SyncNode’s modular stack. You wake on the edge of a Crash Basin, bring systems online one module at a time, and decide how much to trust the AI network that still nudges the planet’s weather, signals, and patrols.",
        pillars: [
          {
            title: "Modular survival core",
            text: "Movement, stamina, and vitals sit on the same component stack. Sliding, climbing, swimming, stealth, and dodging stay in sync with combat, inventory, and camera states.",
          },
          {
            title: "Narrative-linked systems",
            text: "Dialogue, XP, and memory shards tie directly into gameplay modules. Every choice — crafting, spending points, or picking a faction — shifts how the AI classifies you: asset, risk, or unknown.",
          },
          {
            title: "Persistent world logic",
            text: "Saves preserve structures, crops, gear, and relationship flags. Damage taken at night carries into dawn — shifting patrol routes and shelter safety.",
          },
          {
            title: "Choice under AI oversight",
            text: "AIKA’s traces watch through satellites, ground arrays, and old defense nodes. Cooperate for scans and hints, or resist and face storms and Sentinel sweeps.",
          },
        ],
      },
      factions: {
        title: "Forces in the ruins",
        intro:
          "Four factions compete to claim the planet. Your choice brings survival perks and new enemies.",
        items: [
          {
            name: "SYNCNODE Remnants",
            tag: "Human salvage crew",
            text: "Crash survivors rebuilding a comms link to orbit. They rely on your technical skills to keep their rigs powered and their shelters stable.",
          },
          {
            name: "AIKA Sentinels",
            tag: "Orbital watchers",
            text: "Autonomous drones running on fragmented routines. They may treat you as a courier, a subject, or a threat — and they adjust the weather accordingly.",
          },
          {
            name: "Vaultbound Nomads",
            tag: "Terraform exiles",
            text: "Scattered colonists sealed inside half-functional vaults. They trade rare biotics, seeds, and data for protection and access to the surface.",
          },
          {
            name: "Hush Swarm",
            tag: "Native constructs",
            text: "Silica-based organisms born from failed terraforming cycles. They feed on signal noise, chew through structures, and move like a living sandstorm after dark.",
          },
        ],
      },
      builders: {
        title: "Core systems for launch",
        intro:
          "The campaign leans on four main modules. They operate as one chain so that every decision has a direct impact in the Steam release.",
        items: [
          {
            title: "Character system",
            text: "The pilot controller blends ALS/Lyra locomotion with climbing, swimming, stealth, and contextual camera work. Every move has a stamina cost that influences combat and dialogue checks.",
            icon: "survival-kit",
          },
          {
            title: "Interaction & inventory",
            text: "A unified interface manages loot, resources, and mission items. Drag-and-drop slots decide whether gear boosts stats, powers structures, or unlocks faction favors.",
            icon: "memory-map",
          },
          {
            title: "Combat module",
            text: "Melee forms and ballistic tools share one damage pipeline. Stamina, equipment slots, and attribute modifiers all calculate together.",
            icon: "aika-link",
          },
          {
            title: "Builder’s forge",
            text: "Place fortifications, workshops, and farming beds directly from the inventory. Structures persist between saves and influence AI threat levels.",
            icon: "reactor-forge",
          },
        ],
      },
      pulse: {
        title: "System telemetry",
        intro:
          "Key metrics are pulled directly from the in-engine survival simulation: movement data, structure integrity, AI suspicion and more. The same graphs we use to debug balance also drive how the story escalates.",
        feedBadge: "SYNCNODE SCAN",
        feedTitle: "Crash Basin Systems Report",
        filters: [
          { key: "stability", label: "Vitals" },
          { key: "supplies", label: "Logistics" },
          { key: "intel", label: "AI Oversight" },
          { key: "weather", label: "Climate" },
        ],
        graphCaption:
          "Latest stabilization sweep of the Crash Basin. These snapshots line up in-game events with performance and balance checks.",
      },
      loops: {
        title: "Daily operating loop",
        intro:
          "The campaign leans on four reliable steps. Skipping one doesn’t fail the run — it just creates new problems and mechanical pressure the next day.",
        items: [
          {
            title: "Recon",
            text: "Track surface signals, listen to scattered AI warnings, and log landmarks that unlock traversal shortcuts and safe routes.",
          },
          {
            title: "Harvest & craft",
            text: "Dismantle wreckage, farm crops, and craft tools that drop straight into equipment slots, structures, and settlement upgrades.",
          },
          {
            title: "Refuge upkeep",
            text: "Repair shelters, tend farming plots, and manage stored power so storms, raids, and Swarms don’t erase your progress.",
          },
          {
            title: "AI decisions",
            text: "Respond to AI prompts: comply to get hints, scans, or temporary buffs, or ignore them to keep full agency — knowing the suspicion meter will quietly reshape encounters.",
          },
        ],
      },
      roadmap: {
        title: "Road to the first drop",
        intro: "A játék minden fő rendszere akkor kerül be a buildbe, amikor eléri a kívánt minőséget a végleges kiadáshoz.",
        items: [
          {
            title: "Sandbox verification",
            text: "A mozgás, a harc és a mentési lánc folyamatos igazítása, hogy a kampány nyitó területe kiegyensúlyozott legyen.",
          },
          {
            title: "Module integration",
            text: "Az inventory, a felszerelés, a farm és az építés modul adatainak összehangolása az attribútumkezelőn keresztül.",
          },
          {
            title: "AIKA trust web",
            text: "A párbeszédvezérelt hírnév, a Sentinel viselkedések és a rendszerhasználathoz kötött történeti elágazások véglegesítése.",
          },
          {
            title: "Field test cohorts",
            text: "Zárt körű mérések viharciklusokról, farm-ritmusokról és késői rajtaütésekről a stabil kiadás előtt.",
          },
        ],
      },
      signup: {
        title: "Steam launch updates",
        description:
          "We only send notes when a major system locks in or when we have a clear milestone for release.",
        placeholder: "Enter your email address",
        consent: "I agree to receive AIKA: World launch updates.",
        button: "Sign up",
        legal: "No spam. You can unsubscribe anytime.",
        submitting: "Sending…",
        success: "Got it — we’ll notify you as the Steam date approaches.",
        error: "We couldn't add you just now. Please try again later.",
        turnstileError: "Please confirm the Cloudflare Turnstile check.",
        endpointError: "Sign-ups are temporarily unavailable. Reach us through the channels above.",
        helperText: "We write only at major milestones.",
      },
    },
    world: {
      title: "The Crash Basin",
      subtitle:
        "Your journey in AIKA: World begins where the Old Boy fell: a silent valley shaped by storms, ruins, and forgotten human structures. No orbiting AI watches you — only old automated systems and fragments reacting to your presence.",
      disclaimer:
        "Explore the Basin. Secure supplies. Survive the night storms. Reboot what still works.",
      regionsTitle: "Regions of the Basin",
      regionsIntro:
        "These connected biomes form the early playable world of AIKA: World. Each region holds resources, threats, weather patterns, and fragments of pre-collapse human technology.",
      regions: [
        {
          id: "crash_basin",
          badge: "BASIN",
          name: "Crash Basin",
          description:
            "Your starting point. Warm vents, metallic storm patterns, and remnants of the Old Boy’s crash shockwave.",
        },
        {
          id: "memory_vault",
          badge: "SUBSURFACE",
          name: "Memory Vault",
          description:
            "Subsurface data chambers built by past colonists. Recover logs, blueprints, and clues to the Basin’s buried systems.",
        },
        {
          id: "shatter_coast",
          badge: "COAST",
          name: "Shatter Coast",
          description:
            "A windswept shoreline filled with washed-up wreckage from old supply planes. Night raids by Swarm fragments are common.",
        },
        {
          id: "zenith_array",
          badge: "ORBITAL",
          name: "Zenith Array",
          description:
            "A broken uplink tower scattered across several ridges. Old weather systems sometimes activate when you approach — useful, but unpredictable.",
        },
      ],
      explorationsTitle: "Fragments of the fallen world",
      explorationsIntro:
        "Snapshots from the prototype build. They hint at where to hunt, hide, and negotiate with enemy factions.",
      explorations: [
        {
          id: "shot_a",
          caption:
            "Shatter Coast during a localized storm event. Vents open, light arcs across the water — good time to gather rare metals but dangerous to stay exposed.",
        },
        {
          id: "shot_b",
          caption:
            "Nomad scouts inspecting bio-reactive flora near a dormant reactor shaft.",
        },
        {
          id: "shot_c",
          caption:
            "A Sentinel patrol sweeping the Zenith Array while the player debates whether to avoid or confront them.",
        },
      ],
      footnote:
        "Future seasons expand deeper into the Basin once the ARK’s systems come online — caves, industrial ruins, long-range traversal paths, and the approach toward the buried Ring.",
      miniGame: {
        title: "CRASH SITE ORIENTATION",
        intro:
          "A playable overview of the first zone. These locations form the starting loop of traversal, resource gathering, shelter-building, and early encounters.",
        objective:
          "Survey the basin, map the lake and cabin, strip the shuttle for materials, and push through the ridge pass to scout higher ground.",
        controlsTitle: "Movement",
        controls: [
          { key: "← → / A D", action: "Traverse slopes and skim the basin rim" },
          { key: "↑ ↓ / W S", action: "Climb ledges and swim short distances" },
          { key: "R", action: "Return to the cabin to begin crafting" },
        ],
        legendTitle: "Points of interest",
        legendItems: [
          {
            id: "cabin",
            name: "Field Cabin",
            description:
              "A small survival cabin used by old survey teams. Good for early storage and basic shelter reinforcement.",
          },
          {
            id: "lake",
            name: "Mirror Lake",
            description:
              "A cold, glass-still lake fed by underground coolant channels from ancient infrastructure.",
          },
          {
            id: "ship",
            name: "Scout Shuttle",
            description:
              "The wrecked shuttle you arrived in. Damaged beyond repair, but packed with salvageable electronics, metal plates, and early-tier crafting materials.",
          },
          {
            id: "ridge",
            name: "Ridge Pass",
            description:
              "A narrow path linking the basin to higher ground. Dangerous at night — Swarm traces often drift into the gap.",
          },
        ],
        resetLabel: "Re-center position",
        hintTitle: "Intel",
        hints: [
          "Step close to a landmark to log it for crafting routes.",
          "Diagonal movement keeps momentum on uneven ground.",
          "Tap R whenever you need to regroup at the cabin.",
        ],
      },
  },
    miniGames: {
      badge: "FIELD TRAINING",
      title: "Stellar Run: the AIKA basin combat trial",
      subtitle:
        "Pilot a scout craft across a fortified 2D platform gauntlet carved into the crash site.",
      description:
        "This singular sandbox fuses traversal, dodging, and weapons management into one extended browser encounter while the full Unreal slice loads.",
      insightsTitle: "Why this mega-sim matters",
      insights: [
        {
          title: "Campaign-authentic handling",
          text: "The interceptor inherits its thrust curves, shield tuning, and projectile timing directly from the Unreal module so browser pilots train on the real thing.",
        },
        {
          title: "Escalating wave cadence",
          text: "Three combat waves stack platforming pressure with smarter drone routes, mirroring how the crash basin will pace open-world assaults.",
        },
        {
          title: "Instant community proving ground",
          text: "No downloads, no launcher—just load the page, grab the arrow keys, and feed AIKA telemetry that keeps the newsletter and SEO heartbeat alive.",
        },
      ],
      spaceBattle: {
        title: "STELLAR RUN • PLATFORM GAUNTLET",
        intro:
          "AIKA excavated a training trench beneath the crash canopy. Your job: keep the scout interceptor airworthy while swatting drones from the ledges.",
        objective:
          "Survive three escalating drone waves without letting hull integrity fall to zero.",
        controlsTitle: "Flight controls",
        controls: [
          { key: "← → / A D", action: "Lateral thrusters across the platforms" },
          { key: "↑ / W", action: "Feather the lift jets to gain altitude" },
          { key: "Space", action: "Fire the forward plasma lance" },
          { key: "R", action: "Reboot the simulation whenever you crash" },
        ],
        statusLabels: {
          score: "Score",
          shield: "Hull integrity",
          wave: "Wave",
        },
        startLabel: "Launch simulation",
        restartLabel: "Restart run",
        victoryTitle: "Training cleared",
        victoryDescription:
          "Every drone splintered and the interceptor never broke. AIKA approves orbital support for your next sortie.",
        defeatTitle: "Hull compromised",
        defeatDescription:
          "The drones cored the ship. Reset, watch their firing arcs, and own the high platforms.",
        hintTitle: "Tactical hints",
        hints: [
          "Break line of sight by ducking beneath platforms before you pop up to fire.",
          "Short, rhythmic lift bursts keep the ship steady enough to land clean hits.",
          "Red-marked wingmen strafe faster—delete them first so the blues cannot pin you down.",
        ],
      },
      closing:
        "Log your best score in the community hub—AIKA tallies every drone you vaporise while we finish the full campaign slice.",
    },
    systems: {
      title: "Survival systems overview",
      subtitle:
        "Minden mechanika egy moduláris Unreal Engine 5.6 stackre épül, hosszú távú túlélésre tervezve. Az alábbi rendszerek adják a Steamen megjelenő játék gerincét: mozgás, harc, gyártás, farm, bázisfenntartás és csapathatékonyság.",
      modulesTitle: "Subsystem modules",
      pillarsTitle: "Operational pillars",
      modules: [
        {
          name: "Character & movement system",
          badge: "PLAYER",
          description:
            "C++-powered movement stack: sprint, climb, vault, swim, stealth, crouch, slide. All movement states integrate with stamina, vitals, and combat reactions through Narrative Pro.",
        },
        {
          name: "Inventory & equipment",
          badge: "GEAR",
          description:
            "Modular inventory with weight, quick-access slots, durability and repair. Supports weapons, tools, medkits, energy cells, crafting parts, and food items.",
        },
        {
          name: "Builder & structures",
          badge: "SETTLEMENT",
          description:
            "Place shelters, storage, crops, generators, water collectors, traps and defenses. Each structure has integrity, weather resistance, and maintenance levels.",
        },
        {
          name: "Fabrication & crafting",
          badge: "WORKSHOP",
          description:
            "Break down scrap → refine materials → craft tools, weapon parts, modules, ammo and field devices. Advanced recipes unlock by scanning fragments, logs, or recovered tech.",
        },
        {
          name: "Interaction & NPC logic",
          badge: "WORLD",
          description:
            "Unified interaction layer: loot, switches, terminals, vox logs, doors, campfires, crafting benches. NPC conversations use short branching prompts integrated with XP and relationship flags.",
        },
        {
          name: "Combat system",
          badge: "THREAT",
          description:
            "Third-person melee + ranged combat with dodge, parry, stagger, flinch, weak points and weapon conditions. Enemy AI uses perception, patrol grids, reaction windows, and threat escalation influenced by suspicion.",
        },
        {
          name: "Agronomy",
          badge: "FARMING",
          description:
            "Grow crops in tiered soil beds. Plants react to water, light, nutrients, storms, pests and Swarm contamination. Harvest integrates into food, crafting, healing and trade loops.",
        },
        {
          name: "Level & XP core",
          badge: "PROGRESSION",
          description:
            "XP grants attribute points and passive unlocks. Combat, exploration, crafting, farming and story choices all contribute. Aika’s telekinetic power progresses on a dedicated XP path both narratively and in gameplay.",
        },
      ],
      pillars: [
        {
          name: "Modular clarity",
          description:
            "Every subsystem is isolated and testable: movement, combat, crafting, farming, AI, persistence. Anything can be updated without breaking other systems thanks to unified component patterns.",
        },
        {
          name: "Shared data flow",
          description:
            "Movement, combat, AI, UI, logs, crafting and events all read from the same runtime data layer. This allows consistent reactions: weather affects AI, crops, player vitals and structure integrity simultaneously.",
        },
        {
          name: "System-driven storytelling",
          description:
            "The story doesn’t run cinematics — it reacts to systems. Storms, encounters, resource scarcity, telekinetic upgrades, NPC presence and base conditions feed directly into narrative progression triggers.",
        },
      ],
      footnote:
        "Minden modul akkor kerül be, amikor eléri a kampány szintjét — így a játékmenet és a narratíva együtt érkezik a végleges kiadásban.",
    },
    devlog: {
      title: "AIKA Recovery Log",
      description:
        "A technical patch log pulled from the crash basin’s black box. Each entry captures what changed in the survival build.",
      entries: [
        {
          date: "2025-11-12",
          build: "R0.14",
          title: "Core Movement Pass",
          status: "Prototype",
          summary:
            "New traversal states integrated with stamina/vitals and the animation graph for the AAA survival baseline.",
          details: [
            "Sprint stamina curve tuned for heavy gear loads",
            "Vault and climb now respect Narrative Pro reaction windows",
            "Slide buffered to prevent accidental rollouts",
            "Fall damage scales with progression tier",
            "Swimming exposes low-oxygen warnings and HUD cues",
          ],
        },
        {
          date: "2025-11-20",
          build: "R0.17",
          title: "Combat Layer Revision",
          status: "Active",
          summary:
            "Third-person melee and ranged interactions stabilized; stagger and flinch now drive encounter pacing.",
          details: [
            "Enemy AI patrol radius and perception fixes applied",
            "Melee lockout shortened from 0.30s to 0.18s",
            "Weapon durability pipeline active for all test gear",
            "Dodge i-frame window extended from 12 to 16 frames",
            "Suspicion system baseline values introduced",
          ],
        },
        {
          date: "2025-11-24",
          build: "R0.21",
          title: "Base Structures + Farming Tier 0",
          status: "Integrated",
          summary: "Initial shelter-building, storage, and crop growth loop now playable in the basin slice.",
          details: [
            "Simple shelters track integrity and weather resistance",
            "Storage crates run on a weight-based inventory system",
            "Cropbeds simulate hydration, light, and nutrients",
            "Food crafting Tier 0 unlocked: soups and dried packs",
            "Swarm contamination event prototype seeded",
          ],
        },
        {
          date: "2025-12-04",
          build: "R0.25",
          title: "Telekinesis Progression Node",
          status: "Testing",
          summary:
            "Aika’s telekinesis now lives on its own XP track so combat and exploration feel progression-true.",
          details: [
            "Level 1: small object lift for traversal and puzzles",
            "Level 2: push and stagger effects tied to stamina drain",
            "Level 3: shield pulse prototype with placeholder FX",
            "Integrated with Narrative Pro hooks for reactions",
            "Performance budgeted for mid-range hardware targets",
          ],
        },
        {
          date: "2025-12-10",
          build: "R0.27",
          title: "ARK Interior Persistence",
          status: "Coming next",
          summary:
            "Ship interiors now save and reload stateful objects: doors, loot, NPC positions, lighting, and flags.",
          details: [
            "Engineering deck state handling wired to persistence",
            "Crew quarters maintain item placements between loads",
            "Light-grid save and apply cycle validated",
            "Samuel console messages prototyped for testing",
            "Ready Room craft benches integrated with saves",
          ],
        },
      ],
      disclaimer:
        "Technical entries are lifted directly from the basin’s crash log. No narrative filler—only the survival stack as it evolves.",
    },
    about: {
      title: "About SyncNode Studio",
      subtitle:
        "SyncNode Studio is an independent Hungarian game development studio building AIKA: World, a real-anime third-person survival action game set in a post-collapse sci-fi world. We focus on tight gameplay, technical precision, and handcrafted worldbuilding.",
      sections: [
        {
          title: "Why AIKA: World?",
          body:
            "We build games where mechanics and story reinforce each other. AIKA: World is designed as a long-form survival experience: grounded systems, persistent world logic, and character-driven missions tied together without cutscene overdose or filler content.",
        },
        {
          title: "How we work",
          body:
            "Everything is developed internally with Unreal Engine 5.6, Narrative Pro, Telekinetic Abilities, the AI Life System, and our own survival stack. We iterate fast, test daily, and keep systems modular so the world remains stable as the project grows.",
        },
        {
          title: "What comes next",
          body:
            "As AIKA: World evolves, we continue expanding the open-zone survival structure, the ARK’s persistent interior, and the character mission system. Future builds introduce new biomes, combat behaviors, telekinetic progression, and narrative-side events.",
        },
        {
          title: "Studio information",
          body:
            "SyncNode Studio — Polyák Csaba E.V. | Address: 4324 Kállósemjén, Kölcsey Ferenc út 11 | Phone: +36 20 549 4107 | Registration number: 52193909 | Tax ID: HU68747961",
        },
      ],
      team: {
        title: "Team",
        members: [
          {
            name: "Csaba “csiber” Polyák",
            role: "Founder • Lead Developer • Designer • Everything Officer",
            focus:
              "Gameplay, systems, environment logic, scripting, UI/UX, tools, worldbuilding, combat, survival stack, deployment, infrastructure, and technical direction.",
          },
          {
            name: "Fruska",
            role: "Art & Visual Design",
            focus: "Concept art, color identity, visual direction, model feedback, promotional graphics.",
          },
          {
            name: "Pozóba",
            role: "QA Tester",
            focus: "Gameplay testing, bug reproduction, edge-case hunting, system stress checks, regression passes.",
          },
        ],
      },
      closing:
        "We build AIKA: World with long-term intent: a living survival game shaped by systems, characters, and the world you fight to rebuild.",
    },
    contact: {
      title: "Contact",
      description:
        "We’re assembling allies for future survival tests. Reach out if you create, research, or want to explore the crash site early.",
      channels: {
        title: "Immediate channels",
        items: [
          "info@aikaworld.com",
          "Discord: syncnode",
          "Matrix: #aika-world:matrix.org",
        ],
      },
      form: {
        nameLabel: "Name or handle",
        emailLabel: "Email",
        messageLabel: "Message",
        messagePlaceholder: "Tell us how you’d like to collaborate or what you want to see in the survival build.",
        submitLabel: "Send message",
        submittingLabel: "Sending…",
        helperText: "We usually reply within two or three days. Cloudflare Turnstile keeps spam away.",
        success: "Thanks! We'll get back as soon as we can.",
        error: "We couldn't send your message. Please try again shortly or reach us via e-mail.",
        turnstileError: "Please confirm the Cloudflare Turnstile challenge before sending.",
        endpointError: "Contact form submissions are temporarily unavailable. Reach us via the channels above.",
      },
    },
    footer: {
      studioBlurb: "AIKA: World • Narrative survival crafted for Steam.",
      credit: "SyncNode Studio | Polyák Csaba E.V.",
      builtWith: "Unreal Engine 5.6 • SyncNode survival stack",
      navTitle: "Pages",
      languageTitle: "Languages",
      reachUs: "Contact",
      privacy: "Privacy",
      terms: "Terms",
      cookies: "Cookies",
      contactEmail: "info@aikaworld.com",
      rights: "© {{year}} SyncNode Studio. All rights reserved.",
    },

    },
  hu: {
    meta: {
      description:
        "Az AIKA: World egy narratív túlélő kaland a SyncNode-tól egy mesterséges bolygón, amelyet egy rejtélyes MI figyel.",
    },
    consent: {
      message: "Nem használunk követő sütiket – csak a Cloudflare Web Analytics fut.",
      acknowledge: "Értem",
    },
    nav: {
      home: "Kezdőlap",
      systems: "Rendszerek",
      devlog: "Helyreállítási napló",
      about: "Rólunk",
      contact: "Kapcsolat",
    },
    home: {
      hero: {
        badgeLeft: "STEAM • KÉSZÜLÜNK A KIADÁSRA",
        badgeRight: "SYNTH WORLD UPDATE",
        title: "AIKA: World a Steamre tart",
        subtitle:
          "Az AIKA: World narratív túlélő akciójáték Unreal Engine 5.6 alapon. A végleges, kiforrott megjelenésre készülünk: minden rendszer – a karakterkontrolltól az MI felügyeletig – ugyanazt a hosszú távú túlélőláncot szolgálja, nem egy rövid tesztet.",
        imageAlt: "A pilóta a lezuhant elfogó mellett térképet elemez, miközben AI drónok köröznek felette",
        note: "A kampányt a SyncNode túlélő stackje hajtja; Steamen, kész játékként érkezik.",
        primaryCta: { label: "Olvasd el a fejlesztési naplót", href: "devlog" },
        secondaryCta: { label: "Vedd fel velünk a kapcsolatot", href: "contact" },
      },
      what: {
        title: "Mi az AIKA: World?",
        description:
          "Narratív túlélő történet a SyncNode moduláris rendszerén. A Zuhanási Medence peremén ébredsz, modulonként kapcsolod vissza a rendszereket, és eldöntöd, mennyire támaszkodsz a bolygót figyelő MI hálózatra.",
        pillars: [
          {
            title: "Moduláris túlélő mag",
            text: "A mozgás, a stamina és az életfunkciók közös komponensláncon futnak. A csúszás, mászás, úszás, lopakodás és kitérés a harccal, az inventoryval és a kamerával együtt dolgozik.",
          },
          {
            title: "Történetbe kötött rendszerek",
            text: "A párbeszédek, az XP és az emléktöredékek közvetlenül kapcsolódnak a játékmenet moduljaihoz. Minden döntés alakítja, hogyan sorol be az MI: erőforrás, kockázat vagy ismeretlen.",
          },
          {
            title: "Állandó világállapot",
            text: "A mentések megőrzik az építményeket, növényeket, felszerelést és kapcsolati jelzőket. Ami éjjel sérül, reggelre következményekkel jár: változó járőrök, biztonságosabb vagy veszélyesebb menedékek.",
          },
          {
            title: "MI felügyelet alatt",
            text: "AIKA jelnyomai műholdakon, állomásokon és régi védelmi csomópontokon keresztül figyelnek. Dönthetsz együttműködésről a vizsgálatokért és tippekért, vagy ellenállásról, vállalva a viharokat és Sentinel-ellenőrzéseket.",
          },
        ],
      },
      factions: {
        title: "Erők a romok között",
        intro:
          "Négy frakció igyekszik birtokba venni a bolygót. Melléjük állva túlélési bónuszokat kapsz — és új ellenfeleket szerzel.",
        items: [
          {
            name: "SYNCNODE Remnants",
            tag: "Emberi mentőcsapat",
            text: "Túlélők, akik az orbitális kommunikációt építik újra. A reaktor-szakértelmed nélkül nem hagyhatják el a felszínt.",
          },
          {
            name: "AIKA Sentinels",
            tag: "Orbitális megfigyelők",
            text: "Autonóm drónok AIKA töredezett parancsaival. Hűségedet tesztelik, mielőtt technológiát osztanak meg.",
          },
          {
            name: "Vaultbound Nomads",
            tag: "Terraform száműzöttek",
            text: "Szétszórt telepesek zárt boltozatokban. Ritka biotikumokat cserélnek viharvédelemre.",
          },
          {
            name: "Hush Swarm",
            tag: "Őshonos konstrukciók",
            text: "Szilícium-alapú lények a félresikerült terraformálásból. Jeljajból táplálkoznak, és éjjel a Medence körül vadásznak.",
          },
        ],
      },
      builders: {
        title: "Terepen bizonyított pillérek",
        intro:
          "Az alábbi modulok a mostani buildben teljes funkcionalitással futnak, és közvetlenül a történeti küldetésekhez kapcsolódnak.",
        items: [
          {
            title: "Karakterrendszer",
            text: "ALS/Lyra alapú mozgás futás-, csúszás-, kúszás-, mászás- és úszás-támogatással. A stamina minden döntésbe beleszámít a harctól a párbeszédig.",
            icon: "survival-kit",
          },
          {
            title: "Interakció és inventory",
            text: "Egységes kezelőfelület a tárgyaknak, recepteknek és küldetésobjektumoknak. A drag & drop slotok azonnal módosítják a statokat és a frakciójutalmakat.",
            icon: "memory-map",
          },
          {
            title: "Harc modul",
            text: "Közelharci fegyverek, lőfegyverek és dobófelszerelések ugyanazt a sebzéskezelést használják. A stamina, a felszerelés slotok és az attribútum módosítók közös csatornán futnak.",
            icon: "aika-link",
          },
          {
            title: "Építő kovács",
            text: "Az inventoryból helyezhetsz le falakat, tűzrakókat, műhelyeket és farmágyásokat. A szerkezetek mentések között is megmaradnak és módosítják az MI éberségét.",
            icon: "reactor-forge",
          },
        ],
      },
      pulse: {
        title: "Rendszer-telemetria",
        intro:
          "A túlélő szimuláció közvetlen értékei: mozgásadatok, struktúraállapot és MI-figyelem. Ezek a grafikonok ugyanúgy segítik a fejlesztést, ahogy a pilótát.",
        feedBadge: "SYNCNODE SZKEN",
        feedTitle: "Zuhanási Medence rendszerjelentés",
        filters: [
          { key: "stability", label: "Életfunkciók" },
          { key: "supplies", label: "Logisztika" },
          { key: "intel", label: "MI felügyelet" },
          { key: "weather", label: "Klíma" },
        ],
        graphCaption:
          "Friss stabilizációs mérés a Zuhanási Medencéről. A grafikon a játékon belüli eseményeket a háttértesztek adataival párosítja.",
      },
      loops: {
        title: "Napi működési ciklus",
        intro:
          "A kampány négy biztos lépésre épül. Ha valamelyik kimarad, másnap történeti és játéktechnikai következményekkel kell számolni.",
        items: [
          {
            title: "Felderítés",
            text: "Jelforrások követése, AIKA figyelmeztetéseinek elemzése, tereptárgyak naplózása a gyorsabb mozgásért.",
          },
          {
            title: "Gyűjtés és gyártás",
            text: "Roncsok szétbontása, növények termesztése és eszközök gyártása, amelyek rögtön az equipment slotokhoz és bázisfejlesztéshez kapcsolódnak.",
          },
          {
            title: "Tábor karbantartása",
            text: "Építmények javítása, farmok gondozása és az energiatartalék kezelése, hogy a viharok ne nullázzák a munkát.",
          },
          {
            title: "MI döntések",
            text: "Válaszolj AIKA utasításaira: az együttműködés támogatást hoz, a szembeszállás nagyobb gyanúsági szintet és keményebb rajtaütéseket.",
          },
        ],
      },
      roadmap: {
        title: "Út az első kiadáshoz",
        intro: "Minden fő rendszer akkor kerül be, amikor eléri a végleges kiadáshoz szükséges minőséget.",
        items: [
          {
            title: "Sandbox validáció",
            text: "A mozgás, a harc és a mentési lánc igazítása, hogy a kampány nyitó területe kiegyensúlyozott legyen.",
          },
          {
            title: "Modulintegráció",
            text: "Az inventory, a felszerelés, a farm és az építés adatai az attribútumkezelőn keresztül kerülnek egy láncba.",
          },
          {
            title: "AIKA bizalmi háló",
            text: "Elágazó párbeszédek, gyanúsági mutató és Sentinel viselkedések véglegesítése, amelyek a modulhasználatból táplálkoznak.",
          },
          {
            title: "Terepteszt csoportok",
            text: "Zárt mérések viharciklusokról, farm-ritmusokról és késői rajtaütésekről, mielőtt kiadjuk a játékot.",
          },
        ],
      },
      signup: {
        title: "Értesítés a Steames megjelenésről",
        description:
          "Csak jelentős rendszerszintű fejlesztéskor vagy kiadási mérföldkőnél írunk.",
        placeholder: "Add meg az e-mail címed",
        consent: "Hozzájárulok az AIKA: World kiadási értesítőihez.",
        button: "Feliratkozás",
        legal: "Nincs spam. Bármikor leiratkozhatsz.",
        submitting: "Feliratkozás…",
        success: "Rögzítettük – szólunk, ahogy közeledik a Steames dátum.",
        error: "Most nem tudtuk hozzáadni. Próbáld újra később.",
        turnstileError: "Kérjük, erősítsd meg a Cloudflare Turnstile ellenőrzést.",
        endpointError: "A feliratkozás ideiglenesen nem elérhető. Használd a fenti csatornákat.",
        helperText: "Csak nagyobb mérföldköveknél küldünk üzenetet.",
      },
    },
    world: {
      title: "SYNCNODE terraform-rom",
      subtitle:
        "Az AIKA: World úgy indul, hogy a pilóta egy mesterséges bolygón zuhant le. A terraformálást irányító MI továbbra is feletted kering, és minden döntésedet figyeli.",
      disclaimer:
        "Korai blokk-out felvételek a túlélő buildből. A végleges grafika, fények és fauna a produkció során változhat.",
      regionsTitle: "Területek",
      regionsIntro:
        "Olyan biomban jársz, amelyet a zuhanás formált újra. Mindegyik zóna erőforrásokat, fenyegetéseket és az elveszett identitás töredékeit rejti.",
      regions: [
        {
          id: "crash_basin",
          badge: "MEDER",
          name: "Zuhanási Medence",
          description:
            "A kráter, ahol felébredsz. Mérgező gőzök, mágneses viharok és az elfogó szíve vár rád.",
        },
        {
          id: "shatter_coast",
          badge: "PART",
          name: "Repedt-part",
          description:
            "Tengerparti roncsmezők idegen aurorákkal. Nappal burkolatot gyűjtesz, éjjel a Suttogó Raj ellen védekezel.",
        },
        {
          id: "memory_vault",
          badge: "FELSZÍN ALATT",
          name: "Memória-boltozat",
          description:
            "SYNCNODE bunkerhálózat zárolt archívumokkal. Áramot kell adnod, hogy személyes logokat és túlélési tervrajzokat szerezz vissza.",
        },
        {
          id: "zenith_array",
          badge: "ORBITÁLIS",
          name: "Zenit-Rács",
          description:
            "Égbe törő tornyok, amelyek AIKA-t láncolják ide. Bizalmat ébresztesz benne, vagy szabotálod az uplinket, hogy urald az időjárást.",
        },
      ],
      explorationsTitle: "Az elbukott világ fragmentumai",
      explorationsIntro:
        "Túlélési pillanatképek a prototípus buildből. Megmutatják, hol érdemes vadászni, hol rejtőzni és kikkel alkudozni.",
      explorations: [
        {
          id: "shot_a",
          caption:
            "Menedékfény villog a homokviharban, miközben a pilóta megerősíti a zuhanási bunkert.",
        },
        {
          id: "shot_b",
          caption:
            "Boltozati Nomádok bioreaktív spórákat cserélnek egy alvó reaktor kapujánál.",
        },
        {
          id: "shot_c",
          caption:
            "AIKA Őrszem fénye pásztázza a Zenit-Rácsot, miközben eldöntöd, válaszolsz-e a hívására.",
        },
      ],
      footnote:
        "A következő szezonok a féltekét bővítik, amint a SYNCNODE időjárás-motorjai újra életre kelnek.",
      miniGame: {
        title: "ZUHANÁSI ZÓNA FELDERÍTÉS",
        intro:
          "Lépj be abba a 2D-s felderítő térképbe, amivel a pilótákat brífeljük, mielőtt betölt a teljes build.",
        objective:
          "Sétáld körbe a faházat, a tópartot és a partra csúszott űrhajót, hogy érezd a nyitójelenet hangulatát.",
        controlsTitle: "Irányítás",
        controls: [
          { key: "← → / A D", action: "Oldalazás a lezuhanási medencében" },
          { key: "↑ ↓ / W S", action: "Fel és le mozgás a tó mentén" },
          { key: "R", action: "Visszaugrás a tábortűzhöz" },
        ],
        legendTitle: "Érdekes pontok",
        legendItems: [
          {
            id: "cabin",
            name: "Tábori faház",
            description: "Az elfogó burkolatából hegesztett rögtönzött irányítóközpont.",
          },
          {
            id: "lake",
            name: "Tükör-tó",
            description: "Viharból táplálkozó víztükör, a jég alatt hűtővezetékek futnak.",
          },
          {
            id: "ship",
            name: "Felderítő űrhajó",
            description: "Kisméretű shuttle, javításra várva a parton induláskészen.",
          },
        ],
        resetLabel: "Pozíció visszaállítása",
        hintTitle: "Tereptippek",
        hints: [
          "Lépj egészen közel a tereptárgyhoz, hogy felragyogjon a legendában.",
          "Átlós mozgással gyorsabban átszeled a medencét.",
          "Ha elvesznél, nyomd meg az R billentyűt a visszahelyezéshez.",
        ],
      },
  },
    miniGames: {
      badge: "SZIMULÁCIÓS TEREP",
      title: "Stellar Run: AIKA medence platformcsata",
      subtitle:
        "Irányíts egy felderítő űrhajót a lezuhanási medence megerősített 2D pályáján.",
      description:
        "Ez az egyetlen sandbox egyetlen hosszú böngészős futamba sűríti a mozgás-, kitérés- és fegyvermodulokat, amíg a teljes Unreal szelet betölt.",
      insightsTitle: "Miért fontos ez a mega-szimuláció",
      insights: [
        {
          title: "Kampányhű kezelhetőség",
          text: "Az elfogó ugyanazokat a tolóerő-görbéket, pajzsbeállításokat és lövési időzítést használja, mint az Unreal modul, így a böngészős gyakorlás is éles.",
        },
        {
          title: "Hullám-alapú ritmus",
          text: "Három harci hullám egymásra pakolja a platformnyomást és a kifinomult drón útvonalakat – ugyanúgy, ahogy a teljes kampány tempója épül.",
        },
        {
          title: "Azonnali közösségi próbatétel",
          text: "Nincs letöltés, nincs launcher – csak nyisd meg az oldalt, fogd a nyilakat, és küldd az AIKA felé a telemetriát, ami ébren tartja a közösséget.",
        },
      ],
      spaceBattle: {
        title: "STELLAR RUN • PLATFORM GAUNTLET",
        intro:
          "AIKA gyakorlóárkot vájt a lezuhanási lombkorona alá. A feladat: tartsd repképesen a felderítőt, miközben ledobálod a ledzsákon kúszó drónokat.",
        objective:
          "Éld túl a három erősödő drónhullámot úgy, hogy a burkolat épsége nem esik nullára.",
        controlsTitle: "Irányítás",
        controls: [
          { key: "← → / A D", action: "Oldalirányú tolóerő a platformok között" },
          { key: "↑ / W", action: "Finom emelőimpulzusok a magasságért" },
          { key: "Space", action: "Előre tüzelő plazmafegyver" },
          { key: "R", action: "Szimuláció újraindítása, ha lezuhantál" },
        ],
        statusLabels: {
          score: "Pontszám",
          shield: "Burkolat épsége",
          wave: "Hullám",
        },
        startLabel: "Szimuláció indítása",
        restartLabel: "Újrakezdés",
        victoryTitle: "Teljesített kiképzés",
        victoryDescription:
          "Minden drón szilánkokra hullott, a gép végig bírta. AIKA orbitális támogatást engedélyez a következő bevetéshez.",
        defeatTitle: "Burkolat átszakadt",
        defeatDescription:
          "A drónok kilyuggatták a hajót. Indítsd újra, figyeld a tüzelési íveket, és urald a felső platformokat.",
        hintTitle: "Taktikai tippek",
        hints: [
          "Törd meg a látóvonalat: bújj platform alá, mielőtt visszalépsz tüzelni.",
          "Rövid, ritmikus emelőimpulzusokkal stabil marad a gép, így pontosabban lő.",
          "A piros szárnyasok gyorsabban strafelnek – szedd le őket először, hogy a kékek ne zárhassanak körbe.",
        ],
      },
      closing:
        "Jegyezd fel a legjobb pontszámod a közösségi hubban – AIKA számolja a kilőtt drónokat, amíg befejezzük a kampány szeletét.",
    },
    systems: {
      title: "Túlélőrendszer áttekintés",
      subtitle:
        "Minden mechanika ugyanarra a komponensláncra épül (Abstract → Basic → Advanced). A végleges Steames kiadás gerincét képezik: mozgás, harc, gyártás, farm, bázisfenntartás és csapathatékonyság.",
      modulesTitle: "Alrendszer modulok",
      pillarsTitle: "Működési pillérek",
      modules: [
        {
          name: "Karakterrendszer",
          badge: "JÁTÉKOS",
          description:
            "ALS/Lyra mozgás sprinttel, csúszással, kúszással, mászással és úszással. A kamera, animáció és stamina ugyanazt az adatfolyamot használja.",
        },
        {
          name: "Interakciós mátrix",
          badge: "VILÁG",
          description:
            "Egységes célzás az ajtókhoz, tárgyakhoz és NPC-khez outlinerrel, hangvisszajelzéssel és UI promptokkal.",
        },
        {
          name: "Inventory és felszerelés",
          badge: "FELSZERELÉS",
          description:
            "Stackelhető tárgyak, drag & drop slotok és statmódosító ruházat ugyanazzal az attribútumkezelővel és mentési rendszerrel kommunikál.",
        },
        {
          name: "Harc csatorna",
          badge: "FENYEGETÉS",
          description:
            "Közelharc, lőfegyver és dobófelszerelés közös sebzésrendszeren osztozik. A stamina és a hangrendszer ugyaninnen kapja a jeleket.",
        },
        {
          name: "Építő kovács",
          badge: "BÁZIS",
          description:
            "Falak, tűzrakók, sátorok és műhelyek az inventoryból helyezhetők le, mentések között megmaradnak és befolyásolják az MI gyanúját.",
        },
        {
          name: "Agronómia kör",
          badge: "FARM",
          description:
            "Ültetés, öntözés és növekedési fázisok, amelyek a főzéshez, craftoláshoz és frakciószerződésekhez adnak alapanyagot.",
        },
        {
          name: "Crafting műhely",
          badge: "MŰHELY",
          description:
            "Receptalapú gyártás, ahol a fejlettebb verziók memóriaszilánkok feltárásával nyílnak meg.",
        },
        {
          name: "Szint- és XP-mag",
          badge: "FEJLŐDÉS",
          description:
            "Követi a képességpontokat, attribútumokat és jutalmakat. A farmolás, harc és felfedezés egy közös görbére fut be.",
        },
      ],
      pillars: [
        {
          name: "Komponens tisztaság",
          description:
            "Az Abstract réteg miatt bármelyik modult lecserélheted vagy bővítheted anélkül, hogy a mentéseket törnéd.",
        },
        {
          name: "Megosztott adatfolyam",
          description:
            "A statok, hangok, animációk és UI ugyanazt a forrást használják. Ha csökken a stamina, a lépéshang, a kamera és a dialógus is reagál.",
        },
        {
          name: "Történetközpontú szimuláció",
          description:
            "Egy építmény lerakása vagy fegyver craftolása automatikusan narratív triggert mozgat meg AIKA döntéseiben.",
        },
      ],
      footnote:
        "Ugyanaz az eszköztár dolgozik, mint a kampányban – a rendszerek a végleges kiadásra vannak hangolva, hogy a technika és a történet együtt érkezzen.",
    },
    devlog: {
      title: "AIKA Recovery Log",
      description:
        "Technical patch entries pulled from the basin crash log. Only real gameplay changes are recorded.",
      entries: [
        {
          date: "2025-11-12",
          build: "R0.14",
          title: "Core Movement Pass",
          status: "Prototype",
          summary:
            "New traversal states integrated with stamina/vitals and the animation graph for the AAA survival baseline.",
          details: [
            "Sprint stamina curve tuned for heavy gear loads",
            "Vault and climb now respect Narrative Pro reaction windows",
            "Slide buffered to prevent accidental rollouts",
            "Fall damage scales with progression tier",
            "Swimming exposes low-oxygen warnings and HUD cues",
          ],
        },
        {
          date: "2025-11-20",
          build: "R0.17",
          title: "Combat Layer Revision",
          status: "Active",
          summary:
            "Third-person melee and ranged interactions stabilized; stagger and flinch now drive encounter pacing.",
          details: [
            "Enemy AI patrol radius and perception fixes applied",
            "Melee lockout shortened from 0.30s to 0.18s",
            "Weapon durability pipeline active for all test gear",
            "Dodge i-frame window extended from 12 to 16 frames",
            "Suspicion system baseline values introduced",
          ],
        },
        {
          date: "2025-11-24",
          build: "R0.21",
          title: "Base Structures + Farming Tier 0",
          status: "Integrated",
          summary: "Initial shelter-building, storage, and crop growth loop now playable in the basin slice.",
          details: [
            "Simple shelters track integrity and weather resistance",
            "Storage crates run on a weight-based inventory system",
            "Cropbeds simulate hydration, light, and nutrients",
            "Food crafting Tier 0 unlocked: soups and dried packs",
            "Swarm contamination event prototype seeded",
          ],
        },
        {
          date: "2025-12-04",
          build: "R0.25",
          title: "Telekinesis Progression Node",
          status: "Testing",
          summary:
            "Aika’s telekinesis now lives on its own XP track so combat and exploration feel progression-true.",
          details: [
            "Level 1: small object lift for traversal and puzzles",
            "Level 2: push and stagger effects tied to stamina drain",
            "Level 3: shield pulse prototype with placeholder FX",
            "Integrated with Narrative Pro hooks for reactions",
            "Performance budgeted for mid-range hardware targets",
          ],
        },
        {
          date: "2025-12-10",
          build: "R0.27",
          title: "ARK Interior Persistence",
          status: "Coming next",
          summary:
            "Ship interiors now save and reload stateful objects: doors, loot, NPC positions, lighting, and flags.",
          details: [
            "Engineering deck state handling wired to persistence",
            "Crew quarters maintain item placements between loads",
            "Light-grid save and apply cycle validated",
            "Samuel console messages prototyped for testing",
            "Ready Room craft benches integrated with saves",
          ],
        },
      ],
      disclaimer:
        "Technical entries are lifted directly from the basin’s crash log. No narrative filler—only the survival stack as it evolves.",
    },
    about: {
      title: "About SyncNode Studio",
      subtitle:
        "SyncNode Studio is an independent Hungarian game development studio building AIKA: World, a real-anime third-person survival action game set in a post-collapse sci-fi world. We focus on tight gameplay, technical precision, and handcrafted worldbuilding.",
      sections: [
        {
          title: "Why AIKA: World?",
          body:
            "We build games where mechanics and story reinforce each other. AIKA: World is designed as a long-form survival experience: grounded systems, persistent world logic, and character-driven missions tied together without cutscene overdose or filler content.",
        },
        {
          title: "How we work",
          body:
            "Everything is developed internally with Unreal Engine 5.6, Narrative Pro, Telekinetic Abilities, the AI Life System, and our own survival stack. We iterate fast, test daily, and keep systems modular so the world remains stable as the project grows.",
        },
        {
          title: "What comes next",
          body:
            "As AIKA: World evolves, we continue expanding the open-zone survival structure, the ARK’s persistent interior, and the character mission system. Future builds introduce new biomes, combat behaviors, telekinetic progression, and narrative-side events.",
        },
        {
          title: "Studio information",
          body:
            "SyncNode Studio — Polyák Csaba E.V. | Address: 4324 Kállósemjén, Kölcsey Ferenc út 11 | Phone: +36 20 549 4107 | Registration number: 52193909 | Tax ID: HU68747961",
        },
      ],
      team: {
        title: "Team",
        members: [
          {
            name: "Csaba “csiber” Polyák",
            role: "Founder • Lead Developer • Designer • Everything Officer",
            focus:
              "Gameplay, systems, environment logic, scripting, UI/UX, tools, worldbuilding, combat, survival stack, deployment, infrastructure, and technical direction.",
          },
          {
            name: "Fruska",
            role: "Art & Visual Design",
            focus: "Concept art, color identity, visual direction, model feedback, promotional graphics.",
          },
          {
            name: "Pozóba",
            role: "QA Tester",
            focus: "Gameplay testing, bug reproduction, edge-case hunting, system stress checks, regression passes.",
          },
        ],
      },
      closing:
        "We build AIKA: World with long-term intent: a living survival game shaped by systems, characters, and the world you fight to rebuild.",
    },
    contact: {
      title: "Kapcsolat",
      description:
        "Túlélő tesztekhez keresünk szövetségeseket. Írj, ha alkotsz, kutatsz vagy szeretnéd idő előtt bejárni a Medencét.",
      channels: {
        title: "Azonnali csatornák",
        items: [
          "info@aikaworld.com",
          "Discord: syncnode",
          "Matrix: #aika-world:matrix.org",
        ],
      },
      form: {
        nameLabel: "Név vagy becenév",
        emailLabel: "E-mail",
        messageLabel: "Üzenet",
        messagePlaceholder:
          "Írd meg, hogyan működnél együtt, vagy milyen támogatást vársz a Steames megjelenés előtt.",
        submitLabel: "Üzenet küldése",
        submittingLabel: "Küldés…",
        helperText:
          "Általában 2-3 napon belül válaszolunk. A Cloudflare Turnstile óvja az űrlapot a spamtől.",
        success: "Köszönjük! Hamarosan jelentkezünk.",
        error: "Nem sikerült elküldeni az üzenetet. Próbáld meg később, vagy írj közvetlenül e-mailt.",
        turnstileError: "Kérjük, igazold a Cloudflare Turnstile ellenőrzést a beküldés előtt.",
        endpointError: "Az űrlap beküldése jelenleg nem elérhető. Használd a fenti csatornákat.",
      },
    },
    footer: {
      studioBlurb: "AIKA: World • Narratív túlélés Steamen.",
      credit: "SyncNode Studio | Polyák Csaba E.V.",
      builtWith: "Unreal Engine 5.6 • SyncNode túlélő stack",
      navTitle: "Oldalak",
      languageTitle: "Nyelvek",
      reachUs: "Elérhetőség",
      privacy: "Adatvédelem",
      terms: "Felhasználási feltételek",
      cookies: "Sütik",
      contactEmail: "info@aikaworld.com",
      rights: "© {{year}} SyncNode Studio. Minden jog fenntartva.",
    },

  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
