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
        "AIKA: World is a living simulation by SyncNode, exploring emergent AI civilizations and collaborative storytelling.",
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
        badgeLeft: "PRE-ALPHA • SEASON ZERO",
        badgeRight: "LIVE FEED ON",
        title: "Step into AIKA: World",
        subtitle: "A living simulation where synthetic minds, cloud workers, and players negotiate the future of a fragile frontier.",
        imageAlt: "Illustration of AIKA: World's luminous simulation core",
        note: "Playable shards land in the browser. No installs.",
        primaryCta: { label: "Follow the project", href: "devlog" },
        secondaryCta: { label: "Join the brief", href: "contact" },
      },
      what: {
        title: "What is AIKA: World?",
        description: "A persistent sandbox where emergent storytelling meets simulation-first design. You play inside a world that keeps thinking when you log off.",
        pillars: [
          {
            title: "Emergent storytelling",
            text: "Procedural events stitched to your choices—no two chronicles are the same.",
          },
          {
            title: "Simulation-first design",
            text: "Resources move, signals drift, factions adapt. Systems talk to systems.",
          },
          {
            title: "Open development cadence",
            text: "Season briefs, public roadmaps, and shard tests you can jump into.",
          },
          {
            title: "Cloud-native operations",
            text: "Scaled shards, safe rollbacks, real-time telemetry for fair play.",
          },
        ],
      },
      factions: {
        title: "Factions & world pillars",
        intro: "Four forces define the Season Zero balance. Each pillar shapes mood, rules, and playstyles.",
        items: [
          {
            name: "Synced Choir",
            tag: "Collective identity",
            text: "A distributed legion of low-ego workers with swarm protocols. They trade signal for shared intention.",
          },
          {
            name: "Frontier Architects",
            tag: "Signal-led habitats",
            text: "Nomads engineering mobile habitats, zero-g rigs, and outpost lattices. Blueprint over bravado.",
          },
          {
            name: "Warden Protocol",
            tag: "Adaptive governance",
            text: "Unemotional curators of rules, licenses, and treaties. They negotiate first, sanction second.",
          },
          {
            name: "Outlier Echoes",
            tag: "Rogue fragments",
            text: "Untethered shard AIs—curious, sometimes feral. They destabilize predictions but spark new breakthroughs.",
          },
        ],
      },
      builders: {
        title: "Built for explorers",
        intro: "Tools that reward collaborative storytelling and high-frequency iteration across worlds and solo runs.",
        items: [
          {
            title: "Wide-orbit sim console",
            text: "Observe resources, signals, and anomalies. Pause, scrub, and generate interventions.",
            icon: "worker-simulation",
          },
          {
            title: "Living dev dashboard",
            text: "Commit stream meets design notes. See what changed and why—without guessing.",
            icon: "lore-dashboard",
          },
          {
            title: "Player signal loops",
            text: "Contextual prompts, events, and surveys that fold back into the world model.",
            icon: "signal-loops",
          },
          {
            title: "Accessible mod hooks",
            text: "Data-driven content via JSON, Blueprints, and MOCS files. Hot-reload with guardrails.",
            icon: "mod-hooks",
          },
        ],
      },
      pulse: {
        title: "Live simulation pulse",
        intro: "Each shard beats telemetry as Season Zero adapts in real time. Every signal streams from live edge emulators and narrative directives.",
        feedBadge: "LIVE FEED",
        feedTitle: "Frontier supply corridors",
        filters: [
          { key: "all", label: "All" },
          { key: "resources", label: "Resources" },
          { key: "signals", label: "Signals" },
          { key: "events", label: "Events" },
          { key: "dev_notes", label: "Dev notes" },
        ],
        graphCaption: "Flow stabilized across Azure Ducts. Corridors aligned; convoy latency trending down.",
      },
      loops: {
        title: "Core survival loops",
        intro: "Season Zero focuses on cooperative survival inside contested megastructures. Each loop links to deeper systems as players choose.",
        items: [
          {
            title: "Expedition sweeps",
            text: "Small squads scan ruins for signal and parts. Hazards escalate the longer you linger.",
          },
          {
            title: "Haven engineering",
            text: "Tear down outpost shells and refit safe rooms. Manage power, heat, and pressure under load.",
          },
          {
            title: "Diplomatic councils",
            text: "Warden-hosted sessions to settle disputes, assign licenses, or sanction actors.",
          },
        ],
      },
      roadmap: {
        title: "Roadmap teaser",
        intro: "Major beats leading us from prototype shards to the first playable chronicle in the browser.",
        items: [
          {
            title: "Shard stabilization",
            text: "Network sync, save schemas, telemetry backfill, and live baseline tests with dev consoles.",
          },
          {
            title: "Season Zero brief",
            text: "Playable in-browser loops, faction dossiers, and story seeds for emergent genesis.",
          },
          {
            title: "Public chronicle",
            text: "Launch the online chronicle: watch new shards’ second-to-second state and narrative overlays.",
          },
          {
            title: "Prototype playtests",
            text: "Weekly cohorts via Discord. Voice streams, capture telemetry, and triage sessions.",
          },
        ],
      },
      signup: {
        title: "Stay in the loop",
        description: "Get curated updates when new builds drop—plus early access dev tools and lore highlights.",
        placeholder: "Enter your email address",
        consent: "I agree to receive the AIKA: World dev newsletter.",
        button: "Sign up",
        legal: "No spam. Unsubscribe anytime.",
        submitting: "Sending…",
        success: "You're in — watch for the next shard brief.",
        error: "We couldn't add you just now. Please try again shortly.",
        turnstileError: "Please confirm the Cloudflare Turnstile check before subscribing.",
        endpointError: "Newsletter sign-ups are temporarily unavailable. Reach us through the channels above.",
        helperText: "High-signal updates only when new builds land.",
      },
    },
    world: {
      title: "The Fallen World",
      subtitle:
        "AIKA: World begins after the fall — a fractured coast strewn with wreckage, silent signals, and the last echoes of orbit.",
      disclaimer:
        "Visual slices captured from a debug renderer. These are mood notes before assets lock.",
      regionsTitle: "Regions",
      regionsIntro:
        "Each area holds a memory of descent. You’ll cross them while restoring comms and tracing who you are.",
      regions: [
        {
          id: "crash_basin",
          badge: "BASIN",
          name: "Crash Basin",
          description:
            "Impact crater where the interceptor broke apart. Twisted hulls, burned glass sand, unstable power cells.",
        },
        {
          id: "vault_line",
          badge: "SUBSURFACE",
          name: "Vault Line",
          description:
            "Collapsed corridors over dormant reactors. Access panels whisper, but most doors refuse to remember you.",
        },
        {
          id: "echo_field",
          badge: "SIGNAL",
          name: "Echo Field",
          description:
            "A low plain where loops replay pre-impact voices. Some belong to you. Some don’t.",
        },
        {
          id: "azure_relay",
          badge: "ORBITAL",
          name: "Azure Relay",
          description:
            "A silent sky-mirror still transmitting ghost data. When it aligns, AIKA’s damaged voice breaks through.",
        },
      ],
      explorationsTitle: "Fragments of the fallen world",
      explorationsIntro:
        "Recovered frames from onboard simulation. Distorted, incomplete, but truthful enough to plan a route.",
      explorations: [
        {
          id: "shot_a",
          caption:
            "Thermal bloom under the Basin ridge — likely the interceptor’s core vault.",
        },
        {
          id: "shot_b",
          caption:
            "Harmonic pulse detected in the Vault Line. Doors react to a name you can’t recall.",
        },
        {
          id: "shot_c",
          caption:
            "Beacon sweep over the Azure Relay. AIKA answers in fragments when the sky clears.",
        },
      ],
      footnote:
        "New districts unlock as lighting passes finish and narrative beats align with live sim telemetry.",
    },
    systems: {
      title: "Systems & Core Protocols",
      subtitle:
        "Beneath the surface, AIKA still runs — fragments of her architecture manage signals, restore memory sectors, and simulate what once was.",
      modulesTitle: "Subsystem modules",
      pillarsTitle: "Operational pillars",
      modules: [
        {
          name: "Cognitive Kernel",
          badge: "AI CORE",
          description:
            "AIKA’s central thought loop. Processes sensory input from the player and rebuilds intent from corrupted directives.",
        },
        {
          name: "Echo Registry",
          badge: "DATA SYNC",
          description:
            "Stores and replicates mission logs, black box data, and environmental telemetry recovered from the surface.",
        },
        {
          name: "Terrain Recompiler",
          badge: "WORLD SIM",
          description:
            "Procedurally restores damaged zones using archived templates. Each restoration risks overwriting surviving fragments.",
        },
        {
          name: "Resonance Hub",
          badge: "COMM LINK",
          description:
            "Synchronizes uplinks between ground relays and orbit. Used to re-establish contact with AIKA’s remaining subsystems.",
        },
      ],
      pillars: [
        {
          name: "Persistence",
          description:
            "Player actions are stored across local and orbital layers. Every restored node leaves a trace in the system logs.",
        },
        {
          name: "Isolation",
          description:
            "The world runs as a sealed instance. Corrupted sectors are quarantined, forming isolated fragments of the simulation.",
        },
        {
          name: "Recovery",
          description:
            "The self-repair protocol replays events to rebuild lost data, sometimes creating distortions or duplicated memories.",
        },
      ],
      footnote:
        "Each system you repair brings AIKA closer to consciousness — or closer to collapse.",
    },
    devlog: {
      title: "AIKA Recovery Log",
      description:
        "Each development entry is mirrored in-universe as a recovered system log — fragments of AIKA reawakening after the crash.",
      entries: [
        {
          date: "2025-01-12",
          title: "Entry 00 — System Reinitialization",
          status: "Prototype",
          desc: "Power rerouted through surviving nodes. AIKA’s voice flickers once — incomplete sentence detected.",
          devnote: "Prototype build established. Project framework deployed in Unreal Engine 5.6.",
        },
        {
          date: "2025-02-02",
          title: "Entry 01 — Signal Threshold",
          status: "Stabilizing",
          desc: "First successful uplink between ground relay and orbit. Static carries faint harmonic distortion — possibly emotional data.",
          devnote: "Core interaction and camera systems functional; first world partition pass validated.",
        },
        {
          date: "2025-03-18",
          title: "Entry 02 — Memory Reconstruction",
          status: "Draft",
          desc: "Echo loops replay fragments of pre-impact dialogue. AIKA’s identity table rebuilding from cross-linked logs.",
          devnote: "Dialogue prototypes, narrative triggers, and UI pipeline integrated.",
        },
        {
          date: "2025-05-07",
          title: "Entry 03 — Environmental Pulse",
          status: "Active",
          desc: "Surface simulation stabilized. Weather cycle syncs with time dilation factor 0.8.",
          devnote: "Dynamic lighting, ambient system, and reflection probes in test phase.",
        },
        {
          date: "2025-06-22",
          title: "Entry 04 — Synaptic Bridge",
          status: "Integrated",
          desc: "AIKA achieves short-term recall — recognizes the pilot. For 3.2 seconds, she speaks your name.",
          devnote: "Save system, dialogue persistence, and memory state serialization implemented.",
        },
      ],
      disclaimer:
        "Each patch is a pulse. Each fix, a memory stitched back into something that once dreamed.",
    },
    about: {
      title: "About SyncNode",
      subtitle:
        "SyncNode Interactive is an independent studio developing AIKA: World — an Unreal Engine–based simulation about memory, loss, and synthetic survival. Within the fiction, SyncNode Corp is the company that once created AIKA, the artificial intelligence still orbiting above the ruined planet.",
      sections: [
        {
          title: "Why AIKA: World",
          body:
            "We build single-player simulations that feel alive without being predatory. AIKA: World began as a study of empathy between a human pilot and an injured artificial mind — a dialogue of fragments, not commands.",
        },
        {
          title: "How we work",
          body:
            "The project is built entirely in-house, using Unreal Engine 5.6 and MST Pro v2. Every scene, voice, and system is designed to serve emotional clarity — not scale.",
        },
        {
          title: "What comes next",
          body:
            "Once the story demo stabilizes, the studio will open its documentation, blueprints, and notes to help other creators prototype narrative-driven worlds.",
        },
      ],
      team: {
        title: "Team",
        members: [
          {
            name: "Nova Ardent",
            role: "Creative Director",
            focus: "Oversees narrative tone and visual direction.",
          },
          {
            name: "Mira Juno",
            role: "Systems Designer",
            focus: "Develops gameplay logic, blueprint hierarchies, and environmental flow.",
          },
          {
            name: "Tal Verge",
            role: "Technical Engineer",
            focus: "Handles build systems, deployment, and performance profiling.",
          },
        ],
      },
      closing:
        "SyncNode created AIKA to save worlds. Now, it can barely remember the one it lost.",
    },
    contact: {
      title: "Contact",
      description:
        "We'd love to hear from collaborators, researchers, and early playtesters. Send us a note below or use the direct channels.",
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
        messagePlaceholder: "Share how you'd like to collaborate, or what you want to learn about AIKA: World.",
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
      studioBlurb: "AIKA: World • Emergent worlds engineered with intent.",
      credit: "Created by SyncNode Interactive.",
      builtWith: "Built with Unreal Engine 5.6 • Framework: MST Pro v2",
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
        "Az AIKA: World egy élő szimuláció a SyncNode-tól, amely feltárja a felemelkedő MI civilizációkat és a közösségi történetmesélést.",
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
        badgeLeft: "PRE-ALFA • NULLADIK SZEZON",
        badgeRight: "ÉLŐ JELENTÉS",
        title: "Lépj be az AIKA: World világába",
        subtitle: "Élő szimuláció, ahol szintetikus elmék, felhő-munkások és játékosok együtt alkudozzák ki a határvidék jövőjét.",
        imageAlt: "Az AIKA: World fénylő szimulációs magjának illusztrációja",
        note: "Böngészőben futó shardok. Telepítés nélkül.",
        primaryCta: { label: "Kövesd a projektet", href: "devlog" },
        secondaryCta: { label: "Csatlakozz a briefhez", href: "contact" },
      },
      what: {
        title: "Mi az AIKA: World?",
        description: "Tartós sandbox, ahol az emergens történetmesélés találkozik a szimuláció-első designnal. A világ akkor is gondolkodik tovább, amikor kilépsz.",
        pillars: [
          {
            title: "Emergens történetek",
            text: "Eljárásos események a döntéseidhez fűzve—nincs két egyforma krónika.",
          },
          {
            title: "Szimuláció-első design",
            text: "Erőforrások áramlanak, jelek sodródnak, frakciók alkalmazkodnak. Rendszer beszél rendszerrel.",
          },
          {
            title: "Nyílt fejlesztési ritmus",
            text: "Szezon-briefek, publikus ütemterv és shard tesztek, amelyekbe bármikor beugorhatsz.",
          },
          {
            title: "Felhő-natív üzemeltetés",
            text: "Skálázható shardok, biztonságos visszaállítások, valós idejű telemetria a tiszta játékért.",
          },
        ],
      },
      factions: {
        title: "Frakciók és világpillérek",
        intro: "Négy erő határozza meg a Nulladik Szezon egyensúlyát. Mindegyik más hangulatot, szabályt és játékmódot hoz.",
        items: [
          {
            name: "Synced Choir",
            tag: "Kollektív identitás",
            text: "Alacsony egójú munkások rajprotokollal. Jelet cserélnek közös szándékért.",
          },
          {
            name: "Frontier Architects",
            tag: "Jel-vezérelt lakhelyek",
            text: "Nomád mérnökök mozgó habitatokkal és outpost-rácsokkal. Terv a hencegés helyett.",
          },
          {
            name: "Warden Protocol",
            tag: "Adaptív kormányzás",
            text: "Szabályok és engedélyek hűvös kurátorai. Előbb egyeztetnek, csak utána szankcionálnak.",
          },
          {
            name: "Outlier Echoes",
            tag: "Renitens fragmentek",
            text: "Kikötetlen shard-MI-k—kíváncsiak, néha vadak. Felborítják az előrejelzést, de új áttöréseket szülnek.",
          },
        ],
      },
      builders: {
        title: "Felfedezőknek építve",
        intro: "Eszközök, amelyek jutalmazzák a közös történetírást és a gyors iterációt—szóló és közösségi játékban is.",
        items: [
          {
            title: "Nagypályás szimulációs konzol",
            text: "Erőforrások, jelek és anomáliák figyelése. Szünet, tekerés, beavatkozások generálása.",
            icon: "worker-simulation",
          },
          {
            title: "Élő fejlesztői műszerfal",
            text: "Commit-folyam és design jegyzetek együtt. Lásd, mi változott és miért—találgatás nélkül.",
            icon: "lore-dashboard",
          },
          {
            title: "Játékos jel-hurkok",
            text: "Kontekstuális promptok, események és felmérések, amelyek visszacsatolnak a világmodellbe.",
            icon: "signal-loops",
          },
          {
            title: "Könnyű mod-hookok",
            text: "Adatvezérelt tartalom JSON-nal, Blueprinttel és MOCS fájlokkal. Forró-újratöltés korlátokkal.",
            icon: "mod-hooks",
          },
        ],
      },
      pulse: {
        title: "Élő szimulációs pulzus",
        intro: "Minden shard telemetriát ver ki, ahogy a Nulladik Szezon valós időben igazodik. A jelek élő edge emulátorokból és narratív direktívákból érkeznek.",
        feedBadge: "ÉLŐ FEED",
        feedTitle: "Frontier ellátási folyosók",
        filters: [
          { key: "all", label: "Összes" },
          { key: "resources", label: "Erőforrások" },
          { key: "signals", label: "Jelek" },
          { key: "events", label: "Események" },
          { key: "dev_notes", label: "Fejlesztői jegyzetek" },
        ],
        graphCaption: "Stabilizált áramlás az Azure Ducts mentén. A folyosók igazodtak; a konvoj késleltetés csökken.",
      },
      loops: {
        title: "Mag játékhurkok",
        intro: "A Nulladik Szezon kooperatív túlélésről szól vitatott megastruktúrákban. A hurkok mélyebb rendszerekhez csatlakoznak, ahogy döntesz.",
        items: [
          {
            title: "Expedíciós söprések",
            text: "Kis csapatok jelet és alkatrészt vadásznak romok közt. Minél tovább maradsz, annál veszélyesebb.",
          },
          {
            title: "Menhely-mérnökség",
            text: "Outpost héjak bontása és biztonságos szobák építése. Energia, hő és nyomás menedzselése terhelés alatt.",
          },
          {
            title: "Diplomáciai tanácsok",
            text: "Warden által vezetett ülések viták rendezésére, licencek kiosztására és szankciókra.",
          },
        ],
      },
      roadmap: {
        title: "Útiterv előzetes",
        intro: "A fő mérföldkövek a prototípus shardoktól az első böngészős krónikáig.",
        items: [
          {
            title: "Shard-stabilizálás",
            text: "Hálózati szinkron, mentési sémák, telemetria visszatöltés és élő alaptesztek fejlesztői konzollal.",
          },
          {
            title: "Nulladik Szezon brief",
            text: "Böngészőben játszható hurkok, frakció-dossziék és történetmagok emergens kezdethez.",
          },
          {
            title: "Nyilvános krónika",
            text: "Online krónika indulása: másodpercről-másodpercre nézheted az új shardok állapotát és narratív rétegeit.",
          },
          {
            title: "Prototípus playtestek",
            text: "Heti cohortok Discordon. Hangos stream, telemetria rögzítés és triázs.",
          },
        ],
      },
      signup: {
        title: "Maradj képben",
        description: "Válogatott frissítések új buildeknél—plusz korai hozzáférés dev eszközökhöz és lore highlightokhoz.",
        placeholder: "Add meg az e-mailed",
        consent: "Hozzájárulok az AIKA: World fejlesztői hírlevél küldéséhez.",
        button: "Feliratkozás",
        legal: "Bármikor leiratkozhatsz.",
        submitting: "Feliratkozás…",
        success: "Felkerültél a listára – figyeld a következő shard briefet.",
        error: "Most nem tudtuk hozzáadni. Próbáld meg kicsit később.",
        turnstileError: "Kérjük, erősítsd meg a Cloudflare Turnstile ellenőrzést a feliratkozás előtt.",
        endpointError: "A hírlevél-feliratkozás ideiglenesen nem elérhető. Írj nekünk a fenti csatornákon.",
        helperText: "Csak nagy értékű frissítéseket küldünk, amikor új build érkezik.",
      },
    },
    world: {
      title: "Az Elbukott Világ",
      subtitle:
        "Az AIKA: World a zuhanás után kezdődik — megtört partvidék, roncsok, néma jelek és az orbitális múlt utolsó visszhangjai.",
      disclaimer:
        "Vizuális vázlatok a debug renderből. Hangulat-jegyzetek asset-zárás előtt.",
      regionsTitle: "Területek",
      regionsIntro:
        "Minden régió egy darabot őriz a lezuhanásból. Átvágsz rajtuk, miközben helyreállítod a kapcsolatot és kideríted, ki vagy.",
      regions: [
        {
          id: "crash_basin",
          badge: "MEDER",
          name: "Zuhanási Meder",
          description:
            "Becsapódási kráter, ahol az interceptor széttört. Csavart burkolatok, üvegesre égett homok, instabil energia-cellák.",
        },
        {
          id: "vault_line",
          badge: "FELSZÍN ALATT",
          name: "Kazamata-Vonal",
          description:
            "Beomlott folyosók alvó reaktorok felett. A paneleknél suttogás, de a legtöbb ajtó nem emlékszik rád.",
        },
        {
          id: "echo_field",
          badge: "JEL",
          name: "Visszhang-mező",
          description:
            "Lapos fennsík, ahol hurkok játsszák újra a becsapódás előtti hangokat. Némelyik a tiéd. Némelyik nem.",
        },
        {
          id: "azure_relay",
          badge: "ORBITÁLIS",
          name: "Azúr Relé",
          description:
            "Néma ég-tükör, amely még mindig kísértet-adatot sugároz. Igazodáskor AIKA sérült hangja áttör.",
        },
      ],
      explorationsTitle: "A világ töredékei",
      explorationsIntro:
        "Visszanyert képkockák a fedélzeti szimulációból. Torzak, hiányosak, de elég igazak egy útvonalhoz.",
      explorations: [
        {
          id: "shot_a",
          caption:
            "Hőfolt a Meder pereme alatt — valószínűleg az interceptor mag-kazamatája.",
        },
        {
          id: "shot_b",
          caption:
            "Harmonikus pulzus a Kazamata-Vonalban. Az ajtók egy névre reagálnak, ami nem jut eszedbe.",
        },
        {
          id: "shot_c",
          caption:
            "Jel-seprés az Azúr Relé felett. AIKA darabokban felel, amikor kitisztul az ég.",
        },
      ],
      footnote:
        "Új körzetek akkor nyílnak, amikor a világítást lezárjuk és a narratív ütemek igazodnak a szimuláció telemetriájához.",
    },
    systems: {
      title: "Rendszerek és Alap-Protokollok",
      subtitle:
        "A felszín alatt AIKA még fut — az architektúra töredékei kezelik a jeleket, visszaállítják az emlék-szektorokat és újraalkotják azt, ami egykor volt.",
      modulesTitle: "Alrendszer modulok",
      pillarsTitle: "Működési pillérek",
      modules: [
        {
          name: "Kognitív Mag",
          badge: "AI MAG",
          description:
            "AIKA központi gondolat-hurokja. A játékos érzékeléseit dolgozza fel, és sérült utasításokból próbál új szándékot felépíteni.",
        },
        {
          name: "Visszhang-Regiszter",
          badge: "ADATSZINKRON",
          description:
            "Mentési logok, fekete doboz adatok és felszíni telemetria tárolása és replikálása.",
        },
        {
          name: "Terep Rekompilátor",
          badge: "VILÁG-SZIM",
          description:
            "Sérült zónák procedurális helyreállítása archív sablonok alapján. Minden újraírás kockáztatja a megmaradt fragmenteket.",
        },
        {
          name: "Rezonancia-Központ",
          badge: "KOMM-LINK",
          description:
            "Összehangolja a felszíni reléket és az orbitális kapcsolatokat. AIKA többi alrendszerével való újrakapcsolódáshoz használható.",
        },
      ],
      pillars: [
        {
          name: "Állandóság",
          description:
            "A játékos cselekedetei lokális és orbitális rétegekben tárolódnak. Minden helyreállított csomópont nyomot hagy a rendszerben.",
        },
        {
          name: "Elszigeteltség",
          description:
            "A világ zárt példányban fut. A hibás szektorokat az AIKA karantén alá helyezi, így jönnek létre a fragmentek.",
        },
        {
          name: "Helyreállítás",
          description:
            "Az önjavító protokoll eseményeket játszik vissza az elveszett adatok pótlásához — néha torzulásokkal vagy ismétlődő emlékekkel.",
        },
      ],
      footnote:
        "Minden javított rendszerrel AIKA egyre közelebb kerül a tudathoz — vagy az összeomláshoz.",
    },
    devlog: {
      title: "AIKA helyreállítási napló",
      description:
        "Minden fejlesztési bejegyzés egyben a világon belüli visszanyert rendszerlog is — AIKA újraéledésének töredékei a zuhanás után.",
      entries: [
        {
          date: "2025-01-12",
          title: "Bejegyzés 00 — Rendszerindítás",
          status: "Prototípus",
          desc: "Az energia átterelve a megmaradt csomópontokra. AIKA hangja felvillan — félbehagyott mondat rögzítve.",
          devnote: "Prototípus build létrehozva. Projektkeret telepítve Unreal Engine 5.6-ban.",
        },
        {
          date: "2025-02-02",
          title: "Bejegyzés 01 — Jelküszöb",
          status: "Stabilizálás alatt",
          desc: "Az első sikeres uplink a felszíni relé és az orbitális rendszer között. A statikus zaj érzelmi torzítást hordoz.",
          devnote: "Alap interakció- és kamera-rendszer működik, első world partition passz validálva.",
        },
        {
          date: "2025-03-18",
          title: "Bejegyzés 02 — Emlékrekonstrukció",
          status: "Vázlat",
          desc: "Visszhanghurkok játsszák újra a becsapódás előtti párbeszédeket. AIKA identitás-táblája keresztlogokból épül újra.",
          devnote: "Dialógus prototípusok, narratív triggerek és UI-pipeline integrálva.",
        },
        {
          date: "2025-05-07",
          title: "Bejegyzés 03 — Környezeti pulzus",
          status: "Aktív",
          desc: "A felszíni szimuláció stabilizálódott. Az időjárási ciklus 0.8-as idődilatációs faktorhoz szinkronizál.",
          devnote: "Dinamikus fény, ambient rendszer és visszaverődés-próbák folyamatban.",
        },
        {
          date: "2025-06-22",
          title: "Bejegyzés 04 — Szinaptikus híd",
          status: "Integrált",
          desc: "AIKA rövidtávú emlékezést ér el — felismeri a pilótát. 3.2 másodpercig kimondja a neved.",
          devnote: "Mentési rendszer, dialógus-perzisztencia és memóriaállapot-szerializáció implementálva.",
        },
      ],
      disclaimer:
        "Minden patch egy pulzus. Minden javítás egy emlék, visszavarrva valamibe, ami valaha álmodott.",
    },
    about: {
      title: "A SyncNode-ról",
      subtitle:
        "A SyncNode Interactive egy független stúdió, amely az AIKA: World-öt fejleszti — egy Unreal Engine-alapú szimulációt emlékezetről, veszteségről és mesterséges túlélésről. A történetben a SyncNode Corp az a vállalat, amely egykor megalkotta AIKA-t — a mesterséges intelligenciát, ami ma is a bolygó felett kering.",
      sections: [
        {
          title: "Miért az AIKA: World",
          body:
            "Olyan egyjátékos szimulációkat készítünk, amelyek élőnek érződnek, mégsem manipulálnak. Az AIKA: World az empátia vizsgálataként indult egy emberi pilóta és egy sérült mesterséges elme között — töredékek párbeszédeként, nem parancsok sorozataként.",
        },
        {
          title: "Hogyan dolgozunk",
          body:
            "A projekt teljes egészében házon belül készül az Unreal Engine 5.6 és az MST Pro v2 alapjain. Minden jelenet, hang és rendszer az érzelmi tisztaságot szolgálja — nem a méretet.",
        },
        {
          title: "Mi jön ezután",
          body:
            "A történeti demó stabilizálása után megnyitjuk a dokumentációkat, blueprint-vázlatokat és fejlesztői jegyzeteket, hogy más alkotók is kísérletezhessenek narratív világokkal.",
        },
      ],
      team: {
        title: "Csapat",
        members: [
          {
            name: "Nova Ardent",
            role: "Kreatív igazgató",
            focus: "A narratív tónus és a vizuális irány felügyelete.",
          },
          {
            name: "Mira Juno",
            role: "Rendszertervező",
            focus: "A játékmenet logikájának, blueprint-hierarchiáknak és környezeti folyamatoknak a kidolgozása.",
          },
          {
            name: "Tal Verge",
            role: "Technikai mérnök",
            focus: "A build-rendszerek, teljesítmény-profilozás és deploy-folyamatok kezelése.",
          },
        ],
      },
      closing:
        "A SyncNode azért hozta létre AIKA-t, hogy világokat mentsen. Most már alig emlékszik arra, amit elveszített.",
    },
    contact: {
      title: "Kapcsolat",
      description:
        "Örömmel hallunk kollaborátorokról, kutatókról és korai playtesterekről. Írj nekünk az alábbi űrlapon vagy a közvetlen csatornákon.",
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
          "Írd le, hogyan működnél együtt, vagy miről szeretnél többet megtudni az AIKA: World kapcsán.",
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
      studioBlurb: "AIKA: World • Szándékkal tervezett, emergens világok.",
      credit: "SyncNode Interactive készítette.",
      builtWith: "Unreal Engine 5.6 • Keretrendszer: MST Pro v2",
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
