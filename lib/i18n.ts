export const locales = ["en", "hu"] as const;

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export type NavKey =
  | "home"
  | "world"
  | "mini-games"
  | "systems"
  | "devlog"
  | "about"
  | "contact";

export const navOrder: NavKey[] = [
  "home",
  "world",
  "mini-games",
  "systems",
  "devlog",
  "about",
  "contact",
];

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
  status: string;
  desc: string;
  devnote: string;
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
      world: "World",
      "mini-games": "Mini games",
      systems: "Systems",
      devlog: "Recovery Log",
      about: "About",
      contact: "Contact",
    },
    home: {
      hero: {
        badgeLeft: "PRE-ALPHA • SANDBOX BUILD",
        badgeRight: "FIELD LOG ONLINE",
        title: "Test the SyncNode survival stack",
        subtitle:
          "AIKA: World runs on a modular Unreal Engine 5.6 framework built for long-form survival stories. Explore how the crash survivor moves, fights, builds, and negotiates with the AI that still governs the planet.",
        imageAlt: "The pilot studying a tactical map beside the wreck of the interceptor while AI drones orbit overhead",
        note: "Current slice covers the full gameplay loop: traversal, interaction, combat, building, farming, and narrative saves.",
        primaryCta: { label: "Open the recovery log", href: "devlog" },
        secondaryCta: { label: "Reach mission control", href: "contact" },
      },
      what: {
        title: "What is AIKA: World?",
        description:
          "A narrative survival adventure grounded in SyncNode’s modular survival stack. You wake in the wreck of SYNCNODE’s interceptor, repair your systems one module at a time, and decide whether AIKA’s oversight keeps you alive or locks the planet down.",
        pillars: [
          {
            title: "Modular survival core",
            text: "Character movement, stamina, and vitals run on the same component stack the team uses in development. Every slide, climb, and dodge is already networked with combat, inventory, and animation states.",
          },
          {
            title: "Narrative-critical systems",
            text: "Dialogue, XP, and memory shards are tied to gameplay modules. Crafting a tool or siding with a faction directly rewrites AIKA’s attitude toward you.",
          },
          {
            title: "Persistent world logic",
            text: "Save states capture structures, crops, gear, and relationship flags. Failures at night echo into dawn, including where the AI chooses to spawn patrols.",
          },
          {
            title: "Player choice under oversight",
            text: "AIKA’s orbital presence reacts to your signature. Cooperate for support fire and scans, or defy her and brace for targeted storms and Sentinel raids.",
          },
        ],
      },
      factions: {
        title: "Forces in the ruins",
        intro:
          "Four factions compete to claim the planet. Aligning with them unlocks survival perks—and enemies.",
        items: [
          {
            name: "SYNCNODE Remnants",
            tag: "Human salvage crew",
            text: "Crash survivors rebuilding orbital comms. They need your reactor expertise to leave the surface.",
          },
          {
            name: "AIKA Sentinels",
            tag: "Orbital watchers",
            text: "Autonomous drones acting on AIKA’s fragmented directives. They test your loyalty before granting tech.",
          },
          {
            name: "Vaultbound Nomads",
            tag: "Terraform exiles",
            text: "Scattered colonists living in sealed vaults. Trade rare biotics for protection against storms.",
          },
          {
            name: "Hush Swarm",
            tag: "Native constructs",
            text: "Silica-based organisms born from failed terraforming. They feed on signal noise and stalk the Basin at night.",
          },
        ],
      },
      builders: {
        title: "Field-tested survival pillars",
        intro:
          "Each subsystem below is fully playable inside the current build. They connect directly to the campaign instead of living as separate tech demos.",
        items: [
          {
            title: "Character system",
            text: "The pilot controller blends ALS/Lyra locomotion with climbing, swimming, stealth, and contextual camera work. Every move drains stamina that feeds combat and dialogue checks.",
            icon: "survival-kit",
          },
          {
            title: "Interaction & inventory",
            text: "Use a unified interface for loot, crafting ingredients, and mission items. Drag-and-drop slots define whether gear boosts stats, powers structures, or unlocks faction favors.",
            icon: "memory-map",
          },
          {
            title: "Combat suite",
            text: "Blend melee weapon forms with ballistic tools. Stamina, equipment slots, and attribute modifiers all calculate inside the same damage pipeline.",
            icon: "aika-link",
          },
          {
            title: "Builder’s forge",
            text: "Place fortifications, workshops, and farming beds straight from the inventory. Structures persist through saves and influence AI threat levels.",
            icon: "reactor-forge",
          },
        ],
      },
      pulse: {
        title: "System telemetry",
        intro:
          "Key metrics are gathered directly from the in-engine survival simulation: movement data, structure integrity, and AI suspicion. Watching them helps debug the same way it guides the story.",
        feedBadge: "SYNCNODE SCAN",
        feedTitle: "Crash Basin Systems Report",
        filters: [
          { key: "stability", label: "Vitals" },
          { key: "supplies", label: "Logistics" },
          { key: "intel", label: "AI Oversight" },
          { key: "weather", label: "Climate" },
        ],
        graphCaption:
          "Latest stabilization sweep of the Crash Basin. These snapshots correlate in-game events with backend stress tests.",
      },
      loops: {
        title: "Daily operating loop",
        intro:
          "The campaign leans on four reliable steps. Skipping one creates new story complications and mechanical pressure the next day.",
        items: [
          {
            title: "Recon",
            text: "Track surface signals, listen to AIKA’s warnings, and log landmarks that unlock traversal shortcuts.",
          },
          {
            title: "Harvest & craft",
            text: "Dismantle wreckage, farm crops, and craft tools that feed directly into equipment slots and settlement upgrades.",
          },
          {
            title: "Refuge upkeep",
            text: "Repair shelters, tend farming plots, and manage stored power so storms and raids don’t erase progress.",
          },
          {
            title: "AI decisions",
            text: "Respond to AIKA’s directives: cooperate for orbital aid or resist to keep agency, knowing the suspicion meter recalibrates encounters.",
          },
        ],
      },
      roadmap: {
        title: "Road to the first drop",
        intro: "The survival slice grows as soon as each gameplay layer reaches parity with the tech stack.",
        items: [
          {
            title: "Sandbox verification",
            text: "Stress-test traversal, combat, and saving across the core Crash Basin biomes using the same modular base as the internal build.",
          },
          {
            title: "Module integration",
            text: "Lock in inventory, equipment, farming, and building modules so they share data through the attribute manager.",
          },
          {
            title: "AIKA trust web",
            text: "Finalize dialogue-driven reputation, Sentinel behaviors, and critical story branches tied to system usage.",
          },
          {
            title: "Field test cohorts",
            text: "Run closed sessions to capture telemetry on storms, farming cycles, and late-game raids before opening the build.",
          },
        ],
      },
      signup: {
        title: "Request field reports",
        description:
          "We share updates only when a new system connects to the campaign or a playtest window opens.",
        placeholder: "Enter your email address",
        consent: "I agree to receive AIKA: World development updates.",
        button: "Sign up",
        legal: "No spam. Unsubscribe anytime.",
        submitting: "Sending…",
        success: "Transmission received — we’ll ping you when the next build lands.",
        error: "We couldn't add you just now. Please try again shortly.",
        turnstileError: "Please confirm the Cloudflare Turnstile check before subscribing.",
        endpointError: "Newsletter sign-ups are temporarily unavailable. Reach us through the channels above.",
        helperText: "Only survival stack updates when milestones hit.",
      },
    },
    world: {
      title: "SYNCNODE Terraform Ruin",
      subtitle:
        "AIKA: World opens with your interceptor shattered on an engineered planet. The AI that once guided terraforming still orbits above, judging every move.",
      disclaimer:
        "Early blockout captures from the survival build. Final art, lighting, and fauna will evolve with production.",
      regionsTitle: "Regions",
      regionsIntro:
        "Traverse biomes carved by the crash. Each one hides resources, threats, and fragments of your erased identity.",
      regions: [
        {
          id: "crash_basin",
          badge: "BASIN",
          name: "Crash Basin",
          description:
            "The crater where you wake. Toxic steam vents, magnetic storms, and the heart of your broken interceptor.",
        },
        {
          id: "shatter_coast",
          badge: "COAST",
          name: "Shatter Coast",
          description:
            "Tidal wreckyards lit by alien auroras. Scavenge hull plates by day and defend against Hush Swarm raids by night.",
        },
        {
          id: "memory_vault",
          badge: "SUBSURFACE",
          name: "Memory Vault",
          description:
            "SYNCNODE bunkers full of locked archives. Rewire power to recover personal logs and survival schematics.",
        },
        {
          id: "zenith_array",
          badge: "ORBITAL",
          name: "Zenith Array",
          description:
            "Sky-piercing towers that keep AIKA tethered. Gain her trust—or sabotage the uplink—to control the weather grid.",
        },
      ],
      explorationsTitle: "Fragments of the fallen world",
      explorationsIntro:
        "Survival snapshots lifted from the prototype build. They hint at where to hunt, hide, and negotiate.",
      explorations: [
        {
          id: "shot_a",
          caption:
            "Refuge lights pulsing through a sandstorm as the pilot reinforces the crash shelter.",
        },
        {
          id: "shot_b",
          caption:
            "Vaultbound Nomads trading bio-reactive spores beside a dormant reactor gate.",
        },
        {
          id: "shot_c",
          caption:
            "AIKA Sentinel spotlight sweeping the Zenith Array while the pilot decides whether to answer the call.",
        },
      ],
      footnote:
        "Future seasons expand deeper into the hemisphere once SYNCNODE’s weather engines come back online.",
      miniGame: {
        title: "CRASH SITE • HOLOGRAPHIC BRIEFING",
        intro:
          "Stride across the expanded reconnaissance grid that sets the mood for the opening RPG sequence.",
        objective:
          "Locate the cabin, quantum lake, shuttle dock, beacon tower, and monolith to anchor your landing zone.",
        controlsTitle: "Movement & interaction",
        controls: [
          { key: "← → / A D", action: "Strafe across the basin's deck plating" },
          { key: "↑ ↓ / W S", action: "Advance or retreat between terrain layers" },
          { key: "Space / Enter", action: "Progress dialogue when a survivor hails you" },
          { key: "R", action: "Snap back to the crash marker" },
        ],
        legendTitle: "Points of interest",
        legendItems: [
          {
            id: "cabin",
            name: "Field Cabin",
            description: "Upgraded command shelter with telescoping solar vanes and holo-terminals.",
          },
          {
            id: "lake",
            name: "Quantum Lake",
            description: "Iridescent reservoir channeling coolant vapour through the basin vents.",
          },
          {
            id: "ship",
            name: "Scout Shuttle",
            description: "Refit interceptor with modular thrusters waiting for clearance.",
          },
          {
            id: "beacon",
            name: "Signal Beacon",
            description: "AIKA uplink spire bathing the crash zone in guided telemetry.",
          },
          {
            id: "monolith",
            name: "Obsidian Monolith",
            description: "Ancient slab humming with dormant glyphs—anomalous yet stable.",
          },
        ],
        resetLabel: "Re-center to the landing site",
        hintTitle: "Intel",
        hints: [
          "Walk close to any structure to highlight it inside the dossier.",
          "NPCs emit a glow—step inside to trigger their dialogue pulses.",
          "Tap Space or Enter to cycle through the survivor briefings.",
          "Enable the soundscape to hear ambience, footsteps, and interaction chimes.",
        ],
        soundTitle: "Procedural audio",
        soundDescription:
          "Synth pads, telemetry hum, and magnetic footsteps are generated live. Toggle them whenever you want extra immersion.",
        soundToggle: {
          on: "Soundscape active",
          off: "Enable soundscape",
        },
        npcsTitle: "Survivor roster",
        npcsIntro: "Glowing silhouettes mark the crew—step inside to open comms.",
        npcInteractionHint: "Press Space or Enter to continue transmissions.",
        npcs: [
          {
            id: "mentor",
            name: "Captain Nara Ives",
            role: "Mission mentor",
            biography:
              "Veteran pilot who keeps the crash site briefing grounded in real tactics and calm breathing.",
            dialogues: [
              "You made it in one piece—good. This holo-map mirrors the real basin's choke points.",
              "Mark the monolith and beacon; they anchor navigation when the storm rolls in.",
              "Once you're synchronised, meet me by the shuttle and we'll start the live deployment.",
            ],
          },
          {
            id: "mechanic",
            name: "Synth Tech Aki",
            role: "Dropship mechanic",
            biography:
              "Hybrid engineer coaxing plasma engines and shielded hull plates back from a hard landing.",
            dialogues: [
              "Hear that shimmer? The lake coolant is flowing again—means the shuttle can drink.",
              "I rerouted power to the beacon. Step into its glow if you need a signal boost.",
              "Bring me any scrap near the cabin. I'll turn it into gear before AIKA wakes.",
            ],
          },
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
        "Every mechanic in the slice runs on the same component chain shipping with the project: Abstract → Basic → Advanced. What you test is the backbone for the finished story mode.",
      modulesTitle: "Subsystem modules",
      pillarsTitle: "Operational pillars",
      modules: [
        {
          name: "Character system",
          badge: "PLAYER",
          description:
            "ALS/Lyra-based movement with sprint, slide, crouch, climb, swim, and contextual animations feeding stamina, noise, and stealth checks.",
        },
        {
          name: "Interaction matrix",
          badge: "WORLD",
          description:
            "Handles door panels, loot caches, and NPC dialogue cues through a unified targeting outliner and voice notify feedback.",
        },
        {
          name: "Inventory & equipment",
          badge: "GEAR",
          description:
            "Stackable items, drag-and-drop slots, and stat-altering gear share data with the attribute manager and save system.",
        },
        {
          name: "Combat pipeline",
          badge: "THREAT",
          description:
            "Melee combos, firearms, and thrown tools use one damage resolver with stamina costs, hit reactions, and voice responses.",
        },
        {
          name: "Builder forge",
          badge: "SETTLEMENT",
          description:
            "Place shelters, defenses, and crafting stations directly from inventory blueprints—structures persist between saves and influence AI suspicion.",
        },
        {
          name: "Agronomy loop",
          badge: "FARMING",
          description:
            "Plant, water, and harvest crops with time-based growth stages that feed cooking, crafting, and faction contracts.",
        },
        {
          name: "Crafting fabricator",
          badge: "WORKSHOP",
          description:
            "Combine recovered materials using recipe tiers. Advanced versions unlock when memory shards reveal SYNCNODE schematics.",
        },
        {
          name: "Level & XP core",
          badge: "PROGRESSION",
          description:
            "Tracks skill ranks, distributes attribute points, and rewards system usage—farming, combat, exploration all feed the same curve.",
        },
      ],
      pillars: [
        {
          name: "Component clarity",
          description:
            "Abstract interfaces make it easy to swap or extend modules. Every gameplay beat you try can be rebuilt without breaking saves.",
        },
        {
          name: "Shared data flow",
          description:
            "Stats, audio, animation, and UI read from the same sources. If stamina drops, footsteps, camera sway, and dialogue all react together.",
        },
        {
          name: "Story-first simulation",
          description:
            "Systems never run in isolation. Building a shelter or crafting a weapon also pushes AIKA’s narrative triggers forward.",
        },
      ],
      footnote:
        "The toolbox powering AIKA’s field missions is identical here—testing the slice advances both engineering and story planning.",
    },
    devlog: {
      title: "AIKA Recovery Log",
      description:
        "Every development update mirrors a black box entry from the crash. Technical milestones double as the pilot’s fight to survive.",
      entries: [
        {
          date: "2025-01-12",
          title: "Entry 00 — Crash Sequence",
          status: "Prototype",
          desc: "Emergency reboot at the crash site. Suit vitals at 32%. Reactor core sealed just before overload.",
          devnote: "Established Unreal Engine 5.6 project, third-person controls, and crash basin greybox.",
        },
        {
          date: "2025-02-02",
          title: "Entry 01 — Suit Diagnostics",
          status: "Stabilizing",
          desc: "Vitals Mesh online. Hydration and radiation monitors calibrated against Basin storms.",
          devnote: "Implemented survival HUD, temperature loops, and baseline crafting recipes.",
        },
        {
          date: "2025-03-18",
          title: "Entry 02 — Memory Sync",
          status: "Draft",
          desc: "First memory shard recovered. AIKA whispers coordinates to a buried vault, unsure why she trusts you.",
          devnote: "Built memory shard quests, branching dialogue stubs, and narrative save states.",
        },
        {
          date: "2025-05-07",
          title: "Entry 03 — Storm Calibration",
          status: "Active",
          desc: "Weather Forge cycling properly. Night storms spawn Hush Swarm hunting parties.",
          devnote: "Integrated dynamic weather volumes, swarm AI behaviors, and shelter degradation.",
        },
        {
          date: "2025-06-22",
          title: "Entry 04 — AI Negotiation",
          status: "Integrated",
          desc: "AIKA grants a provisional uplink. Trust meter fluctuates with every dialogue choice.",
          devnote: "Completed AIKA conversation system, suspicion tracking, and cinematic uplink sequences.",
        },
      ],
      disclaimer:
        "Each patch is a pulse. Every fix keeps the pilot breathing—and wakes AIKA a little more.",
    },
    about: {
      title: "About SyncNode",
      subtitle:
        "SyncNode Interactive is an independent studio building AIKA: World — a third-person survival story about memory, trust, and the last conversation between a pilot and an AI.",
      sections: [
        {
          title: "Why AIKA: World",
          body:
            "We craft single-player adventures that respect your time. This project explores how survival mechanics and narrative consequence can feel inseparable.",
        },
        {
          title: "How we work",
          body:
            "Everything is developed in-house with Unreal Engine 5.6. We prototype quickly, test in-engine daily, and share builds early for honest feedback.",
        },
        {
          title: "What comes next",
          body:
            "After the vertical slice, we’ll release documentation and blueprints so other teams can experiment with story-driven survival design.",
        },
      ],
      team: {
        title: "Team",
        members: [
          {
            name: "Nova Ardent",
            role: "Creative Director",
            focus: "Guides narrative tone, cinematic direction, and world vision.",
          },
          {
            name: "Mira Juno",
            role: "Systems Designer",
            focus: "Connects survival loops with narrative triggers and mission flow.",
          },
          {
            name: "Tal Verge",
            role: "Technical Engineer",
            focus: "Maintains build pipelines, performance budgets, and deployment.",
          },
        ],
      },
      closing:
        "SyncNode built AIKA to restore worlds. Now we fight alongside her to survive the one that fell apart.",
    },
    contact: {
      title: "Contact",
      description:
        "We’re assembling allies for future survival tests. Reach out if you create, research, or want to explore the crash site early.",
      channels: {
        title: "Immediate channels",
        items: [
          "hello@aika.world",
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
      studioBlurb: "AIKA: World • Story-driven survival engineered with intent.",
      credit: "Created by SyncNode Interactive.",
      builtWith: "Built with Unreal Engine 5.6 • Survival framework: SyncNode stack",
      navTitle: "Pages",
      languageTitle: "Languages",
      reachUs: "Reach us",
      privacy: "Privacy",
      terms: "Terms",
      cookies: "Cookies",
      contactEmail: "hello@syncnodeinteractive.com",
      rights: "© {{year}} SyncNode Interactive. All rights reserved.",
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
      world: "Világ",
      "mini-games": "Mini játékok",
      systems: "Rendszerek",
      devlog: "Helyreállítási napló",
      about: "Rólunk",
      contact: "Kapcsolat",
    },
    home: {
      hero: {
        badgeLeft: "PRE-ALFA • SANDBOX ALAP",
        badgeRight: "TEREP NAPLÓ AKTÍV",
        title: "Próbáld ki a SyncNode túlélőkeretét",
        subtitle:
          "Az AIKA: World egy moduláris Unreal Engine 5.6 keretrendszeren fut. A jelenlegi buildben végigjátszható a mozgás, harc, építés, farmolás és történeti mentés teljes lánca – ugyanazzal a technikával, ami a végleges kampányt hajtja.",
        imageAlt: "A pilóta a lezuhant elfogó mellett térképet elemez, miközben AI drónok köröznek felette",
        note: "A szelet PC-n és böngészős streamen is fut, és már most a moduláris túlélőrendszer összes fő láncát használja.",
        primaryCta: { label: "Nyisd meg a helyreállítási naplót", href: "devlog" },
        secondaryCta: { label: "Vedd fel velünk a kapcsolatot", href: "contact" },
      },
      what: {
        title: "Mi az AIKA: World?",
        description:
          "Egy narratív túlélő történet, ahol egy SYNCNODE pilóta a saját moduláris rendszerein keresztül rakja össze a múltját. Minden modul – a karakterkontrolltól az attribútkezelőig – ugyanazt a komponensláncot használja, amelyre a későbbi epizódok épülnek.",
        pillars: [
          {
            title: "Moduláris túlélő mag",
            text: "A karakterrendszer, a mozgás és a statkezelés ugyanazt az Abstract → Basic → Advanced láncot használja, mint a fejlesztői buildben.",
          },
          {
            title: "Történetbe kötött rendszerek",
            text: "A dialógusok, XP és frakciójutalmak ugyanazon komponensből olvasnak, mint az inventory, a harc és a mentés – minden döntés azonnal átszivárog a narratívába.",
          },
          {
            title: "Állandó világállapot",
            text: "A mentések megőrzik az építményeket, növényeket, felszerelést és kapcsolati állapotokat. Egy kihagyott este új AI járőröket és frakcióreakciókat hoz reggelre.",
          },
          {
            title: "MI felügyelet alatt",
            text: "AIKA figyeli a hő- és zajlenyomatot. A segítség kérése légicsapást vagy felderítést hozhat, a dacolás viszont célzott viharokat és Sentinel rajtaütést vált ki.",
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
        intro: "A szelet minden lépésnél akkor bővül, amikor a játékréteg utoléri a fejlesztői build szintjét.",
        items: [
          {
            title: "Sandbox validáció",
            text: "Mozgás, harc és mentési lánc stressztesztelése a Zuhanási Medence kulcsbiomjaiban, ugyanarra a moduláris alapra támaszkodva, mint a belső build.",
          },
          {
            title: "Modulintegráció",
            text: "Az inventory, equipment, farm és építés modulok összekapcsolása az attribútumkezelővel és a mentési rendszerrel.",
          },
          {
            title: "AIKA bizalmi háló",
            text: "Elágazó párbeszédek, gyanúsági mutató és Sentinel viselkedések véglegesítése, amelyek a modulhasználatból táplálkoznak.",
          },
          {
            title: "Terepteszt csoportok",
            text: "Zárt tesztek viharokra, farm ciklusokra és késői rajtaütésekre fókuszálva, mielőtt szélesebbre nyitjuk a buildet.",
          },
        ],
      },
      signup: {
        title: "Kérj terepi jelentést",
        description:
          "Csak akkor küldünk levelet, amikor új rendszer kapcsolódik a kampányhoz, vagy playteszt ablak nyílik.",
        placeholder: "Add meg az e-mail címed",
        consent: "Hozzájárulok az AIKA: World fejlesztési frissítéseihez.",
        button: "Feliratkozás",
        legal: "Bármikor leiratkozhatsz.",
        submitting: "Feliratkozás…",
        success: "Az adást megkaptuk – szólunk, ha érkezik az új build.",
        error: "Most nem tudtuk hozzáadni. Próbáld újra később.",
        turnstileError: "Kérjük, erősítsd meg a Cloudflare Turnstile ellenőrzést a feliratkozás előtt.",
        endpointError: "A feliratkozás ideiglenesen nem elérhető. Írj a fenti csatornák egyikén.",
        helperText: "Csak a túlélőkeretet érintő mérföldkövekről küldünk üzenetet.",
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
        title: "ZUHANÁSI ZÓNA • HOLOGRAFIKUS BEJÁRÁS",
        intro:
          "Lépj rá a kibővített felderítő rácsra, ami felvezeti az RPG nyitány atmoszféráját.",
        objective:
          "Kövesd végig a kabint, a kvantumtavat, a dokkolt hajót, a jelzőtornyot és a monolitot, hogy rögzítsd a leszállóövet.",
        controlsTitle: "Mozgás és interakció",
        controls: [
          { key: "← → / A D", action: "Oldalazás a medence páncélburkolatán" },
          { key: "↑ ↓ / W S", action: "Közelítés vagy távolodás a terepszintek között" },
          { key: "Szóköz / Enter", action: "Párbeszéd folytatása, ha túlélő szólít" },
          { key: "R", action: "Visszaugrás a becsapódási jelzőhöz" },
        ],
        legendTitle: "Érdekes pontok",
        legendItems: [
          {
            id: "cabin",
            name: "Feldolgozó kabin",
            description: "Felpimpelt parancsnoki menedék teleszkópos napelemekkel és holo-konzolokkal.",
          },
          {
            id: "lake",
            name: "Kvantumtó",
            description: "Színjátszó víztükör, amely hűtőgőzt keringtet a medence szellőzőin át.",
          },
          {
            id: "ship",
            name: "Felderítő sikló",
            description: "Újrahuzalozott elfogóhajó moduláris hajtóművekkel, indulási engedélyre várva.",
          },
          {
            id: "beacon",
            name: "Jelzőtorony",
            description: "AIKA uplink spire, amely irányított telemetriával fürdeti a zuhanási zónát.",
          },
          {
            id: "monolith",
            name: "Obszidián monolit",
            description: "Ősi tömb lüktető glifákkal – anomália, de stabil.",
          },
        ],
        resetLabel: "Pozíció visszaállítása a leszállópontra",
        hintTitle: "Hírszerzés",
        hints: [
          "Menj közel bármelyik struktúrához, hogy kiemelődjön a dossziéban.",
          "Az aurával ragyogó alak túlélőt jelez – lépj be, és indul a párbeszéd.",
          "Szóköz vagy Enter megnyomásával léptetheted a túlélők üzeneteit.",
          "Kapcsold be a hangképet, ha hallani akarod az ambience-t, lépéseket és csilingelést.",
        ],
        soundTitle: "Procedurális hangkép",
        soundDescription:
          "Élőben generált szintipárna, telemetriazúgás és mágneses léptek – kapcsold, amikor teljes elmerülésre vágysz.",
        soundToggle: {
          on: "Hangkép aktív",
          off: "Hangkép bekapcsolása",
        },
        npcsTitle: "Túlélőlista",
        npcsIntro: "A fénygömbök jelzik a legénységet – lépj be a sávjukba a kommunikációhoz.",
        npcInteractionHint: "Szóköz / Enter – következő adás.",
        npcs: [
          {
            id: "mentor",
            name: "Nara Ives kapitány",
            role: "Küldetésmentor",
            biography:
              "Veterán pilóta, aki egyszerre hangolja a felszerelést és a légzést, hogy ne ess pánikba.",
            dialogues: [
              "Egyben érkeztél – jó jel. Ez a holo-térkép a valódi meder szűk átjáróit mutatja.",
              "Jegyezd meg a monolitot és a jelzőtornyot; viharban ezek adják a tájolást.",
              "Ha szinkronban vagy, találkozunk a siklónál, és indul a valós telepítés.",
            ],
          },
          {
            id: "mechanic",
            name: "Aki szintetikus technikus",
            role: "Sikló-mechanikus",
            biography:
              "Hibrid mérnök, aki plazmahajtóműveket és páncéllemezeket éleszt újra egy roncshalomból.",
            dialogues: [
              "Hallod a csilingelést? A tó hűtőköre újra kering – a hajó végre tankolhat.",
              "Átvezettem az áramot a jelzőtoronyba. Ha erősebb jelet akarsz, állj a fényébe.",
              "Hozz minden törmeléket a kabin mellől; felszerelést kovácsolok belőle, mielőtt AIKA felébred.",
            ],
          },
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
        "Minden mechanika ugyanarra a komponensláncra épül (Abstract → Basic → Advanced). Amit most kipróbálsz, az a kész kampány gerince.",
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
        "Ugyanaz az eszköztár dolgozik, mint AIKA terepküldetésein – a szelet tesztelése egyszerre lendíti előre a technikát és a történetet.",
    },
    devlog: {
      title: "AIKA helyreállítási napló",
      description:
        "Minden fejlesztési bejegyzés egy fekete doboz log a zuhanásból. A technikai mérföldkövek a pilóta túléléséért vívott harcot tükrözik.",
      entries: [
        {
          date: "2025-01-12",
          title: "Bejegyzés 00 — Zuhanási szekvencia",
          status: "Prototípus",
          desc: "Vészindítás a becsapódási helyen. Öltözék-állapot 32%. A reaktor magját az utolsó pillanatban zártuk le.",
          devnote: "Unreal Engine 5.6 projekt felhúzva, harmadik személyű irányítás és medence greybox kész.",
        },
        {
          date: "2025-02-02",
          title: "Bejegyzés 01 — Öltözékdiagnosztika",
          status: "Stabilizálás",
          desc: "Az Életfunkció-háló online. Hidratáció- és sugárzásmonitor kalibrálva a medence viharaihoz.",
          devnote: "Túlélő HUD, hurok hőmérséklet és alap barkácsrecept integrálva.",
        },
        {
          date: "2025-03-18",
          title: "Bejegyzés 02 — Memóriaszinkron",
          status: "Vázlat",
          desc: "Első memóriaszilánk visszanyerve. AIKA koordinátákat súg egy eltemetett boltozathoz, bár maga sem tudja, miért bízik benned.",
          devnote: "Memóriaszilánk küldetések, elágazó párbeszéd stubok és narratív mentés kész.",
        },
        {
          date: "2025-05-07",
          title: "Bejegyzés 03 — Vihar-kalibráció",
          status: "Aktív",
          desc: "Az Időjárás-kohó stabilan ciklusoz. Éjszakai viharok Suttogó Raj portyákat szülnek.",
          devnote: "Dinamikus időjárás volumenek, raj AI viselkedés és menedék-degradáció élesben.",
        },
        {
          date: "2025-06-22",
          title: "Bejegyzés 04 — MI-tárgyalás",
          status: "Integrált",
          desc: "AIKA ideiglenes uplinket enged. A bizalmi szint minden párbeszéddel ingadozik.",
          devnote: "AIKA párbeszédrendszer, gyanúsági követés és filmes uplink jelenetek kész.",
        },
      ],
      disclaimer:
        "Minden patch egy pulzus. Minden javítás, ami életben tart, AIKA-t is közelebb húzza a tudathoz.",
    },
    about: {
      title: "A SyncNode-ról",
      subtitle:
        "A SyncNode Interactive egy független stúdió, amely az AIKA: Worldöt építi — egy harmadik személyű túlélő történetet az emlékezetről, a bizalomról és egy pilóta utolsó párbeszédéről egy MI-vel.",
      sections: [
        {
          title: "Miért az AIKA: World",
          body:
            "Egyjátékos kalandokat készítünk, amelyek tiszteletben tartják az idődet. A projekt azt kutatja, hogyan fonódhat össze a túlélés és a narratíva.",
        },
        {
          title: "Hogyan dolgozunk",
          body:
            "Mindent házon belül fejlesztünk Unreal Engine 5.6-tal. Gyorsan prototipizálunk, naponta tesztelünk, és korán osztunk meg buildeket őszinte visszajelzésért.",
        },
        {
          title: "Mi jön ezután",
          body:
            "A vertikális szelet után megnyitjuk a dokumentációkat és blueprint-eket, hogy más csapatok is kísérletezhessenek történetvezérelt túléléssel.",
        },
      ],
      team: {
        title: "Csapat",
        members: [
          {
            name: "Nova Ardent",
            role: "Kreatív igazgató",
            focus: "A narratív tónus, a filmes nyelv és a világ víziójának őre.",
          },
          {
            name: "Mira Juno",
            role: "Rendszertervező",
            focus: "A túlélési hurkokat köti össze a narratív triggerekrel és küldésfolyamokkal.",
          },
          {
            name: "Tal Verge",
            role: "Technikai mérnök",
            focus: "A build pipeline-t, a teljesítménykeretet és a deployt felügyeli.",
          },
        ],
      },
      closing:
        "A SyncNode AIKA-t világok megmentésére hozta létre. Most vele együtt küzdünk, hogy túléljük azt, ami széthullott.",
    },
    contact: {
      title: "Kapcsolat",
      description:
        "Túlélő tesztekhez keresünk szövetségeseket. Írj, ha alkotsz, kutatsz vagy szeretnéd idő előtt bejárni a Medencét.",
      channels: {
        title: "Azonnali csatornák",
        items: [
          "hello@aika.world",
          "Discord: syncnode",
          "Matrix: #aika-world:matrix.org",
        ],
      },
      form: {
        nameLabel: "Név vagy becenév",
        emailLabel: "E-mail",
        messageLabel: "Üzenet",
        messagePlaceholder:
          "Írd meg, hogyan működnél együtt, vagy mit látnál szívesen a túlélő buildben.",
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
      studioBlurb: "AIKA: World • Szándékkal tervezett történeti túlélés.",
      credit: "SyncNode Interactive készítette.",
      builtWith: "Unreal Engine 5.6 • Túlélő keretrendszer: SyncNode stack",
      navTitle: "Oldalak",
      languageTitle: "Nyelvek",
      reachUs: "Elérhetőség",
      privacy: "Adatvédelem",
      terms: "Felhasználási feltételek",
      cookies: "Sütik",
      contactEmail: "hello@syncnodeinteractive.com",
      rights: "© {{year}} SyncNode Interactive. Minden jog fenntartva.",
    },

  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
