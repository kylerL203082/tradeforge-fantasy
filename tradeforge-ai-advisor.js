/* TradeForge AI Trade Advisor 2.1
   Replace the entire tradeforge-ai-advisor.js file with this file.
   This file does not change calculator math. It only renders the advisor.
*/

(function(){
  "use strict";

  window.TRADEFORGE_AI_ADVISOR_VERSION = "2026-09-25 AI Trade Advisor 2.1 Fixed";
  window.TRADEFORGE_AI_ADVISOR_MODULE = true;

  function tfAIById(id){ return document.getElementById(id); }
  function tfAIRound(value){ return Math.round(Number(value || 0) * 10) / 10; }
  function tfAIClamp(value,min,max){ return Math.max(min,Math.min(max,Number(value || 0))); }
  function tfAINum(value,fallback=0){ const n = Number(value); return Number.isFinite(n) ? n : fallback; }
  function tfAIEsc(value){ return String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;"); }
  function tfAINormName(name){ return String(name || "").toLowerCase().replace(/[.'’\-]/g,"").replace(/\b(jr|sr|ii|iii|iv)\b/g,"").replace(/[^a-z0-9]/g,""); }

  function tfAILeagueMode(context){
    if (context && context.synced) {
      try { if (typeof sleeperLeagueMode !== "undefined") return sleeperLeagueMode || "redraft"; } catch(error) {}
    }
    try { if (typeof leagueMode !== "undefined") return leagueMode || "redraft"; } catch(error) {}
    return "redraft";
  }

  function tfAIQbMode(context){
    if (context && context.synced) {
      try { if (typeof sleeperQbMode !== "undefined") return sleeperQbMode || "oneqb"; } catch(error) {}
    }
    try { if (typeof qbMode !== "undefined") return qbMode || "oneqb"; } catch(error) {}
    return "oneqb";
  }

  function tfAIScoringMode(context){
    if (context && context.synced) {
      try { if (typeof sleeperScoringMode !== "undefined") return sleeperScoringMode || "ppr"; } catch(error) {}
    }
    try { if (typeof scoringMode !== "undefined") return scoringMode || "ppr"; } catch(error) {}
    return "ppr";
  }

  function tfAISyncedProvider(){
    try { if (typeof syncedProvider !== "undefined" && syncedProvider) return syncedProvider; } catch(error) {}
    return "synced";
  }

  function tfAIPlayerDatabase(){
    try { if (Array.isArray(playerDatabase)) return playerDatabase; } catch(error) {}
    return Array.isArray(window.playerDatabase) ? window.playerDatabase : [];
  }

  function tfAISyncedRosters(){
    try { if (Array.isArray(syncedRosters)) return syncedRosters; } catch(error) {}
    return Array.isArray(window.syncedRosters) ? window.syncedRosters : [];
  }

  function tfAISleeperPlayers(){
    try { if (sleeperPlayers) return sleeperPlayers; } catch(error) {}
    return window.sleeperPlayers || {};
  }

  function tfAIValue(player,context){
    if (!player) return 0;

    const mode = tfAILeagueMode(context);

    if (player.pos === "PICK") {
      const pickValue = tfAIQbMode(context) === "superflex" ? player.superflex : player.oneqb;
      return tfAINum(pickValue,0);
    }

    try {
      if (typeof value === "function") return tfAINum(value(player),0);
    } catch(error) {}

    if (mode === "dynasty") return tfAINum(player.dynasty,tfAINum(player.redraft,0));
    if (mode === "keeper") return tfAINum(player.keeper,tfAINum(player.redraft,0));

    return tfAINum(player.redraft,0);
  }

  function tfAITeamValue(players,context){
    if (!Array.isArray(players) || !players.length) return 0;

    try {
      if (typeof calculateAdjustedTeamValue === "function") {
        return tfAINum(calculateAdjustedTeamValue(players),0);
      }
    } catch(error) {}

    return players.reduce((sum,player) => sum + tfAIValue(player,context),0);
  }

  function tfAIDifference(a,b){
    const avg = (Math.abs(a) + Math.abs(b)) / 2;
    if (!avg) return 0;
    return Math.abs(a - b) / (avg / 100);
  }

  function tfAITeamLabel(side){
    return side === "A" ? "Team A" : "Team B";
  }

  function tfAITopAsset(players,context){
    return (players || []).slice().sort((a,b) => tfAIValue(b,context) - tfAIValue(a,context))[0] || null;
  }

  function tfAIPositionCounts(players){
    const counts = { QB:0,RB:0,WR:0,TE:0,K:0,DST:0,PICK:0 };
    (players || []).forEach(player => {
      if (!player) return;
      counts[player.pos] = (counts[player.pos] || 0) + 1;
    });
    return counts;
  }

  function tfAIPositionValues(players,context){
    const values = { QB:0,RB:0,WR:0,TE:0,K:0,DST:0,PICK:0 };
    (players || []).forEach(player => {
      if (!player) return;
      values[player.pos] = (values[player.pos] || 0) + tfAIValue(player,context);
    });
    return values;
  }

  function tfAIAverage(list){
    const clean = (list || []).map(Number).filter(Number.isFinite);
    return clean.length ? clean.reduce((sum,value) => sum + value,0) / clean.length : 0;
  }

  function tfAIPlayerAge(player){
    if (!player) return null;

    const directAge = tfAINum(player.age,NaN);
    if (Number.isFinite(directAge)) return directAge;

    const live = player.liveData || {};
    const engine = player.engine || {};
    const dynasty = engine.dynasty || {};
    const keeper = engine.keeper || {};
    const redraft = engine.redraft || {};

    const age = [
      live.age,
      dynasty.age,
      keeper.age,
      redraft.age
    ].map(value => tfAINum(value,NaN)).find(Number.isFinite);

    return Number.isFinite(age) ? age : null;
  }

  function tfAIFutureGap(player){
    if (!player || player.pos === "PICK") return 0;
    return tfAINum(player.dynasty,0) - tfAINum(player.redraft,0);
  }

  function tfAIPrimeText(player){
    if (!player) return "no profile available";
    if (player.pos === "PICK") return "future draft asset";

    const age = tfAIPlayerAge(player);
    const gap = tfAIFutureGap(player);

    if (player.pos === "RB" && age && age >= 28) return "older RB profile with more short-term than long-term value";
    if (["WR","TE"].includes(player.pos) && age && age <= 25) return "young pass-catcher profile with long-term value";
    if (player.pos === "QB" && age && age <= 27) return "young QB profile with multi-year value";
    if (gap >= 8) return "future-leaning dynasty profile";
    if (gap <= -8) return "win-now profile with less dynasty insulation";

    return "balanced current and future profile";
  }

  function tfAIAssetTier(player,context){
    if (!player) return "unknown asset";

    if (player.pos === "PICK") return "draft capital";

    const val = tfAIValue(player,context);

    if (val >= 75) return "elite cornerstone";
    if (val >= 50) return "premium starter";
    if (val >= 25) return "solid starter/flex asset";
    if (val >= 10) return "depth asset";

    return "low-value depth piece";
  }

  function tfAIInjuryText(player,context){
    if (!player) return "";

    if (player.injuryAdjusted && player.injuryNote) return player.injuryNote;
    if (player.injuryStatus) return `${player.injuryStatus}${player.injuryBodyPart ? " • " + player.injuryBodyPart : ""}`;

    const live = player.liveData || {};
    const engine = player.engine || {};
    const modeEngine = engine[tfAILeagueMode(context)] || engine.redraft || engine.keeper || engine.dynasty || {};

    const status = live.injuryStatus || live.injury_status || live.status || modeEngine.injuryStatus || "";
    const bodyPart = live.injuryBodyPart || live.injury_body_part || modeEngine.injuryBodyPart || "";

    return status ? `${status}${bodyPart ? " • " + bodyPart : ""}` : "";
  }

  function tfAIPlayerSummary(player,context){
    if (!player) return "No primary asset found.";

    const injury = tfAIInjuryText(player,context);
    const parts = [
      `${player.name} is a ${tfAIAssetTier(player,context)} at ${tfAIValue(player,context).toFixed(1)} value`,
      tfAIPrimeText(player)
    ];

    if (injury) parts.push(`injury note: ${injury}`);

    return parts.join("; ") + ".";
  }

  function tfAIFindPlayerByName(name,pos){
    const db = tfAIPlayerDatabase();
    const target = tfAINormName(name);

    return (
      db.find(player => tfAINormName(player.name) === target && (!pos || player.pos === pos)) ||
      db.find(player => tfAINormName(player.name) === target) ||
      null
    );
  }

  function tfAIResolveSyncedPlayer(id){
    const players = tfAISleeperPlayers();
    const raw = players[String(id)];

    if (!raw) return null;

    const name = raw.full_name || raw.name || raw.player_name || raw.displayName || `${raw.first_name || ""} ${raw.last_name || ""}`.trim();

    if (!name) return null;

    const pos = raw.position || raw.default_position || raw.pos || "";
    const match = tfAIFindPlayerByName(name,pos);

    if (!match) return null;

    return {
      ...match,
      sleeperId:String(id),
      nflTeam:raw.team || raw.nflTeam || "",
      liveData:raw
    };
  }
     function tfAIFindFullRoster(rosterId){
    if (!rosterId) return [];

    const rosters = tfAISyncedRosters();
    const roster = rosters.find(roster => String(roster.roster_id ?? roster.id ?? roster.owner_id ?? "") === String(rosterId));

    if (!roster) return [];

    const ids = Array.isArray(roster.players) ? roster.players : Array.isArray(roster.starters) ? roster.starters : [];

    return ids.map(id => tfAIResolveSyncedPlayer(id)).filter(Boolean);
  }

  function tfAIAnalyzeTeam(players,contextLabel,rosterId,context){
    const fullRoster = tfAIFindFullRoster(rosterId);
    const source = fullRoster.length >= 5 ? fullRoster : (Array.isArray(players) ? players : []);
    const counts = tfAIPositionCounts(source);
    const positionValues = tfAIPositionValues(source,context);
    const top = tfAITopAsset(source,context);
    const avgAge = tfAIAverage(source.map(tfAIPlayerAge).filter(age => age));
    const redraftTotal = source.reduce((sum,player) => sum + (player.pos === "PICK" ? tfAIValue(player,context) : tfAINum(player.redraft,0)),0);
    const dynastyTotal = source.reduce((sum,player) => sum + (player.pos === "PICK" ? tfAIValue(player,context) : tfAINum(player.dynasty,0)),0);
    const futureGap = dynastyTotal - redraftTotal;
    const hasFullRoster = fullRoster.length >= 5;

    const corePositions = ["QB","RB","WR","TE"];
    const strongest = corePositions.slice().sort((a,b) => (positionValues[b] || 0) - (positionValues[a] || 0))[0] || "WR";
    const weakest = corePositions.slice().sort((a,b) => (positionValues[a] || 0) - (positionValues[b] || 0))[0] || "TE";

    let direction = "Balanced";
    let directionReason = "This profile has a fairly even current/future value mix.";

    if (hasFullRoster && redraftTotal >= dynastyTotal + 20) {
      direction = "Win-now contender";
      directionReason = "The roster leans more current-season than future-value heavy.";
    } else if (hasFullRoster && dynastyTotal >= redraftTotal + 20) {
      direction = "Rebuilder / future-leaning";
      directionReason = "The roster carries more long-term dynasty value than current redraft value.";
    } else if (!hasFullRoster && source.length && source.some(player => player.pos === "PICK") && futureGap >= 10) {
      direction = "Future-leaning package";
      directionReason = "This package includes draft capital or dynasty-weighted assets.";
    } else if (!hasFullRoster && redraftTotal >= dynastyTotal + 8) {
      direction = "Win-now package";
      directionReason = "This package is stronger for immediate production than long-term value.";
    }

    return {
      label:contextLabel,
      source,
      hasFullRoster,
      counts,
      positionValues,
      top,
      avgAge,
      redraftTotal,
      dynastyTotal,
      futureGap,
      direction,
      directionReason,
      strongest,
      weakest
    };
  }

  function tfAITradeImpact(receiving,giving,teamRead,context){
    const receiveCounts = tfAIPositionCounts(receiving);
    const giveCounts = tfAIPositionCounts(giving);
    const receiveTop = tfAITopAsset(receiving,context);
    const giveTop = tfAITopAsset(giving,context);
    const notes = [];

    Object.keys(receiveCounts).forEach(pos => {
      const net = (receiveCounts[pos] || 0) - (giveCounts[pos] || 0);

      if (net > 0 && ["QB","RB","WR","TE","PICK"].includes(pos)) {
        notes.push(`adds ${net} net ${pos}${net > 1 ? "s" : ""}`);
      }

      if (net < 0 && ["QB","RB","WR","TE","PICK"].includes(pos)) {
        notes.push(`gives up ${Math.abs(net)} net ${pos}${Math.abs(net) > 1 ? "s" : ""}`);
      }
    });

    if (receiveTop) notes.push(`best incoming asset: ${receiveTop.name}`);
    if (giveTop) notes.push(`best outgoing asset: ${giveTop.name}`);
    if (teamRead && receiveTop && teamRead.weakest === receiveTop.pos) notes.push(`directly helps the weakest roster area: ${receiveTop.pos}`);
    if (teamRead && giveTop && teamRead.strongest !== giveTop.pos && ["QB","RB","WR","TE"].includes(giveTop.pos)) notes.push("loses value outside the team's strongest room");

    return notes;
  }

  function tfAILeagueContext(context){
    const mode = tfAILeagueMode(context);
    const qb = tfAIQbMode(context);
    const scoring = tfAIScoringMode(context);
    const pieces = [];

    if (mode === "dynasty") pieces.push("Dynasty mode increases the importance of age, long-term value, and draft capital.");
    else if (mode === "keeper") pieces.push("Keeper mode blends immediate production with future value, but this app does not know private keeper cost.");
    else pieces.push("Redraft mode prioritizes current-season production over long-term upside.");

    if (qb === "superflex") pieces.push("Superflex settings raise the importance of reliable QB value.");
    if (scoring === "ppr") pieces.push("PPR scoring supports higher WR/TE reception volume value.");
    if (scoring === "standard") pieces.push("Standard scoring leans more heavily toward TDs and rushing volume.");

    return pieces.join(" ");
  }

  function tfAIFormatFitNotes(teamName,receiving,giving,teamRead,context){
    const notes = [];
    const mode = tfAILeagueMode(context);
    const receiveTop = tfAITopAsset(receiving,context);
    const giveTop = tfAITopAsset(giving,context);
    const incomingGap = receiving.reduce((sum,player) => sum + tfAIFutureGap(player),0);
    const outgoingGap = giving.reduce((sum,player) => sum + tfAIFutureGap(player),0);

    if (mode === "dynasty") {
      if (incomingGap >= outgoingGap + 8) notes.push(`${teamName} gets the better long-term profile in dynasty.`);
      if (outgoingGap >= incomingGap + 8) notes.push(`${teamName} gives away more long-term value than it receives.`);
    }

    if (mode === "redraft") {
      const inNow = receiving.reduce((sum,player) => sum + tfAINum(player.redraft,tfAIValue(player,context)),0);
      const outNow = giving.reduce((sum,player) => sum + tfAINum(player.redraft,tfAIValue(player,context)),0);

      if (inNow >= outNow + 8) notes.push(`${teamName} improves current-season usable value.`);
      if (outNow >= inNow + 8) notes.push(`${teamName} loses current-season usable value.`);
    }

    if (tfAIQbMode(context) === "superflex" && receiveTop && receiveTop.pos === "QB") notes.push(`${teamName} adds a premium Superflex asset.`);
    if (tfAIQbMode(context) === "superflex" && giveTop && giveTop.pos === "QB") notes.push(`${teamName} sends away a premium Superflex asset.`);
    if (teamRead && receiveTop && teamRead.hasFullRoster && teamRead.weakest === receiveTop.pos) notes.push(`${teamName} fills a real roster need at ${receiveTop.pos}.`);

    return notes;
  }

  function tfAIBuildRecommendation(aValue,bValue){
    const difference = tfAIDifference(aValue,bValue);
    const stronger = aValue >= bValue ? "A" : "B";
    const weaker = stronger === "A" ? "B" : "A";

    let label = "Fair but context dependent";
    let className = "hold";
    let detail = "The value gap is small enough that roster fit, format, and team direction matter more than raw value.";

    if (difference <= 5) {
      label = "Fair but context dependent";
      className = "hold";
      detail = "This is within the TradeForge fair range. Decide based on roster construction and format fit.";
    } else if (difference <= 10) {
      label = `Slight edge to ${tfAITeamLabel(stronger)}`;
      className = "hold";
      detail = `${tfAITeamLabel(stronger)} gets a small value edge. ${tfAITeamLabel(weaker)} can still justify it if the trade fixes a roster need.`;
    } else if (difference <= 20) {
      label = `Accept for ${tfAITeamLabel(stronger)} / ask for more for ${tfAITeamLabel(weaker)}`;
      className = "make";
      detail = `${tfAITeamLabel(stronger)} gets a clear value edge. ${tfAITeamLabel(weaker)} should ask for another useful asset or pick.`;
    } else {
      label = `Do not accept as ${tfAITeamLabel(weaker)}`;
      className = "stop";
      detail = `${tfAITeamLabel(weaker)} is giving up too much adjusted value unless there is outside context not captured by TradeForge.`;
    }

    return {
      difference,
      stronger,
      weaker,
      label,
      className,
      detail
    };
  }

  function tfAIBuildAdvisorNotes(teamA,teamB,aRead,bRead,recommendation,context){
    const notes = [];
    const aImpact = tfAITradeImpact(teamB,teamA,aRead,context);
    const bImpact = tfAITradeImpact(teamA,teamB,bRead,context);
    const topA = tfAITopAsset(teamA,context);
    const topB = tfAITopAsset(teamB,context);

    notes.push(`${aRead.label}: ${aRead.direction}. ${aRead.directionReason}`);
    notes.push(`${bRead.label}: ${bRead.direction}. ${bRead.directionReason}`);

    if (topA) notes.push(`Team A's best outgoing asset is ${tfAIPlayerSummary(topA,context)}`);
    if (topB) notes.push(`Team B's best outgoing asset is ${tfAIPlayerSummary(topB,context)}`);

    if (aImpact.length) notes.push(`For Team A, receiving Team B's side ${aImpact.slice(0,4).join(", ")}.`);
    if (bImpact.length) notes.push(`For Team B, receiving Team A's side ${bImpact.slice(0,4).join(", ")}.`);

    notes.push(...tfAIFormatFitNotes("Team A",teamB,teamA,aRead,context));
    notes.push(...tfAIFormatFitNotes("Team B",teamA,teamB,bRead,context));

    if (recommendation.difference <= 5) notes.push("Because this is close on value, the correct move depends on whether you need consolidation, depth, youth, or immediate points.");
    if (teamA.length > teamB.length + 1) notes.push("Team B is consolidating multiple pieces into fewer assets, which usually favors the team receiving the best individual player.");
    if (teamB.length > teamA.length + 1) notes.push("Team A is consolidating multiple pieces into fewer assets, which usually favors the team receiving the best individual player.");

    return notes.filter(Boolean);
  }

  function tfAIBuildTeamCards(aRead,bRead){
    const card = read => {
      const ageText = read.avgAge ? ` • Avg age ${read.avgAge.toFixed(1)}` : "";
      const rosterText = read.hasFullRoster ? "Full roster read" : "Trade package read";

      return `<div class="trade-advisor-detail"><strong>${tfAIEsc(read.label)}:</strong> ${tfAIEsc(read.direction)} — ${tfAIEsc(rosterText)} • Strongest: ${tfAIEsc(read.strongest)} • Weakest: ${tfAIEsc(read.weakest)}${tfAIEsc(ageText)}</div>`;
    };

    return card(aRead) + card(bRead);
  }

  function tfAIRenderTradeAdvisor(targetId,teamA,teamB,totals,context){
    const box = tfAIById(targetId);

    if (!box) return;

    const aPlayers = Array.isArray(teamA) ? teamA : [];
    const bPlayers = Array.isArray(teamB) ? teamB : [];
    const renderContext = {
      ...(context || {}),
      synced:targetId === "sleeper-trade-advisor" || !!(context && (context.rosterA || context.rosterB))
    };

    if (!aPlayers.length || !bPlayers.length) {
      box.className = "trade-advisor-box empty";
      box.textContent = targetId === "sleeper-trade-advisor"
        ? "Build a synced league trade to get advisor guidance."
        : "Add players to both sides to get AI Trade Advisor guidance.";
      return;
    }

    try {
      const aValue = tfAINum(totals && totals.a,tfAITeamValue(aPlayers,renderContext));
      const bValue = tfAINum(totals && totals.b,tfAITeamValue(bPlayers,renderContext));
      const recommendation = tfAIBuildRecommendation(aValue,bValue);
      const aRead = tfAIAnalyzeTeam(aPlayers,"Team A",renderContext.rosterA,renderContext);
      const bRead = tfAIAnalyzeTeam(bPlayers,"Team B",renderContext.rosterB,renderContext);
      const notes = tfAIBuildAdvisorNotes(aPlayers,bPlayers,aRead,bRead,recommendation,renderContext).slice(0,8);
      const contextLine = tfAILeagueContext(renderContext);
      const providerLine = targetId === "sleeper-trade-advisor"
        ? ` Synced roster context is based on the current ${tfAIEsc(tfAISyncedProvider())} league when available.`
        : "";

      box.className = "trade-advisor-box";
      box.innerHTML = `
        <div class="trade-advisor-verdict ${tfAIEsc(recommendation.className)}">${tfAIEsc(recommendation.label)}</div>
        <div class="trade-advisor-detail">Advisor read: Team A ${aValue.toFixed(1)} vs Team B ${bValue.toFixed(1)} • ${recommendation.difference.toFixed(1)}% value gap.</div>
        <div class="trade-advisor-detail">${tfAIEsc(recommendation.detail)}</div>
        ${tfAIBuildTeamCards(aRead,bRead)}
        <ul class="trade-advisor-list">${notes.map(note => `<li>${tfAIEsc(note)}</li>`).join("")}</ul>
        <div class="trade-advisor-context">AI Trade Advisor 2.1 uses TradeForge app data only: player values, league format, package size, synced roster context when available, roster direction, positional fit, and injury fields already loaded into the app.${providerLine} ${tfAIEsc(contextLine)}</div>
      `;
    } catch(error) {
      console.warn("TradeForge AI Advisor render failed:",error);

      box.className = "trade-advisor-box empty";
      box.textContent = "AI Trade Advisor could not render. Check the browser console for the exact error.";
    }
  }

  function tfAIInstallAdvisor(){
    window.renderTradeAdvisor = tfAIRenderTradeAdvisor;
    window.tradeForgeRenderAIAdvisor = tfAIRenderTradeAdvisor;
    window.tradeForgeAnalyzeAdvisorTeam = tfAIAnalyzeTeam;
    window.tradeForgeAIAdvisorVersion = window.TRADEFORGE_AI_ADVISOR_VERSION;
  }

  tfAIInstallAdvisor();
  setTimeout(tfAIInstallAdvisor,0);
  setTimeout(tfAIInstallAdvisor,50);
  setTimeout(tfAIInstallAdvisor,250);
  setTimeout(tfAIInstallAdvisor,750);
  document.addEventListener("DOMContentLoaded",tfAIInstallAdvisor);
  window.addEventListener("load",tfAIInstallAdvisor);
})();
