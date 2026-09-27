/* TradeForge Injury Engine
   Dedicated compatibility/normalization module.

   IMPORTANT:
   - This file must NOT redeclare TradeForge core globals such as teamA, teamB,
     scoringMode, leagueMode, syncedLeague, syncedRosters, sleeperPlayers, etc.
   - The actual Injury Intelligence scoring/rendering remains in
     tradeforge-engine.js.
   - This module only normalizes injury metadata and exposes the refresh hook
     that tradeforge-engine.js already calls.
*/

(function(){
  "use strict";

  window.TRADEFORGE_INJURY_ENGINE_MODULE = true;
  window.TRADEFORGE_INJURY_ENGINE_VERSION = "2026-09-26 Injury Engine Module v2";

  function tfInjuryText(value){
    return String(value ?? "").trim();
  }

  function tfInjuryNormalizeStatus(value){
    const raw = tfInjuryText(value);

    if (!raw) return "";

    const lower = raw.toLowerCase();

    if (lower === "ir" || lower.includes("injured reserve")) return "IR";
    if (lower === "pup" || lower.includes("physically unable")) return "PUP";
    if (lower === "nfi" || lower.includes("non-football")) return "NFI";
    if (lower.includes("out")) return "Out";
    if (lower.includes("doubt")) return "Doubtful";
    if (lower.includes("question")) return "Questionable";
    if (lower.includes("suspend")) return "Suspended";
    if (lower.includes("healthy") || lower.includes("active")) return "Active";

    return raw;
  }

  function tfInjuryGetStatus(record){
    if (!record || typeof record !== "object") return "";

    return tfInjuryNormalizeStatus(
      record.injury_status ??
      record.injuryStatus ??
      record.status ??
      ""
    );
  }

  function tfInjuryGetBodyPart(record){
    if (!record || typeof record !== "object") return "";

    return tfInjuryText(
      record.injury_body_part ??
      record.injuryBodyPart ??
      record.injury_detail ??
      record.injuryDetail ??
      ""
    );
  }

  function tfInjuryNormalizeRecord(record){
    if (!record || typeof record !== "object") return false;

    const status = tfInjuryGetStatus(record);
    const bodyPart = tfInjuryGetBodyPart(record);

    let changed = false;

    if (status && record.injury_status !== status){
      record.injury_status = status;
      changed = true;
    }

    if (status && record.injuryStatus !== status){
      record.injuryStatus = status;
      changed = true;
    }

    if (bodyPart && record.injury_body_part !== bodyPart){
      record.injury_body_part = bodyPart;
      changed = true;
    }

    if (bodyPart && record.injuryBodyPart !== bodyPart){
      record.injuryBodyPart = bodyPart;
      changed = true;
    }

    return changed;
  }
    function tfInjuryNormalizePlayer(player){
    if (!player || typeof player !== "object") return false;

    let changed = false;

    if (player.liveData && tfInjuryNormalizeRecord(player.liveData)){
      changed = true;
    }

    const engine = player.engine;

    if (engine && typeof engine === "object"){

      ["redraft","keeper","dynasty"].forEach(function(mode){

        const data = engine[mode];

        if (!data || typeof data !== "object") return;

        const status = tfInjuryNormalizeStatus(
          data.injuryStatus ??
          data.injury_status ??
          ""
        );

        if (status && data.injuryStatus !== status){
          data.injuryStatus = status;
          changed = true;
        }

      });

    }

    return changed;
  }

  function applyTradeForgeInjuryEngine(){

    const database = Array.isArray(window.playerDatabase)
      ? window.playerDatabase
      : [];

    let updated = 0;

    database.forEach(function(player){

      if (tfInjuryNormalizePlayer(player)){
        updated++;
      }

    });

    return {
      ok:true,
      players:database.length,
      updated:updated,
      version:window.TRADEFORGE_INJURY_ENGINE_VERSION
    };
  }

  window.applyTradeForgeInjuryEngine = applyTradeForgeInjuryEngine;

  window.TradeForgeInjuryEngine = {
    version:window.TRADEFORGE_INJURY_ENGINE_VERSION,
    refresh:applyTradeForgeInjuryEngine,
    normalizeStatus:tfInjuryNormalizeStatus,
    getStatus:tfInjuryGetStatus,
    getBodyPart:tfInjuryGetBodyPart
  };

  /*
    player-rater.js loads before this file, so baseline player records can be
    normalized immediately.

    Synced/live records are normalized again whenever tradeforge-engine.js
    calls window.applyTradeForgeInjuryEngine().
  */

  applyTradeForgeInjuryEngine();

})();
