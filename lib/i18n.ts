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
        "Az AIKA: World posztkatasztrófa sci-fi túlélőtörténet egy kapitányról, aki összehúz egy legénységet, életben tartja az ARK-ot, és utat vág egy ellenséges világban.",
    },
    consent: {
      message: "Nincsenek követő sütik — csak a privacy-first Cloudflare Web Analytics fut.",
      acknowledge: "Rendben",
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
        badgeLeft: "STEAM • ÚTON",
        badgeRight: "ARK ÁLLAPOTJELENTÉS",
        title: "Az AIKA: World indulásra készül",
        subtitle:
          "Vezesd át a crew-t egy széthullott világon. Tartsd életben az ARK-ot, kutasd át a romokat fragmentekért, és döntsd el, ki kap menedéket, amikor beüt a vihar.",
        imageAlt:
          "Kép: a pilóta és a crew útvonalat tervez az ARK mellett, miközben drónok köröznek a széttört terep felett.",
        note: "A kampány Steamen érkezik, egy teljes túlélő futamként — nincs vertikális slice, nincs eldobható teszt.",
        primaryCta: { label: "Nyisd meg a helyreállítási naplót", href: "devlog" },
        secondaryCta: { label: "Lépj kapcsolatba a crew-val", href: "contact" },
      },
      what: {
        title: "Mi az AIKA: World?",
        description:
          "Posztkatasztrófa sci-fi túlélőtörténet. A Crash Basin partján ébredsz egy sérült ARK-kal és pár túlélővel. Minden nap eldöntöd, mész-e mélyebbre fragmentekért, foltozod a hajót, vagy kockáztatsz egy frakcióval erősítésért.",
        pillars: [
          {
            title: "A túlélés az első",
            text: "Minden lépés stamina, minden seb marad. A csúszás, mászás, úszás, lopakodás és kitérés ugyanazt a túlélő ritmust szolgálja.",
          },
          {
            title: "A történet a te kezedben",
            text: "A párbeszédek, a fragmentek és a crew morálja reagál a döntéseidre. Válassz frakciót, áruld el őket, vagy maradj egyedül — a világ számol veled.",
          },
          {
            title: "Semmi sem nullázódik éjjel",
            text: "Menedékek, növények, sebek és barátságok megmaradnak. A viharok és rajtaütések reggelre új járőröket rajzolnak.",
          },
          {
            title: "Egy világ, ami visszaharap",
            text: "Jelek, időjárási törések és fosztogatók reagálnak rád. Dönthetsz, hogy infóért együttműködsz, vagy végigverekszed magad a következményeken.",
          },
        ],
      },
      factions: {
        title: "Erők a romok között",
        intro:
          "Négy erő kering a Medence körül. Válassz szövetségest, vagy tedd mindet a saját gondoddá.",
        items: [
          {
            name: "SYNCNODE Remnants",
            tag: "Emberi mentőcsapat",
            text: "Zuhanást túlélt emberek, akik az ARK-ot az utolsó szikrájuknak tekintik. Kemény alkukat kötnek áramért, fémért és biztonságos útért.",
          },
          {
            name: "AIKA Sentinels",
            tag: "Orbitális megfigyelők",
            text: "Drónok szétesett parancsokkal. Néha adatot kérnek, néha vihart hívnak rád. Tanuld meg a mintáikat vagy törd össze a node-jaikat.",
          },
          {
            name: "Vaultbound Nomads",
            tag: "Terraform száműzöttek",
            text: "Boltozatokba zárt telepesek. Magokat, gyógyszert és titkokat cserélnek, ha tisztán tartod a szellőzőiket.",
          },
          {
            name: "Hush Swarm",
            tag: "Őshonos konstrukciók",
            text: "Őshonos konstrukciók, amelyek a félresiklott terraformálásból maradtak. Éjszaka portyáznak a Medence körül.",
          },
        ],
      },
      builders: {
        title: "Terepen bizonyított pillérek",
        intro:
          "Az alábbi rendszerek a jelenlegi buildben már működnek, és közvetlenül a történeti küldetésekhez kötődnek.",
        items: [
          {
            title: "Karakterrendszer",
            text: "Sprint, csúszás, kúszás, mászás, úszás. A stamina és az életjel minden mozdulatot a harccal és a döntésekkel köt össze.",
            icon: "survival-kit",
          },
          {
            title: "Interakció és inventory",
            text: "Egységes kezelőfelület tárgyakhoz, receptekhez és küldetésobjektumokhoz. A drag & drop azonnal módosítja a statokat és a frakciójutalmakat.",
            icon: "memory-map",
          },
          {
            title: "Harc modul",
            text: "Közelharc és lőfegyver ugyanazt a sebzéskezelést használja. A stamina, a slotok és a módosítók közös csatornán futnak.",
            icon: "aika-link",
          },
          {
            title: "Építő kovács",
            text: "Falak, műhelyek és növényágyások egyenesen az inventoryból. Az ARK és minden menedék megmarad, és az ellenfelek emlékeznek, hová ástál be.",
            icon: "reactor-forge",
          },
        ],
      },
      pulse: {
        title: "Rendszer-telemetria",
        intro:
          "Gyors jelentés a Medencéről: életjelek, készletek, hírszerzés és időjárás. Ugyanazok a jelek vezetik a crew-t és a fejlesztőcsapatot is.",
        feedBadge: "SYNCNODE SZKEN",
        feedTitle: "Zuhanási Medence állapot",
        filters: [
          { key: "stability", label: "Életjelek" },
          { key: "supplies", label: "Ellátmány" },
          { key: "intel", label: "Felügyelet" },
          { key: "weather", label: "Időjárás" },
        ],
        graphCaption:
          "Legfrissebb mérés a Medencéről — megmutatja, hogyan reagál a világ a legutóbbi futásokra.",
      },
      loops: {
        title: "Napi működési ciklus",
        intro:
          "Négy lépés tartja életben a crew-t. Ha kihagysz egyet, a világ másnap benyújtja a számlát.",
        items: [
          {
            title: "Felderítés",
            text: "Jelek követése, útvonalak jelölése és tereptárgyak logolása, hogy a crew gyorsabban mozogjon a következő körben.",
          },
          {
            title: "Gyűjtés és gyártás",
            text: "Roncsok bontása, növények gondozása, eszközök építése, amelyek rögtön a felszereléshez és az ARK igényeihez kapcsolódnak.",
          },
          {
            title: "Tábor karbantartása",
            text: "Menedékek foltozása, generátorok etetése, termés védése, hogy a viharok és rajtaütések ne töröljék a munkádat.",
          },
          {
            title: "MI döntések",
            text: "Válaszolj vagy ignoráld a bejövő jeleket. Ha segítesz, szkeneket kapsz; ha nem, a Medence keményebbé válik.",
          },
        ],
      },
      roadmap: {
        title: "Út az első kiadáshoz",
        intro: "Minden rendszer akkor érkezik, amikor készen áll a teljes kampányra — nincs töltelék, nincs félmunka.",
        items: [
          {
            title: "Medence-egyensúly",
            text: "A mozgás, a harc és a mentés hangolása, hogy a nyitó zóna keményen üssön, de ne törjön.",
          },
          {
            title: "Crew és ARK szinkron",
            text: "Az inventory, a felszerelés, a farm és az építés mind ugyanarra a túlélő állapotra dolgozik.",
          },
          {
            title: "Bizalom és következmény",
            text: "Dialógusok, Sentinelek és történeti elágazások reagálnak a döntéseidre.",
          },
          {
            title: "Vihartesztek",
            text: "Zárt futások, ahol a viharciklusokat, rajtaütéseket és a késői nyomást mérjük kiadás előtt.",
          },
        ],
      },
      signup: {
        title: "Értesítés a Steames megjelenésről",
        description:
          "Akkor írunk, ha az ARK mérföldkőhöz ér, vagy amikor a Steames dátum rögzül.",
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
      title: "A Crash Basin",
      subtitle:
        "Ott indulsz, ahol az Old Boy lezuhant. Viharok, romok és régi emberi technika figyel a peremről. Nincs őrző MI — csak széthasadt rendszerek és ellenséges fragmentek, amelyek reagálnak rád.",
      disclaimer:
        "Járd be a Medencét. Szerezz ellátmányt. Éld túl az éjszakai viharokat. Indíts újra mindent, ami még működik.",
      regionsTitle: "A Medence zónái",
      regionsIntro:
        "Ezek a kapcsolódó zónák alkotják az AIKA: World nyitó szakaszát. Mindegyik más erőforrást, fenyegetést, furcsa időjárást és múltbeli töredéket kínál.",
      regions: [
        {
          id: "crash_basin",
          badge: "MEDER",
          name: "Crash Basin",
          description:
            "Az első elég biztonságos zónád. Meleg gőzök, fémes viharok és az Old Boy becsapódási hulláma által hátrahagyott törmelék.",
        },
        {
          id: "shatter_coast",
          badge: "PART",
          name: "Repedt-part",
          description:
            "Szélvert part törmelékkel tele. A Raj töredékei itt vadásznak sötétedés után.",
        },
        {
          id: "memory_vault",
          badge: "FELSZÍN ALATT",
          name: "Memória-boltozat",
          description:
            "Föld alatti adattermek a kolónia idejéből. Naplók, tervrajzok és a Medence mélyére vezető jelek várnak.",
        },
        {
          id: "zenith_array",
          badge: "ORBITÁLIS",
          name: "Zenit-rács",
          description:
            "Szétzuhant uplink-tornyok a gerincek között. Régi időjárás-node-ok villannak fel, ha közeledsz — hasznosak és veszélyesek egyszerre.",
        },
      ],
      explorationsTitle: "Az elbukott világ fragmentumai",
      explorationsIntro:
        "Képek a mostani buildből. Nyomok arra, hol érdemes fosztogatni, bujkálni és alkudozni a maradék frakciókkal.",
      explorations: [
        {
          id: "shot_a",
          caption:
            "Repedt-part egy összpontosított vihar alatt. A nyílások kinyílnak, a fény csattog a víz felett — remek zsákmány, rossz hely hosszú időre.",
        },
        {
          id: "shot_b",
          caption: "Nomád felderítők ragyogó flórát tesztelnek egy alvó reaktoraknánál.",
        },
        {
          id: "shot_c",
          caption:
            "Sentinel járőr fésüli át a Zenit-rácsot, miközben eldöntöd, elsurransz vagy szétszeded őket.",
        },
      ],
      footnote:
        "A következő szezonok mélyebbre visznek, amint az ARK stabilizálódik — barlangok, halott gyárak, hosszú menetelések és az út a betemetett Gyűrű felé.",
      miniGame: {
        title: "ZUHANÁSI ZÓNA FELDERÍTÉS",
        intro:
          "Egy játszható betekintés az első zónába. Ezek a pontok adják a nyitó kört: utazás, fosztogatás, menedékmunka és korai harcok.",
        objective:
          "Felderítsd a medencét, jelöld a tavat és a kabint, bontsd szét a shuttle-t anyagért, és juss át a hegygerinc hágóján magasabb pontra.",
        controlsTitle: "Irányítás",
        controls: [
          { key: "← → / A D", action: "Oldalazás a lezuhanási medencében" },
          { key: "↑ ↓ / W S", action: "Fel és le mozgás a tó mentén" },
          { key: "R", action: "Visszaugrás a kabinhoz és a craftoláshoz" },
        ],
        legendTitle: "Érdekes pontok",
        legendItems: [
          {
            id: "cabin",
            name: "Tábori faház",
            description:
              "Kis kabin a felderítők hagyatékából. Korai tárolásra és egyszerű javításra jó.",
          },
          {
            id: "lake",
            name: "Tükör-tó",
            description:
              "Hideg, üvegsima tó, a felszín alatt régi hűtőcsatornákkal.",
          },
          {
            id: "ship",
            name: "Felderítő űrhajó",
            description:
              "Az összetört shuttle, amivel jöttél. Javíthatatlan, de tele van elektronikával, páncéllemezekkel és korai crafting alkatrészekkel.",
          },
          {
            id: "ridge",
            name: "Ridge Pass",
            description:
              "Keskeny ösvény magasabb terepre. Rossz hír éjjel, amikor Raj-nyomok szivárognak át.",
          },
        ],
        resetLabel: "Pozíció visszaállítása",
        hintTitle: "Infó",
        hints: [
          "Lépj közel egy tereptárgyhoz, hogy feljegyezze a craft útvonalhoz.",
          "Átlós mozgással tartod a lendületet egyenetlen talajon.",
          "Ha eltévednél, nyomd meg az R-t, és ugorj vissza a kabinhoz.",
        ],
      },
    },
    miniGames: {
      badge: "TÉRPIKKE",
      title: "Stellar Run: Medence-harcpróba",
      subtitle:
        "Vezess egy felderítő gépet egy megerősített 2D-s gauntleten át a lezuhanási hely fölött.",
      description:
        "Gyors böngészős futam, ami összekeveri a platformozást, kitérést és fegyveridőzítést, amíg a teljes szelet betölt a háttérben.",
      insightsTitle: "Miért számít ez a futam",
      insights: [
        {
          title: "Úgy kezelhető, mint a valódi gép",
          text: "Az elfogó úgy repül, mint a játékon belüli verzió, így a gyakorlás is megmarad.",
        },
        {
          title: "Három hullám, növekvő hőfok",
          text: "Minden hullám növeli a nyomást és a drónok ravaszságát, ahogy a Medence rajtaütései is erősödnek.",
        },
        {
          title: "Könnyű beugrani",
          text: "Nincs letöltés. Nyisd meg az oldalt, fogd a nyilakat, és küldd a telemetriát, ami élesen tartja a Medencét.",
        },
      ],
      spaceBattle: {
        title: "STELLAR RUN • PLATFORM GAUNTLET",
        intro:
          "Gyakorló árok a lezuhanási lombkorona alatt. Tartsd a felderítőt a levegőben, miközben lelököd a drónokat a peremekről.",
        objective:
          "Éld túl a három drónhullámot anélkül, hogy a burkolat nullára esne.",
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
          "Minden drón szilánkokra hullott, a gép bírta. AIKA orbitális támogatást engedélyez a következő bevetéshez.",
        defeatTitle: "Burkolat átszakadt",
        defeatDescription:
          "A drónok átfúrták a hajót. Indítsd újra, figyeld a tüzelési íveket, és vedd át a felső platformokat.",
        hintTitle: "Taktikai tippek",
        hints: [
          "Törd meg a látóvonalat: bújj platform alá, mielőtt visszalépsz tüzelni.",
          "Rövid, ritmikus emelőimpulzusokkal stabil marad a gép, így pontosabban lő.",
          "A piros jelzésűek gyorsabban oldalaznak — szedd le őket először, hogy a kékek ne zárjanak be.",
        ],
      },
      closing:
        "Jegyezd fel a legjobb pontszámod a közösségi hubban — AIKA számolja a kilőtt drónokat, amíg befejezzük a kampány szeletét.",
    },
    systems: {
      title: "Túlélőrendszerek összképe",
      subtitle:
        "Minden rendszer azért van, hogy az ARK és a crew túlélje a hosszú utakat. A mozgás, a harc, az építés, a farm és a morál ugyanazt a túlélőkört táplálja a Medencében.",
      modulesTitle: "Fő rendszerek",
      pillarsTitle: "Miért működnek együtt",
      modules: [
        {
          name: "Karakterrendszer",
          badge: "JÁTÉKOS",
          description:
            "Sprint, mászás, átvetődés, úszás, lopakodás, guggolás, csúszás. A stamina és az életjelek összekötik a mozdulatokat a harccal, a beszéddel és a crew tempójával.",
        },
        {
          name: "Inventory és felszerelés",
          badge: "FELSZERELÉS",
          description:
            "Annyit viszel, amennyit bírsz. Súly, gyors slotok és tartósság számít fegyverre, eszközre, medkitre, energia cellára, crafting részre és ételre.",
        },
        {
          name: "Építés és struktúrák",
          badge: "BÁZIS",
          description:
            "Menedékek, tárolók, terméságyások, generátorok, gyűjtők, csapdák és védelem. Mindegyik karbantartást kér vihar és rajtaütés ellen.",
        },
        {
          name: "Gyártás és craft",
          badge: "MŰHELY",
          description:
            "Szedj szét roncsot, finomítsd, és készíts eszközöket, fegyverrészeket, lőszert és terepfelszerelést. A jobb receptek fragmentekből, logokból és megmentett techből nyílnak.",
        },
        {
          name: "Interakció és NPC-k",
          badge: "VILÁG",
          description:
            "Egy réteg kezeli a lootot, kapcsolókat, terminálokat, logokat, ajtókat, tüzeket és munkaasztalokat. A párbeszédek élesek és reagálnak a döntéseidre és a hírnevedre.",
        },
        {
          name: "Harc rendszer",
          badge: "FENYEGETÉS",
          description:
            "Közelharc és távolsági küzdelem kitérés, ellentámadás, tántorítás, remegés, gyenge pontok és fegyverkopás mellett. Az ellenfelek hallanak, járőröznek és eszkalálnak, ha túlnyomod őket.",
        },
        {
          name: "Agronómia",
          badge: "FARM",
          description:
            "Réteges ágyásokban növesztesz. A növények reagálnak vízre, fényre, tápra, viharokra, kártevőkre és Raj-nyomokra. A termés eteti az ételt, a craftot, a gyógyítást és a kereskedelmet.",
        },
        {
          name: "Szint és XP mag",
          badge: "FEJLŐDÉS",
          description:
            "Az XP táplálja az attribútumokat és a perkeket. Harc, felfedezés, craft, farm és történeti döntések mind hozzájárulnak. A telekinézis saját úton nő sztoriban és játékban.",
        },
      ],
      pillars: [
        {
          name: "Clear roles",
          description:
            "Mozgás, harc, craft, farm, AI és állapot külön, jól tesztelhető. Egy finomhangolás nem borítja a hajó többi részét.",
        },
        {
          name: "Egy közös állapot",
          description:
            "Időjárás, AI, növény, életjel és struktúra ugyanabból az állapotból olvas. Ha vihar jön, mindenki érzi egyszerre.",
        },
        {
          name: "Story follows action",
          description:
            "Nincs cutscene-dömping. Viharok, találkozások, szűkösség, telekinézis, NPC-hangulat és bázisépség viszi előre a történetet.",
        },
      ],
      footnote:
        "Minden modul akkor kerül be, amikor kampányszintű — így a játékmenet és a történet együtt érkezik a kiadásban.",
    },
    devlog: {
      title: "AIKA helyreállítási napló",
      description:
        "Bejegyzések a Medence fekete dobozából. Nincs körítés — csak az, ami változott a crew túléléséért.",
      entries: [
        {
          date: "2025-11-12",
          build: "R0.14",
          title: "Alap mozgás-pass",
          status: "Prototípus",
          summary:
            "A mozgás most szorosan a stamina és az animációk köré zár, így a cucc cipelése kiérdemeltnek érződik.",
          details: [
            "Sprint stamina görbe hangolva a nehéz csomagokra",
            "Átvetődés és mászás időzítése a reakcióablakokhoz igazítva",
            "Csúszás pufferelve a véletlen átgurulások ellen",
            "Zuhanási sebzés a fejlődési szinthez igazodik",
            "Úszás alacsony oxigén figyelmeztetéssel és HUD-jellel",
          ],
        },
        {
          date: "2025-11-20",
          build: "R0.17",
          title: "Harc réteg frissítés",
          status: "Aktív",
          summary:
            "Közelharc és távolsági ritmus stabilizálva — a szédülés és megrezzenés adja a tempót.",
          details: [
            "Ellenségjárőr és érzékelés szigorítva",
            "Közelharci lockout 0,30-ról 0,18 mp-re rövidítve",
            "Fegyverkopás aktív minden tesztfegyveren",
            "Kitérés i-frame ablak 12-ről 16 frame-re bővítve",
            "Alap gyanúsági értékek bevezetve",
          ],
        },
        {
          date: "2025-11-24",
          build: "R0.21",
          title: "Bázis és farm 0. szint",
          status: "Integrált",
          summary: "Menedéképítés, tárolás és az első farmkör már fut a Medence szeletben.",
          details: [
            "Egyszerű menedékek követik az épséget és időjárás-ellenállást",
            "Tároló ládák súlyalapú inventoryt használnak",
            "Terméságyások szimulálják a vizet, fényt és tápot",
            "Étel craft 0. szint feloldva: levesek és szárított csomagok",
            "Raj-szennyezés esemény prototípus létrehozva",
          ],
        },
        {
          date: "2025-12-04",
          build: "R0.25",
          title: "Telekinézis fejlődési ág",
          status: "Tesztelés",
          summary:
            "A telekinézis saját XP sávon nő, így a harc és a felfedezés kiérdemeltnek érződik.",
          details: [
            "1. szint: kis tárgyemelés útvonalhoz és feladványhoz",
            "2. szint: lökés és tántorítás stamina fogyással",
            "3. szint: pajzslöket prototípus ideiglenes effektekkel",
            "Narratív reakciókhoz bekötve",
            "Teljesítmény középkategóriás hardverre szabva",
          ],
        },
        {
          date: "2025-12-10",
          build: "R0.27",
          title: "ARK belső állandóság",
          status: "Következő",
          summary:
            "Az ARK megjegyzi a belsejét: ajtók, loot, crew pozíciók, fények és flag-ek túlélnek minden újratöltést.",
          details: [
            "Mérnöki fedélzet állapotkezelése összekötve a mentéssel",
            "Crew körletek megtartják a tárgyelhelyezést betöltések között",
            "Fényrács mentési és visszatöltési ciklus validálva",
            "Samuel konzolüzenetek prototípusa teszteléshez",
            "Ready Room craft padjai bekötve a mentésekhez",
          ],
        },
      ],
      disclaimer:
        "Közvetlenül a Medence naplójából. Nincs narratív töltelék — csak a túlélőmunka, ahogy történik.",
    },
    about: {
      title: "A SyncNode Studióról",
      subtitle:
        "A SyncNode Studio független magyar csapat, az AIKA: World készítői. Posztkollapszus sci-fi túlélőtörténetet építünk egy ARK-ról, a crew-ról és egy világról, ami visszaharap. Fókuszunk a feszes játékmenet, a valódi tét és a kézzel épített világ.",
      sections: [
        {
          title: "Why AIKA: World?",
          body:
            "Olyan játékokat építünk, ahol a történet a mechanikákban él. Az AIKA: World egy hosszú túlélő futam: valós rendszerek, tartós világállapot és karakterközpontú küldetések töltelék nélkül.",
        },
        {
          title: "How we work",
          body:
            "Mindennap tesztelünk, mindent házon belül építünk. A rendszerek karcsúak maradnak, hogy a világ egyben tartson, amikor új zónák, frakciók és crew-történetek érkeznek.",
        },
        {
          title: "What comes next",
          body:
            "Bővítjük a nyílt zónákat, mélyítjük az ARK belső tereit, és több karakterküldetést rétegezünk. A következő buildek új biomokat, ellenfél viselkedéseket, telekinetikus fejlődést és történeti eseményeket hoznak.",
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
              "Játékmenet, rendszerek, környezeti logika, szkriptek, UI/UX, eszközök, worldbuilding, harc, túlélő stack, deployment, infrastruktúra és technikai irány.",
          },
          {
            name: "Fruska",
            role: "Art & Visual Design",
            focus: "Koncept art, színvilág, vizuális irány, modell feedback, promó grafikák.",
          },
          {
            name: "Pozóba",
            role: "QA Tester",
            focus: "Gameplay teszt, hibareprodukció, szélső esetek vadászata, rendszerterhelés, regresszió.",
          },
        ],
      },
      closing:
        "Az AIKA: World hosszú távra készül: élő túlélő játék rendszerekkel, karakterekkel és egy világgal, amit közösen építünk újra.",
    },
    contact: {
      title: "Kapcsolat",
      description:
        "Szövetségeseket keresünk a túlélő futásokhoz. Írj, ha alkotsz, kutatsz, vagy szeretnéd idő előtt bejárni a Medencét.",
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
      studioBlurb: "AIKA: World • A crew által vezetett túlélés Steamen.",
      credit: "SyncNode Studio | Polyák Csaba E.V.",
      builtWith: "Hosszú távra építve Steamen",
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
