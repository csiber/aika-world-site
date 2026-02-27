<template>
  <div class="guide-layout">

    <!-- Sticky sidebar nav -->
    <aside class="guide-sidebar">
      <div class="sidebar-header">📖 ÚTMUTATÓ</div>
      <nav class="sidebar-nav">
        <a
          v-for="section in sections"
          :key="section.id"
          class="sidebar-link"
          :class="{ active: activeSection === section.id }"
          @click="scrollTo(section.id)"
        >
          <span class="sidebar-icon">{{ section.icon }}</span>
          <span>{{ section.title }}</span>
        </a>
      </nav>
      <div class="sidebar-version">v1.0 · AIKA World</div>
    </aside>

    <!-- Main content -->
    <main class="guide-content" ref="contentEl" @scroll="onScroll">

      <!-- Hero -->
      <div class="guide-hero" id="intro">
        <div class="hero-glow"></div>
        <div class="hero-text">
          <div class="hero-label">GALAKTIKUS STRATÉGIA</div>
          <h1 class="hero-title">AIKA <span>WORLD</span></h1>
          <p class="hero-sub">Építsd fel birodalmad a végtelen galaxisban. Termelj, kutass, harcolj, szövetkezz.</p>
        </div>
        <div class="hero-stats">
          <div class="hs"><span class="hs-n">4</span><span class="hs-l">Nyersanyag</span></div>
          <div class="hs"><span class="hs-n">10</span><span class="hs-l">Épület</span></div>
          <div class="hs"><span class="hs-n">10</span><span class="hs-l">Kutatás</span></div>
          <div class="hs"><span class="hs-n">6</span><span class="hs-l">Hajótípus</span></div>
        </div>
      </div>

      <!-- ── Kezdés ── -->
      <section class="guide-section" id="start">
        <h2 class="section-title"><span class="s-icon">🚀</span> Kezdés</h2>
        <div class="card-grid">
          <div class="info-card">
            <div class="ic-icon">1</div>
            <div class="ic-body">
              <div class="ic-title">Regisztráció</div>
              <p>Hozz létre fiókot egy felhasználónévvel és email címmel. Automatikusan kapsz egy főbolygót és kezdőnyersanyagokat.</p>
            </div>
          </div>
          <div class="info-card">
            <div class="ic-icon">2</div>
            <div class="ic-body">
              <div class="ic-title">Épületek fejlesztése</div>
              <p>Először a <b>Fémolvasztót</b> és <b>Kristálybányát</b> fejleszd — ezek adják az alapnyersanyagot mindenhez.</p>
            </div>
          </div>
          <div class="info-card">
            <div class="ic-icon">3</div>
            <div class="ic-body">
              <div class="ic-title">Energia figyelése</div>
              <p>Ha a <b>Napelemfarm</b> nem tart lépést az épületeid energiaigényével, az összes termelésed csökken!</p>
            </div>
          </div>
          <div class="info-card">
            <div class="ic-icon">4</div>
            <div class="ic-body">
              <div class="ic-title">Kutatás + Flotta</div>
              <p>A <b>Kutatólabor</b> és <b>Hajógyár</b> fejlesztése után elindíthatod az első kutatásokat és hajókat.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Nyersanyagok ── -->
      <section class="guide-section" id="resources">
        <h2 class="section-title"><span class="s-icon">⚙️</span> Nyersanyagok</h2>
        <p class="section-intro">Minden nyersanyagnak van termelési rátája (per óra) és maximális tárolási kapacitása. Ha a tároló megtelik, a többlet elvész!</p>

        <table class="guide-table">
          <thead><tr><th>Nyersanyag</th><th>Termelő épület</th><th>Mire kell</th><th>Tároló</th></tr></thead>
          <tbody>
            <tr>
              <td><span class="res-badge metal">⚙️ Fém</span></td>
              <td>Fémolvasztó</td>
              <td>Épületek, hajók, kutatás alapja</td>
              <td>Fémtároló</td>
            </tr>
            <tr>
              <td><span class="res-badge crystal">💎 Kristály</span></td>
              <td>Kristálybánya</td>
              <td>Kutatás, fejlettebb hajók</td>
              <td>Kristálytároló</td>
            </tr>
            <tr>
              <td><span class="res-badge energy">⚡ Energia</span></td>
              <td>Napelemfarm</td>
              <td>Összes termelés hatékonysága</td>
              <td>Végtelen</td>
            </tr>
            <tr>
              <td><span class="res-badge deus">🔮 Déusium</span></td>
              <td>Déusium Reaktor</td>
              <td>Fejlett technológiák, speciális kutatások</td>
              <td>Déusium Tároló</td>
            </tr>
          </tbody>
        </table>

        <div class="tip-box warning">
          <span class="tip-icon">⚡</span>
          <div><b>Energia egyensúly!</b> Minden termelőépület energiát fogyaszt. Ha az energiatermelés kevesebb mint a fogyasztás, az összes termelésed arányosan csökken — akár 50%-ra is. Tartsd a Napelemfarmot legalább azonos szinten a többi termelőépülettel!</div>
        </div>

        <div class="tip-box info">
          <span class="tip-icon">💡</span>
          <div><b>Hipertér Technológia</b> kutatás növeli a raktárkapacitást szintenként +15%-kal — nagyon hasznos ha sok nyersanyagot gyűjtesz offline.</div>
        </div>
      </section>

      <!-- ── Épületek ── -->
      <section class="guide-section" id="buildings">
        <h2 class="section-title"><span class="s-icon">🏗️</span> Épületek</h2>
        <p class="section-intro">Az épületek szintje meghatározza a termelést, a fejlesztési/kutatási sebességet és a flotta kapacitást.</p>

        <div class="building-groups">
          <div class="building-group">
            <div class="bg-label">Termelő épületek</div>
            <div class="building-row" v-for="b in prodBuildings" :key="b.id">
              <span class="b-icon">{{ b.icon }}</span>
              <div class="b-info">
                <div class="b-name">{{ b.name }}</div>
                <div class="b-desc">{{ b.desc }}</div>
              </div>
            </div>
          </div>
          <div class="building-group">
            <div class="bg-label">Infrastruktúra</div>
            <div class="building-row" v-for="b in infraBuildings" :key="b.id">
              <span class="b-icon">{{ b.icon }}</span>
              <div class="b-info">
                <div class="b-name">{{ b.name }}</div>
                <div class="b-desc">{{ b.desc }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="tip-box info">
          <span class="tip-icon">🤖</span>
          <div><b>Robotika Gyár</b> szintje csökkenti az építési időt (-7%/szint). 5-ös szintnél megnyílik egy harmadik fejlesztési slot — egyszerre 3 épületet fejleszthetsz!</div>
        </div>
      </section>

      <!-- ── Kutatás ── -->
      <section class="guide-section" id="research">
        <h2 class="section-title"><span class="s-icon">🔬</span> Kutatás</h2>
        <p class="section-intro">Egyszerre csak egy kutatás futhat. A Kutatólabor szintje csökkenti a kutatási időt. Minden kutatásnak komoly hatása van a játékra!</p>

        <table class="guide-table">
          <thead><tr><th>Kutatás</th><th>Hatás</th><th>Max szint</th></tr></thead>
          <tbody>
            <tr v-for="r in researchList" :key="r.id">
              <td><span class="res-badge" style="background:rgba(0,200,255,0.1);color:var(--accent)">{{ r.icon }} {{ r.name }}</span></td>
              <td>{{ r.effect }}</td>
              <td class="text-center">{{ r.max }}</td>
            </tr>
          </tbody>
        </table>

        <div class="tip-box warning">
          <span class="tip-icon">💥</span>
          <div><b>Plazma Technológia</b> csak Lézer Technológia Szint 10 után kutatható — de a legjobb tűzerő bónuszt adja (+12%/szint)!</div>
        </div>
      </section>

      <!-- ── Flotta ── -->
      <section class="guide-section" id="fleet">
        <h2 class="section-title"><span class="s-icon">🚀</span> Flotta</h2>
        <p class="section-intro">A flotta építéséhez Hajógyár szükséges. Fejlettebb hajókhoz magasabb szintű Hajógyár kell!</p>

        <table class="guide-table">
          <thead><tr><th>Hajó</th><th>Tűzerő</th><th>Pajzs</th><th>Rakomány</th><th>Min. Hajógyár</th></tr></thead>
          <tbody>
            <tr v-for="s in shipList" :key="s.id">
              <td><b>{{ s.icon }} {{ s.name }}</b></td>
              <td class="text-attack">{{ s.attack.toLocaleString('hu') }}</td>
              <td class="text-shield">{{ s.shield.toLocaleString('hu') }}</td>
              <td>{{ s.cargo > 0 ? s.cargo.toLocaleString('hu') : '—' }}</td>
              <td class="text-center">Szint {{ s.minShipyard }}</td>
            </tr>
          </tbody>
        </table>

        <div class="tip-box info">
          <span class="tip-icon">📦</span>
          <div><b>Rakomány (cargo)</b> meghatározza mennyi nyersanyagot tudsz elvonni egy támadásnál. Ha a flottád cargo kapacitása alacsony, kevesebbet zsákmányolsz még győzelem esetén is!</div>
        </div>
      </section>

      <!-- ── Galaxis ── -->
      <section class="guide-section" id="galaxy">
        <h2 class="section-title"><span class="s-icon">🌌</span> Galaxis & Küldetések</h2>
        <p class="section-intro">A galaxistérképen látod az összes játékos bolygóját. Három típusú küldetést indíthatsz:</p>

        <div class="mission-cards">
          <div class="mission-card spy">
            <div class="mc-icon">🔍</div>
            <div class="mc-title">Kémkedés</div>
            <div class="mc-desc">Megmutatja a célpont nyersanyagait. Magasabb <b>Kémtechnológia</b> szinttel flottáját és épületeit is láthatod.</div>
            <div class="mc-req">Kémtechnológia Szint 3 = Energia is látható<br>Szint 7 = Flotta is látható<br>Szint 10 = Épületek is láthatók</div>
          </div>
          <div class="mission-card attack">
            <div class="mc-icon">⚔️</div>
            <div class="mc-title">Támadás</div>
            <div class="mc-desc">Harc a célpont ellen. A harcot az összes harci kutatás befolyásolja. Győzelem esetén zsákmányt szerezhetsz — cargo kapacitás erejéig.</div>
            <div class="mc-req">Szükséges: legalább 1 hajó</div>
          </div>
          <div class="mission-card colony">
            <div class="mc-icon">🌍</div>
            <div class="mc-title">Gyarmatosítás</div>
            <div class="mc-desc">Üres koordinátára küldhetsz Gyarmatosító hajót. Sikeres gyarmatosítás után új bolygót kapsz, ami önálló termelési kapacitást ad.</div>
            <div class="mc-req">Szükséges: Gyarmatosító hajó + Asztrofizika kutatás</div>
          </div>
        </div>

        <div class="tip-box info">
          <span class="tip-icon">📡</span>
          <div>A küldetések eredménye <b>üzenetként</b> érkezik meg amikor a flotta visszatér. Az Áttekintés oldalon az AIKA asszisztens segít értelmezni a harci jelentéseket!</div>
        </div>
      </section>

      <!-- ── Szövetségek ── -->
      <section class="guide-section" id="alliance">
        <h2 class="section-title"><span class="s-icon">🤝</span> Szövetségek</h2>
        <p class="section-intro">Szövetségbe tömörülve más játékosokkal szövetségi chateten koordinálhattok és közös pontszámot gyűjthettek a ranglistán.</p>

        <div class="role-cards">
          <div class="role-card">
            <div class="rc-icon">👑</div>
            <div class="rc-role">Vezető</div>
            <div class="rc-perms">Minden jog. Tagokat rúghat ki, tisztté léptetheti. Ha kilép, az utolsó tag örökli a pozíciót.</div>
          </div>
          <div class="role-card">
            <div class="rc-icon">⭐</div>
            <div class="rc-role">Tiszt</div>
            <div class="rc-perms">Meghívhat új tagokat. Tagokat rúghat ki.</div>
          </div>
          <div class="role-card">
            <div class="rc-icon">👤</div>
            <div class="rc-role">Tag</div>
            <div class="rc-perms">Hozzáfér a szövetségi chathez. Megtekintheti a taglistát.</div>
          </div>
        </div>

        <div class="tip-box info">
          <span class="tip-icon">📨</span>
          <div>Meghívót kapsz? A meghívó üzenetben megtalálod a <b>Szövetség ID</b>-t. Menj a Szövetség menüpontba → "Csatlakozás meghívóval" → illeszd be az ID-t.</div>
        </div>
      </section>

      <!-- ── Tippek ── -->
      <section class="guide-section" id="tips">
        <h2 class="section-title"><span class="s-icon">💡</span> Stratégiai tippek</h2>

        <div class="tips-grid">
          <div class="tip-item" v-for="tip in tips" :key="tip.title">
            <div class="ti-icon">{{ tip.icon }}</div>
            <div class="ti-body">
              <div class="ti-title">{{ tip.title }}</div>
              <div class="ti-text">{{ tip.text }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── AIKA AI ── -->
      <section class="guide-section" id="aika">
        <h2 class="section-title"><span class="s-icon">🤖</span> AIKA Asszisztens</h2>
        <div class="aika-promo">
          <div class="ap-left">
            <div class="ap-title">Kérdezd meg AIKÁT!</div>
            <p>Az Áttekintés oldalon elérhető az AIKA mesterséges intelligencia asszisztens. Ismeri az aktuális játékállapotodat és személyre szabott stratégiai tanácsokat ad.</p>
            <ul class="ap-examples">
              <li>"Mit fejlesszek most?"</li>
              <li>"Hogyan növeljem a termelést?"</li>
              <li>"Mikor érdemes támadni?"</li>
              <li>"Milyen sorrendben kutassak?"</li>
            </ul>
          </div>
          <div class="ap-right">
            <div class="ap-bubble assistant">Üdvözöllek! Miben segíthetek a birodalmad fejlesztésében?</div>
            <div class="ap-bubble user">Mit fejlesszek most?</div>
            <div class="ap-bubble assistant">Az energiahatékonyságod 72% — a Napelemfarm szintje elmarad. Javaslom a Solar fejlesztését, mielőtt továbblépnél a Kristálybányával.</div>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const contentEl    = ref(null);
const activeSection = ref('intro');

const sections = [
  { id: 'intro',     icon: '🌌', title: 'Bevezetés' },
  { id: 'start',     icon: '🚀', title: 'Kezdés' },
  { id: 'resources', icon: '⚙️', title: 'Nyersanyagok' },
  { id: 'buildings', icon: '🏗️', title: 'Épületek' },
  { id: 'research',  icon: '🔬', title: 'Kutatás' },
  { id: 'fleet',     icon: '✈️', title: 'Flotta' },
  { id: 'galaxy',    icon: '🌌', title: 'Galaxis' },
  { id: 'alliance',  icon: '🤝', title: 'Szövetségek' },
  { id: 'tips',      icon: '💡', title: 'Tippek' },
  { id: 'aika',      icon: '🤖', title: 'AIKA AI' },
];

const prodBuildings = [
  { id: 'metal_mine',    icon: '⚙️', name: 'Fémolvasztó',    desc: 'Fém termelése. Minden szint +10% termelést ad.' },
  { id: 'crystal_mine',  icon: '💎', name: 'Kristálybánya',  desc: 'Kristály termelése. Minden szint +10% termelést ad.' },
  { id: 'solar',         icon: '☀️', name: 'Napelemfarm',    desc: 'Energia termelése. Kritikus — hiányánál minden termelés csökken!' },
  { id: 'deusium',       icon: '🔮', name: 'Déusium Reaktor', desc: 'Déusium termelése. Szükséges fejlett kutatásokhoz.' },
];

const infraBuildings = [
  { id: 'storage_metal',   icon: '🗄️', name: 'Fémtároló',          desc: 'Megkétszerezi a fémtárolási kapacitást szintenként.' },
  { id: 'storage_crystal', icon: '💠', name: 'Kristálytároló',      desc: 'Megkétszerezi a kristálytárolási kapacitást szintenként.' },
  { id: 'robotics',        icon: '🤖', name: 'Robot Gyár',          desc: 'Csökkenti az építési időt -7%/szint. Szint 5: +1 építési slot.' },
  { id: 'shipyard',        icon: '🏭', name: 'Hajógyár',            desc: 'Csökkenti a hajógyártási időt. Magasabb szint = fejlettebb hajók.' },
  { id: 'lab',             icon: '🔬', name: 'Kutatólabor',         desc: 'Csökkenti a kutatási időt -7%/szint.' },
  { id: 'defense',         icon: '🛡️', name: 'Védelmi Rendszer',    desc: '+500 védelmi erő szintenként. Véd a támadások ellen.' },
];

const researchList = [
  { id: 'combat',      icon: '⚔️', name: 'Harci Technológia',      effect: '+10% tűzerő szintenként',              max: 20 },
  { id: 'drive',       icon: '🚀', name: 'Ionhajtómű',             effect: '+15% flotta sebesség szintenként',     max: 15 },
  { id: 'shield',      icon: '🛡️', name: 'Pajzstechnológia',       effect: '+10% pajzserő szintenként',            max: 20 },
  { id: 'astro',       icon: '🔭', name: 'Asztrofizika',           effect: '+1 gyarmatosítható bolygó szintenként', max: 10 },
  { id: 'energy_tech', icon: '⚡', name: 'Energiatechnológia',     effect: '+8% energiatermelés szintenként',      max: 20 },
  { id: 'computer',    icon: '💻', name: 'Számítógép Technológia', effect: '+1 flottaslot szintenként',            max: 20 },
  { id: 'spy',         icon: '🔍', name: 'Kémtechnológia',         effect: 'Jobb kémjelentések (flotta, épületek)', max: 20 },
  { id: 'hyper',       icon: '🌀', name: 'Hipertér Technológia',   effect: '+15% raktárkapacitás szintenként',     max: 15 },
  { id: 'laser',       icon: '🔴', name: 'Lézer Technológia',      effect: '+5% tűzerő — Plazma előfeltétel',      max: 20 },
  { id: 'plasma',      icon: '💥', name: 'Plazma Technológia',     effect: '+12% tűzerő (Lézer 10 kell!)',         max: 10 },
];

const shipList = [
  { id: 'fighter_s',  icon: '✈️',  name: 'Kis Vadász',    attack: 50,   shield: 10,   cargo: 0,    minShipyard: 1 },
  { id: 'miner',      icon: '⛏️',  name: 'Bányász',       attack: 5,    shield: 25,   cargo: 5000, minShipyard: 1 },
  { id: 'fighter_l',  icon: '🛸',  name: 'Nagy Vadász',   attack: 400,  shield: 100,  cargo: 0,    minShipyard: 2 },
  { id: 'colony',     icon: '🌍',  name: 'Gyarmatosító',  attack: 0,    shield: 100,  cargo: 7500, minShipyard: 2 },
  { id: 'cruiser',    icon: '🚀',  name: 'Cirkáló',       attack: 800,  shield: 400,  cargo: 800,  minShipyard: 3 },
  { id: 'battleship', icon: '🛰️', name: 'Csatahajó',     attack: 4000, shield: 2000, cargo: 1500, minShipyard: 4 },
];

const tips = [
  { icon: '⚡', title: 'Energia először', text: 'Ha az energiahatékonyságod 100% alá esik, minden termelésed csökken. Mindig tartsd a Napelemfarmot legalább a többi termelőépület szintjén.' },
  { icon: '🗄️', title: 'Tároló fejlesztés', text: 'Offline időkre fejleszd fel a tárolókat. A tele raktár elveszíti a termelést — különösen hosszú kihagyás előtt figyelj erre!' },
  { icon: '🤖', title: 'Robotika hamar', text: 'A Robot Gyár szint 5-re hozva új fejlesztési slotot nyit — ezután háromszor gyorsabban fejlődsz, mint az alap két slottal.' },
  { icon: '🔍', title: 'Kémkedj először', text: 'Támadás előtt mindig küldd el a kémeket. Szint 7+ Kémtechnológiával látod az ellenség flottáját — így nem küldöd feleslegesen a hajóidat.' },
  { icon: '📦', title: 'Cargo számít', text: 'A zsákmány a flottád cargo kapacitásától függ. Bányász hajók sok cargot visznek, de gyengék harcban — kombinálj vadászokkal és bányászokkal.' },
  { icon: '🌍', title: 'Második bolygó', text: 'Az Asztrofizika szint 1 után gyarmatosítható az első kolónia. Ez megkétszerezi a termelési kapacitásodat — minél hamarabb, annál jobb!' },
  { icon: '🤝', title: 'Szövetség ereje', text: 'Szövetségben jobb védelmet kaphatsz. Koordinált támadásokkal sokkal hatékonyabban lehet erős ellenfeleket legyőzni.' },
  { icon: '🔬', title: 'Kutatási sorrend', text: 'Ajánlott sorrend: Energiatechnológia → Harci Technológia → Pajzs → Kémtechnológia → Asztrofizika → Lézer → Plazma.' },
];

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el && contentEl.value) {
    contentEl.value.scrollTo({ top: el.offsetTop - 20, behavior: 'smooth' });
  }
  activeSection.value = id;
}

