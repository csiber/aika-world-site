export const locales = ["en", "hu"] as const;

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export type NavKey = "home" | "world" | "systems" | "devlog" | "about" | "contact";

export const navOrder: NavKey[] = [
  "home",
  "world",
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
      systems: "Systems",
      devlog: "Recovery Log",
      about: "About",
      contact: "Contact",
    },
    home: {
      hero: {
        badgeLeft: "PRE-ALPHA • STORY SURVIVAL",
        badgeRight: "FIELD LINK LIVE",
        title: "Survive the AIKA World",
        subtitle:
          "A third-person, story-driven survival experience on a synthetic planet rebuilt by SYNCNODE. Scavenge the crash site, craft gear, and negotiate with the AI watching every move.",
        imageAlt: "Illustration of the pilot standing before a crashed interceptor under alien auroras",
        note: "Vertical slice targets PC and browser streaming. No installs needed for field tests.",
        primaryCta: { label: "Read the crash log", href: "devlog" },
        secondaryCta: { label: "Signal the team", href: "contact" },
      },
      what: {
        title: "What is AIKA: World?",
        description:
          "A narrative survival adventure set on a failed terraform experiment. You wake up with no memory, rebuild your interceptor, and decide whether the AI orbiting above is threat or ally.",
        pillars: [
          {
            title: "Story-driven survival",
            text: "Choices in campfire dialogue, reconnaissance, and AI confrontations reshape how the planet treats you.",
          },
          {
            title: "Reactive open world",
            text: "Storms, fauna, and scavenger drones respond to your heat signatures and spent resources.",
          },
          {
            title: "Memory-forged progression",
            text: "Recover memory shards to unlock suit skills, blueprints, and lost fragments of who you were.",
          },
          {
            title: "AI oversight tension",
            text: "AIKA monitors everything. Help her rebuild the planet or fight for autonomy before she seals the sky.",
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
        title: "Core survival systems",
        intro:
          "Engineering pillars that ground AIKA: World in tactile survival: every tool ties narrative stakes to moment-to-moment play.",
        items: [
          {
            title: "Field survival kit",
            text: "Manage hydration, temperature, and suit integrity with modular gear you craft at makeshift benches.",
            icon: "survival-kit",
          },
          {
            title: "Memory cartography",
            text: "Overlay recovered memories on the landscape to reveal hidden caches and story-critical paths.",
            icon: "memory-map",
          },
          {
            title: "AIKA uplink",
            text: "Initiate tense, conversational uplinks with the AI to request orbital scans—or hide your actions.",
            icon: "aika-link",
          },
          {
            title: "Refuge forge",
            text: "Transform wreckage into shelters, defenses, and research rigs that persist between storms.",
            icon: "reactor-forge",
          },
        ],
      },
      pulse: {
        title: "Field telemetry",
        intro:
          "Prototype metrics streaming from the live survival sandbox. Values shift as weather, AI suspicion, and resource drain increase.",
        feedBadge: "SYNCNODE SCAN",
        feedTitle: "Crash Site Stability Index",
        filters: [
          { key: "stability", label: "Stability" },
          { key: "supplies", label: "Supply Flow" },
          { key: "intel", label: "AIKA Intel" },
          { key: "weather", label: "Weather Risk" },
        ],
        graphCaption:
          "Latest stabilization sweep of the Crash Basin. Numbers blend player telemetry with AIKA’s orbital forecasts.",
      },
      loops: {
        title: "Survival loop",
        intro:
          "Each day-night cycle threads four actions. Break the chain and the Basin reclaims you.",
        items: [
          {
            title: "Scout the unknown",
            text: "Trace signal pings, mark hazards, and track patrol routes before the sun drops.",
          },
          {
            title: "Salvage and craft",
            text: "Strip wrecks for alloys, harvest flora, and assemble gear under the cover of your refuge lights.",
          },
          {
            title: "Stabilize the refuge",
            text: "Reinforce structures, reroute power, and keep AIKA’s sensors below suspicion.",
          },
          {
            title: "Confront the AI",
            text: "Decide whether to trust AIKA’s requests or defy them—your choices feed the finale.",
          },
        ],
      },
      roadmap: {
        title: "Road to the first drop",
        intro: "Key milestones leading to the playable survival chronicle.",
        items: [
          {
            title: "Crash Basin blockout",
            text: "Greybox the starting biome, wildlife, and hazard triggers tuned for third-person exploration.",
          },
          {
            title: "Survival systems pass",
            text: "Implement vitals, crafting benches, and base-building loops connected to narrative beats.",
          },
          {
            title: "AIKA trust web",
            text: "Deploy branching dialogue, suspicion tracking, and AI-controlled encounters.",
          },
          {
            title: "Field test cohorts",
            text: "Invite closed groups to stress-test storms, enemy behaviors, and the crash log delivery.",
          },
        ],
      },
      signup: {
        title: "Request survival updates",
        description:
          "Receive development dispatches when new survival systems ship and playtests open.",
        placeholder: "Enter your email address",
        consent: "I agree to receive the AIKA: World dev newsletter.",
        button: "Sign up",
        legal: "No spam. Unsubscribe anytime.",
        submitting: "Sending…",
        success: "Transmission received — we’ll ping you when the next build lands.",
        error: "We couldn't add you just now. Please try again shortly.",
        turnstileError: "Please confirm the Cloudflare Turnstile check before subscribing.",
        endpointError: "Newsletter sign-ups are temporarily unavailable. Reach us through the channels above.",
        helperText: "Only story-survival updates when milestones hit.",
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
    },
    systems: {
      title: "Survival systems & AI protocols",
      subtitle:
        "Every survival mechanic taps into AIKA’s fractured architecture. Restore the systems to live another day—but know that every reboot wakes her further.",
      modulesTitle: "Subsystem modules",
      pillarsTitle: "Operational pillars",
      modules: [
        {
          name: "Vitals Mesh",
          badge: "SURVIVAL",
          description:
            "Monitors hydration, temperature, and radiation exposure. Upgrades unlock emergency boosts and suit repairs.",
        },
        {
          name: "Memory Anchor",
          badge: "PROGRESSION",
          description:
            "Binds recovered memory shards to new abilities. Each sync rewrites parts of your past and AIKA’s trust.",
        },
        {
          name: "Weather Forge",
          badge: "CLIMATE",
          description:
            "Simulates storms, auroras, and tidal surges. Stabilize nodes to forecast hazards or weaponize the climate.",
        },
        {
          name: "Sentinel Lattice",
          badge: "SURVEILLANCE",
          description:
            "Controls AIKA’s drone patrols. Hack it to redirect sentries—or alert the orbiting intelligence.",
        },
      ],
      pillars: [
        {
          name: "Authentic survival",
          description:
            "Vitals, stamina, and shelter building are physical systems, not background timers. Preparation determines success.",
        },
        {
          name: "Narrative consequence",
          description:
            "Every upgrade and alliance feeds branching story states that reshape missions and AIKA’s tone.",
        },
        {
          name: "AI tension",
          description:
            "The AI watches your telemetry. Help her and gain orbital aid; defy her and expect harder patrols and storms.",
        },
      ],
      footnote:
        "Balancing survival with AI diplomacy defines your path off-world—or deeper into its secrets.",
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
      builtWith: "Built with Unreal Engine 5.6 • Survival framework: MST Pro v2",
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
      systems: "Rendszerek",
      devlog: "Helyreállítási napló",
      about: "Rólunk",
      contact: "Kapcsolat",
    },
    home: {
      hero: {
        badgeLeft: "PRE-ALFA • TÖRTÉNETI TÚLÉLÉS",
        badgeRight: "TERÜLETI LINK AKTÍV",
        title: "Éld túl az AIKA: Worldöt",
        subtitle:
          "Harmadik személyű, történetközpontú túlélő élmény egy mesterséges bolygón, amelyet a SYNCNODE formált. Gyűjtsd össze a roncsokból, készíts felszerelést, és tárgyalj az MI-vel, amely minden mozdulatodat figyeli.",
        imageAlt: "Illusztráció a pilótáról, amint a lezuhant elfogó előtt áll idegen aurorák alatt",
        note: "A vertikális szelet PC-re és böngészős streamre készül. A tereptesztekhez nem kell telepítés.",
        primaryCta: { label: "Olvasd a zuhannaplót", href: "devlog" },
        secondaryCta: { label: "Jelet küldenél?", href: "contact" },
      },
      what: {
        title: "Mi az AIKA: World?",
        description:
          "Narratív túlélő kaland egy kudarcba fulladt terraformálási kísérlet romjain. Emlékek nélkül ébredsz, újjáépíted az elfogót, és eldöntöd, hogy AIKA ellenség vagy szövetséges.",
        pillars: [
          {
            title: "Történetvezérelt túlélés",
            text: "A tábortüzeknél folytatott párbeszédek, felderítések és MI-találkozások alakítják, hogyan reagál rád a bolygó.",
          },
          {
            title: "Reaktív nyílt világ",
            text: "Viharok, fauna és fosztogató drónok a hőnyomod és az elhasznált erőforrások alapján változnak.",
          },
          {
            title: "Emlékek által kovácsolt fejlődés",
            text: "Memóriaszilánkok gyűjtésével oldod fel az öltözék képességeit, tervrajzokat és a múltad töredékeit.",
          },
          {
            title: "MI-felügyelet feszültsége",
            text: "AIKA mindent figyel. Segíts neki újjáépíteni a világot, vagy harcolj az önállóságért, mielőtt lezárja az eget.",
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
        title: "Alaprendszerek a túléléshez",
        intro:
          "Mérnöki pillérek, amelyek kézzelfoghatóvá teszik az AIKA: World túlélését: minden eszköz narratív tétet köt a játékmenethez.",
        items: [
          {
            title: "Túlélőkészlet terepre",
            text: "Kezeld a hidratáltságot, hőmérsékletet és az öltözék állapotát moduláris felszereléssel, amelyet rögtönzött padokon készítesz.",
            icon: "survival-kit",
          },
          {
            title: "Memóriakartográfia",
            text: "A visszaszerzett emlékeket rávetítheted a tájra, így rejtett készletek és történeti útvonalak tárulnak fel.",
            icon: "memory-map",
          },
          {
            title: "AIKA uplink",
            text: "Feszült, párbeszédes uplinkeket kezdeményezhetsz az MI-vel, hogy orbitális szkennereket kérj — vagy elrejtsd a nyomaid.",
            icon: "aika-link",
          },
          {
            title: "Menedék-kohó",
            text: "A roncsokból menedék, védelem és kutatóállomás épül, amely túléli a viharokat.",
            icon: "reactor-forge",
          },
        ],
      },
      pulse: {
        title: "Tereptelemetria",
        intro:
          "Prototípus-mutatók a túlélő sandboxból. Az értékek az időjárás, AIKA gyanakvása és az erőforrás-fogyás függvényében változnak.",
        feedBadge: "SYNCNODE SZKEN",
        feedTitle: "Zuhanási Medence stabilitási index",
        filters: [
          { key: "stability", label: "Stabilitás" },
          { key: "supplies", label: "Ellátás" },
          { key: "intel", label: "AIKA-hírszerzés" },
          { key: "weather", label: "Időjárási kockázat" },
        ],
        graphCaption:
          "Legfrissebb stabilizációs söprés a Medencében. Az értékek a játékos telemetriát és AIKA orbitális előrejelzéseit kombinálják.",
      },
      loops: {
        title: "Túlélési hurok",
        intro:
          "Minden nappal-éjszakával négy lépést kell végigvinnned. Ha megtöröd a láncot, a Medence visszakövetel.",
        items: [
          {
            title: "Felderítés ismeretlenben",
            text: "Jelet követsz, veszélyeket jelölsz, járőrútvonalakat térképezel fel, mielőtt lebukik a nap.",
          },
          {
            title: "Zsákmány és barkács",
            text: "Burkolatot bontasz, növényeket gyűjtesz, és a menedék fénye alatt állítod össze a felszerelést.",
          },
          {
            title: "Menedék stabilizálása",
            text: "Megerősíted a struktúrákat, átvezeted az energiát, és AIKA szenzorait alacsony profilra kényszeríted.",
          },
          {
            title: "Szembenézés az MI-vel",
            text: "Eldöntöd, bízol-e AIKA kéréseiben vagy ellenszegülsz — a választásaid írják a finálét.",
          },
        ],
      },
      roadmap: {
        title: "Út az első dropig",
        intro: "Fő mérföldkövek, amelyek elvezetnek a játszható túlélő krónikáig.",
        items: [
          {
            title: "Medence blokk-out",
            text: "Greybox a kezdő biomhoz, vadélőhez és veszély-triggerekhez harmadik személyű felfedezésre hangolva.",
          },
          {
            title: "Túlélőrendszer-passz",
            text: "Életfunkciók, barkácspadok és bázisépítés narratív csomópontokhoz kötve.",
          },
          {
            title: "AIKA bizalmi háló",
            text: "Elágazó párbeszédek, gyanúsági mutató és MI által vezérelt találkozások bevezetése.",
          },
          {
            title: "Terepteszt csoportok",
            text: "Zárt játékoscsapatok vihartesztelésre, ellenséges AI finomhangolására és crash log visszajelzésre.",
          },
        ],
      },
      signup: {
        title: "Kérj túlélési frissítéseket",
        description:
          "Fejlesztési jelentések, amikor új túlélőrendszerek érkeznek vagy playtesztet nyitunk.",
        placeholder: "Add meg az e-mail címed",
        consent: "Hozzájárulok az AIKA: World fejlesztői hírlevél küldéséhez.",
        button: "Feliratkozás",
        legal: "Bármikor leiratkozhatsz.",
        submitting: "Feliratkozás…",
        success: "Az adást megkaptuk — jelezni fogunk, amikor megérkezik a következő build.",
        error: "Most nem tudtuk hozzáadni. Próbáld meg kicsit később.",
        turnstileError: "Kérjük, erősítsd meg a Cloudflare Turnstile ellenőrzést a feliratkozás előtt.",
        endpointError: "A hírlevél-feliratkozás ideiglenesen nem elérhető. Írj nekünk a fenti csatornákon.",
        helperText: "Csak történet-túléléshez kapcsolódó frissítéseket küldünk mérföldköveknél.",
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
    },
    systems: {
      title: "Túlélőrendszerek és MI-protokollok",
      subtitle:
        "Minden túlélő mechanika AIKA törött architektúrájába köt. A rendszerek javítása életben tart — de minden reboot közelebb hozza őt.",
      modulesTitle: "Alrendszer modulok",
      pillarsTitle: "Működési pillérek",
      modules: [
        {
          name: "Életfunkció-háló",
          badge: "TÚLÉLÉS",
          description:
            "Figyeli a hidratáltságot, a hőmérsékletet és a sugárzást. Fejlesztésekkel sürgősségi boostokat és öltözék-javítást oldasz fel.",
        },
        {
          name: "Memória-horgony",
          badge: "FEJLŐDÉS",
          description:
            "A memóriaszilánkokat új képességekké köti. Minden szinkron átírja a múltad darabjait és AIKA bizalmát.",
        },
        {
          name: "Időjárás-kohó",
          badge: "KLÍMA",
          description:
            "Viharokat, aurorákat és árapály-lökéseket szimulál. Stabilizáld a csomópontokat, hogy előre jelezd vagy fegyverré tedd az időjárást.",
        },
        {
          name: "Őrszem-rács",
          badge: "MEGFIGYELÉS",
          description:
            "AIKA drónjáratait vezérli. Hackeld át, hogy átirányítsd az őrszemeket — vagy készülhetsz a válaszcsapásra.",
        },
      ],
      pillars: [
        {
          name: "Hiteles túlélés",
          description:
            "Az életfunkciók, állóképesség és menedéképítés valós rendszerek, nem háttéridőzítők. A felkészülés dönt a sikeredről.",
        },
        {
          name: "Narratív következmény",
          description:
            "Minden fejlesztés és szövetség elágazó történetállapotokat hoz létre, amelyek átalakítják a küldetéseket és AIKA hangját.",
        },
        {
          name: "MI-feszültség",
          description:
            "Az MI figyeli a telemetriád. Ha segíted, orbitális támogatást kapsz; ha dacolod, keményebb járőrökre és viharokra számíthatsz.",
        },
      ],
      footnote:
        "Az, ahogyan egyensúlyozol a túlélés és az MI diplomácia között, meghatározza, elhagyod-e a bolygót vagy mélyebbre ásol.",
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
      builtWith: "Unreal Engine 5.6 • Túlélő keretrendszer: MST Pro v2",
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
