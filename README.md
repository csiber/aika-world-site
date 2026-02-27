# AIKA COLONY — Cloudflare Workers Deploy

## Fájlstruktúra

```
aika-colony-worker/
├── worker.js        ← A Cloudflare Worker szkript (belépési pont)
├── index.html       ← A teljes játékalkalmazás (HTML + CSS + JS)
├── wrangler.toml    ← Cloudflare Workers konfiguráció
├── package.json     ← npm csomagkezelő fájl
└── README.md        ← Ez a fájl
```

## Telepítés lépései

### 1. Előfeltételek
- [Node.js](https://nodejs.org/) (v18+)
- [Cloudflare fiók](https://dash.cloudflare.com/sign-up)

### 2. Wrangler telepítése
```bash
npm install
```

### 3. Cloudflare bejelentkezés
```bash
npx wrangler login
```

### 4. Helyi fejlesztés (opcionális)
```bash
npm run dev
# → http://localhost:8787
```

### 5. Deploy Cloudflare-re
```bash
npm run deploy
```

A deploy után megkapod a `*.workers.dev` URL-t ahol az alkalmazás él.

## Konfiguráció

A `wrangler.toml` fájlban testreszabható:
- `name` — a Worker neve (ez lesz az URL: `name.your-subdomain.workers.dev`)
- `[[routes]]` — egyedi domain beállítása (kommentes sorokat aktiváld)
- `[[kv_namespaces]]` — jövőbeli KV alapú mentési rendszer

## Hogyan működik?

A `worker.js` importálja az `index.html` fájlt szövegként (Wrangler `Text` rule segítségével), majd minden HTTP kérésre visszaadja azt a megfelelő fejlécekkel. Az alkalmazás teljesen kliens-oldali (JavaScript), nincs szükség szerveroldali logikára.

## Jövőbeli fejlesztési lehetőségek

- **KV Store**: Játékállás mentése Cloudflare KV-ban
- **Durable Objects**: Valós idejű multiplayer szinkronizáció
- **R2**: Képek és asetek tárolása
- **D1**: SQLite alapú ranglisták és felhasználói adatok
