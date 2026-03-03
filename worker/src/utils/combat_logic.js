/**
 * AIKA WORLD — Combat & Mission Logic (Shared)
 * v2.7.0: Decoupled logic for 10/10 stability
 */

export function runBattle(attacker, defender) {
    const getStats = (units, res, builds = []) => {
        const combat = res?.find(r => r.id === 'combat')?.level || 0;
        const shield = res?.find(r => r.id === 'shield')?.level || 0;
        const laser  = res?.find(r => r.id === 'laser')?.level || 0;
        const plasma = res?.find(r => r.id === 'plasma')?.level || 0;
        
        // Advanced formula: Base + Tech bonuses
        const atkBonus = 1 + (combat * 0.10) + (laser * 0.05) + (plasma * 0.12);
        const defBonus = 1 + (shield * 0.10);
        
        const atkTotal = units.reduce((s, u) => s + (u.attack * u.count * atkBonus), 0);
        const defTotal = units.reduce((s, u) => s + (u.shield * u.count * defBonus), 0);
        
        // Defense building adds flat structural integrity to the whole planet
        const defenseBuildingBonus = (builds.find(b => b.id === 'defense')?.level || 0) * 1000;
        
        return { 
            attack: Math.floor(atkTotal), 
            shield: Math.floor(defTotal + defenseBuildingBonus), 
            cargo: units.reduce((s, u) => s + ((u.cargo || 0) * u.count), 0) 
        };
    };

    const rounds = [];
    let curAtkFleet = JSON.parse(JSON.stringify(attacker.fleet));
    let curDefFleet = JSON.parse(JSON.stringify(defender.fleet));
    let curDefDefense = JSON.parse(JSON.stringify(defender.defense || []));

    let lostMetal = 0;
    let lostCrystal = 0;

    const shipCosts = { 
        fighter_s: {m:3000, c:1000}, fighter_l: {m:25000, c:7500}, 
        cruiser: {m:50000, c:15000}, battleship: {m:150000, c:50000}, 
        recycler: {m:10000, c:6000}, miner: {m:10000, c:20000}, colony: {m:10000, c:20000} 
    };

    // ── SIMULATION ──
    for (let r = 1; r <= 3; r++) {
        const atkStats = getStats(curAtkFleet, attacker.research);
        const defStats = getStats([...curDefFleet, ...curDefDefense], defender.research, defender.buildings);
        
        if (atkStats.attack <= 0 || defStats.shield <= 0) break;
        
        rounds.push({ round: r, attackerPower: atkStats.attack, defenderPower: defStats.shield });

        const applyLoss = (units, dmg, totalShield) => {
            if (totalShield <= 0) return units.map(u => ({ ...u, count: 0 }));
            // Nonlinear loss formula: damage vs shield density
            const lossPct = Math.min(1, (dmg / (totalShield * 1.2 + 100)) * 0.8);
            return units.map(u => {
                const countLost = Math.floor(u.count * lossPct);
                const cost = shipCosts[u.id] || {m:0,c:0};
                lostMetal += countLost * cost.m;
                lostCrystal += countLost * cost.c;
                return { ...u, count: u.count - countLost };
            });
        };

        // Defender takes damage from Attacker
        const newDefFleet = applyLoss(curDefFleet, atkStats.attack, defStats.shield);
        const newDefDefense = applyLoss(curDefDefense, atkStats.attack, defStats.shield);
        
        // Attacker takes damage from Defender (retaliation)
        const newAtkFleet = applyLoss(curAtkFleet, defStats.shield * 0.4, atkStats.shield || 1000);

        curAtkFleet = newAtkFleet;
        curDefFleet = newDefFleet;
        curDefDefense = newDefDefense;
    }

    const finalAtkStats = getStats(curAtkFleet, attacker.research);
    const finalDefStats = getStats([...curDefFleet, ...curDefDefense], defender.research, defender.buildings);
    const attackerWins = finalAtkStats.attack > finalDefStats.shield;
    
    let loot = { metal: 0, crystal: 0, deus: 0 };
    let defenderResources = { ...defender.resources };
    
    if (attackerWins) {
        const finalAtk = getStats(curAtkFleet, attacker.research);
        loot.metal   = Math.min(finalAtk.cargo / 2.5, defenderResources.metal * 0.5);
        loot.crystal = Math.min(finalAtk.cargo / 2.5, defenderResources.crystal * 0.5);
        loot.deus    = Math.min(finalAtk.cargo / 10,  defenderResources.deus * 0.3);
        
        defenderResources.metal -= loot.metal;
        defenderResources.crystal -= loot.crystal;
        defenderResources.deus -= loot.deus;
    }

    return {
        attackerWins,
        attackerName: attacker.username,
        defenderName: defender.username,
        initialAtkFleet: attacker.fleet,
        initialDefFleet: defender.fleet,
        initialDefDefense: defender.defense,
        attackerRemainingFleet: curAtkFleet,
        defenderRemainingFleet: curDefFleet,
        defenderRemainingDefense: curDefDefense,
        defenderResources,
        loot,
        rounds,
        debris: { metal: Math.floor(lostMetal * 0.3), crystal: Math.floor(lostCrystal * 0.3) }
    };
}

export function runExpedition(ships) {
    const roll = Math.random();
    const cargo = ships.reduce((s, u) => s + ((u.cargo || 0) * u.count), 0);
    const remainingShips = JSON.parse(JSON.stringify(ships));
    let loot = null;
    let message = "";

    if (roll < 0.25) {
        loot = { metal: Math.floor(cargo * 0.5 * Math.random()), crystal: Math.floor(cargo * 0.25 * Math.random()), deus: Math.floor(cargo * 0.1 * Math.random()) };
        message = "Egy elhagyatott bányász-kolóniára bukkantunk. A raktárak még tele voltak!";
    } else if (roll < 0.45) {
        message = "A mélyűr csendes. A legénység csillagászati méréseket végzett.";
    } else if (roll < 0.55) {
        const bonus = Math.floor(Math.random() * 8) + 2;
        const target = remainingShips.find(s => s.id === 'fighter_s' || s.id === 'miner');
        if (target) { target.count += bonus; message = `Sodródó hajókat találtunk! Sikerült ${bonus} egységet újraindítani és a flottához csatolni.`; }
        else { message = "Egy régi űrállomást találtunk, de nem volt megfelelő felszerelésünk a hasznosításához."; }
    } else if (roll < 0.65) {
        const lossPct = 0.15;
        remainingShips.forEach(s => s.count = Math.floor(s.count * (1 - lossPct)));
        message = "Ionviharba kerültünk! A flotta egy része megrongálódott a turbulenciában.";
    } else if (roll < 0.75) {
        loot = { deus: Math.floor(Math.random() * 1000) + 200 };
        message = "Egy instabil csillag közelében nagy koncentrációjú Déusiumot találtunk.";
    } else if (roll < 0.85) {
        message = "Különös idegen jeleket fogtunk, de a forrást nem sikerült azonosítani.";
    } else {
        message = "A flotta egy fekete lyuk eseményhorizontja közelébe került, a navigáció csak nehezen talált vissza.";
    }

    return { loot, message, remainingShips };
}