function onScroll() {
  const container = contentEl.value;
  if (!container) return;
  const scrollTop = container.scrollTop;
  for (const s of [...sections].reverse()) {
    const el = document.getElementById(s.id);
    if (el && el.offsetTop - 60 <= scrollTop) {
      activeSection.value = s.id;
      return;
    }
  }
  activeSection.value = 'intro';
}
</script>

<style scoped>
.guide-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  height: calc(100vh - 120px);
  gap: 0;
  overflow: hidden;
}

/* ── Sidebar ── */
.guide-sidebar {
  background: rgba(0,0,0,0.4);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: sticky;
  top: 0;
}
.sidebar-header {
  padding: 14px 14px 10px;
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--accent);
  border-bottom: 1px solid var(--border);
}
.sidebar-nav { flex: 1; padding: 8px 0; }
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  font-size: 11px;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.15s;
  border-left: 2px solid transparent;
}
.sidebar-link:hover { color: var(--text); background: rgba(255,255,255,0.03); }
.sidebar-link.active { color: var(--accent); border-left-color: var(--accent); background: rgba(0,200,255,0.06); }
.sidebar-icon { font-size: 12px; width: 16px; text-align: center; }
.sidebar-version { padding: 10px 14px; font-size: 9px; color: var(--text-dim); letter-spacing: 1px; border-top: 1px solid var(--border); }

