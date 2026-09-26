/* TradeForge League Sync
   Active sync module for Sleeper/ESPN UI wiring.

   What this fixes:
   - Your old file was only a placeholder.
   - ESPN sync logic was still buried inside tradeforge-engine.js.
   - This file now takes control of ESPN sync handlers.
   - It preserves Sleeper behavior and only overrides ESPN-specific sync wiring.

   Recommended index.html order:
   player-rater.js
   injury-engine.js
   tradeforge-ai-advisor.js
   tradeforge-engine.js
   tradeforge-league-sync.js
*/

(function(){
  "use strict";

  window.TRADEFORGE_LEAGUE_SYNC_MODULE = true;
  window.TRADEFORGE_LEAGUE_SYNC_VERSION = "2026-09-25 League Sync Module v2";

  function tfLSById(id){
    return document.getElementById(id);
  }

  function tfLSEsc(value){
    return String(value ?? "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function tfLSNorm(value){
    return String(value || "")
      .toLowerCase()
      .replace(/[.'’\-]/g,"")
      .replace(/\b(jr|sr|ii|iii|iv)\b/g,"")
      .replace(/[^a-z0-9]/g,"");
  }

  function tfLSStatus(message){
    const box = tfLSById("espn-status");
    if (box) box.textContent = message;
  }

  function tfLSSetButtonText(id,text){
    const button = tfLSById(id);
    if (button) button.textContent = text;
  }

  function tfLSSafeCall(label,fn){
    try {
      if (typeof fn === "function") return fn();
    } catch(error) {
      console.warn("TradeForge League Sync:",label,"failed.",error);
    }
    return null;
  }

  function tfLSParseLeagueInput(input){
    const raw = String(input || "").trim();

    let leagueId = "";
    let teamId = "";
    let seasonId = "";

    if (/^\d+$/.test(raw)) {
      leagueId = raw;
    } else if (raw) {
      try {
        const url = new URL(raw);
        leagueId = url.searchParams.get("leagueId") || "";
        teamId = url.searchParams.get("teamId") || "";
        seasonId = url.searchParams.get("seasonId") || url.searchParams.get("season") || "";
      } catch(error) {}

      if (!leagueId) {
        const match = raw.match(/leagueId(?:=|\/)(\d+)/i);
        leagueId = match?.[1] || "";
      }

      if (!teamId) {
        const match = raw.match(/teamId(?:=|\/)(\d+)/i);
        teamId = match?.[1] || "";
      }

      if (!seasonId) {
        const match = raw.match(/seasonId(?:=|\/)(\d{4})/i);
        seasonId = match?.[1] || "";
      }
    }

    return {
      leagueId:/^\d+$/.test(leagueId) ? leagueId : "",
      teamId:/^\d+$/.test(teamId) ? teamId : "",
      seasonId:/^\d{4}$/.test(seasonId) ? seasonId : ""
    };
  }

  const ESPN_POSITION_MAP = {
    1:"QB",
    2:"RB",
    3:"WR",
    4:"TE",
    5:"K",
    16:"DST"
  };

  const ESPN_PRO_TEAM_MAP = {
    0:"",
    1:"ATL",
    2:"BUF",
    3:"CHI",
    4:"CIN",
    5:"CLE",
    6:"DAL",
    7:"DEN",
    8:"DET",
    9:"GB",
    10:"TEN",
    11:"IND",
    12:"KC",
    13:"LV",
    14:"LAR",
    15:"MIA",
    16:"MIN",
    17:"NE",
    18:"NO",
    19:"NYG",
    20:"NYJ",
    21:"PHI",
    22:"ARI",
    23:"PIT",
    24:"LAC",
    25:"SF",
    26:"SEA",
    27:"TB",
    28:"WAS",
    29:"CAR",
    30:"JAC",
    33:"BAL",
    34:"HOU"
  };

  const ESPN_LINEUP_SLOT_MAP = {
    0:"QB",
    1:"QB",
    2:"RB",
    3:"WRRB_FLEX",
    4:"WR",
    5:"REC_FLEX",
    6:"TE",
    7:"SUPER_FLEX",
    16:"DEF",
    17:"K",
    20:"BN",
    21:"IR",
    23:"FLEX",
    24:"IR",
    25:"BN"
  };

  function tfLSEspnRosterPositions(lineupSlotCounts){
    const slots = [];

    Object.entries(lineupSlotCounts || {}).forEach(([slotId,count]) => {
      const slotName = ESPN_LINEUP_SLOT_MAP[Number(slotId)];
      if (!slotName) return;

      const amount = Math.max(0,Number(count) || 0);

      for (let i = 0; i < amount; i++) {
        slots.push(slotName);
      }
    });

    return slots;
  }

  function tfLSEspnReceptionScoringItem(league){
    const items = league?.settings?.scoringSettings?.scoringItems || [];

    return (
      items.find(item => Number(item.statId) === 53) ||
      items.find(item => Number(item.statId) === 41) ||
      items.find(item => String(item.statAbbrev || item.abbrev || "").toLowerCase().includes("rec")) ||
      null
    );
  }

  function tfLSEspnSettings(league){
    const recItem = tfLSEspnReceptionScoringItem(league);
    const recPoints = Number(recItem?.points || 0);
    const teOverride = Number(recItem?.pointsOverrides?.[4]);
    const teBonus = Number.isFinite(teOverride) ? Math.max(0,teOverride - recPoints) : 0;

    const lineup = league?.settings?.rosterSettings?.lineupSlotCounts || {};
    const keeperCount = Math.max(
      Number(league?.settings?.draftSettings?.keeperCount || 0),
      Number(league?.settings?.draftSettings?.keeperCountFuture || 0),
      Number(league?.settings?.rosterSettings?.keeperCount || 0)
    );

    return {
      scoringMode:recPoints >= 0.75 ? "ppr" : recPoints >= 0.25 ? "half" : "standard",
      qbMode:Number(lineup[7] || 0) > 0 || Number(lineup[0] || 0) + Number(lineup[1] || 0) > 1 ? "superflex" : "oneqb",
      tePremiumMode:teBonus >= 0.75 ? "full" : teBonus >= 0.25 ? "half" : "off",
      leagueMode:keeperCount > 0 ? "keeper" : "redraft",
      recPoints,
      teBonus
    };
  }

  function tfLSEspnTeamName(team){
    return (
      team?.name ||
      [team?.location,team?.nickname].filter(Boolean).join(" ") ||
      team?.abbrev ||
      "Team " + String(team?.id || "")
    );
  }

  function tfLSEspnNormalizePlayer(entry){
    const player = entry?.playerPoolEntry?.player || entry?.player || {};
    const id = String(entry?.playerId ?? player?.id ?? entry?.playerPoolEntry?.id ?? "");

    if (!id) return null;

    const name = (
      player.fullName ||
      player.displayName ||
      [player.firstName,player.lastName].filter(Boolean).join(" ") ||
      "Unknown Player"
    ).trim();

    const position = ESPN_POSITION_MAP[Number(player.defaultPositionId)] || "";
    const team = ESPN_PRO_TEAM_MAP[Number(player.proTeamId)] || "";

    return {
      id,
      full_name:name,
      first_name:player.firstName || name.split(" ")[0] || "",
      last_name:player.lastName || name.split(" ").slice(1).join(" "),
      position,
      team,
      espn_id:id,
      injury_status:player.injuryStatus || player.injury_status || "",
      injuryStatus:player.injuryStatus || player.injury_status || "",
      injury_body_part:player.injuryBodyPart || player.injuryDetail || "",
      injuryBodyPart:player.injuryBodyPart || player.injuryDetail || "",
      raw:entry
    };
  }

  function tfLSEspnBuildLeagueUrl(leagueId,season,views,extra){
    const base = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${encodeURIComponent(season)}/segments/0/leagues/${encodeURIComponent(leagueId)}`;
    const viewQuery = views.map(view => `view=${encodeURIComponent(view)}`).join("&");
    return `${base}?${viewQuery}${extra ? "&" + extra : ""}`;
  }

  async function tfLSEspnFetchJson(url){
    let response;

    try {
      response = await fetch(url,{
        method:"GET",
        credentials:"include",
        cache:"no-store",
        headers:{
          Accept:"application/json"
        }
      });
    } catch(error) {
      throw new Error("The ESPN request failed before ESPN responded. This can happen if ESPN blocks browser access from GitHub Pages or if the league is private.");
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("ESPN denied access. Public leagues usually work, but private ESPN leagues may require a backend/proxy connection.");
      }

      throw new Error("ESPN request failed (" + response.status + ").");
    }

    const json = await response.json();
    return Array.isArray(json) ? json[0] : json;
  }

  async function tfLSLoadEspnLeague(leagueId,season){
    const statusUrl = tfLSEspnBuildLeagueUrl(
      leagueId,
      season,
      ["mSettings","mTeam","mStatus"],
      ""
    );

    const first = await tfLSEspnFetchJson(statusUrl);

    const scoringPeriod =
      Number(first?.scoringPeriodId || first?.status?.currentMatchupPeriod || first?.status?.latestScoringPeriod || 1);

    const leagueUrl = tfLSEspnBuildLeagueUrl(
      leagueId,
      season,
      ["mSettings","mTeam","mRoster","mDraftDetail","mStatus","mMembers"],
      "scoringPeriodId=" + encodeURIComponent(scoringPeriod)
    );

    return tfLSEspnFetchJson(leagueUrl);
  }
     function tfLSNormalizeEspnLeague(league,selectedTeamId){
    const teams = Array.isArray(league?.teams) ? league.teams : [];

    if (!teams.length) {
      throw new Error("ESPN returned the league, but no team rosters were available.");
    }

    if (selectedTeamId && !teams.some(team => String(team.id) === String(selectedTeamId))) {
      throw new Error("That team ID is not in this ESPN league.");
    }

    const members = Array.isArray(league?.members) ? league.members : [];
    const playerMap = {};
    const rosters = [];
    const users = [];

    teams.forEach(team => {
      const rosterId = String(team.id);
      const ownerId = "espn-team-" + rosterId;
      const entries = Array.isArray(team?.roster?.entries) ? team.roster.entries : [];
      const playerIds = [];

      entries.forEach(entry => {
        const player = tfLSEspnNormalizePlayer(entry);
        if (!player || !player.id) return;

        playerIds.push(player.id);
        playerMap[player.id] = player;
      });

      rosters.push({
        roster_id:rosterId,
        owner_id:ownerId,
        players:playerIds,
        starters:entries
          .filter(entry => {
            const slot = Number(entry.lineupSlotId);
            return slot !== 20 && slot !== 21 && slot !== 24 && slot !== 25;
          })
          .map(entry => String(entry?.playerId ?? entry?.playerPoolEntry?.player?.id ?? ""))
          .filter(Boolean),
        espnTeam:team,
        metadata:{
          team_name:tfLSEspnTeamName(team)
        }
      });

      const member = members.find(member =>
        (team.owners || []).some(owner => String(owner) === String(member.id))
      );

      users.push({
        user_id:ownerId,
        display_name:member?.displayName || tfLSEspnTeamName(team),
        username:member?.displayName || tfLSEspnTeamName(team),
        metadata:{
          team_name:tfLSEspnTeamName(team)
        },
        raw:member || team
      });
    });

    const settings = tfLSEspnSettings(league);
    const recItem = tfLSEspnReceptionScoringItem(league);
    const typeValue = settings.leagueMode === "keeper" ? 1 : 0;

    const normalizedLeague = {
      ...league,
      name:league?.settings?.name || league?.name || "ESPN League",
      roster_positions:tfLSEspnRosterPositions(league?.settings?.rosterSettings?.lineupSlotCounts),
      scoring_settings:{
        rec:Number(recItem?.points || 0),
        bonus_rec_te:settings.teBonus
      },
      settings:{
        ...(league?.settings || {}),
        type:typeValue
      },
      espn:true
    };

    const teamId = String(selectedTeamId || "");
    const selectedRoster = teamId && rosters.some(roster => String(roster.roster_id) === teamId)
      ? teamId
      : String(rosters[0]?.roster_id || "");

    const secondRoster = String(
      rosters.find(roster => String(roster.roster_id) !== selectedRoster)?.roster_id ||
      selectedRoster
    );

    return {
      league:normalizedLeague,
      rosters,
      users,
      players:playerMap,
      settings,
      selectedRoster,
      secondRoster
    };
  }

  function tfLSSetEspnGlobals(state,rawLeague){
    try { syncedProvider = "espn"; } catch(error) { window.syncedProvider = "espn"; }
    try { syncedLeague = state.league; } catch(error) { window.syncedLeague = state.league; }
    try { syncedRosters = state.rosters; } catch(error) { window.syncedRosters = state.rosters; }
    try { syncedUsers = state.users; } catch(error) { window.syncedUsers = state.users; }
    try { sleeperPlayers = state.players; } catch(error) { window.sleeperPlayers = state.players; }
    try { espnLeagueRaw = rawLeague; } catch(error) { window.espnLeagueRaw = rawLeague; }

    try { sleeperScoringMode = state.settings.scoringMode; } catch(error) { window.sleeperScoringMode = state.settings.scoringMode; }
    try { sleeperLeagueMode = state.settings.leagueMode; } catch(error) { window.sleeperLeagueMode = state.settings.leagueMode; }
    try { sleeperQbMode = state.settings.qbMode; } catch(error) { window.sleeperQbMode = state.settings.qbMode; }
    try { sleeperTePremiumMode = state.settings.tePremiumMode; } catch(error) { window.sleeperTePremiumMode = state.settings.tePremiumMode; }

    try { sleeperRosterA = state.selectedRoster; } catch(error) { window.sleeperRosterA = state.selectedRoster; }
    try { sleeperRosterB = state.secondRoster; } catch(error) { window.sleeperRosterB = state.secondRoster; }

    try { sleeperTeamA = []; } catch(error) { window.sleeperTeamA = []; }
    try { sleeperTeamB = []; } catch(error) { window.sleeperTeamB = []; }
    try { sleeperTrendMarket = {}; } catch(error) { window.sleeperTrendMarket = {}; }
    try { leagueTradeFinderBuilds = []; } catch(error) { window.leagueTradeFinderBuilds = []; }

    const nameMap = {};
    Object.entries(state.players || {}).forEach(([id,player]) => {
      const name = player.full_name || [player.first_name,player.last_name].filter(Boolean).join(" ");
      if (name) nameMap[tfLSNorm(name)] = String(id);
    });

    try { sleeperIdByName = nameMap; } catch(error) { window.sleeperIdByName = nameMap; }

    const user = state.selectedRoster ? { user_id:"espn-team-" + state.selectedRoster } : null;
    try { sleeperUser = user; } catch(error) { window.sleeperUser = user; }
  }

  function tfLSRosterName(roster){
    const users = (() => {
      try { return syncedUsers || []; } catch(error) { return window.syncedUsers || []; }
    })();

    const user = users.find(user => String(user.user_id) === String(roster.owner_id));

    return (
      roster?.metadata?.team_name ||
      user?.metadata?.team_name ||
      user?.display_name ||
      "Roster " + String(roster?.roster_id || "")
    );
  }

  function tfLSPopulateRosterSelectors(rosters,rosterA,rosterB){
    const selectA = tfLSById("sleeper-roster-a");
    const selectB = tfLSById("sleeper-roster-b");

    if (!selectA || !selectB) return;

    const html = rosters.map(roster =>
      `<option value="${tfLSEsc(roster.roster_id)}">${tfLSEsc(tfLSRosterName(roster))}</option>`
    ).join("");

    selectA.innerHTML = html;
    selectB.innerHTML = html;

    selectA.value = String(rosterA || "");
    selectB.value = String(rosterB || "");
  }

  function tfLSRefreshSyncedUI(state){
    tfLSPopulateRosterSelectors(state.rosters,state.selectedRoster,state.secondRoster);

    const sleeperName = tfLSById("sleeper-name");
    if (sleeperName) sleeperName.textContent = state.league.name || "ESPN League";

    const sleeperModeLabel = tfLSById("sleeper-mode-label");
    if (sleeperModeLabel && typeof sleeperModeLabel === "object") {
      if (typeof window.sleeperModeLabel === "function") {
        sleeperModeLabel.textContent = window.sleeperModeLabel();
      } else {
        sleeperModeLabel.textContent =
          `${state.settings.scoringMode.toUpperCase()} • ${state.settings.leagueMode} • ${state.settings.qbMode}`;
      }
    }

    const sleeperBar = tfLSById("sleeper-bar");
    if (sleeperBar) sleeperBar.style.display = "block";

    tfLSSetButtonText("sync-button","Sync Sleeper");
    tfLSSetButtonText("espn-sync-button","ESPN Synced ✓");

    const leagueView = tfLSById("league-view-button");
    if (leagueView) leagueView.disabled = false;

    const tradeFinderResults = tfLSById("trade-finder-results");
    if (tradeFinderResults) tradeFinderResults.textContent = "Choose a target player and click Find Trades.";

    tfLSSafeCall("updateSyncedProviderCopy",() => updateSyncedProviderCopy());
    tfLSSafeCall("renderSleeper",() => renderSleeper());

    try {
      location.hash = "league";
    } catch(error) {}

    tfLSSafeCall("setPage",() => setPage("league"));
    tfLSSafeCall("buildLeaguePage",() => buildLeaguePage());
    tfLSSafeCall("tradeForgeEngineRefresh",() => window.tradeForgeEngineRefresh && window.tradeForgeEngineRefresh());
  }

  function tfLSOpenEspnModal(){
    const seasonInput = tfLSById("espn-season");
    if (seasonInput && !seasonInput.value) seasonInput.value = String(new Date().getFullYear());

    tfLSStatus("");

    const modal = tfLSById("espn-modal");
    if (modal) modal.classList.add("show");
  }

  function tfLSCloseEspnModal(){
    const modal = tfLSById("espn-modal");
    if (modal) modal.classList.remove("show");
  }

  async function tfLSSyncEspnLeague(){
    const parsed = tfLSParseLeagueInput(tfLSById("espn-league-input")?.value || "");
    const leagueId = parsed.leagueId;
    const selectedTeamId = String(tfLSById("espn-team-id")?.value || parsed.teamId || "").trim();
    const season = Number(parsed.seasonId || tfLSById("espn-season")?.value || new Date().getFullYear());

    if (!leagueId) {
      tfLSStatus("Enter an ESPN league ID or paste an ESPN league URL.");
      return;
    }

    if (!Number.isInteger(season) || season < 2018) {
      tfLSStatus("Enter a valid ESPN fantasy season, 2018 or newer.");
      return;
    }

    tfLSStatus("Syncing ESPN league...");

    try {
      const league = await tfLSLoadEspnLeague(leagueId,season);
      const state = tfLSNormalizeEspnLeague(league,selectedTeamId);

      tfLSSetEspnGlobals(state,league);
      tfLSRefreshSyncedUI(state);
      tfLSCloseEspnModal();

      window.tradeForgeEspnSyncSummary = {
        ok:true,
        version:window.TRADEFORGE_LEAGUE_SYNC_VERSION,
        leagueId,
        season,
        leagueName:state.league.name,
        teams:state.rosters.length,
        playerRecords:Object.keys(state.players || {}).length,
        settings:state.settings,
        selectedRoster:state.selectedRoster,
        secondRoster:state.secondRoster,
        updatedAt:new Date().toISOString()
      };

      tfLSStatus(`${state.league.name} synced ✓`);
      console.log("TradeForge ESPN sync complete:",window.tradeForgeEspnSyncSummary);
    } catch(error) {
      window.tradeForgeEspnSyncSummary = {
        ok:false,
        version:window.TRADEFORGE_LEAGUE_SYNC_VERSION,
        error:error.message || String(error),
        updatedAt:new Date().toISOString()
      };

      console.warn("TradeForge ESPN sync failed:",error);
      tfLSStatus(error.message || "Unable to sync this ESPN league.");
    }
  }

  function tfLSInstallHandlers(){
    const espnButton = tfLSById("espn-sync-button");
    const espnClose = tfLSById("espn-modal-close");
    const espnConnect = tfLSById("espn-connect-league");

    if (espnButton) espnButton.onclick = tfLSOpenEspnModal;
    if (espnClose) espnClose.onclick = tfLSCloseEspnModal;
    if (espnConnect) espnConnect.onclick = tfLSSyncEspnLeague;

    window.tradeForgeOpenEspnModal = tfLSOpenEspnModal;
    window.tradeForgeSyncEspnLeague = tfLSSyncEspnLeague;
    window.syncEspnLeague = tfLSSyncEspnLeague;
  }

  window.TradeForgeLeagueSync = {
    version:window.TRADEFORGE_LEAGUE_SYNC_VERSION,
    openEspnModal:tfLSOpenEspnModal,
    syncEspnLeague:tfLSSyncEspnLeague,
    parseLeagueInput:tfLSParseLeagueInput
  };

  tfLSInstallHandlers();
  document.addEventListener("DOMContentLoaded",tfLSInstallHandlers);
  window.addEventListener("load",tfLSInstallHandlers);
  setTimeout(tfLSInstallHandlers,50);
  setTimeout(tfLSInstallHandlers,250);
  setTimeout(tfLSInstallHandlers,750);
})();
