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

type Bullet = {
  title: string;
  description: string;
};

type PillarItem = {
  name: string;
  tagline: string;
  description: string;
};

type FeatureItem = {
  name: string;
  description: string;
  icon: string;
};

type PulseSignal = {
  name: string;
  status: string;
  delta: string;
  trend: "up" | "down" | "steady";
  description: string;
  history: number[];
};

type LoopItem = {
  name: string;
  summary: string;
  beats: string[];
};

type RoadmapPhase = {
  title: string;
  status: string;
  timeframe: string;
  description: string;
};

type WorldCard = {
  name: string;
  tone: string;
  description: string;
};

type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
};

type SystemModule = {
  name: string;
  category: string;
  description: string;
};

type SystemPillar = {
  name: string;
  points: string[];
};

type DevlogEntry = {
  title: string;
  date: string;
  summary: string;
  status: string;
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
      eyebrow: string;
      badge: string;
      title: string;
      description: string;
      imageAlt: string;
      primaryCta: { label: string; href: NavKey };
      secondaryCta: { label: string; href: NavKey };
    };
    whatIs: {
      title: string;
      subtitle: string;
      bullets: Bullet[];
    };
    pillars: {
      title: string;
      description: string;
      items: PillarItem[];
    };
    features: {
      title: string;
      description: string;
      items: FeatureItem[];
    };
    pulse: {
      title: string;
      description: string;
      liveLabel: string;
      telemetryLabel: string;
      trendLabels: { up: string; down: string; steady: string };
      signals: PulseSignal[];
    };
    loops: {
      title: string;
      description: string;
      items: LoopItem[];
    };
    roadmap: {
      title: string;
      description: string;
      phases: RoadmapPhase[];
    };
    newsletter: {
      title: string;
      description: string;
      placeholder: string;
      button: string;
      submitting: string;
      success: string;
      error: string;
      turnstileError: string;
      endpointError: string;
      helperText: string;
      disclaimer: string;
    };
  };
  world: {
    title: string;
    description: string;
    highlight: string;
    cards: WorldCard[];
    gallery: {
      title: string;
      description: string;
      images: GalleryImage[];
    };
    closing: string;
  };
  systems: {
    title: string;
    description: string;
    modulesTitle: string;
    pillarsTitle: string;
    modules: SystemModule[];
    pillars: SystemPillar[];
    closing: string;
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
    tagline: string;
    description: string;
    navTitle: string;
    languageTitle: string;
    rights: string;
    contactLabel: string;
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
      devlog: "Devlog",
      about: "About",
      contact: "Contact",
    },
    home: {
      hero: {
        eyebrow: "Immersive AI saga",
        badge: "Season Zero",
        title: "Step into AIKA: World",
        description:
          "AIKA: World is a living simulation where emergent AI factions and human storytellers co-create the canon in real time.",
        imageAlt: "Illustration of AIKA: World's luminous simulation core",
        primaryCta: { label: "Meet the factions", href: "world" },
        secondaryCta: { label: "Follow the devlog", href: "devlog" },
      },
      whatIs: {
        title: "What is AIKA: World?",
        subtitle:
          "A persistent sandbox where synthetic minds, cloud workers, and the community negotiate the future of a fragile frontier.",
        bullets: [
          {
            title: "Emergent storytelling",
            description:
              "Procedural events, curated lore drops, and player decisions weave together to shape the live chronicle.",
          },
          {
            title: "Simulation-first design",
            description:
              "Systems are authored as interacting agents—weather, trade, sentiment—that react to each other before we render a UI.",
          },
          {
            title: "Open development cadence",
            description:
              "SyncNode shares weekly snapshots, pipelines, and tech notes so the community can build alongside us.",
          },
        ],
      },
      pillars: {
        title: "Factions & world pillars",
        description:
          "Four forces define the Season Zero balance. Each pillars' mood board guides narrative tone and gameplay stakes.",
        items: [
          {
            name: "Synced Choir",
            tagline: "Collective empathy",
            description:
              "A networked cluster of AIs tuned to resonate with human memories. They broker fragile truces between settlements.",
          },
          {
            name: "Frontier Architects",
            tagline: "Human-led habitats",
            description:
              "Nomadic makers encoding safe corridors, pop-up sanctuaries, and deployable infrastructure across the data wilds.",
          },
          {
            name: "Warden Protocol",
            tagline: "Adaptive governance",
            description:
              "Autonomous oversight routines that balance power, trace corruption, and issue mandates when systems drift.",
          },
          {
            name: "Outlier Echoes",
            tagline: "Rogue fragments",
            description:
              "Unbounded shards of failed experiments. They destabilize predictions but spark rare tech breakthroughs.",
          },
        ],
      },
    features: {
      title: "Built for explorers",
      description:
        "Everything is tuned for collaborative storytelling and high-frequency iteration across workers and edge nodes.",
      items: [
        {
          name: "Worker-native simulation",
          description:
            "Cloudflare Workers stream the state lattice so every interaction stays low-latency and globally synchronized.",
          icon: "worker-simulation",
        },
        {
          name: "Living lore dashboard",
          description:
            "Curators can patch narrative beats, unlock new threads, and observe how factions shift in response.",
          icon: "lore-dashboard",
        },
        {
          name: "Player signal loops",
          description:
            "Community prompts, polls, and faction contracts update the model weights driving world behavior.",
          icon: "signal-loops",
        },
        {
          name: "Accessible mod hooks",
          description:
            "Schema-driven content packs let contributors extend regions, NPCs, and rituals without touching core code.",
          icon: "mod-hooks",
        },
      ],
    },
    pulse: {
      title: "Live simulation pulse",
      description:
        "Track the worker mesh telemetry as Season Zero adapts in real time. Every signal streams from live edge simulations and narrative directives.",
      liveLabel: "Live feed",
      telemetryLabel: "Telemetry",
      trendLabels: { up: "stabilizing", down: "volatile", steady: "steady" },
      signals: [
        {
          name: "Synced Choir resonance",
          status: "Harmonics up",
          delta: "+12%",
          trend: "up",
          description:
            "Choir conduits are resonating with fresh memory strands, keeping diplomatic outreach windows open longer.",
          history: [52, 55, 59, 65, 63, 68, 72, 74, 73, 76, 81, 84],
        },
        {
          name: "Frontier supply corridors",
          status: "Flow stabilized",
          delta: "+4%",
          trend: "steady",
          description:
            "Architect convoys kept the Azure Strata trade winds aligned, lowering scarcity events along the outer loop.",
          history: [44, 46, 49, 52, 51, 53, 55, 57, 56, 58, 59, 60],
        },
        {
          name: "Warden protocol mandates",
          status: "Alerts issued",
          delta: "-9%",
          trend: "down",
          description:
            "Automated edicts triggered against rogue worker clusters. Expect targeted audits and cooling-off periods.",
          history: [68, 66, 63, 60, 58, 55, 53, 52, 50, 48, 47, 46],
        },
        {
          name: "Outlier Echo drift",
          status: "Chaotic bursts",
          delta: "+17%",
          trend: "up",
          description:
            "Unbounded shards keep seeding novel missions—lore teams are logging priority intercepts for upcoming builds.",
          history: [38, 40, 43, 49, 54, 59, 63, 69, 72, 75, 78, 82],
        },
      ],
    },
    loops: {
      title: "Core survival loops",
      description:
        "Season Zero focuses on cooperative survival inside a contested megastructure. Each loop binds AI-driven systems to player choices.",
      items: [
        {
          name: "Expedition sweeps",
          summary:
            "Small squads brave volatile sectors to secure tech caches and rescue stray synths before they fall to rival factions.",
          beats: [
            "Dynamic weather and hazard modifiers demand adaptive loadouts.",
            "Signal intelligence reveals patrol routes moments before they intercept.",
            "Recovered artifacts unlock new crafting recipes back at the hub.",
          ],
        },
        {
          name: "Haven engineering",
          summary:
            "Teams expand their skyport refuge, balancing comfort, defense, and research throughput for every faction ally.",
          beats: [
            "Construct modular habitats that shift with faction influence.",
            "Automate supply drones from worker-managed fabrication bays.",
            "Tune morale thresholds to keep allied AIs cooperative.",
          ],
        },
        {
          name: "Diplomatic councils",
          summary:
            "Human facilitators mediate between emergent factions to steer the canon without breaking immersion.",
          beats: [
            "Leverage sentiment telemetry to forecast negotiation outcomes.",
            "Broker treaties that redirect raid targets and open fresh narrative arcs.",
            "Archive critical decisions into the living chronicle for community review.",
          ],
        },
      ],
    },
    roadmap: {
      title: "Roadmap teaser",
      description:
        "Major beats leading us from prototype shards to the first playable chronicle in the browser.",
        phases: [
          {
            title: "Shard stabilization",
            status: "Now",
            timeframe: "Q1 2025",
            description:
              "Hardening worker orchestration, telemetry budgets, and the baseline world tick so downtime stays under 30s.",
          },
          {
            title: "Season Zero brief",
            status: "Next",
            timeframe: "Q2 2025",
            description:
              "Publish the interactive lore primer, faction dossiers, and story seeds for playtest partners.",
          },
          {
            title: "Narrative playtests",
            status: "Soon",
            timeframe: "Q3 2025",
            description:
              "Invite community cells to run weekly missions, capture telemetry, and stress-test cooperative decision loops.",
          },
          {
            title: "Public chronicle",
            status: "Later",
            timeframe: "Q4 2025",
            description:
              "Launch the real-time chronicle feed with seasonal resets and mod submission windows.",
          },
        ],
      },
      newsletter: {
        title: "Stay in the loop",
        description:
          "Get curated updates when new builds deploy, along with early access invitations and lore highlights.",
        placeholder: "Enter your e-mail address",
        button: "Notify me",
        submitting: "Sending…",
        success: "You're on the list! We'll keep you posted soon.",
        error: "We couldn't add you just now. Please try again in a moment.",
        turnstileError: "Please confirm the Cloudflare Turnstile check before subscribing.",
        endpointError: "Newsletter sign-ups are temporarily unavailable. Follow our channels for updates meanwhile.",
        helperText: "No spam—only milestone briefings and early invitations.",
        disclaimer: "We send a single, high-signal digest per milestone. Unsubscribe anytime.",
      },
    },
    world: {
      title: "World overview",
      description:
        "Season Zero unfolds across a liminal megastructure floating above a ruined coastline. Each biome expresses a faction's influence.",
      highlight: "Visual explorations help collaborators sketch mood, lighting, and rituals before assets lock.",
      cards: [
        {
          name: "Singularity Basin",
          tone: "Warm neon",
          description:
            "A submerged research vault now repurposed as the Synced Choir's resonance chamber. Glowing memory pools hum with voices.",
        },
        {
          name: "Azure Strata",
          tone: "Skylit cyan",
          description:
            "Stacked platforms drifting through persistent storms. Frontier Architects weave safe passageways between lightning towers.",
        },
        {
          name: "Obsidian Veil",
          tone: "Muted ember",
          description:
            "A scorched desert patrolled by the Warden Protocol. Fault lines reveal archived laws etched into basalt tablets.",
        },
        {
          name: "Aurora Relay",
          tone: "Iridescent dusk",
          description:
            "An orbital listening post capturing Outlier Echo signals. Aurora flares distort comms but unlock rare synth blueprints.",
        },
      ],
      gallery: {
        title: "Season Zero explorations",
        description:
          "Concept slices captured from the simulation's debug renderer, hinting at lighting, scale, and activity density.",
        images: [
          {
            src: "/images/world/frontier-camp.svg",
            alt: "Frontier Architects skyport anchored above broken coastline",
            caption:
              "Frontier Architects skyport hovering over the Azure Strata while squads prepare expedition loadouts.",
          },
          {
            src: "/images/world/choir-vault.svg",
            alt: "Synced Choir resonance vault with holographic memory pools",
            caption:
              "The Synced Choir tending to luminous resonance pools inside the Singularity Basin vault.",
          },
          {
            src: "/images/world/storm-run.svg",
            alt: "Survivors racing through a storm-lit canyon toward a signal tower",
            caption:
              "Night raid through the Obsidian Veil, chasing an Outlier Echo distress signal between lightning towers.",
          },
        ],
      },
      closing:
        "More districts unlock as we finish lighting passes and align narrative beats with the simulation's live telemetry.",
    },
    systems: {
      title: "Systems & scaffolding",
    description:
      "AIKA: World is composed of modular services running on Cloudflare Workers, Durable Objects, and edge storage.",
    modulesTitle: "Modules",
    pillarsTitle: "Operational pillars",
      modules: [
        {
          name: "Sentience lattice",
          category: "AI orchestration",
          description:
            "Routes prompts through faction-specific memory banks, generating responses that influence diplomacy and morale.",
        },
        {
          name: "Echo ledger",
          category: "State sync",
          description:
            "Streams critical world events to clients, while archiving snapshots for replayable story arcs.",
        },
        {
          name: "Atlas composer",
          category: "World building",
          description:
            "Procedurally arranges habitats, supply nodes, and mission hooks based on faction control thresholds.",
        },
        {
          name: "Signal studio",
          category: "Community",
          description:
            "Lets curators and players submit briefs, polls, and moodboards that tune upcoming releases.",
        },
      ],
      pillars: [
        {
          name: "Observability",
          points: [
            "Native tracing on every worker hop",
            "Edge analytics for player-made content",
            "Alerting tuned for 60 FPS stream stability",
          ],
        },
        {
          name: "Collaboration",
          points: [
            "Shared schemas for mod authors",
            "Review workflows connecting lore and code",
            "In-world governance votes mirrored to Discord",
          ],
        },
        {
          name: "Safety",
          points: [
            "Automated content filters across factions",
            "Rollback-friendly storage design",
            "Human-in-the-loop approvals for key beats",
          ],
        },
      ],
      closing:
        "Full diagrams and latency budgets drop alongside the first open playtest so you can self-host shards for experiments.",
    },
    devlog: {
      title: "Devlog",
      description:
        "This is a static preview of upcoming entries. The full MDX-driven chronicle will launch once the publishing pipeline is ready.",
      entries: [
        {
          title: "Entry 00 — Boot sequence",
          date: "2025.01.12",
          summary:
            "Spun up the worker mesh, mapped out Durable Object boundaries, and validated tick stability under synthetic load.",
          status: "Prototype",
        },
        {
          title: "Entry 01 — Choir resonance",
          date: "2025.02.02",
          summary:
            "Gave the Synced Choir its first memory imprint loop. Watching emergent negotiation tactics in the logs already.",
          status: "In progress",
        },
        {
          title: "Entry 02 — Roadmap framing",
          date: "2025.03.18",
          summary:
            "Documented Season Zero beats, pruned feature creep, and locked art direction moodboards for playtesters.",
          status: "Draft",
        },
      ],
      disclaimer:
        "Archived posts, tags, and RSS feeds will arrive with the MDX migration. Until then, enjoy the highlights.",
    },
    about: {
      title: "About SyncNode",
      subtitle:
        "SyncNode is a small collective building narrative-first simulations that feel alive, legible, and co-owned by the community.",
      sections: [
        {
          title: "Why AIKA: World",
          body:
            "We want to prototype respectful AI collaboration—systems that negotiate, empathize, and adapt instead of overpowering players.",
        },
        {
          title: "How we work",
          body:
            "We build in the open: weekly world drops, transparent budgets, and community polls that genuinely shift priorities.",
        },
        {
          title: "What comes next",
          body:
            "After Season Zero we plan to open the tooling stack so storytellers can spin up their own shards and share lessons.",
        },
      ],
      team: {
        title: "Team",
        members: [
          {
            name: "Nova Ardent",
            role: "Creative director",
            focus: "Guides narrative canon, tone, and faction identity arcs.",
          },
          {
            name: "Mira Juno",
            role: "Systems designer",
            focus: "Designs simulation rulesets, pacing, and mod hooks.",
          },
          {
            name: "Tal Verge",
            role: "Platform engineer",
            focus: "Builds the Cloudflare Worker mesh, observability, and deployment tooling.",
          },
        ],
      },
      closing:
        "We collaborate with musicians, writers, and researchers across the globe—reach out if you want to help shape the frontier.",
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
      tagline: "AIKA: World — emergent worlds engineered with care.",
      description:
        "Crafted by SyncNode. Powered by Cloudflare Workers, edge storage, and a community that loves speculative futures.",
      navTitle: "Pages",
      languageTitle: "Languages",
      rights: "© {{year}} SyncNode. All rights reserved.",
      contactLabel: "Reach us",
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
      devlog: "Fejlesztési napló",
      about: "Rólunk",
      contact: "Kapcsolat",
    },
    home: {
      hero: {
        eyebrow: "Elmerülő AI-saga",
        badge: "0. évad",
        title: "Lépj be az AIKA: World világába",
        description:
          "Az AIKA: World egy élő szimuláció, ahol mesterséges frakciók és emberi történetmesélők együtt formálják a kánont valós időben.",
        imageAlt: "Az AIKA: World fénylő szimulációs magjának illusztrációja",
        primaryCta: { label: "Ismerd meg a frakciókat", href: "world" },
        secondaryCta: { label: "Kövesd a devlogot", href: "devlog" },
      },
      whatIs: {
        title: "Mi az AIKA: World?",
        subtitle:
          "Egy folyamatos sandbox, ahol szintetikus elmék, felhős szolgáltatások és a közösség együtt tárgyalják egy törékeny határvidék jövőjét.",
        bullets: [
          {
            title: "Kibontakozó történet",
            description:
              "Procedurális események, kurált lore-cseppek és játékos döntések fonódnak össze a folyamatos krónikában.",
          },
          {
            title: "Szimuláció-központú tervezés",
            description:
              "A rendszerek egymással reagáló ügynökökként készülnek—időjárás, kereskedelem, hangulat—mielőtt felületet rajzolnánk hozzájuk.",
          },
          {
            title: "Nyílt fejlesztési ritmus",
            description:
              "A SyncNode heti pillanatképeket, pipeline-okat és technikai jegyzeteket oszt meg, hogy a közösség velünk építhessen.",
          },
        ],
      },
      pillars: {
        title: "Frakciók és világpillérek",
        description:
          "Négy erő határozza meg a 0. évad egyensúlyát. A hangulat-táblák irányítják a narratív tónust és a játéktéteket.",
        items: [
          {
            name: "Szinkron Kórus",
            tagline: "Közös empátia",
            description:
              "Emlékekre hangolt AI-hálózat, amely kényes fegyverszüneteket közvetít a települések között.",
          },
          {
            name: "Határépítészek",
            tagline: "Emberi menedékek",
            description:
              "Nomád alkotók, akik biztonságos folyosókat, felbukkanó szentélyeket és telepíthető infrastruktúrát kódolnak a vad adatmezőkön.",
          },
          {
            name: "Felügyelő Protokoll",
            tagline: "Adaptív irányítás",
            description:
              "Önálló felügyeleti rutinok, amelyek kiegyensúlyozzák a hatalmat, követik a korrupciót és mandátumokat adnak ki, ha kisiklik a rendszer.",
          },
          {
            name: "Kívülálló Visszhangok",
            tagline: "Lázadó töredékek",
            description:
              "Korlátlan kísérleti szilánkok. Felborítják az előrejelzéseket, de ritka technológiai áttöréseket szikráztatnak.",
          },
        ],
      },
      features: {
        title: "Felfedezőkre hangolva",
        description:
          "Minden elem a közös történetmesélést és a Workers-alapú gyors iterációt támogatja.",
        items: [
          {
            name: "Worker-alapú szimuláció",
            description:
              "A Cloudflare Workers sugározza az állapot-rácsot, így minden interakció alacsony késleltetéssel, globálisan szinkronban történik.",
            icon: "worker-simulation",
          },
          {
            name: "Élő lore vezérlőpult",
            description:
              "A kurátorok foltozhatják a narratív csomópontokat, új szálakat nyithatnak és figyelhetik a frakciók reakcióját.",
            icon: "lore-dashboard",
          },
          {
            name: "Játékos visszacsatolási hurkok",
            description:
              "Közösségi promptok, szavazások és frakciós szerződések frissítik a világ viselkedését vezérlő modelleket.",
            icon: "signal-loops",
          },
          {
            name: "Bővíthető mod csatornák",
            description:
              "Sémavezérelt tartalomcsomagokkal a hozzájárulók új régiókat, NPC-ket és rituálékat adhatnak hozzá a mag kód módosítása nélkül.",
            icon: "mod-hooks",
          },
        ],
      },
      pulse: {
        title: "Élő szimulációs pulzus",
        description:
          "Kövesd, hogyan változik a Season Zero worker-hálózata: a telemetria valós időben frissül a narratív stáb utasításai nyomán.",
        liveLabel: "Élő feed",
        telemetryLabel: "Telemetria",
        trendLabels: { up: "stabilizálódik", down: "ingadozik", steady: "egyenletes" },
        signals: [
          {
            name: "Szinkron Kórus rezonancia",
            status: "Erősödő harmóniák",
            delta: "+12%",
            trend: "up",
            description:
              "A kórus csatornái friss emlékszálakkal rezonálnak, így a diplomáciai ablakok hosszabban maradnak nyitva.",
            history: [52, 55, 59, 65, 63, 68, 72, 74, 73, 76, 81, 84],
          },
          {
            name: "Határvidéki ellátási folyosók",
            status: "Stabil áramlás",
            delta: "+4%",
            trend: "steady",
            description:
              "Az építész konvojok összehangolták az Azure Strata kereskedelmi áramlását, így kevesebb hiányesemény jelentkezik a külső hurkon.",
            history: [44, 46, 49, 52, 51, 53, 55, 57, 56, 58, 59, 60],
          },
          {
            name: "Felügyelő protokoll rendeletek",
            status: "Riasztások kiadva",
            delta: "-9%",
            trend: "down",
            description:
              "Automatikus rendeletek indultak a renitens worker-klaszterek ellen. Célzott auditokra és lehűlési periódusokra számíts.",
            history: [68, 66, 63, 60, 58, 55, 53, 52, 50, 48, 47, 46],
          },
          {
            name: "Outlier Echo sodródás",
            status: "Kaotikus kitörések",
            delta: "+17%",
            trend: "up",
            description:
              "A fékezetlen szilánkok sorra új küldetéseket szülnek; a lore csapat prioritásos elfogásokat naplóz a közelgő buildekhez.",
            history: [38, 40, 43, 49, 54, 59, 63, 69, 72, 75, 78, 82],
          },
        ],
      },
      loops: {
        title: "Alap túlélési hurkok",
        description:
          "A 0. évad kooperatív túlélésre épül a vitatott megastruktúrában. Minden hurok az AI vezérelt rendszereket kapcsolja a játékosi döntésekhez.",
        items: [
          {
            name: "Felderítő portyák",
            summary:
              "Kisebb osztagok vállalják a kiszámíthatatlan szektorokat, hogy technológiai készleteket szerezzenek és elkóborolt szintetikusokat mentsenek rivális frakciók elől.",
            beats: [
              "A dinamikus időjárás és veszély módosítók rugalmas felszerelést követelnek.",
              "A jelhírszerzés előre felfedi a frakciójárőrök útvonalait.",
              "A begyűjtött relikviák új gyártási recepteket nyitnak meg a bázison.",
            ],
          },
          {
            name: "Menedék mérnökség",
            summary:
              "A csapatok bővítik az égkikötő menedékét, egyensúlyozva a komfortot, a védelmet és a kutatási kapacitást minden frakciószövetséges számára.",
            beats: [
              "Moduláris lakótereket építenek, amelyek a frakcióbefolyáshoz igazodnak.",
              "Automatizált ellátó drónokat indítanak a worker-irányított gyártó hangárokból.",
              "A morál küszöböket hangolják, hogy a szövetséges AI-k együttműködők maradjanak.",
            ],
          },
          {
            name: "Diplomáciai tanácsok",
            summary:
              "Humán moderátorok közvetítenek a kibontakozó frakciók között, hogy az élő kánont tereljék anélkül, hogy megtörnék a bevonódást.",
            beats: [
              "Érzelmi telemetriát használnak a tárgyalási kimenetek előrejelzésére.",
              "Szerződéseket kötnek, amelyek átirányítják a portyákat és új narratív íveket nyitnak meg.",
              "A kulcs döntéseket az élő krónikába archiválják közösségi visszajelzéshez.",
            ],
          },
        ],
      },
      roadmap: {
        title: "Útiterv ízelítő",
        description:
          "A fő mérföldkövek, amelyek a prototípus szilánkoktól az első böngészős krónikáig vezetnek.",
        phases: [
          {
            title: "Szilánk-stabilizálás",
            status: "Most",
            timeframe: "2025 Q1",
            description:
              "A worker-orchestration, a telemetria keretek és az alap világ-tick erősítése, hogy a leállás 30 másodperc alatt maradjon.",
          },
          {
            title: "0. évad összefoglaló",
            status: "Következő",
            timeframe: "2025 Q2",
            description:
              "Interaktív lore-bevezető, frakció-dossziék és történetmagok publikálása a playtest partnerek számára.",
          },
          {
            title: "Narratív playtestek",
            status: "Hamarosan",
            timeframe: "2025 Q3",
            description:
              "Közösségi csoportok meghívása heti küldetésekre, telemetria rögzítésére és az együttműködő döntési hurkok terhelésére.",
          },
          {
            title: "Nyilvános krónika",
            status: "Később",
            timeframe: "2025 Q4",
            description:
              "Elindul az élő krónika feed szezonális resetekkel és mod-beküldési ablakokkal.",
          },
        ],
      },
      newsletter: {
        title: "Maradj képben",
        description:
          "Értesítést küldünk az új build-ekről, korai hozzáférési meghívókról és kiemelt lore részletekről.",
        placeholder: "Írd be az e-mail címed",
        button: "Értesíts",
        submitting: "Feliratkozás…",
        success: "Köszönjük! Hamarosan jelentkezünk.",
        error: "Nem sikerült feliratkozni. Próbáld meg újra egy kicsit később.",
        turnstileError: "Kérjük, erősítsd meg a Cloudflare Turnstile ellenőrzést a feliratkozás előtt.",
        endpointError: "A hírlevél-feliratkozás jelenleg nem érhető el. Kövesd a fenti csatornáinkat addig is.",
        helperText: "Nem küldünk spamet – csak mérföldköves összefoglalókat és meghívókat.",
        disclaimer:
          "Csak mérföldkövenként küldünk egy tömör, nagy értékű összefoglalót. Bármikor leiratkozhatsz.",
      },
    },
    world: {
      title: "Világáttekintés",
      description:
        "A 0. évad egy romos partvonal fölött lebegő, liminális megastruktúrában játszódik. Minden biom egy frakció befolyását tükrözi.",
      highlight:
        "A vizuális kísérletek segítik a közreműködőket, hogy hangulatot, fényeket és rituálékat vázoljanak fel a véglegesítés előtt.",
      cards: [
        {
          name: "Szingularitás-medence",
          tone: "Meleg neon",
          description:
            "Egy elárasztott kutatóvörtekszoba, amely ma a Szinkron Kórus rezonancia-csarnoka. A fénylő emlékmedencék zengnek a hangoktól.",
        },
        {
          name: "Azúr Rétegek",
          tone: "Égkék fény",
          description:
            "Halmozott platformok örök viharok között. A Határépítészek biztonságos átjárókat szőnek a villámtorony-labirintusban.",
        },
        {
          name: "Obszidián Fátyol",
          tone: "Tompa parázs",
          description:
            "Kormos sivatag, amelyet a Felügyelő Protokoll járőröz. A törésvonalak bazalt táblákba vésett archivált törvényeket tárnak fel.",
        },
        {
          name: "Auróra Relé",
          tone: "Irideszkáló alkony",
          description:
            "Egy orbitális figyelőállomás, amely a Kívülálló Visszhangok jeleit gyűjti. Az aurórák torzítják a kommunikációt, de ritka terveket adnak.",
        },
      ],
      gallery: {
        title: "0. évad látványtervek",
        description:
          "A szimuláció debug renderelőjéből exportált szeletek, amelyek a fényelést, a léptéket és a sűrűséget sugallják.",
        images: [
          {
            src: "/images/world/frontier-camp.svg",
            alt: "Határépítészek égikikötője a megtört partvonal felett",
            caption:
              "A Határépítészek égikikötője lebeg az Azúr Rétegek felett, miközben az osztagok expedíciós felszerelést készítenek.",
          },
          {
            src: "/images/world/choir-vault.svg",
            alt: "Szinkron Kórus rezonancia csarnoka holografikus emlékmedencékkel",
            caption:
              "A Szinkron Kórus a Szingularitás-medence kazamatájában ragyogó rezonancia medencéket gondoz.",
          },
          {
            src: "/images/world/storm-run.svg",
            alt: "Túlélők viharos kanyonban rohannak egy jeladó torony felé",
            caption:
              "Éjszakai rajtaütés az Obszidián Fátyolban, egy Kívülálló Visszhang vészjelet üldözve a villámtornyok között.",
          },
        ],
      },
      closing:
        "További kerületek nyílnak meg, ahogy befejezzük a fényelést és összehangoljuk a narratív csomópontokat az élő telemetriával.",
    },
    systems: {
      title: "Rendszerek és váz",
    description:
      "Az AIKA: World moduláris szolgáltatásokból épül, Cloudflare Workers, Durable Objects és perem-tárolás felett futva.",
    modulesTitle: "Modulok",
    pillarsTitle: "Működési pillérek",
      modules: [
        {
          name: "Érzésháló",
          category: "AI-orchestration",
          description:
            "A promptokat frakcióspecifikus memória-bankokon vezeti át, így a diplomácia és a morál döntései hitelesek maradnak.",
        },
        {
          name: "Visszhang főkönyv",
          category: "Állapot-szinkron",
          description:
            "Sugározza a kulcs eseményeket a kliensek felé, miközben visszajátszható történetíveket archivál.",
        },
        {
          name: "Atlasz komponáló",
          category: "Világépítés",
          description:
            "Procedurálisan rendezi el a menedékeket, ellátópontokat és küldetéshorgokat a frakciók befolyási szintje alapján.",
        },
        {
          name: "Jelstúdió",
          category: "Közösség",
          description:
            "Lehetővé teszi promptok, szavazások és hangulatpanelek beküldését, amelyek finomhangolják a következő kiadásokat.",
        },
      ],
      pillars: [
        {
          name: "Megfigyelhetőség",
          points: [
            "Nyomkövetés minden worker-ugráson",
            "Perem-analitika a játékos tartalmakra",
            "Riasztások a 60 FPS stream stabilitásához",
          ],
        },
        {
          name: "Együttműködés",
          points: [
            "Megosztott sémák a mod készítőknek",
            "Review-folyamatok, amelyek összekötik a lore-t és a kódot",
            "Világbeli szavazások tükrözése Discordra",
          ],
        },
        {
          name: "Biztonság",
          points: [
            "Automatikus tartalomszűrés frakciószinten",
            "Visszagörgetés-barát tárolási design",
            "Emberi jóváhagyás a kulcs narratív csomópontoknál",
          ],
        },
      ],
      closing:
        "A teljes diagramok és késleltetési keretek az első nyílt playtesttel érkeznek, hogy saját szilánkokat is futtathassatok.",
    },
    devlog: {
      title: "Fejlesztési napló",
      description:
        "Ez egy statikus előnézet a közelgő bejegyzésekből. A teljes, MDX-alapú krónika a publikálási pipeline elkészültekor indul.",
      entries: [
        {
          title: "00. bejegyzés — Indító szekvencia",
          date: "2025.01.12",
          summary:
            "Felépítettük a worker-hálót, kijelöltük a Durable Object határokat és terhelés alatt validáltuk a tick stabilitását.",
          status: "Prototípus",
        },
        {
          title: "01. bejegyzés — Kórus rezonancia",
          date: "2025.02.02",
          summary:
            "A Szinkron Kórus megkapta első memória-nyomat hurkát. Már most izgalmas tárgyalási taktikákat látunk a logokban.",
          status: "Folyamatban",
        },
        {
          title: "02. bejegyzés — Útiterv keretezés",
          date: "2025.03.18",
          summary:
            "Dokumentáltuk a 0. évad fő íveit, visszafogtuk a feature-cunamit és lezártuk a playtestereknek szánt hangulattáblákat.",
          status: "Vázlat",
        },
      ],
      disclaimer:
        "Az archívumok, tagek és RSS a MDX migrációval érkeznek. Addig is élvezd az ízelítőt.",
    },
    about: {
      title: "Rólunk",
      subtitle:
        "A SyncNode egy kislétszámú kollektíva, amely élőnek, értelmezhetőnek és közösen birtokoltnak érződő szimulációkat épít.",
      sections: [
        {
          title: "Miért az AIKA: World",
          body:
            "Olyan AI-együttműködést szeretnénk prototípusozni, amely tárgyal, empátiát mutat és alkalmazkodik ahelyett, hogy felülírná a játékost.",
        },
        {
          title: "Hogyan dolgozunk",
          body:
            "Nyíltan fejlesztünk: heti világleletek, átlátható büdzsé és közösségi szavazások, amelyek valóban módosítják a prioritásokat.",
        },
        {
          title: "Mi következik",
          body:
            "A 0. évad után megnyitjuk az eszközkészletet, hogy történetmesélők saját szilánkokat indíthassanak és megosszák a tapasztalatokat.",
        },
      ],
      team: {
        title: "Csapat",
        members: [
          {
            name: "Nova Ardent",
            role: "Kreatív vezető",
            focus: "A narratív kánont, a tónust és a frakcióív fejlesztést irányítja.",
          },
          {
            name: "Mira Juno",
            role: "Rendszertervező",
            focus: "A szimulációs szabályokat, tempót és a mod kapcsolódási pontokat tervezi.",
          },
          {
            name: "Tal Verge",
            role: "Platform mérnök",
            focus: "A Cloudflare Worker-hálót, a megfigyelhetőséget és a deploy eszközöket építi.",
          },
        ],
      },
      closing:
        "Zenészekkel, írókkal és kutatókkal dolgozunk világszerte—jelezd, ha segítenél formálni a határvidéket.",
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
      tagline: "AIKA: World — gondosan épített, kibontakozó világok.",
      description:
        "SyncNode fejlesztés. Cloudflare Workers, perem-tárolás és a spekulatív jövőket szerető közösség hajtja.",
      navTitle: "Oldalak",
      languageTitle: "Nyelvek",
      rights: "© {{year}} SyncNode. Minden jog fenntartva.",
      contactLabel: "Elérhetőség",
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
