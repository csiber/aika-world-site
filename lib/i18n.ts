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
      devlog: "Devlog",
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
      devlog: "Fejlesztési napló",
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