/* ── Main content ── */
.guide-content {
  overflow-y: auto;
  padding: 0 0 40px;
  scroll-behavior: smooth;
}

/* ── Hero ── */
.guide-hero {
  position: relative;
  padding: 40px 32px 32px;
  border-bottom: 1px solid var(--border);
  overflow: hidden;
}
.hero-glow {
  position: absolute;
  top: -40px; right: -40px;
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(0,200,255,0.08) 0%, transparent 70%);
  pointer-events: none;
}
.hero-label { font-family: 'Orbitron', sans-serif; font-size: 9px; letter-spacing: 3px; color: var(--accent); margin-bottom: 8px; }
.hero-title { font-family: 'Orbitron', sans-serif; font-size: 32px; font-weight: 900; color: var(--text-bright); line-height: 1; margin-bottom: 12px; }
.hero-title span { color: var(--accent); text-shadow: 0 0 20px rgba(0,200,255,0.5); }
.hero-sub { font-size: 13px; color: var(--text-dim); max-width: 500px; line-height: 1.6; margin-bottom: 24px; }
.hero-stats { display: flex; gap: 24px; }
.hs { display: flex; flex-direction: column; }
.hs-n { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 900; color: var(--accent4); line-height: 1; }
.hs-l { font-size: 10px; color: var(--text-dim); margin-top: 2px; }

