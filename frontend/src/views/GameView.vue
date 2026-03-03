<style scoped>
.game-shell { display: flex; flex-direction: column; min-height: 100vh; position: relative; z-index: 1; }

.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(180deg, var(--bg-deep) 0%, #040813 100%);
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: auto 1fr auto; /* Logo | Resources | User */
  align-items: center;
  height: 48px;
  box-shadow: 0 2px 20px rgba(0,0,0,0.6);
  padding-right: 8px; /* Give a little space on the right */
}

.logo-area { display: flex; align-items: center; gap: 8px; padding: 0 14px; border-right: 1px solid var(--border); height: 100%; min-width: 140px; }
.ver-badge { font-family: 'Orbitron', sans-serif; font-size: 8px; color: var(--text-dim); background: none; border: 1px solid var(--border); border-radius: 3px; padding: 1px 5px; cursor: pointer; transition: all 0.2s; letter-spacing: 1px; margin-left: 4px; }
.ver-badge:hover { color: var(--accent); border-color: var(--accent); }
.logo-icon  { font-size: 22px; }
.logo-title { font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 900; color: var(--accent); letter-spacing: 2px; text-shadow: 0 0 12px var(--accent); }
.logo-sub   { font-size: 8px; color: var(--text-dim); letter-spacing: 3px; font-family: 'Orbitron', sans-serif; }

.resource-bar { display: flex; align-items: center; flex: 1; height: 100%; padding: 0 8px; overflow-x: auto; scrollbar-width: none; }
.resource-bar::-webkit-scrollbar { display: none; }

.user-area { display: flex; align-items: center; gap: 8px; padding: 0 14px; border-left: 1px solid var(--border); height: 100%; }
.user-info  { text-align: right; }
.user-name  { font-family: 'Orbitron', sans-serif; font-size: 11px; color: var(--accent4); }
.user-pts   { font-size: 9px; color: var(--accent3); }
.user-info:hover .user-name { color: var(--accent); }

.alliance-badge { font-family: 'Orbitron', sans-serif; font-size: 10px; color: var(--accent4); background: rgba(255,215,0,0.08); border: 1px solid rgba(255,215,0,0.2); padding: 2px 6px; border-radius: 3px; cursor: pointer; transition: all 0.2s; }
.alliance-badge:hover { background: rgba(255,215,0,0.15); border-color: var(--accent4); }

.logout-btn { background: none; border: 1px solid rgba(255,58,122,0.3); color: var(--accent2); width: 28px; height: 28px; border-radius: 4px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.logout-btn:hover { background: rgba(255,58,122,0.1); border-color: var(--accent2); }

.nav { background: #050c1c; border-bottom: 1px solid var(--border); display: flex; align-items: center; height: 36px; padding: 0 4px; position: sticky; top: 48px; z-index: 99; gap: 2px; overflow-x: auto; }
.nav-btn { padding: 0 12px; height: 28px; background: none; border: 1px solid transparent; color: var(--text-dim); font-family: 'Exo 2', sans-serif; font-size: 12px; cursor: pointer; border-radius: 3px; transition: all 0.2s; display: flex; align-items: center; white-space: nowrap; }
.nav-btn:hover  { color: var(--text); border-color: var(--border); background: rgba(255,255,255,0.03); }
.nav-btn.active { color: var(--accent); border-color: var(--border-glow); background: rgba(0,200,255,0.08); box-shadow: inset 0 0 12px rgba(0,200,255,0.1); }

.planet-bar { background: #040a18; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 6px; padding: 6px 12px; overflow-x: auto; position: sticky; top: 84px; z-index: 98; }
.planet-slot { display: flex; flex-direction: column; align-items: center; padding: 4px 10px; border: 1px solid var(--border); border-radius: 4px; cursor: pointer; min-width: 80px; transition: all 0.2s; background: var(--bg-panel); }
.planet-slot:hover  { border-color: var(--border-glow); background: rgba(0,200,255,0.05); }
.planet-slot.active { border-color: var(--accent); background: rgba(0,200,255,0.1); box-shadow: 0 0 10px rgba(0,200,255,0.15); }
.planet-emoji  { font-size: 20px; }
.planet-name   { font-size: 9px; color: var(--text-dim); margin-top: 2px; }
.planet-coords { font-size: 8px; color: var(--text-dim); font-family: 'Orbitron', sans-serif; }
.add-planet { border-style: dashed; opacity: 0.5; font-size: 20px; display: flex; align-items: center; justify-content: center; color: var(--text-dim); min-width: 50px; height: 52px; }
.add-planet:hover { opacity: 0.8; }

.main-content { flex: 1; padding: 10px; position: relative; z-index: 1; }

/* ── Mobile & Tablet Optimization ── */
@media (max-width: 768px) {
  .topbar {
    padding: 0 4px;
    grid-template-columns: auto 1fr auto; /* Keep the 3 columns */
    height: auto;
    min-height: 48px;
    flex-wrap: wrap; /* Allow wrapping on smaller screens */
    row-gap: 4px; /* Add some gap between rows if wrapped */
  }
  .logo-area {
    min-width: auto;
    padding: 0 8px;
    border-right: none;
    height: 40px;
  }
  .logo-title, .logo-sub {
    display: none;
  }
  .resource-bar {
    padding: 0 4px;
    mask-image: linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%);
    grid-column: 1 / -1; /* Span all columns on mobile */
    height: 40px;
  }
  .user-area {
    padding: 0 4px;
    border-left: none;
    height: 40px;
    margin-left: auto;
  }
  .user-name {
    display: none;
  }
  
  .nav {
    position: fixed;
    bottom: 0;
    top: auto;
    left: 0;
    width: 100%;
    height: 60px;
    background: #050c1c;
    border-top: 1px solid var(--border);
    border-bottom: none;
    padding: 0;
    z-index: 1000;
    justify-content: flex-start;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
  }
  .nav-btn {
    flex-direction: column;
    justify-content: center;
    height: 100%;
    padding: 0 16px;
    min-width: 70px;
    font-size: 10px;
    gap: 4px;
    border: none;
    border-top: 2px solid transparent;
    border-radius: 0;
  }
  .nav-btn.active {
    border-color: var(--accent);
    background: linear-gradient(180deg, rgba(0,200,255,0.05) 0%, transparent 100%);
    box-shadow: none;
  }
  
  .planet-bar {
    top: 48px;
    z-index: 90;
    padding: 4px 8px;
  }
  .planet-slot {
    min-width: 70px;
    padding: 2px 6px;
  }
  
  .main-content {
    padding-bottom: 80px;
  }
}

.loading-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; position: relative; z-index: 1; }
.loading-icon { font-size: 64px; animation: pulse 2s ease-in-out infinite; filter: drop-shadow(0 0 20px rgba(0,200,255,0.5)); }
.loading-text { font-family: 'Orbitron', sans-serif; font-size: 14px; color: var(--accent); letter-spacing: 2px; }
@keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } }

.energy-banner { padding: 5px 14px; font-size: 11px; text-align: center; font-family: 'Exo 2', sans-serif; }
.energy-banner.warning  { background: rgba(255,165,0,0.15); border-bottom: 1px solid rgba(255,165,0,0.3); color: #ffaa00; }
.energy-banner.critical { background: rgba(255,58,122,0.15); border-bottom: 1px solid rgba(255,58,122,0.3); color: var(--accent2); animation: pulse 1.5s ease-in-out infinite; }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
</style>