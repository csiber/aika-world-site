# AIKA World v3.0.0 — Full-Stack Cloudflare Workers + Vue 3 + D1 (STRATEGIC)

**AIKA World** is a modern, real-time galactic strategy game built on the Cloudflare ecosystem (Workers, D1, Assets) using Vue 3.

## Key Improvements (v3.0.0)
- **🌑 Hold Rendszer (Moons)**: Nagy csaták után esély nyílik hold kialakulására, amely saját épületekkel és taktikai lehetőségekkel bővíti a birodalmadat.
- **🛰️ Törmelékmezők & Újrahasznosítás**: A csaták roncsai mostantól kinyerhetők! Építs Szemétgyűjtő (Recycler) hajókat, hogy értékes fémet és kristályt gyűjts be a világűrből.
- **🌌 9 Galaxis**: A játék világa kibővült! 9 különböző galaxis áll rendelkezésre, mindegyik egyedi nyersanyag-termelési és energia-bónuszokkal rendelkezik.
- **🛡️ Bypass Biztonság**: Ideiglenes "Nem vagyok robot" checkbox váltotta fel a Turnstile rendszert a belépési stabilitás érdekében.

## Key Features
- **🚀 Valós idejű flotta-irányítás**: Kémkedés, támadás, gyarmatosítás és most már újrahasznosítás.
- **🏗️ Komplex gazdaság**: Bányák, raktárak és kutatóközpontok fejlesztése.
- **📱 PWA Support**: Telepíthető mobilra és asztali gépre egyaránt.
- **🎨 Modern UI**: Futurisztikus, reszponzív felület Orbitron és Exo 2 betűtípusokkal.

## Tech Stack
- **Backend**: Cloudflare Workers (Edge Runtime)
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: Vue 3 (Vite, Pinia)
- **Storage**: Cloudflare Workers Assets

## Changelog

### v3.0.1 (Alive Marketplace)
- **Bot Activity**: A bot játékosok mostantól aktívan használják a piacot (ajánlatokat tesznek fel és fogadnak el).
- **UI Fix**: Piac felület sötét módos szövegmegjelenítési hibáinak javítása.

### v3.0.0 (The Strategic Update)
- **Feature**: Implementált Debris Field (roncsmező) rendszer.
- **Feature**: Új hajótípus: Recycler (Szemétgyűjtő).
- **Feature**: Hold kialakulási logika és hold-váltó UI.
- **Feature**: 9 galaxis támogatása egyedi bónuszokkal.
- **Bypass**: Turnstile ideiglenes lecserélése manuális checkboxra a belépési hibák elkerülésére.

### v2.9.6 (Emergency Fix & PWA)
- **Fix**: Synchronized Turnstile keys and restored verification logic.
- **Feature**: Added `manifest.webmanifest` and PWA support via `vite-plugin-pwa`.
- **Visual**: Global CSS cleanup to fix design regressions.