/* ── Sections ── */
.guide-section { padding: 28px 32px; border-bottom: 1px solid rgba(26,42,74,0.5); }
.section-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-bright);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.s-icon { font-size: 16px; }
.section-intro { font-size: 12px; color: var(--text-dim); line-height: 1.7; margin-bottom: 16px; }

/* ── Cards ── */
.card-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.info-card {
  display: flex;
  gap: 12px;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 14px;
}
.ic-icon {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(0,200,255,0.15);
  border: 1px solid rgba(0,200,255,0.3);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  color: var(--accent);
  flex-shrink: 0;
}
.ic-title { font-size: 12px; color: var(--text-bright); font-weight: 600; margin-bottom: 4px; }
.ic-body p { font-size: 11px; color: var(--text-dim); line-height: 1.5; margin: 0; }

/* ── Table ── */
.guide-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  margin-bottom: 14px;
}
.guide-table th {
  text-align: left;
  padding: 6px 10px;
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-dim);
  border-bottom: 1px solid var(--border);
  font-weight: 400;
}
.guide-table td {
  padding: 8px 10px;
  border-bottom: 1px solid rgba(26,42,74,0.4);
  color: var(--text);
  vertical-align: middle;
}
.guide-table tr:hover td { background: rgba(255,255,255,0.02); }
.text-center { text-align: center; }
.text-attack { color: var(--accent2); font-family: 'Orbitron', sans-serif; font-size: 10px; }
.text-shield { color: var(--accent); font-family: 'Orbitron', sans-serif; font-size: 10px; }

