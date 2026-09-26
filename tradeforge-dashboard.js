/* TradeForge Dashboard
   Fixed active dashboard module.

   This replaces the placeholder file.

   What this file does:
   - Populates League Dashboard cards.
   - Populates League Power Rankings.
   - Populates Your Team / Opponent rosters.
   - Populates League Trade Finder dropdowns.
   - Provides fallback Find Trades logic if tradeforge-trade-finder.js is still only a placeholder.
   - Reads the same syncedLeague / syncedRosters / sleeperPlayers state that tradeforge-engine.js creates.
*/

(function(){
  "use strict";

  window.TRADEFORGE_DASHBOARD_MODULE = true;
  window.TRADEFORGE_DASHBOARD_VERSION = "2026-09-25 Dashboard Fixed v2";

  const DASHBOARD_POSITIONS = ["QB","RB","WR","TE"];

  function $(id){
    return document.getElementById(id);
  }

  function esc(value){
    return String(value ?? "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function norm(value){
    return String(value || "")
      .toLowerCase()
      .replace(/[.'’\-]/g,"")
      .replace(/\b(jr|sr|ii|iii|iv)\b/g,"")
      .replace(/[^a-z0-9]/g,"");
  }

  function num(value,fallback=0){
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function ordinal(value){
    const n = Number(value) || 0;
    const lastTwo = n % 100;

    if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`;

    switch(n % 10){
      case 1: return `${n}st`;
      case 2: return `${n}nd`;
      case 3: return `${n}rd`;
      default: return `${n}th`;
    }
  }

  function getSyncedLeague(){
    try { return syncedLeague || null; } catch(error) { return window.syncedLeague || null; }
  }

  function getSyncedRosters(){
    try { return Array.isArray(syncedRosters) ? syncedRosters : []; } catch(error) { return Array.isArray(window.syncedRosters) ? window.syncedRosters : []; }
  }

  function getSyncedUsers(){
    try { return Array.isArray(syncedUsers) ? syncedUsers : []; } catch(error) { return Array.isArray(window.syncedUsers) ? window.syncedUsers : []; }
  }

  function getSleeperPlayers(){
    try { return sleeperPlayers || {}; } catch(error) { return window.sleeperPlayers || {}; }
  }

  function getPlayerDatabase(){
    try { return Array.isArray(playerDatabase) ? playerDatabase : []; } catch(error) { return Array.isArray(window.playerDatabase) ? window.playerDatabase : []; }
  }

  function getDstMap(){
    try { return dst || window.dst || {}; } catch(error) { return window.dst || {}; }
  }

  function getSleeperRosterA(){
    try { return String(sleeperRosterA || ""); } catch(error) { return String(window.sleeperRosterA || ""); }
  }

  function getSleeperRosterB(){
    try { return String(sleeperRosterB || ""); } catch(error) { return String(window.sleeperRosterB || ""); }
  }

  function setSleeperRosterA(value){
    try { sleeperRosterA = String(value || ""); } catch(error) { window.sleeperRosterA = String(value || ""); }
  }

  function setSleeperRosterB(value){
    try { sleeperRosterB = String(value || ""); } catch(error) { window.sleeperRosterB = String(value || ""); }
  }

  function clearSyncedCalculatorTeams(){
    try { sleeperTeamA = []; } catch(error) { window.sleeperTeamA = []; }
    try { sleeperTeamB = []; } catch(error) { window.sleeperTeamB = []; }
    try { leagueTradeFinderBuilds = []; } catch(error) { window.leagueTradeFinderBuilds = []; }
  }

  function getSleeperMode(){
    try { return sleeperLeagueMode || "redraft"; } catch(error) { return window.sleeperLeagueMode || "redraft"; }
  }

  function getSleeperQbMode(){
    try { return sleeperQbMode || "oneqb"; } catch(error) { return window.sleeperQbMode || "oneqb"; }
  }

  function getSyncedProviderName(){
    try {
      if (typeof syncedProviderName === "function") return syncedProviderName();
    } catch(error) {}

    try { return syncedProvider === "espn" ? "ESPN" : "Sleeper"; } catch(error) {}

    return window.syncedProvider === "espn" ? "ESPN" : "Sleeper";
  }

  function getSleeperModeLabel(){
    try {
      if (typeof sleeperModeLabel === "function") return sleeperModeLabel();
    } catch(error) {}

    const scoring = (() => {
      try { return sleeperScoringMode || "ppr"; } catch(error) { return window.sleeperScoringMode || "ppr"; }
    })();

    const league = (() => {
      try { return sleeperLeagueMode || "redraft"; } catch(error) { return window.sleeperLeagueMode || "redraft"; }
    })();

    const qb = (() => {
      try { return sleeperQbMode || "oneqb"; } catch(error) { return window.sleeperQbMode || "oneqb"; }
    })();

    return `${scoring.toUpperCase()} • ${league} • ${qb}`;
  }

  function setText(id,value){
    const el = $(id);
    if (el) el.textContent = value;
  }

  function setHTML(id,value){
    const el = $(id);
    if (el) el.innerHTML = value;
  }

  function rosterName(roster){
    if (!roster) return "Unknown Team";

    const users = getSyncedUsers();
    const user = users.find(user => String(user.user_id) === String(roster.owner_id));

    return (
      roster.metadata?.team_name ||
      user?.metadata?.team_name ||
      user?.display_name ||
      user?.username ||
      `Roster ${roster.roster_id}`
    );
  }

  function getRosterById(rosterId){
    return getSyncedRosters().find(roster => String(roster.roster_id) === String(rosterId)) || null;
  }

  function getMyRosterId(){
    try {
      if (typeof window.getMyRosterId === "function") return String(window.getMyRosterId() || "");
    } catch(error) {}

    try {
      if (typeof getMyRosterId === "function" && getMyRosterId !== window.TradeForgeDashboard?.getMyRosterId) return String(getMyRosterId() || "");
    } catch(error) {}

    const selected = getSleeperRosterA();
    if (selected) return selected;

    const rosters = getSyncedRosters();
    return String(rosters[0]?.roster_id || "");
  }

  function rawPlayerName(record){
    return record?.full_name || [record?.first_name,record?.last_name].filter(Boolean).join(" ") || record?.name || "";
  }

  function rawPlayerPosition(record){
    const pos = record?.position || record?.pos || "";
    if (pos === "DEF") return "DST";
    return pos;
  }

  function matchSyncedPlayer(playerId){
    const id = String(playerId || "");

    if (!id) return null;

    try {
      if (typeof matchSleeper === "function") {
        const matched = matchSleeper(id);
        if (matched) return matched;
      }
    } catch(error) {}

    const syncedPlayers = getSleeperPlayers();
    const record = syncedPlayers[id];

    if (!record) return null;

    const db = getPlayerDatabase();
    const dstMap = getDstMap();

    const rawName = rawPlayerName(record);
    const rawPos = rawPlayerPosition(record);
    const rawTeam = record.team || record.nflTeam || "";

    let base = null;

    if (rawPos === "DST") {
      const dstName = dstMap[id] || dstMap[rawTeam] || rawName;
      base =
        db.find(player => player.pos === "DST" && norm(player.name) === norm(dstName)) ||
        db.find(player => player.pos === "DST" && norm(player.name).includes(norm(rawTeam))) ||
        null;
    }

    if (!base) {
      base =
        db.find(player => player.pos === rawPos && norm(player.name) === norm(rawName)) ||
        db.find(player => norm(player.name) === norm(rawName)) ||
        null;
    }

    if (!base) return null;

    return {
      ...base,
      sleeperId:id,
      nflTeam:rawTeam,
      liveData:record
    };
  }

  function rosterPlayers(rosterOrId){
    const roster = typeof rosterOrId === "object" ? rosterOrId : getRosterById(rosterOrId);

    if (!roster) return [];

    return (roster.players || [])
      .map(playerId => matchSyncedPlayer(playerId))
      .filter(Boolean);
  }

  function rawValue(player,mode){
    if (!player) return 0;

    if (mode === "dynasty") return num(player.dynasty,0);
    if (mode === "keeper") return num(player.keeper,0);

    return num(player.redraft,0);
  }

  function currentValue(player){
    if (!player) return 0;

    try {
      if (typeof sleeperValue === "function") {
        const value = sleeperValue(player);
        if (Number.isFinite(Number(value))) return Number(value);
      }
    } catch(error) {}

    return rawValue(player,getSleeperMode());
  }

  function modeValue(player,mode){
    try {
      if (typeof sleeperValueForMode === "function") {
        const value = sleeperValueForMode(player,mode);
        if (Number.isFinite(Number(value))) return Number(value);
      }
    } catch(error) {}

    return rawValue(player,mode);
  }

  function canFillSlot(player,slot){
    if (!player || !slot) return false;

    const pos = player.pos;

    if (slot === pos) return true;
    if (slot === "DEF" && pos === "DST") return true;
    if (slot === "FLEX" || slot === "WRRBTE_FLEX") return ["RB","WR","TE"].includes(pos);
    if (slot === "WRRB_FLEX") return ["RB","WR"].includes(pos);
    if (slot === "REC_FLEX") return ["WR","TE"].includes(pos);
    if (slot === "SUPER_FLEX" || slot === "OP") return ["QB","RB","WR","TE"].includes(pos);

    return false;
  }

  function starterSlots(){
    const league = getSyncedLeague();
    const slots = Array.isArray(league?.roster_positions) ? league.roster_positions.slice() : [];

    const excluded = new Set(["BN","IR","TAXI"]);

    const filtered = slots.filter(slot => !excluded.has(slot));

    if (filtered.length) return filtered;

    return ["QB","RB","RB","WR","WR","TE","FLEX","K","DST"];
  }

  function starterValue(roster,mode=null){
    const players = rosterPlayers(roster);

    if (!players.length) return 0;

    const slots = starterSlots();

    if (!slots.length) {
      return players
        .slice()
        .sort((a,b) => (mode ? modeValue(b,mode) : currentValue(b)) - (mode ? modeValue(a,mode) : currentValue(a)))
        .slice(0,Math.min(9,players.length))
        .reduce((sum,player) => sum + (mode ? modeValue(player,mode) : currentValue(player)),0);
    }

    const pool = players.slice();

    const orderedSlots = slots.slice().sort((a,b) => {
      const aCount = players.filter(player => canFillSlot(player,a)).length;
      const bCount = players.filter(player => canFillSlot(player,b)).length;
      return aCount - bCount;
    });

    let total = 0;

    orderedSlots.forEach(slot => {
      let bestIndex = -1;
      let bestValue = -1;

      pool.forEach((player,index) => {
        if (!canFillSlot(player,slot)) return;

        const value = mode ? modeValue(player,mode) : currentValue(player);

        if (value > bestValue) {
          bestValue = value;
          bestIndex = index;
        }
      });

      if (bestIndex >= 0) {
        total += bestValue;
        pool.splice(bestIndex,1);
      }
    });

    return total;
  }

  function positionCap(position){
    if (position === "QB") return getSleeperQbMode() === "superflex" ? 2 : 1;
    if (position === "RB" || position === "WR") return 3;
    if (position === "TE") return 2;
    return 1;
  }

  function positionValue(players,position,mode=null){
    return players
      .filter(player => player.pos === position)
      .sort((a,b) => (mode ? modeValue(b,mode) : currentValue(b)) - (mode ? modeValue(a,mode) : currentValue(a)))
      .slice(0,positionCap(position))
      .reduce((sum,player) => sum + (mode ? modeValue(player,mode) : currentValue(player)),0);
  }

  function dashboardMetrics(roster){
    const players = rosterPlayers(roster);
    const total = players.reduce((sum,player) => sum + currentValue(player),0);
    const starters = starterValue(roster);
    const depth = Math.max(0,total - starters);
    const redraftStarters = starterValue(roster,"redraft");
    const dynastyTotal = players.reduce((sum,player) => sum + modeValue(player,"dynasty"),0);

    const positions = {};
    DASHBOARD_POSITIONS.forEach(position => {
      positions[position] = positionValue(players,position);
    });

    const power = (0.6 * starters) + (0.2 * depth) + (0.2 * total);

    return {
      roster,
      rosterId:String(roster.roster_id),
      name:rosterName(roster),
      players,
      matched:players.length,
      rostered:(roster.players || []).length,
      total,
      starters,
      depth,
      redraftStarters,
      dynastyTotal,
      positions,
      power
    };
  }

  function rankBy(metrics,key,rosterId){
    const sorted = metrics.slice().sort((a,b) => b[key] - a[key]);
    const index = sorted.findIndex(item => String(item.rosterId) === String(rosterId));
    return index >= 0 ? index + 1 : sorted.length;
  }

  function positionRank(metrics,position,rosterId){
    const sorted = metrics.slice().sort((a,b) => b.positions[position] - a.positions[position]);
    const index = sorted.findIndex(item => String(item.rosterId) === String(rosterId));
    return index >= 0 ? index + 1 : sorted.length;
  }

  function teamProfile(myMetrics,allMetrics){
    if (getSleeperMode() === "dynasty") {
      const currentRank = rankBy(allMetrics,"redraftStarters",myMetrics.rosterId);
      const futureRank = rankBy(allMetrics,"dynastyTotal",myMetrics.rosterId);

      if (currentRank + 2 < futureRank) {
        return {
          label:"Win-now leaning",
          detail:`Current lineup strength ranks ${ordinal(currentRank)}, while long-term dynasty value ranks ${ordinal(futureRank)}.`
        };
      }

      if (futureRank + 2 < currentRank) {
        return {
          label:"Future-focused",
          detail:`Long-term dynasty value ranks ${ordinal(futureRank)}, while current lineup strength ranks ${ordinal(currentRank)}.`
        };
      }

      return {
        label:"Balanced roster",
        detail:`Current lineup strength ranks ${ordinal(currentRank)} and long-term dynasty value ranks ${ordinal(futureRank)}.`
      };
    }

    const starterRank = rankBy(allMetrics,"starters",myMetrics.rosterId);
    const depthRank = rankBy(allMetrics,"depth",myMetrics.rosterId);

    if (starterRank + 2 < depthRank) {
      return {
        label:"Starter-heavy",
        detail:`The starting lineup ranks ${ordinal(starterRank)}, while roster depth ranks ${ordinal(depthRank)}.`
      };
    }

    if (depthRank + 2 < starterRank) {
      return {
        label:"Depth-heavy",
        detail:`Roster depth ranks ${ordinal(depthRank)}, while the starting lineup ranks ${ordinal(starterRank)}.`
      };
    }

    return {
      label:"Balanced roster",
      detail:`Starting lineup ranks ${ordinal(starterRank)} and depth ranks ${ordinal(depthRank)}.`
    };
  }
     function dashboardTradeOpportunities(myMetrics,allMetrics){
    const leagueSize = allMetrics.length;

    const weakestPositions = DASHBOARD_POSITIONS
      .map(position => ({
        pos:position,
        rank:positionRank(allMetrics,position,myMetrics.rosterId)
      }))
      .sort((a,b) => b.rank - a.rank)
      .slice(0,2);

    const opportunities = [];
    const usedPartners = new Set();

    weakestPositions.forEach(need => {
      const partners = allMetrics
        .filter(team => team.rosterId !== myMetrics.rosterId)
        .map(team => ({
          ...team,
          posRank:positionRank(allMetrics,need.pos,team.rosterId)
        }))
        .sort((a,b) => a.posRank - b.posRank || b.positions[need.pos] - a.positions[need.pos]);

      for (const partner of partners) {
        if (usedPartners.has(partner.rosterId)) continue;

        const targets = partner.players
          .filter(player => player.pos === need.pos)
          .sort((a,b) => currentValue(b) - currentValue(a));

        if (!targets.length) continue;

        let targetIndex = 0;

        if (targets.length >= 2 && need.pos !== "QB") targetIndex = 1;
        if (targets.length >= 2 && need.pos === "QB" && getSleeperQbMode() === "superflex") targetIndex = 1;

        opportunities.push({
          need,
          partner,
          target:targets[targetIndex],
          leagueSize
        });

        usedPartners.add(partner.rosterId);
        break;
      }
    });

    return opportunities.slice(0,3);
  }

  function renderLeagueDashboard(){
    const league = getSyncedLeague();
    const rosters = getSyncedRosters();

    if (!league || !rosters.length) {
      setText("dashboard-overall-rank","—");
      setText("dashboard-overall-detail","No synced league found");
      setText("dashboard-starter-rank","—");
      setText("dashboard-starter-detail","—");
      setText("dashboard-depth-rank","—");
      setText("dashboard-depth-detail","—");
      setText("dashboard-future-rank","—");
      setText("dashboard-future-detail","—");
      setText("dashboard-profile","—");
      setText("dashboard-profile-detail","Sync a league first.");
      setText("dashboard-position-summary","—");
      setText("dashboard-position-detail","—");
      setHTML("dashboard-position-grid","");
      setHTML("dashboard-power-body","");
      setHTML("dashboard-trade-opportunities","");
      return;
    }

    const metrics = rosters
      .map(dashboardMetrics)
      .filter(item => item.matched > 0);

    if (!metrics.length) {
      const totalRostered = rosters.reduce((sum,roster) => sum + ((roster.players || []).length),0);

      setText("dashboard-overall-rank","—");
      setText("dashboard-overall-detail","No matched TradeForge players");
      setText("dashboard-starter-rank","—");
      setText("dashboard-starter-detail","No matched starters");
      setText("dashboard-depth-rank","—");
      setText("dashboard-depth-detail","No matched depth");
      setText("dashboard-future-label",getSleeperMode() === "dynasty" ? "FUTURE VALUE" : "TOTAL ROSTER VALUE");
      setText("dashboard-future-rank","—");
      setText("dashboard-future-detail","No matched values");
      setText("dashboard-coverage",`0/${totalRostered} rostered players matched`);
      setText("dashboard-subtitle",`${league.name || "Synced League"} • ${getSleeperModeLabel()} • No matched TradeForge players`);
      setText("dashboard-profile","No matched players");
      setText("dashboard-profile-detail","The synced league loaded, but roster players are not matching the TradeForge database.");
      setText("dashboard-position-summary","No position data");
      setText("dashboard-position-detail","Check player names/positions in player-rater.js.");
      setHTML("dashboard-position-grid","");
      setHTML("dashboard-power-body","");
      setHTML("dashboard-trade-opportunities",'<div class="trade-opportunity"><div class="sub">No matched roster data available yet.</div></div>');
      return;
    }

    const myRosterId = getMyRosterId();
    const myMetrics = metrics.find(item => item.rosterId === String(myRosterId)) || metrics[0];
    const leagueSize = metrics.length;

    const overallRank = rankBy(metrics,"power",myMetrics.rosterId);
    const starterRank = rankBy(metrics,"starters",myMetrics.rosterId);
    const depthRank = rankBy(metrics,"depth",myMetrics.rosterId);
    const futureKey = getSleeperMode() === "dynasty" ? "dynastyTotal" : "total";
    const futureRank = rankBy(metrics,futureKey,myMetrics.rosterId);

    setText("dashboard-overall-rank",`${ordinal(overallRank)} / ${leagueSize}`);
    setText("dashboard-overall-detail",`${myMetrics.power.toFixed(1)} power score`);

    setText("dashboard-starter-rank",`${ordinal(starterRank)} / ${leagueSize}`);
    setText("dashboard-starter-detail",`${myMetrics.starters.toFixed(1)} starter value`);

    setText("dashboard-depth-rank",`${ordinal(depthRank)} / ${leagueSize}`);
    setText("dashboard-depth-detail",`${myMetrics.depth.toFixed(1)} depth value`);

    setText("dashboard-future-label",getSleeperMode() === "dynasty" ? "FUTURE VALUE" : "TOTAL ROSTER VALUE");
    setText("dashboard-future-rank",`${ordinal(futureRank)} / ${leagueSize}`);
    setText(
      "dashboard-future-detail",
      getSleeperMode() === "dynasty"
        ? `${myMetrics.dynastyTotal.toFixed(1)} dynasty value`
        : `${myMetrics.total.toFixed(1)} total value`
    );

    const totalRostered = rosters.reduce((sum,roster) => sum + ((roster.players || []).length),0);
    const totalMatched = metrics.reduce((sum,item) => sum + item.matched,0);

    setText("dashboard-coverage",`${totalMatched}/${totalRostered} rostered players matched`);
    setText("dashboard-subtitle",`${league.name || "Synced League"} • ${getSleeperModeLabel()} • TradeForge league analysis`);

    const profile = teamProfile(myMetrics,metrics);

    setText("dashboard-profile",profile.label);
    setText("dashboard-profile-detail",profile.detail);

    const positionRows = DASHBOARD_POSITIONS
      .map(position => ({
        pos:position,
        rank:positionRank(metrics,position,myMetrics.rosterId),
        value:myMetrics.positions[position] || 0
      }))
      .sort((a,b) => a.rank - b.rank);

    const strongest = positionRows[0];
    const weakest = positionRows[positionRows.length - 1];

    setText("dashboard-position-summary",`Strongest: ${strongest.pos} • Biggest need: ${weakest.pos}`);
    setText("dashboard-position-detail",`${strongest.pos} ranks ${ordinal(strongest.rank)} in the league. ${weakest.pos} ranks ${ordinal(weakest.rank)}.`);

    setHTML(
      "dashboard-position-grid",
      DASHBOARD_POSITIONS.map(position => {
        const rank = positionRank(metrics,position,myMetrics.rosterId);
        const value = myMetrics.positions[position] || 0;

        return `
<div class="dashboard-position-card">
  <div class="dashboard-position-head">
    <strong>${position}</strong>
    <span class="dashboard-position-rank">${ordinal(rank)} / ${leagueSize}</span>
  </div>
  <div class="dashboard-position-value">${value.toFixed(1)} TradeForge positional value</div>
</div>`;
      }).join("")
    );

    const opportunities = dashboardTradeOpportunities(myMetrics,metrics);

    setHTML(
      "dashboard-trade-opportunities",
      opportunities.length
        ? opportunities.map((opportunity,index) => `
<div class="trade-opportunity">
  <strong>Opportunity ${index + 1}: ${esc(opportunity.partner.name)}</strong>
  <div class="sub">
    Your ${opportunity.need.pos} room ranks ${ordinal(opportunity.need.rank)} of ${opportunity.leagueSize}.
    ${esc(opportunity.partner.name)} ranks ${ordinal(opportunity.partner.posRank)} at ${opportunity.need.pos}.
    A player worth exploring is ${esc(opportunity.target.name)} at ${currentValue(opportunity.target).toFixed(1)} TradeForge value.
  </div>
</div>`).join("")
        : '<div class="trade-opportunity"><div class="sub">No clear roster-strength trade opportunities were found with the players currently matched in TradeForge.</div></div>'
    );

    const powerRows = metrics.slice().sort((a,b) => b.power - a.power);

    setHTML(
      "dashboard-power-body",
      powerRows.map((team,index) => {
        const bestPosition = DASHBOARD_POSITIONS
          .map(position => ({
            pos:position,
            rank:positionRank(metrics,position,team.rosterId)
          }))
          .sort((a,b) => a.rank - b.rank)[0];

        return `
<tr class="${team.rosterId === myMetrics.rosterId ? "my-row" : ""}">
  <td class="rank-cell">${index + 1}</td>
  <td><strong>${esc(team.name)}</strong>${team.rosterId === myMetrics.rosterId ? ' <span class="sub">(You)</span>' : ""}</td>
  <td>${team.power.toFixed(1)}</td>
  <td>${team.starters.toFixed(1)}</td>
  <td>${team.depth.toFixed(1)}</td>
  <td>${bestPosition.pos} • ${ordinal(bestPosition.rank)}</td>
</tr>`;
      }).join("")
    );
  }

  function renderLeagueRoster(rosterId,listId,nameId,metaId){
    const roster = getRosterById(rosterId);

    if (!roster) {
      setText(nameId,"Roster Not Found");
      setText(metaId,"");
      setHTML(listId,"");
      return;
    }

    const rawCount = (roster.players || []).length;
    const players = (roster.players || [])
      .map(playerId => {
        const syncedPlayers = getSleeperPlayers();
        const raw = syncedPlayers[String(playerId)] || null;
        const tradePlayer = matchSyncedPlayer(playerId);

        return {
          name:tradePlayer?.name || rawPlayerName(raw) || "Unknown Player",
          pos:tradePlayer?.pos || rawPlayerPosition(raw) || "",
          team:tradePlayer?.nflTeam || raw?.team || "",
          tradePlayer
        };
      })
      .sort((a,b) => (b.tradePlayer ? currentValue(b.tradePlayer) : -1) - (a.tradePlayer ? currentValue(a.tradePlayer) : -1));

    const valuedPlayers = players.filter(player => player.tradePlayer);
    const totalValue = valuedPlayers.reduce((sum,player) => sum + currentValue(player.tradePlayer),0);

    setText(nameId,rosterName(roster));
    setText(metaId,`${rawCount} players • ${valuedPlayers.length} valued • ${totalValue.toFixed(1)} value`);

    setHTML(
      listId,
      players.length
        ? players.map(player => {
          const valueText = player.tradePlayer ? currentValue(player.tradePlayer).toFixed(1) : "—";
          const meta = [player.pos,player.team].filter(Boolean).join(" • ");

          return `
<div class="roster-player">
  <div>
    <strong>${esc(player.name)}</strong>
    <small>${esc(meta)}</small>
    ${player.tradePlayer ? "" : '<div class="not-valued">Not yet in TradeForge database</div>'}
  </div>
  <div class="roster-value">${valueText}</div>
</div>`;
        }).join("")
        : '<div class="sub">No roster players available.</div>'
    );
  }

  function populateOpponentSelect(myRosterId){
    const select = $("opponent-select");
    if (!select) return "";

    const rosters = getSyncedRosters().filter(roster => String(roster.roster_id) !== String(myRosterId));
    const previous = select.value;

    select.innerHTML = rosters.map(roster => `
<option value="${esc(roster.roster_id)}">${esc(rosterName(roster))}</option>`).join("");

    let selected = previous;

    if (!rosters.some(roster => String(roster.roster_id) === String(selected))) {
      selected = String(rosters[0]?.roster_id || "");
    }

    select.value = selected;

    return selected;
  }

  function buildLeagueTradeFinder(){
    const teamSelect = $("trade-finder-team");
    const targetSelect = $("trade-finder-target");
    const results = $("trade-finder-results");

    if (!teamSelect || !targetSelect) return;

    const myRosterId = getMyRosterId();
    const otherRosters = getSyncedRosters().filter(roster => String(roster.roster_id) !== String(myRosterId));

    const previousTeam = teamSelect.value;

    teamSelect.innerHTML = otherRosters.map(roster => `
<option value="${esc(roster.roster_id)}">${esc(rosterName(roster))}</option>`).join("");

    let selectedTeam = previousTeam;

    if (!otherRosters.some(roster => String(roster.roster_id) === String(selectedTeam))) {
      selectedTeam = String(otherRosters[0]?.roster_id || "");
    }

    teamSelect.value = selectedTeam;

    populateTradeFinderTargets(selectedTeam);

    if (results && !results.textContent.trim()) {
      results.textContent = "Choose a target player and click Find Trades.";
    }
  }

  function populateTradeFinderTargets(rosterId){
    const targetSelect = $("trade-finder-target");

    if (!targetSelect) return;

    const targets = rosterPlayers(rosterId)
      .filter(player => player.pos !== "K" && player.pos !== "DST")
      .sort((a,b) => currentValue(b) - currentValue(a));

    targetSelect.innerHTML = targets.length
      ? targets.map(player => `
<option value="${esc(player.sleeperId || player.pos + "|" + player.name)}">${esc(player.name)} • ${esc(player.pos)} • ${currentValue(player).toFixed(1)}</option>`).join("")
      : '<option value="">No valued players available</option>';
  }

  function tradeFinderSelectedTarget(){
    const rosterId = $("trade-finder-team")?.value || "";
    const targetKey = $("trade-finder-target")?.value || "";

    if (!rosterId || !targetKey) return null;

    return rosterPlayers(rosterId).find(player => {
      const key = player.sleeperId || player.pos + "|" + player.name;
      return String(key) === String(targetKey);
    }) || null;
  }

  function adjustedPackageValue(players){
    try {
      if (typeof adjusted === "function") {
        const value = adjusted(players,[]);
        if (Number.isFinite(Number(value))) return Number(value);
      }
    } catch(error) {}

    const weights = [1,0.95,0.9,0.85,0.8,0.8,0.8,0.8];

    return players
      .slice()
      .sort((a,b) => currentValue(b) - currentValue(a))
      .reduce((sum,player,index) => sum + currentValue(player) * (weights[index] || 0.8),0);
  }

  function tradeDifference(a,b){
    const avg = (a + b) / 2;
    return avg ? Math.abs(a - b) / avg * 100 : 0;
  }

  function gradeDifference(diff){
    if (diff <= 5) return "A+";
    if (diff <= 8) return "A";
    if (diff <= 12) return "B+";
    if (diff <= 18) return "B";
    return "C";
  }

  function combinations(players,max){
    const result = [];

    function walk(start,picked){
      if (picked.length) result.push(picked.slice());
      if (picked.length >= max) return;

      for (let i = start; i < players.length; i++) {
        picked.push(players[i]);
        walk(i + 1,picked);
        picked.pop();
      }
    }

    walk(0,[]);

    return result;
  }

  function findLeagueTrades(){
    const results = $("trade-finder-results");

    if (!results) return;

    const myRosterId = getMyRosterId();
    const target = tradeFinderSelectedTarget();
    const maxSend = Math.max(1,Math.min(3,Number($("trade-finder-max")?.value || 3)));

    if (!myRosterId || !target) {
      results.textContent = "Choose a target player and click Find Trades.";
      return;
    }

    const myPlayers = rosterPlayers(myRosterId)
      .filter(player => player.pos !== "K" && player.pos !== "DST")
      .sort((a,b) => currentValue(b) - currentValue(a))
      .slice(0,28);

    const targetValue = adjustedPackageValue([target]);

    const packages = combinations(myPlayers,maxSend)
      .map(packagePlayers => {
        const packageValue = adjustedPackageValue(packagePlayers);
        const difference = tradeDifference(packageValue,targetValue);

        return {
          packagePlayers,
          packageValue,
          targetValue,
          difference,
          grade:gradeDifference(difference)
        };
      })
      .filter(result => result.packageValue >= targetValue * 0.65)
      .sort((a,b) => a.difference - b.difference || a.packagePlayers.length - b.packagePlayers.length)
      .slice(0,8);

    try { leagueTradeFinderBuilds = packages.map(item => ({...item,target,mineId:myRosterId,otherId:$("trade-finder-team")?.value || ""})); } catch(error) { window.leagueTradeFinderBuilds = packages.map(item => ({...item,target,mineId:myRosterId,otherId:$("trade-finder-team")?.value || ""})); }

    if (!packages.length) {
      results.innerHTML = '<div class="sub">No reasonable packages found for this target.</div>';
      return;
    }

    results.innerHTML = packages.map((item,index) => `
<div class="suggestion league-trade-result">
  <strong>${item.grade} Match • ${item.difference.toFixed(1)}% difference</strong><br><br>
  <strong>You send:</strong> ${item.packagePlayers.map(player => esc(player.name)).join(" + ")}<br>
  <strong>You receive:</strong> ${esc(target.name)}<br><br>
  Value: ${item.packageValue.toFixed(1)} vs ${item.targetValue.toFixed(1)}
  <br><br>
  <button class="secondary build-trade-btn" data-dashboard-build-trade-index="${index}" type="button">Build Trade</button>
</div>`).join("");

    results.querySelectorAll("[data-dashboard-build-trade-index]").forEach(button => {
      button.onclick = () => buildFinderTrade(Number(button.dataset.dashboardBuildTradeIndex));
    });
  }

  function buildFinderTrade(index){
    let builds = [];

    try { builds = Array.isArray(leagueTradeFinderBuilds) ? leagueTradeFinderBuilds : []; } catch(error) { builds = Array.isArray(window.leagueTradeFinderBuilds) ? window.leagueTradeFinderBuilds : []; }

    const build = builds[index];

    if (!build) return;

    setSleeperRosterA(build.mineId);
    setSleeperRosterB(build.otherId);

    if ($("sleeper-roster-a")) $("sleeper-roster-a").value = build.mineId;
    if ($("sleeper-roster-b")) $("sleeper-roster-b").value = build.otherId;

    try { sleeperTeamA = build.packagePlayers.map(player => ({...player})); } catch(error) { window.sleeperTeamA = build.packagePlayers.map(player => ({...player})); }
    try { sleeperTeamB = [{...build.target}]; } catch(error) { window.sleeperTeamB = [{...build.target}]; }

    try { if (typeof renderSleeper === "function") renderSleeper(); } catch(error) {}

    try {
      if (typeof setTradeCenterTab === "function") setTradeCenterTab("calculator");
    } catch(error) {}

    $("trade-center-card")?.scrollIntoView({behavior:"smooth",block:"start"});
  }

  function buildLeaguePage(){
    const league = getSyncedLeague();

    if (!league) return;

    const myRosterId = getMyRosterId();

    setText("league-page-name",`${league.name || getSyncedProviderName() + " League"} • ${getSleeperModeLabel()}`);
    setText("sleeper-name",league.name || `${getSyncedProviderName()} League`);
    setText("sleeper-mode-label",getSleeperModeLabel());

    try {
      if (typeof updateSyncedProviderCopy === "function") updateSyncedProviderCopy();
    } catch(error) {}

    renderLeagueDashboard();
    buildLeagueTradeFinder();
    renderLeagueRoster(myRosterId,"my-team-roster","my-team-name","my-team-meta");

    const opponentId = populateOpponentSelect(myRosterId);

    if (opponentId) {
      renderLeagueRoster(opponentId,"opponent-team-roster","opponent-team-name","opponent-team-meta");
    } else {
      setText("opponent-team-name","No Other Team");
      setText("opponent-team-meta","");
      setHTML("opponent-team-roster","");
    }

    try {
      if (typeof renderSleeper === "function") renderSleeper();
    } catch(error) {}
  }

  function wireDashboardEvents(){
    const tradeTeam = $("trade-finder-team");
    const tradeTarget = $("trade-finder-target");
    const tradeMax = $("trade-finder-max");
    const tradeRun = $("trade-finder-run");
    const opponent = $("opponent-select");
    const rosterA = $("sleeper-roster-a");
    const rosterB = $("sleeper-roster-b");

    if (tradeTeam) {
      tradeTeam.onchange = () => {
        populateTradeFinderTargets(tradeTeam.value);
        setText("trade-finder-results","Choose a target player and click Find Trades.");
      };
    }

    if (tradeTarget) {
      tradeTarget.onchange = () => setText("trade-finder-results","Click Find Trades to search your roster for packages.");
    }

    if (tradeMax) {
      tradeMax.onchange = () => setText("trade-finder-results","Click Find Trades to search your roster for packages.");
    }

    if (tradeRun) {
      tradeRun.onclick = findLeagueTrades;
    }

    if (opponent) {
      opponent.onchange = event => {
        renderLeagueRoster(event.target.value,"opponent-team-roster","opponent-team-name","opponent-team-meta");
      };
    }

    if (rosterA) {
      rosterA.onchange = event => {
        setSleeperRosterA(event.target.value);
        clearSyncedCalculatorTeams();

        try {
          if (typeof renderSleeper === "function") renderSleeper();
        } catch(error) {}

        buildLeaguePage();
      };
    }

    if (rosterB) {
      rosterB.onchange = event => {
        setSleeperRosterB(event.target.value);
        clearSyncedCalculatorTeams();

        try {
          if (typeof renderSleeper === "function") renderSleeper();
        } catch(error) {}

        buildLeaguePage();
      };
    }
  }

  function installDashboardModule(){
    window.renderLeagueDashboard = renderLeagueDashboard;
    window.buildLeaguePage = buildLeaguePage;
    window.buildLeagueTradeFinder = buildLeagueTradeFinder;
    window.populateTradeFinderTargets = populateTradeFinderTargets;
    window.findLeagueTrades = findLeagueTrades;
    window.renderLeagueRoster = renderLeagueRoster;

    window.TradeForgeDashboard = {
      version:window.TRADEFORGE_DASHBOARD_VERSION,
      renderLeagueDashboard,
      buildLeaguePage,
      buildLeagueTradeFinder,
      findLeagueTrades,
      renderLeagueRoster,
      getMyRosterId
    };

    wireDashboardEvents();

    const league = getSyncedLeague();
    const rosters = getSyncedRosters();

    if (league && rosters.length) {
      buildLeaguePage();
    }
  }

  installDashboardModule();

  document.addEventListener("DOMContentLoaded",installDashboardModule);
  window.addEventListener("load",installDashboardModule);

  setTimeout(installDashboardModule,50);
  setTimeout(installDashboardModule,250);
  setTimeout(installDashboardModule,750);
  setTimeout(installDashboardModule,1500);
})();
