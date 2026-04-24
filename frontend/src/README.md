# AIKA World — Vue UI Redesign

## Fájlok elhelyezése

```
frontend/src/
├── App.vue                                    ← vue-output/App.vue
├── views/
│   └── GameView.vue                           ← vue-output/views/GameView.vue
└── components/
    ├── PlanetCanvas.vue                       ← vue-output/components/PlanetCanvas.vue
    ├── BuildingIllustration.vue               ← vue-output/components/BuildingIllustration.vue
    ├── BuildingAnim.vue                       ← vue-output/components/BuildingAnim.vue
    ├── AnimCounter.vue                        ← vue-output/components/AnimCounter.vue
    └── views/
        ├── OverviewView.vue                   ← vue-output/components/views/OverviewView.vue
        └── BuildingsView.vue                  ← vue-output/components/views/BuildingsView.vue
```

## Szükséges Google Fonts (index.html-be)

```html
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Space+Mono:wght@400;700&family=Exo+2:wght@300;400;500;600&display=swap" rel="stylesheet" />
```

## Megjegyzések

- **App.vue** — csak a CSS változott (új design tokenek, finomított paletta). A script logika változatlan.
- **GameView.vue** — script 100%-ig változatlan (minden store, timer, logika megmarad). Csak template + style cserélődött.
- **OverviewView.vue** — új `PlanetCanvas` + `AnimCounter` komponensek beépítve. Az API hívások (missions, quests, AIKA chat) változatlanok.
- **BuildingsView.vue** — `BuildingIllustration` + `BuildingAnim` rétegek a kártyákon. A `game.upgradeBuilding()` hívás változatlan.
- **PlanetCanvas.vue** — canvas-alapú animált bolygó, keringő szatelittel.
- **BuildingIllustration.vue** — épület-specifikus sci-fi architektúra rajz (8 típus).
- **BuildingAnim.vue** — animációs overlay (scan, particles, electric arcs stb.) típusonként.
- **AnimCounter.vue** — smooth count-up animáció erőforrás értékekhez.

## CSS változók (App.vue)

Az accent szín `#1ac8e8` lett (volt: `#00c8ff`) — hidegebb, kevésbé neon.
Space Mono font adva numerikus értékekhez.
Orbitron megmaradt headingekhez/labelekhez.