.res-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
}
.res-badge.metal   { background: rgba(180,140,60,0.15);  color: var(--metal); }
.res-badge.crystal { background: rgba(80,180,255,0.12);  color: var(--crystal); }
.res-badge.energy  { background: rgba(255,220,0,0.12);   color: var(--energy); }
.res-badge.deus    { background: rgba(140,80,255,0.12);  color: var(--accent); }

/* ── Tip boxes ── */
.tip-box {
  display: flex;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.6;
  margin-top: 12px;
}
.tip-box.info    { background: rgba(0,200,255,0.06);  border: 1px solid rgba(0,200,255,0.2);  color: var(--text); }
.tip-box.warning { background: rgba(255,165,0,0.06);  border: 1px solid rgba(255,165,0,0.2);  color: var(--text); }
.tip-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }

/* ── Buildings ── */
.building-groups { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px; }
.building-group { background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
.bg-label { padding: 8px 12px; font-size: 9px; letter-spacing: 2px; color: var(--accent); text-transform: uppercase; border-bottom: 1px solid var(--border); background: rgba(0,200,255,0.04); }
.building-row { display: flex; gap: 10px; align-items: flex-start; padding: 8px 12px; border-bottom: 1px solid rgba(26,42,74,0.3); }
.building-row:last-child { border-bottom: none; }
.b-icon { font-size: 18px; width: 24px; flex-shrink: 0; }
.b-name { font-size: 11px; color: var(--text-bright); font-weight: 500; }
.b-desc { font-size: 10px; color: var(--text-dim); line-height: 1.4; margin-top: 1px; }

/* ── Mission cards ── */
.mission-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
.mission-card {
  border-radius: 6px;
  padding: 16px;
  border: 1px solid;
}
.mission-card.spy    { background: rgba(0,200,255,0.05);  border-color: rgba(0,200,255,0.2); }
.mission-card.attack { background: rgba(255,58,122,0.05); border-color: rgba(255,58,122,0.2); }
.mission-card.colony { background: rgba(58,255,122,0.05); border-color: rgba(58,255,122,0.2); }
.mc-icon  { font-size: 28px; margin-bottom: 8px; }
.mc-title { font-family: 'Orbitron', sans-serif; font-size: 11px; font-weight: 700; color: var(--text-bright); margin-bottom: 6px; }
.mc-desc  { font-size: 11px; color: var(--text-dim); line-height: 1.5; margin-bottom: 8px; }
.mc-req   { font-size: 10px; color: var(--accent4); line-height: 1.5; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06); }

