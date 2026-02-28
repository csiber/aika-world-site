# AIKA COLONY v2.1.0 — Full-Stack Cloudflare Workers + Vue 3 + D1

Galaktikus stratégiai játék Cloudflare Workers (FaaS), D1 (SQLite) és Vue 3 technológiákkal.

## Újdonságok (v2.1.0)

- **📱 Mobil-első Élmény:** Teljesen újratervezett reszponzív felület, rögzített alsó navigációval és optimalizált érintési célokkal.
- **⚡ PWA Integráció:** Telepíthető alkalmazásként (Progressive Web App), offline gyorsítótárazással és natív app érzettel.
- **🛡️ Adminisztrációs Panel:** Új dashboard a rendszergazdáknak (statisztikák, felhasználókezelés, erőforrás-adományozás).
- **🤖 AIKA Asszisztens:** Beépített AI alapú segítő a stratégiai döntésekhez.

## Architektúra

```
aika-colony-v2/
├── frontend/                    ← Vue 3 + Vite frontend (PWA + Mobil optimalizált)
│   ├── src/
│   │   ├── api/client.js        ← API kliens (fetch wrapper)
│   │   ├── components/          ← Újrafelhasználható Vue komponensek
│   │   │   ├── views/           ← Tab-specifikus nézetek (AdminView, OverviewView, stb.)
│   │   │   ├── BuildingCard.vue
│   │   │   ├── BuildingItem.vue
│   │   │   ├── QueueItem.vue
│   │   │   └── ResourceItem.vue
│   │   ├── router/index.js      ← Vue Router (auth guard)
│   │   ├── stores/
│   │   │   ├── auth.js          ← Pinia auth store (JWT + Admin role)
│   │   │   └── game.js          ← Pinia game state store
│   │   ├── views/
│   │   │   ├── LoginView.vue
│   │   │   ├── RegisterView.vue
│   │   │   └── GameView.vue     ← Fő játék shell (Dynamic Tabs)
│   │   ├── App.vue
│   │   └── main.js
├── worker/
│   └── src/
│       ├── index.js             ← Worker belépési pont + routing (Admin routes)
│       ├── routes/
│       │   ├── auth.js          ← /api/auth/* (register, login, me)
│       │   ├── admin.js         ← /api/admin/* (stats, users, resources)
│       │   ├── game.js          ← /api/game/* (state, upgrade, research, fleet)
│       │   └── rankings.js      ← /api/rankings
│       └── utils/
│           ├── jwt.js           ← PBKDF2 hash + HS256 JWT (Admin claim)
│           └── response.js      ← JSON response helpers + CORS
├── db/
│   ├── schema.sql               ← D1 SQLite alap séma
│   └── migration.sql            ← Admin oszlop migráció
├── package.json                 ← Root config (v2.1.0)
└── README.md
```

## Funkciók

- **Regisztráció / Bejelentkezés** — email + jelszó, PBKDF2 hash, JWT session (is_admin support)
- **Progresszív Web App (PWA)** — Kezdőképernyőhöz adható, teljes képernyős mód
- **Épület fejlesztés** — valós D1 adatbázisba ment, build queue
- **Kutatás** — 10 kutatási ág, szintenkénti fejlesztés
- **Flotta gyártás** — 6 hajótípus, mennyiség megadható
- **Admin Eszközök** — Globális statisztikák és játékos-segítő funkciók
- **Rangsor** — valós játékosok pontszáma, oldalpozíció kiemelés
- **Offline termelés** — max 8 óra offline nyersanyag-gyűjtés szinkronizálásnál

## Telepítés

### 1. Előfeltételek
- Node.js 18+
- Cloudflare fiók

### 2. Dependenciák telepítése

```bash
# Gyökér (wrangler)
npm install

# Frontend (Vue + Vite + PWA)
cd frontend && npm install && cd ..
```

### 3. D1 adatbázis beállítása

1. Hozd létre az adatbázist: `npm run db:create`
2. Másold ki a kapott `database_id`-t a `wrangler.toml`-ba.
3. Futtasd a sémát és a migrációt:
```bash
# Séma
wrangler d1 execute aika-world-db --file=./db/schema.sql

# Admin migráció (v2.1.0 esetén szükséges)
wrangler d1 execute aika-world-db --file=./db/migration.sql
```

### 4. Admin kinevezése

Futtasd a következő parancsot az első admin kinevezéséhez:
```bash
wrangler d1 execute aika-world-db --command="UPDATE users SET is_admin = 1 WHERE username = 'SAJAT_FELHASZNALONEV';"
```

## API Végpontok

### Auth (publikus / JWT)
| Metódus | Endpoint | Leírás |
|---------|----------|--------|
| POST | `/api/auth/register` | Regisztráció + Turnstile ellenőrzés |
| POST | `/api/auth/login` | Bejelentkezés → JWT (isAdmin claim) |
| GET  | `/api/auth/me` | Saját profil adatai |

### Admin (Csak admin JWT-vel)
| Metódus | Endpoint | Leírás |
|---------|----------|--------|
| GET  | `/api/admin/stats` | Globális játék statisztikák |
| GET  | `/api/admin/users` | Felhasználók listázása |
| POST | `/api/admin/update-resources` | Erőforrás adományozás |

### Game (JWT szükséges)
| Metódus | Endpoint | Leírás |
|---------|----------|--------|
| GET  | `/api/game/state` | Teljes játékállapot + sor |
| POST | `/api/game/sync` | Szerver szinkronizáció |
| POST | `/api/game/upgrade` | Épület fejlesztés |
| POST | `/api/game/research` | Kutatás indítás |

## License
MIT
