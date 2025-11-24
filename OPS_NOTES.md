# Üzemeltetési jegyzet – AIKA: World

Ez a dokumentum a Cloudflare Pages/Workers környezetben történő üzemeltetéshez ad támpontokat.

## Cloudflare Pages beállítások

- **Build parancs:** `npm run build`
- **Build output:** az `open-next.config.ts` határozza meg; a Pages automatikusan a `.open-next` mappát tölti fel.
- **Environment variables:** mind a Production, mind a Preview környezetben állítsd be a README-ben felsorolt értékeket.
- **Edge runtime:** a Turnstile és a dinamikus meta generálás miatt a Workers runtime engedélyezett; extra konfiguráció a `wrangler.jsonc` fájlban található.

## Cloudflare Web Analytics

- A `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` értékét a Cloudflare Analytics panelen lehet létrehozni.
- Token csere esetén nincs szükség deploy-ra: elég a környezeti változót frissíteni.
- Pageview adatok néhány perc késleltetéssel jelennek meg.

## Turnstile kulcsok

- **Site key:** `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- **Secret key:** nincs a frontendben, Cloudflare Workers oldalon vagy a form backendben kell ellenőrizni.
- Ha a kulcs változik, mindkét űrlap (hírlevél és kapcsolatfelvétel) automatikusan az új értéket használja.

## Form endpoint rotáció

- A `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` és `NEXT_PUBLIC_NEWSLETTER_FORM_ENDPOINT` változókat bármikor lecserélheted.
- Célszerű olyan szolgáltatást választani, ami Turnstile-t támogat (pl. Cloudflare Workers, Supabase Edge Functions).
- Ha új endpointot vezetsz be, először Preview deploy-ban teszteld, majd a változókat Productionben frissítsd.

## Domain kezelés

- Az alap domain `aikaworld.com`; a `NEXT_PUBLIC_SITE_URL` változót ehhez igazítsd.
- Cloudflare Pages-en az egyedi domaint a „Custom domains” menüben add hozzá, majd várd meg az SSL validációt.
- Ha több nyelvi aldomaint szeretnél (pl. `hu.aikaworld.com`), a DNS-ben CNAME-ként mutass a Pages default domainre, majd adj hozzá új custom domaint.

## Monitorozás

- Lighthouse riportot minden nagyobb release előtt készíts (Chrome DevTools → Lighthouse → Desktop).
- A Cloudflare Analytics mellett a Workers Metrics dashboard is követhető (CPU time, requests).
- Ha SEO visszaesést tapasztalsz, ellenőrizd a `sitemap.xml` és `robots.txt` tartalmát a frissített útvonalakkal.

## Incidenskezelés

1. Ellenőrizd a Cloudflare status oldalt (Pages, Workers, Analytics).
2. Futtasd lokálisan az `npm run build` parancsot – ha hibát jelez, gyors rollback szükséges.
3. Ha a form endpoint nem válaszol, ideiglenesen kapcsold ki a bevitelt (állítsd `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` értékét üresre); a komponensek ekkor hibát jeleznek a felhasználónak.

Frissítés esetén ezt a fájlt tartsd naprakészen.