/* ── Role cards ── */
.role-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
.role-card { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 14px; text-align: center; }
.rc-icon  { font-size: 28px; margin-bottom: 6px; }
.rc-role  { font-family: 'Orbitron', sans-serif; font-size: 11px; color: var(--accent4); margin-bottom: 6px; }
.rc-perms { font-size: 11px; color: var(--text-dim); line-height: 1.5; }

/* ── Tips grid ── */
.tips-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.tip-item {
  display: flex;
  gap: 12px;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px;
  transition: border-color 0.2s;
}
.tip-item:hover { border-color: var(--border-glow); }
.ti-icon  { font-size: 22px; flex-shrink: 0; }
.ti-title { font-size: 12px; color: var(--text-bright); font-weight: 600; margin-bottom: 4px; }
.ti-text  { font-size: 11px; color: var(--text-dim); line-height: 1.5; }

/* ── AIKA promo ── */
.aika-promo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(0,200,255,0.2);
  border-radius: 8px;
  padding: 20px;
}
.ap-title { font-family: 'Orbitron', sans-serif; font-size: 14px; color: var(--accent); margin-bottom: 10px; }
.aika-promo p { font-size: 12px; color: var(--text-dim); line-height: 1.6; margin-bottom: 12px; }
.ap-examples { list-style: none; padding: 0; }
.ap-examples li { font-size: 11px; color: var(--text-dim); padding: 3px 0; }
.ap-examples li::before { content: '→ '; color: var(--accent); }
.ap-right { display: flex; flex-direction: column; gap: 8px; justify-content: center; }
.ap-bubble { padding: 8px 12px; border-radius: 8px; font-size: 11px; line-height: 1.5; max-width: 90%; }
.ap-bubble.assistant { background: rgba(0,200,255,0.08); border: 1px solid rgba(0,200,255,0.2); color: var(--text); align-self: flex-start; }
.ap-bubble.user { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-dim); align-self: flex-end; }

@media (max-width: 900px) {
  .guide-layout { grid-template-columns: 1fr; }
  .guide-sidebar { display: none; }
  .card-grid, .building-groups, .mission-cards, .role-cards, .tips-grid, .aika-promo { grid-template-columns: 1fr; }
}
</style>
