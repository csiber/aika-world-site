# AIKA: World – fejlesztői útmutató

A projekt egy Next.js alapú, többnyelvű marketing oldal, amely Cloudflare Pages + Workers környezetre van optimalizálva. Az alábbi leírás célja, hogy új fejlesztő legfeljebb 10 perc alatt be tudja indítani a rendszert és átlássa az alapvető működést.

## Fejlesztői gyorsindító

1. Node 18+ és npm szükséges (a lockfile npm-hez készült).
2. Telepítés: `npm install`
3. Fejlesztői szerver indítása: `npm run dev`
4. Böngészőben nyisd meg a `http://localhost:3000` címet.

A projekt nem használ SQLite-ot; a form endpontok és a Turnstile integráció külső szolgáltatásokhoz csatlakoznak, így lokális adatbázis beállításra nincs szükség.

## Hasznos npm parancsok

| Parancs | Leírás |
| --- | --- |
| `npm run dev` | Next.js fejlesztői mód, hot reloaddal. |
| `npm run build` | Klasszikus Next.js build lokális hibakereséshez. |
| `npm run build:cloudflare` | Cloudflare Pages/Workers build, elkészíti a `.open-next` mappát. |
| `npm run start` | Next.js preview szerver a `.next` kimenethez. |
| `npm run start:cloudflare` | Workers runtime preview az `.open-next` kimenettel. |
| `npm run preview` | Cloudflare build + preview (megegyezik a Pages futtatással). |
| `npm run lint` | Statikus ellenőrzés a projekt ESLint szabályaival. |

## Build és deploy folyamat

1. `npm run build:cloudflare` állítja elő azt a `.open-next` kimenetet, amelyet a Cloudflare Pages + Workers használ.
2. Cloudflare Pages-en a build parancsot `npm run build:cloudflare` értékre kell állítani, az output könyvtár marad `.open-next`.
3. A klasszikus `npm run build` parancs továbbra is futtatható, ha csak a Next.js saját buildjét szeretnéd ellenőrizni.
4. A Workers funkciókat a `wrangler.jsonc` és az `open-next.config.ts` fájlok szabályozzák.
5. Élesítés előtt érdemes Lighthouse-t futtatni (Chrome DevTools) és ellenőrizni, hogy a Performance + SEO legalább 90 pont.

## I18n struktúra

- A kulcsok és szövegek a `lib/i18n.ts` fájlban találhatók.
- A `Dictionary` típus határozza meg az elérhető tartalmi blokkokat; minden új komponenshez itt kell felvenni a lokalizált szöveget.
- A nyelvi útvonalak (`/en`, `/hu`) fixen statikusan generálódnak az `app/[lang]` mappában.

## UI komponensek

- Minden nagyobb UI elem a `components/` könyvtárban él.
- A marketing szakaszok animációi a `framer-motion` könyvtárat használják (`components/home/home-landing.tsx`).
- A Cloudflare Turnstile widget újrafelhasználható verziója: `components/turnstile-widget.tsx`.
- Az analitika hozzájárulási sáv: `components/analytics-consent.tsx`.

## Környezeti változók

| Változó | Szerep |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Teljes bázis URL (pl. `https://aika.world`), meta tagekhez és sitemaphez. |
| `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` | Cloudflare Web Analytics token; ha nincs megadva, a script nem töltődik be. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site kulcs a kapcsolatfelvételi űrlaphoz és hírlevélhez. |
| `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` | Külső endpoint, ahová a kapcsolatfelvételi űrlap POST-olja az adatokat. |
| `NEXT_PUBLIC_NEWSLETTER_FORM_ENDPOINT` | Külső endpoint a hírlevél feliratkozáshoz. |

Éles környezetben minden értéket a Cloudflare Pages projekt environment-jében kell felvenni.

## Kódstílus és minőség

- TypeScript minden fájlban kötelező.
- A Tailwind utility osztályok preferáltak, saját CSS csak a `app/globals.css` fájlban található változókkal történjen.
- A képi assetek SVG formátumban élnek a `public/images` és `public/og` mappákban; PNG feltöltése kerülendő.

## Ellenőrzőlista élesítés előtt

- [ ] `npm run build:cloudflare` hibamentesen lefut.
- [ ] Lighthouse desktop: Performance ≥ 90, SEO ≥ 90.
- [ ] Cloudflare Web Analytics token aktív és a consent banner megjelenik.
- [ ] Hreflang és canonical tagek ellenőrizve (View Source).
- [ ] `sitemap.xml` és `robots.txt` kiszolgálva van (`npm run start` után ellenőrizhető).

További üzemeltetési részletek az `OPS_NOTES.md` fájlban találhatók.
