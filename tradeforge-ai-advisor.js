/* TradeForge AI Trade Advisor 2.0
   Replace the entire tradeforge-ai-advisor.js file with this file.
   This file does not change the calculator math. It replaces the advisor renderer only.
*/

(function(){
  "use strict";

  window.TRADEFORGE_AI_ADVISOR_VERSION = "2026-09-25 AI Trade Advisor 2.0";
  window.TRADEFORGE_AI_ADVISOR_MODULE = true;

  function tfAIById(id){ return document.getElementById(id); }
  function tfAIRound(value){ return Math.round(Number(value || 0) * 10) / 10; }
  function tfAIClamp(value,min,max){ return Math.max(min,Math.min(max,Number(value || 0))); }
  function tfAINum(value,fallback){ const n = Number(value); return Number.isFinite(n) ? n : fallback; }
  function tfAIEsc(value){ return String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;"); }
  function tfAICap(value){ const text = String(value || ""); return text ? text.charAt(0).toUpperCase() + text.slice(1) : text; }
  function tfAILeagueMode(){ return typeof leagueMode !== "undefined" ? leagueMode : "redraft"; }
  function tfAIQbMode(){ return typeof qbMode !== "undefined" ? qbMode : "oneqb"; }
  function tfAIScoringMode(){ return typeof scoringMode !== "undefined" ? scoringMode : "ppr"; }
  function tfAISyncedProvider(){ return typeof syncedProvider !== "undefined" && syncedProvider ? syncedProvider : "synced"; }

  function tfAIValue(player,mode){
    if (!player) return 0;
    const useMode = mode || tfAILeagueMode();
    if (player.pos === "PICK") {
      const pickValue = tfAIQbMode() === "superflex" ? player.superflex : player.oneqb;
      return tfAINum(pickValue,0);
    }
    if (typeof value === "function") {
      try { return tfAINum(value(player),0); } catch(error) {}
    }
    return tfAINum(player[useMode],tfAINum(player.redraft,0));
  }

  function tfAITeamValue(players){
    if (!Array.isArray(players) || !players.length) return 0;
    if (typeof calculateAdjustedTeamValue === "function") {
      try { return tfAINum(calculateAdjustedTeamValue(players),0); } catch(error) {}
    }
    return players.reduce((sum,player) => sum + tfAIValue(player),0);
  }

  function tfAIDifference(a,b){
    const avg = (Math.abs(a) + Math.abs(b)) / 2;
    if (!avg) return 0;
    return Math.abs(a - b) / (avg / 100);
  }

  function tfAITeamLabel(side){ return side === "A" ? "Team A" : "Team B"; }

  function tfAITopAsset(players){
    return (players || []).slice().sort((a,b) => tfAIValue(b) - tfAIValue(a))[0] || null;
  }

  function tfAIPositionCounts(players){
    const counts = { QB:0,RB:0,WR:0,TE:0,K:0,DST:0,PICK:0 };
    (players || []).forEach(player => { counts[player.pos] = (counts[player.pos] || 0) + 1; });
    return counts;
  }

  function tfAIPositionValues(players){
    const values = { QB:0,RB:0,WR:0,TE:0,K:0,DST:0,PICK:0 };
    (players || []).forEach(player => { values[player.pos] = (values[player.pos] || 0) + tfAIValue(player); });
    return values;
  }

  function tfAIAverage(list){
    const clean = (list || []).map(Number).filter(Number.isFinite);
    return clean.length ? clean.reduce((sum,value) => sum + value,0) / clean.length : 0;
  }

  function tfAIPlayerAge(player){
    if (!player) return null;
    const age = tfAINum(player.age,NaN);
    if (Number.isFinite(age)) return age;
    const metadata = player.liveData || player.metadata || player.engine || {};
    const metaAge = tfAINum(metadata.age,NaN);
    return Number.isFinite(metaAge) ? metaAge : null;
  }

  function tfAIFutureGap(player){
    if (!player || player.pos === "PICK") return 0;
    return tfAINum(player.dynasty,0) - tfAINum(player.redraft,0);
  }

  function tfAIPrimeText(player){
    if (!player || player.pos === "PICK") return "future draft asset";
    const age = tfAIPlayerAge(player);
    const gap = tfAIFutureGap(player);
    if (player.pos === "RB" && age && age >= 28) return "older RB profile with more short-term than long-term value";
    if (["WR","TE"].includes(player.pos) && age && age <= 25) return "young pass-catcher profile with long-term value";
    if (player.pos === "QB" && age && age <= 27) return "young QB profile with multi-year value";
    if (gap >= 8) return "future-leaning dynasty profile";
    if (gap <= -8) return "win-now profile with less dynasty insulation";
    return "balanced current and future profile";
  }

  function tfAIAssetTier(player){
    const val = tfAIValue(player);
    if (val >= 75) return "elite cornerstone";
    if (val >= 50) return "premium starter";
    if (val >= 25) return "solid starter/flex asset";
    if (val >= 10) return "depth asset";
    if (player && player.pos === "PICK") return "draft capital";
    return "low-value depth piece";
  }

  function tfAIInjuryText(player){
    if (!player) return "";
    if (player.injuryAdjusted && player.injuryNote) return player.injuryNote;
    if (player.injuryStatus) return `${player.injuryStatus}${player.injuryBodyPart ? " • " + player.injuryBodyPart : ""}`;
    const live = player.liveData || {};
    const engineMode = player.engine && player.engine[tfAILeagueMode()] ? player.engine[tfAILeagueMode()] : {};
    const status = live.injuryStatus || live.injury_status || engineMode.injuryStatus || "";
    const bodyPart = live.injuryBodyPart || live.injury_body_part || engineMode.injuryBodyPart || "";
    return status ? `${status}${bodyPart ? " • " + bodyPart : ""}` : "";
  }

  function tfAIPlayerSummary(player){
    if (!player) return "No primary asset found.";
    const injury = tfAIInjuryText(player);
    const parts = [`${player.name} is a ${tfAIAssetTier(player)} at ${tfAIValue(player).toFixed(1)} value`, tfAIPrimeText(player)];
    if (injury) parts.push(`injury note: ${injury}`);
    return parts.join("; ") + ".";
  }

  function tfAIFindFullRoster(rosterId){
    if (!rosterId) return [];
    if (typeof syncedRosters === "undefined" || !Array.isArray(syncedRosters)) return [];
    const roster = syncedRosters.find(r => String(r.roster_id ?? r.id ?? r.owner_id ?? "") === String(rosterId));
    if (!roster) return [];
    const ids = Array.isArray(roster.players) ? roster.players : Array.isArray(roster.starters) ? roster.starters : [];
    if (!ids.length) return [];
    return ids.map(id => tfAIResolveSyncedPlayer(id)).filter(Boolean);
  }

  function tfAIResolveSyncedPlayer(id){
    let raw = null;
    if (typeof sleeperPlayers !== "undefined" && sleeperPlayers) raw = sleeperPlayers[id];
    if (!raw && typeof espnLeagueRaw !== "undefined" && espnLeagueRaw && Array.isArray(espnLeagueRaw.players)) raw = espnLeagueRaw.players.find(p => String(p.id) === String(id));
    if (!raw) return null;
    const name = raw.full_name || raw.name || raw.player_name || raw.displayName || `${raw.first_name || ""} ${raw.last_name || ""}`.trim();
    if (!name) return null;
    const pos = raw.position || raw.default_position || raw.pos || "";
    const match = tfAIFindPlayerByName(name,pos);
    if (!match) return null;
    return Object.assign({},match,{sleeperId:id,liveData:raw});
  }

  function tfAINormName(name){
    return String(name || "").toLowerCase().replace(/[.'’\-]/g,"").replace(/\b(jr|sr|ii|iii|iv)\b/g,"").replace(/[^a-z0-9]/g,"");
  }

  function tfAIFindPlayerByName(name,pos){
    if (typeof playerDatabase === "undefined" || !Array.isArray(playerDatabase)) return null;
    const target = tfAINormName(name);
    return playerDatabase.find(player => tfAINormName(player.name) === target && (!pos || player.pos === pos)) || playerDatabase.find(player => tfAINormName(player.name) === target) || null;
  }

  function tfAIAnalyzeTeam(players,contextLabel,rosterId){
    const fullRoster = tfAIFindFullRoster(rosterId);
    const source = fullRoster.length >= 5 ? fullRoster : (players || []);
    const counts = tfAIPositionCounts(source);
    const positionValues = tfAIPositionValues(source);
    const top = tfAITopAsset(source);
    const avgAge = tfAIAverage(source.map(tfAIPlayerAge).filter(age => age));
    const redraftTotal = source.reduce((sum,p) => sum + (p.pos === "PICK" ? tfAIValue(p) : tfAINum(p.redraft,0)),0);
    const dynastyTotal = source.reduce((sum,p) => sum + (p.pos === "PICK" ? tfAIValue(p) : tfAINum(p.dynasty,0)),0);
    const futureGap = dynastyTotal - redraftTotal;
    const hasFullRoster = fullRoster.length >= 5;
    let direction = "Balanced";
    let directionReason = "This profile has a fairly even current/future value mix.";

    if (hasFullRoster && redraftTotal >= dynastyTotal + 20) {
      direction = "Win-now contender";
      directionReason = "The roster leans more current-season than future-value heavy.";
    } else if (hasFullRoster && dynastyTotal >= redraftTotal + 20) {
      direction = "Rebuilder / future-leaning";
      directionReason = "The roster carries more long-term dynasty value than current redraft value.";
    } else if (!hasFullRoster && players.length && players.some(p => p.pos === "PICK") && futureGap >= 10) {
      direction = "Future-leaning package";
      directionReason = "This package includes draft capital or dynasty-weighted assets.";
    } else if (!hasFullRoster && redraftTotal >= dynastyTotal + 8) {
      direction = "Win-now package";
      directionReason = "This package is stronger for immediate production than long-term value.";
    }

    const corePositions = ["QB","RB","WR","TE"];
         const weakest = corePositions.slice().sort((a,b) => (positionValues[a] || 0) - (positionValues[b] || 0))[0] || "TE";

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

  function tfAITradeImpact(receiving,giving,teamRead){
    const receiveCounts = tfAIPositionCounts(receiving);
    const giveCounts = tfAIPositionCounts(giving);
    const receiveTop = tfAITopAsset(receiving);
    const giveTop = tfAITopAsset(giving);
    const notes = [];

    Object.keys(receiveCounts).forEach(pos => {
      const net = (receiveCounts[pos] || 0) - (giveCounts[pos] || 0);
      if (net > 0 && ["QB","RB","WR","TE","PICK"].includes(pos)) notes.push(`adds ${net} net ${pos}${net > 1 ? "s" : ""}`);
      if (net < 0 && ["QB","RB","WR","TE","PICK"].includes(pos)) notes.push(`gives up ${Math.abs(net)} net ${pos}${Math.abs(net) > 1 ? "s" : ""}`);
    });

    if (receiveTop) notes.push(`best incoming asset: ${receiveTop.name}`);
    if (giveTop) notes.push(`best outgoing asset: ${giveTop.name}`);
    if (teamRead && receiveTop && teamRead.weakest === receiveTop.pos) notes.push(`directly helps the weakest roster area: ${receiveTop.pos}`);
    if (teamRead && giveTop && teamRead.strongest !== giveTop.pos && ["QB","RB","WR","TE"].includes(giveTop.pos)) notes.push(`loses value outside the team's strongest room`);

    return notes;
  }

  function tfAILeagueContext(){
    const mode = tfAILeagueMode();
    const qb = tfAIQbMode();
    const scoring = tfAIScoringMode();
    const pieces = [];

    if (mode === "dynasty") pieces.push("Dynasty mode increases the importance of age, long-term value, and draft capital.");
    else if (mode === "keeper") pieces.push("Keeper mode blends immediate production with future value, but this app does not know private keeper cost.");
    else pieces.push("Redraft mode prioritizes current-season production over long-term upside.");

    if (qb === "superflex") pieces.push("Superflex settings raise the importance of reliable QB value.");
    if (scoring === "ppr") pieces.push("PPR scoring supports higher WR/TE reception volume value.");
    if (scoring === "standard") pieces.push("Standard scoring leans more heavily toward TDs and rushing volume.");

    return pieces.join(" ");
  }

  function tfAIFormatFitNotes(teamName,receiving,giving,teamRead){
    const notes = [];
    const mode = tfAILeagueMode();
    const receiveTop = tfAITopAsset(receiving);
    const giveTop = tfAITopAsset(giving);
    const incomingGap = receiving.reduce((sum,p) => sum + tfAIFutureGap(p),0);
    const outgoingGap = giving.reduce((sum,p) => sum + tfAIFutureGap(p),0);

    if (mode === "dynasty") {
      if (incomingGap >= outgoingGap + 8) notes.push(`${teamName} gets the better long-term profile in dynasty.`);
      if (outgoingGap >= incomingGap + 8) notes.push(`${teamName} gives away more long-term value than it receives.`);
    }

    if (mode === "redraft") {
      const inNow = receiving.reduce((sum,p) => sum + tfAINum(p.redraft,tfAIValue(p)),0);
      const outNow = giving.reduce((sum,p) => sum + tfAINum(p.redraft,tfAIValue(p)),0);
      if (inNow >= outNow + 8) notes.push(`${teamName} improves current-season usable value.`);
      if (outNow >= inNow + 8) notes.push(`${teamName} loses current-season usable value.`);
    }

    if (tfAIQbMode() === "superflex" && receiveTop && receiveTop.pos === "QB") notes.push(`${teamName} adds a premium Superflex asset.`);
    if (tfAIQbMode() === "superflex" && giveTop && giveTop.pos === "QB") notes.push(`${teamName} sends away a premium Superflex asset.`);
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
      detail = "This is within the TradeForge fair range. I would decide based on roster construction and format fit.";
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

    return { difference, stronger, weaker, label, className, detail };
  }

  function tfAIBuildAdvisorNotes(teamA,teamB,aRead,bRead,recommendation){
    const notes = [];
    const aImpact = tfAITradeImpact(teamB,teamA,aRead);
    const bImpact = tfAITradeImpact(teamA,teamB,bRead);
    const topA = tfAITopAsset(teamA);
    const topB = tfAITopAsset(teamB);

    notes.push(`${aRead.label}: ${aRead.direction}. ${aRead.directionReason}`);
    notes.push(`${bRead.label}: ${bRead.direction}. ${bRead.directionReason}`);

    if (topA) notes.push(`Team A's best outgoing asset is ${tfAIPlayerSummary(topA)}`);
    if (topB) notes.push(`Team B's best outgoing asset is ${tfAIPlayerSummary(topB)}`);

    if (aImpact.length) notes.push(`For Team A, receiving Team B's side ${aImpact.slice(0,4).join(", ")}.`);
    if (bImpact.length) notes.push(`For Team B, receiving Team A's side ${bImpact.slice(0,4).join(", ")}.`);

    notes.push(...tfAIFormatFitNotes("Team A",teamB,teamA,aRead));
    notes.push(...tfAIFormatFitNotes("Team B",teamA,teamB,bRead));

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

    if (!aPlayers.length || !bPlayers.length) {
      box.className = "trade-advisor-box empty";
      box.textContent = targetId === "sleeper-trade-advisor" ? "Build a synced league trade to get advisor guidance." : "Add players to both sides to get AI Trade Advisor guidance.";
      return;
    }

    const aValue = tfAINum(totals && totals.a,tfAITeamValue(aPlayers));
    const bValue = tfAINum(totals && totals.b,tfAITeamValue(bPlayers));
    const recommendation = tfAIBuildRecommendation(aValue,bValue);
    const aRead = tfAIAnalyzeTeam(aPlayers,"Team A",context && context.rosterA);
    const bRead = tfAIAnalyzeTeam(bPlayers,"Team B",context && context.rosterB);
    const notes = tfAIBuildAdvisorNotes(aPlayers,bPlayers,aRead,bRead,recommendation).slice(0,8);
    const contextLine = tfAILeagueContext();
    const providerLine = targetId === "sleeper-trade-advisor" ? ` Synced roster context is based on the current ${tfAIEsc(tfAISyncedProvider())} league when available.` : "";

    box.className = "trade-advisor-box";
    box.innerHTML = `
      <div class="trade-advisor-verdict ${tfAIEsc(recommendation.className)}">${tfAIEsc(recommendation.label)}</div>
      <div class="trade-advisor-detail">Advisor read: Team A ${aValue.toFixed(1)} vs Team B ${bValue.toFixed(1)} • ${recommendation.difference.toFixed(1)}% value gap.</div>
      <div class="trade-advisor-detail">${tfAIEsc(recommendation.detail)}</div>
      ${tfAIBuildTeamCards(aRead,bRead)}
      <ul class="trade-advisor-list">${notes.map(note => `<li>${tfAIEsc(note)}</li>`).join("")}</ul>
      <div class="trade-advisor-context">AI Trade Advisor 2.0 uses TradeForge app data only: player values, league format, package size, synced roster context when available, roster direction, positional fit, and injury fields already loaded into the app.${providerLine} ${tfAIEsc(contextLine)}</div>
    `;
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
  document.addEventListener("DOMContentLoaded",tfAIInstallAdvisor);
  window.addEventListener("load",tfAIInstallAdvisor);
})();
    const strongest = corePositions.slice().sort((a,b) => (positionValues[b] || 0) - (positionValues[a] || 0))[0] || "WR";
