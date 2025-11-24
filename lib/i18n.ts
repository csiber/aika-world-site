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
        "AIKA: World is a post-collapse sci-fi survival story about leading a crew, holding an ARK together, and carving a path through hostile ruins.",
    },
    consent: {
      message: "No tracking cookies here — only privacy-first Cloudflare Web Analytics.",
      acknowledge: "Got it",
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
        badgeLeft: "STEAM • ON APPROACH",
        badgeRight: "ARK STATUS UPDATE",
        title: "AIKA: World is preparing for launch",
        subtitle:
          "Lead a crew through a broken world. Keep the ARK running, sweep the ruins for fragments, and decide who gets shelter when the storms roll in.",
        imageAlt:
          "Image: The pilot and crew plotting a route beside the ARK while drones buzz over shattered terrain.",
        note: "The campaign arrives on Steam as one complete survival run — no vertical slice, no throwaway tests.",
        primaryCta: { label: "Open the recovery log", href: "devlog" },
        secondaryCta: { label: "Reach the crew", href: "contact" },
      },
      what: {
        title: "What is AIKA: World?",
        description:
          "A post-apocalyptic sci-fi survival story. You wake by the Crash Basin with a damaged ARK and a handful of crew. Each day you decide whether to push deeper for fragments, shore up the ship, or gamble on a faction for backup.",
        pillars: [
          {
            title: "Survival first",
            text: "Every step costs stamina, every wound lingers. Sliding, climbing, swimming, stealth, and dodging all feed the same survival rhythm.",
          },
          {
            title: "Story in your hands",
            text: "Dialogue, fragments, and crew morale react to your choices. Pick a faction, backstab them, or walk alone — the world keeps score.",
          },
          {
            title: "Nothing resets overnight",
            text: "Shelters, crops, wounds, and friendships carry forward. Storm damage and raids change patrols by morning.",
          },
          {
            title: "A world that pushes back",
            text: "Signals, weather shifts, and scavengers respond to you. Cooperate for intel or fight through the consequences.",
          },
        ],
      },
      factions: {
        title: "Forces in the ruins",
        intro:
          "Four forces circle the Basin. Choose an ally, or make them all your problem.",
        items: [
          {
            name: "SYNCNODE Remnants",
            tag: "Human salvage crew",
            text: "Crash survivors who treat the ARK like their last spark. They trade hard favors for power, metal, and safe passage.",
          },
          {
            name: "AIKA Sentinels",
            tag: "Orbital watchers",
            text: "Drones running on broken orders. Sometimes they scan you for data, sometimes they call in storms. Learn their patterns or wreck their nodes.",
          },
          {
            name: "Vaultbound Nomads",
            tag: "Terraform exiles",
            text: "Colonists sealed in failing vaults. They barter seeds, meds, and secrets if you keep their vents clear.",
          },
          {
            name: "Hush Swarm",
            tag: "Native constructs",
            text: "Signal-hungry fragments born from bad terraforming. They chew metal, raid shelters, and move like a living dust storm after dark.",
          },
        ],
      },
      builders: {
        title: "Core pillars at launch",
        intro:
          "The campaign leans on four pillars. They stay linked so every call you make hits the crew and the ship.",
        items: [
          {
            title: "Character system",
            text: "Stamina, vitals, and movement live together. Climb, swim, sneak, and slide — each move drains something the crew will feel.",
            icon: "survival-kit",
          },
          {
            title: "Interaction & inventory",
            text: "Drag gear into slots to power structures, buff your crew, or earn favors. Loot stays meaningful because every slot has a cost.",
            icon: "memory-map",
          },
          {
            title: "Combat module",
            text: "Close strikes and ranged tools share the same wound logic. Stamina and gear condition decide if you stagger foes or get knocked down.",
            icon: "aika-link",
          },
          {
            title: "Builder’s forge",
            text: "Drop walls, workshops, and crops straight from your pack. The ARK and every shelter persist, and enemies remember where you dig in.",
            icon: "reactor-forge",
          },
        ],
      },
      pulse: {
        title: "System telemetry",
        intro:
          "Quick reads from the Basin: vitals, supplies, intel, and weather. The same signals guide both the crew and the dev team.",
        feedBadge: "SYNCNODE SCAN",
        feedTitle: "Crash Basin status",
        filters: [
          { key: "stability", label: "Vitals" },
          { key: "supplies", label: "Logistics" },
          { key: "intel", label: "AI Oversight" },
          { key: "weather", label: "Climate" },
        ],
        graphCaption:
          "Latest sweep of the Basin — showing how the world reacts to recent runs.",
      },
      loops: {
        title: "Daily rhythm",
        intro:
          "Four steps keep the crew alive. Skip one and the world makes you pay for it tomorrow.",
        items: [
          {
            title: "Recon",
            text: "Sweep signals, mark routes, and log landmarks so the crew moves faster next run.",
          },
          {
            title: "Harvest & craft",
            text: "Strip wrecks, tend crops, and build tools that slot straight into your gear and the ARK’s needs.",
          },
          {
            title: "Refuge upkeep",
            text: "Patch shelters, feed generators, and guard crops so storms and raids don’t erase your work.",
          },
          {
            title: "AI decisions",
            text: "Answer or ignore incoming signals. Help and you get scans; refuse and the Basin grows meaner.",
          },
        ],
      },
      roadmap: {
        title: "Road to launch",
        intro: "Every system lands when it’s ready for the full campaign — no filler, no half steps.",
        items: [
          {
            title: "Basin balance",
            text: "Tuning movement, combat, and saves so the opening zone hits hard without breaking.",
          },
          {
            title: "Crew and ARK sync",
            text: "Making sure inventory, gear, farming, and building all feed the same survival state.",
          },
          {
            title: "Trust and fallout",
            text: "Locking in how dialogue, Sentinels, and story branches react to your choices.",
          },
          {
            title: "Storm trials",
            text: "Closed runs that test storm cycles, raid pacing, and late-game pressure before release.",
          },
        ],
      },
      signup: {
        title: "Stay in the loop",
        description:
          "We write when the ARK hits a milestone or when the Steam date is locked.",
        placeholder: "Enter your email address",
        consent: "I agree to receive AIKA: World launch updates.",
        button: "Sign up",
        legal: "No spam. You can unsubscribe anytime.",
        submitting: "Sending…",
        success: "Got it — we’ll ping you when the next big update lands.",
        error: "We couldn't add you just now. Please try again in a bit.",
        turnstileError: "Please confirm the Cloudflare Turnstile check.",
        endpointError: "Sign-ups are temporarily unavailable. Use the channels above instead.",
        helperText: "We write only when it matters.",
      },
    },
    world: {
      title: "The Crash Basin",
      subtitle:
        "You start where the Old Boy fell. Storms, ruins, and old human tech watch from the ridges. No guardian AI — only fractured systems and hostile fragments reacting to your moves.",
      disclaimer:
        "Explore the Basin. Secure supplies. Survive the night storms. Reboot what still works.",
      regionsTitle: "Regions of the Basin",
      regionsIntro:
        "These connected zones form the opening stretch of AIKA: World. Each one offers resources, threats, strange weather, and shards of the past.",
      regions: [
        {
          id: "crash_basin",
          badge: "BASIN",
          name: "Crash Basin",
          description:
            "Your first safe-enough zone. Warm vents, metallic storms, and debris from the Old Boy’s crash shockwave.",
        },
        {
          id: "memory_vault",
          badge: "SUBSURFACE",
          name: "Memory Vault",
          description:
            "Buried data halls left by colonists. Hunt logs, schematics, and hints about the Basin’s deeper routes.",
        },
        {
          id: "shatter_coast",
          badge: "COAST",
          name: "Shatter Coast",
          description:
            "A windswept shoreline littered with wrecks. Swarm fragments hunt here after dark.",
        },
        {
          id: "zenith_array",
          badge: "ORBITAL",
          name: "Zenith Array",
          description:
            "A shattered uplink tower across the ridges. Old weather nodes flicker when you get close — helpful and dangerous.",
        },
      ],
      explorationsTitle: "Fragments of the fallen world",
      explorationsIntro:
        "Shots from the current build. Clues on where to scavenge, hide, and bargain with whoever is left.",
      explorations: [
        {
          id: "shot_a",
          caption:
            "Shatter Coast during a focused storm. Vents open, light crackles over the water — great salvage, bad place to linger.",
        },
        {
          id: "shot_b",
          caption:
            "Nomad scouts testing glowing flora beside a dormant reactor shaft.",
        },
        {
          id: "shot_c",
          caption:
            "A Sentinel patrol combing the Zenith Array while you choose between slipping past or taking them apart.",
        },
      ],
      footnote:
        "Future seasons push deeper once the ARK is stable — caves, dead factories, long treks, and the road toward the buried Ring.",
      miniGame: {
        title: "CRASH SITE ORIENTATION",
        intro:
          "A playable peek at the first zone. These spots form your opening loop of travel, scavenging, shelter work, and early fights.",
        objective:
          "Scout the basin, mark the lake and cabin, strip the shuttle for materials, and push through the ridge pass to higher ground.",
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
              "A small cabin left by survey teams. Works for early storage and simple repairs.",
          },
          {
            id: "lake",
            name: "Mirror Lake",
            description:
              "A cold, glassy lake fed by old coolant channels beneath the ground.",
          },
          {
            id: "ship",
            name: "Scout Shuttle",
            description:
              "The wrecked shuttle you came in. Beyond repair, but packed with electronics, plates, and early crafting parts.",
          },
          {
            id: "ridge",
            name: "Ridge Pass",
            description:
              "A narrow path to higher ground. Bad news at night when Swarm traces slip through.",
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
      title: "Stellar Run: Basin combat trial",
      subtitle:
        "Fly a scout craft through a fortified 2D gauntlet carved into the crash site.",
      description:
        "A quick browser run that mixes platforming, dodging, and weapon timing while the full slice loads in the background.",
      insightsTitle: "Why this run matters",
      insights: [
        {
          title: "Handles like the real craft",
          text: "The interceptor flies like the in-game version, so this training actually sticks.",
        },
        {
          title: "Three waves, rising heat",
          text: "Each wave stacks pressure and smarter drone routes, matching how raids ramp up in the Basin.",
        },
        {
          title: "Easy to jump into",
          text: "No downloads. Load the page, grab the arrow keys, and send us telemetry that keeps the Basin sharp.",
        },
      ],
      spaceBattle: {
        title: "STELLAR RUN • PLATFORM GAUNTLET",
        intro:
          "A training trench beneath the crash canopy. Keep the interceptor in the air while knocking drones off the ledges.",
        objective:
          "Survive three drone waves without letting the hull drop to zero.",
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
        "Every system exists to keep the ARK and the crew alive on long hauls. Movement, combat, building, farming, and morale feed the same survival loop across the Basin.",
      modulesTitle: "Key systems",
      pillarsTitle: "Why they work together",
      modules: [
        {
          name: "Character & movement system",
          badge: "PLAYER",
          description:
            "Sprint, climb, vault, swim, sneak, crouch, slide. Stamina and vitals link every move to how you fight, talk, and keep the crew steady.",
        },
        {
          name: "Inventory & equipment",
          badge: "GEAR",
          description:
            "Pack what you can carry. Weight, quick slots, and durability matter for weapons, tools, medkits, energy cells, crafting parts, and food.",
        },
        {
          name: "Builder & structures",
          badge: "SETTLEMENT",
          description:
            "Drop shelters, storage, crops, generators, collectors, traps, and defenses. Each build needs upkeep against storms and raids.",
        },
        {
          name: "Fabrication & crafting",
          badge: "WORKSHOP",
          description:
            "Tear down scrap, refine it, and craft tools, weapon parts, ammo, and field gear. Better recipes unlock from fragments, logs, and recovered tech.",
        },
        {
          name: "Interaction & NPC logic",
          badge: "WORLD",
          description:
            "One interaction layer for loot, switches, terminals, logs, doors, fires, and benches. Conversations stay sharp and reactive to your choices and reputation.",
        },
        {
          name: "Combat system",
          badge: "THREAT",
          description:
            "Melee and ranged fights with dodge, parry, stagger, flinch, weak points, and weapon condition. Enemies listen, patrol, and escalate when you push them.",
        },
        {
          name: "Agronomy",
          badge: "FARMING",
          description:
            "Grow crops in layered beds. Plants react to water, light, nutrients, storms, pests, and Swarm traces. Harvests feed your food, crafting, healing, and trade loops.",
        },
        {
          name: "Level & XP core",
          badge: "PROGRESSION",
          description:
            "XP fuels attributes and perks. Combat, exploration, crafting, farming, and story calls all contribute. Telekinesis grows on its own path in both story and play.",
        },
      ],
      pillars: [
        {
          name: "Clear roles",
          description:
            "Movement, combat, crafting, farming, AI, and persistence stay clear and testable. Tweaks don’t break the rest of the ship.",
        },
        {
          name: "One state for all",
          description:
            "Weather, AI, crops, vitals, and structures read from the same state. When a storm hits, everyone feels it at once.",
        },
        {
          name: "Story follows action",
          description:
            "No cutscene dump. Storms, encounters, scarcity, telekinesis, NPC moods, and base health all push the narrative forward.",
        },
      ],
      footnote:
        "Minden modul akkor kerül be, amikor eléri a kampány szintjét — így a játékmenet és a narratíva együtt érkezik a végleges kiadásban.",
    },
    devlog: {
      title: "AIKA Recovery Log",
      description:
        "Updates ripped from the Basin’s black box. No fluff — just what changed for the crew’s survival run.",
      entries: [
        {
          date: "2025-11-12",
          build: "R0.14",
          title: "Core Movement Pass",
          status: "Prototype",
          summary:
            "Traversal now locks into stamina and animations so hauling gear feels earned.",
          details: [
            "Sprint stamina curve tuned for heavy packs",
            "Vault and climb timings tightened to reaction windows",
            "Slide buffered to avoid accidental rollouts",
            "Fall damage now scales with progression tier",
            "Swimming throws low-oxygen warnings and HUD cues",
          ],
        },
        {
          date: "2025-11-20",
          build: "R0.17",
          title: "Combat Layer Revision",
          status: "Active",
          summary:
            "Melee and ranged flow stabilized — stagger and flinch now set the pace.",
          details: [
            "Enemy patrol and perception tightened",
            "Melee lockout shortened from 0.30s to 0.18s",
            "Weapon durability active for all test gear",
            "Dodge i-frame window extended from 12 to 16 frames",
            "Suspicion baseline values introduced",
          ],
        },
        {
          date: "2025-11-24",
          build: "R0.21",
          title: "Base Structures + Farming Tier 0",
          status: "Integrated",
          summary: "Shelter-building, storage, and the first crop loop now run inside the Basin slice.",
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
            "Telekinesis now grows on its own XP track so combat and exploration feel earned.",
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
            "The ARK now remembers its interior: doors, loot, crew positions, lighting, and flags survive reloads.",
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
        "Pulled straight from the Basin’s log. No narrative padding — only the survival work as it happens.",
    },
    about: {
      title: "About SyncNode Studio",
      subtitle:
        "SyncNode Studio is an independent Hungarian team building AIKA: World, a post-collapse sci-fi survival story about an ARK, its crew, and a world that fights back. We focus on tight play, honest stakes, and handcrafted worldbuilding.",
      sections: [
        {
          title: "Why AIKA: World?",
          body:
            "We build games where story lives inside the mechanics. AIKA: World is a long-form survival run: grounded systems, persistent world state, and character-driven missions without filler.",
        },
        {
          title: "How we work",
          body:
            "We build everything in-house and test daily. Systems stay lean so the world holds together as new zones, factions, and crew stories arrive.",
        },
        {
          title: "What comes next",
          body:
            "We’re expanding the open zones, deepening the ARK’s interior, and layering more character missions. Future builds add new biomes, enemy behaviors, telekinetic growth, and story events.",
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
              "Gameplay and systems lead — environment logic, scripting, UI/UX, tools, worldbuilding, combat feel, survival balance, deployment, and infrastructure.",
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
        "We’re in this for the long haul: a living survival game shaped by the crew, the ARK, and the world you fight to rebuild.",
    },
    contact: {
      title: "Contact",
      description:
        "We’re gathering allies for the next survival runs. Reach out if you create, research, or want to walk the Basin early with us.",
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
        messagePlaceholder: "Tell us how you’d help the crew or what you want to see aboard the ARK.",
        submitLabel: "Send message",
        submittingLabel: "Sending…",
        helperText: "We usually reply within two or three days. Turnstile keeps spam out.",
        success: "Thanks! We'll respond as soon as we can.",
        error: "We couldn't send your message. Please try again shortly or reach us via email.",
        turnstileError: "Please confirm the Cloudflare Turnstile challenge before sending.",
        endpointError: "Contact form submissions are temporarily unavailable. Reach us via the channels above.",
      },
    },
    footer: {
      studioBlurb: "AIKA: World • Post-collapse survival led by your crew.",
      credit: "SyncNode Studio | Polyák Csaba E.V.",
      builtWith: "Built for long-form survival on Steam",
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
