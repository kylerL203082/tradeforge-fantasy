/* TradeForge Injury Engine v2
   Purpose:
   - Keeps player-rater.js as the base player value file.
   - Applies temporary injury/availability discounts after player-rater.js loads.
   - Preserves the same playerDatabase contract the app already uses:
     { rank, pos, name, redraft, keeper, dynasty }

   How to use:
   - Add injured players inside window.tradeForgeInjuryData.
   - The engine automatically adjusts redraft, keeper, and dynasty values.
   - Remove a player from tradeForgeInjuryData when healthy.
*/

window.TRADEFORGE_INJURY_ENGINE_VERSION = "2026-09-25 Injury Engine v2";

window.tradeForgeInjuryData = {
  "Puka Nacua": {
    status: "OUT",
    bodyPart: "Hip/Groin",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "medium",
    note: "Reuters reported Nacua out with a hip/groin issue. Short-term redraft hit; smaller keeper/dynasty impact."
  },

  "Jayden Daniels": {
    status: "OUT",
    bodyPart: "Left elbow",
    severity: "high",
    expectedWeeks: 2,
    recurrence: "medium",
    note: "Reported dislocated left elbow with no fracture shown on initial X-rays. Stronger short-term QB availability penalty."
  },

  "Caleb Williams": {
    status: "QUESTIONABLE",
    bodyPart: "Hamstring",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "medium",
    note: "Left game with a non-contact hamstring injury. Short-term redraft concern."
  },

  "Omar Cooper Jr.": {
    status: "IR_SHORT",
    bodyPart: "Ankle",
    severity: "high",
    expectedWeeks: 4,
    recurrence: "medium",
    note: "Reported heading to injured reserve and required to miss at least four games."
  },

  "Ja'Kobi Lane": {
    status: "IR_SHORT",
    bodyPart: "Wrist",
    severity: "moderate",
    expectedWeeks: 4,
    recurrence: "low",
    note: "Placed on injured reserve after wrist surgery. Minimum four-game absence."
  },

  "Demarcus Robinson": {
    status: "IR_SHORT",
    bodyPart: "Ankle",
    severity: "high",
    expectedWeeks: 4,
    recurrence: "medium",
    note: "Reported high ankle sprain with a 3-6 week range. Strong short-term redraft hit."
  },

  "Zay Flowers": {
    status: "QUESTIONABLE",
    bodyPart: "Hamstring",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "medium",
    note: "Listed as day-to-day with a hamstring issue and limited/DNP practice concern."
  },

  "Mike Evans": {
    status: "QUESTIONABLE",
    bodyPart: "Hip",
    severity: "low",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Limited participation/hip issue. Monitor but not a major downgrade yet."
  },

  "Charlie Kolar": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Did not participate in practice on the current NFL injury report."
  },

  "Brenen Thompson": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Did not participate in practice on the current NFL injury report."
  },

  "Keon Coleman": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "low",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Limited participation on the current NFL injury report."
  },

  "DJ Moore": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "low",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Limited participation on the current NFL injury report."
  },

  "Cooper Kupp": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "low",
    expectedWeeks: 1,
    recurrence: "medium",
    note: "Limited participation on the current NFL injury report."
  },

  "Chig Okonkwo": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Did not participate in practice on the current NFL injury report."
  },

  "Jalen Coker": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "low",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Limited participation on the current NFL injury report."
  },

  "Xavier Legette": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "low",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Limited participation on the current NFL injury report."
  },

  "Caleb Douglas": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Did not participate in practice on the current NFL injury report."
  },

  "Jaylen Wright": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "medium",
    note: "Did not participate in practice on the current NFL injury report."
  },

  "Andrei Iosivas": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Did not participate in practice on the current NFL injury report."
  },

  "Rico Dowdle": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Did not participate in practice on the current NFL injury report."
  },

  "Michael Pittman Jr.": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "low",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Limited participation on the current NFL injury report."
  },

  "Jaylen Warren": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "low",
    expectedWeeks: 1,
    recurrence: "medium",
    note: "Limited participation on the current NFL injury report."
  },

  "Adonai Mitchell": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "low",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Limited participation on the current NFL injury report."
  },

  "Nico Collins": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "medium",
    note: "Did not participate in practice on the current NFL injury report."
  },

  "Dalton Schultz": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Did not participate in practice on the current NFL injury report."
  },

  "Ashton Dulin": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Did not participate in practice on the current NFL injury report."
  },

  "Alec Pierce": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "medium",
    note: "Did not participate in practice on the current NFL injury report."
  },

  "LeQuint Allen Jr.": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "low",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Limited participation on the current NFL injury report."
  },

  "Tony Pollard": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "low",
    expectedWeeks: 1,
    recurrence: "medium",
    note: "Limited participation on the current NFL injury report."
  },

  "Tyjae Spears": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "low",
    expectedWeeks: 1,
    recurrence: "medium",
    note: "Limited participation on the current NFL injury report."
  },

  "Jaxson Dart": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Did not participate in practice on the current NFL injury report."
  },

  "Brock Bowers": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "medium",
    note: "Did not participate in practice on the current NFL injury report."
  },

  "Barion Brown": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Did not participate in practice on the current NFL injury report."
  },

  "Colby Parkinson": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Did not participate in practice on the current NFL injury report."
  },

  "Jonah Coleman": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Did not participate in practice on the current NFL injury report."
  },

  "Marvin Mims Jr.": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "low",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Limited participation on the current NFL injury report."
  },

  "Saquon Barkley": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "low",
    expectedWeeks: 1,
    recurrence: "medium",
    note: "Limited participation on the current NFL injury report."
  },

  "Tank Bigsby": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Did not participate in practice on the current NFL injury report."
  },

  "Dallas Goedert": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "medium",
    note: "Did not participate in practice on the current NFL injury report."
  },

  "Will Shipley": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "low",
    note: "Did not participate in practice on the current NFL injury report."
  },

  "DeVonta Smith": {
    status: "QUESTIONABLE",
    bodyPart: "Undisclosed",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "medium",
    note: "Did not participate in practice on the current NFL injury report."
  }
};
  /*
  Example format:

  "Player Name": {
    status: "QUESTIONABLE",
    bodyPart: "Hamstring",
    severity: "moderate",
    expectedWeeks: 1,
    recurrence: "medium",
    note: "Short-term injury concern. Larger redraft impact than dynasty impact."
  }

  Accepted status values:
  HEALTHY
  QUESTIONABLE
  DOUBTFUL
  OUT
  IR_SHORT
  IR_LONG
  SEASON_ENDING
  SUSPENDED

  Accepted severity values:
  low
  moderate
  high

  Accepted recurrence values:
  low
  medium
  high

  Optional manual override:
  redraftPenalty: 0.20,
  keeperPenalty: 0.10,
  dynastyPenalty: 0.05

  Penalties are percentages written as decimals.
  0.20 means a 20% reduction.
  */
};

(function(){
  const STATUS_PRESETS = {
    HEALTHY:{redraft:0,keeper:0,dynasty:0,label:"Healthy"},
    QUESTIONABLE:{redraft:0.06,keeper:0.03,dynasty:0.01,label:"Questionable"},
    DOUBTFUL:{redraft:0.18,keeper:0.08,dynasty:0.03,label:"Doubtful"},
    OUT:{redraft:0.26,keeper:0.12,dynasty:0.05,label:"Out"},
    IR_SHORT:{redraft:0.36,keeper:0.18,dynasty:0.08,label:"Short-term IR"},
    IR_LONG:{redraft:0.55,keeper:0.32,dynasty:0.16,label:"Long-term IR"},
    SEASON_ENDING:{redraft:0.78,keeper:0.55,dynasty:0.32,label:"Season-ending"},
    SUSPENDED:{redraft:0.22,keeper:0.10,dynasty:0.04,label:"Suspended"}
  };

  const SEVERITY_ADJUSTMENTS = {
    low:{redraft:0.00,keeper:0.00,dynasty:0.00},
    moderate:{redraft:0.04,keeper:0.02,dynasty:0.01},
    high:{redraft:0.09,keeper:0.05,dynasty:0.025}
  };

  const RECURRENCE_ADJUSTMENTS = {
    low:{redraft:0.00,keeper:0.00,dynasty:0.00},
    medium:{redraft:0.025,keeper:0.015,dynasty:0.01},
    high:{redraft:0.06,keeper:0.035,dynasty:0.02}
  };

  function tfNormalizeName(name){
    return String(name || "").trim().toLowerCase().replace(/\s+/g," ");
  }

  function tfClamp(value,min,max){
    return Math.max(min,Math.min(max,value));
  }

  function tfRound(value){
    return Math.round(value * 10) / 10;
  }

  function tfCleanStatus(status){
    return String(status || "HEALTHY").trim().toUpperCase().replace(/\s+/g,"_");
  }

  function tfCleanLower(value,fallback){
    return String(value || fallback || "low").trim().toLowerCase();
  }

  function tfGetBodyPartRisk(player,injury){
    const bodyPart = String(injury.bodyPart || "").toLowerCase();
    const pos = player.pos;

    let redraft = 0;
    let keeper = 0;
    let dynasty = 0;

    const lowerBody = ["hamstring","knee","ankle","foot","achilles","calf","quad","groin","toe","hip"];
    const upperBody = ["shoulder","elbow","wrist","hand","finger"];
    const core = ["back","neck","rib","oblique"];

    if (lowerBody.some(part => bodyPart.includes(part))) {
      if (["RB","WR","TE"].includes(pos)) {
        redraft += 0.04;
        keeper += 0.02;
        dynasty += 0.01;
      }
      if (pos === "RB") {
        redraft += 0.025;
        keeper += 0.015;
      }
    }

    if (upperBody.some(part => bodyPart.includes(part))) {
      if (pos === "QB") {
        redraft += 0.05;
        keeper += 0.025;
        dynasty += 0.015;
      }
      if (["WR","TE"].includes(pos)) {
        redraft += 0.02;
        keeper += 0.01;
      }
    }

    if (core.some(part => bodyPart.includes(part))) {
      redraft += 0.025;
      keeper += 0.015;
      dynasty += 0.01;
    }

    return { redraft, keeper, dynasty };
  }

  function tfGetWeeksRisk(injury){
    const weeks = Number(injury.expectedWeeks || 0);

    if (!Number.isFinite(weeks) || weeks <= 0) {
      return { redraft:0, keeper:0, dynasty:0 };
    }

    if (weeks <= 1) {
      return { redraft:0.02, keeper:0.005, dynasty:0 };
    }

    if (weeks <= 3) {
      return { redraft:0.07, keeper:0.025, dynasty:0.01 };
    }

    if (weeks <= 6) {
      return { redraft:0.16, keeper:0.07, dynasty:0.025 };
    }

    if (weeks <= 10) {
      return { redraft:0.28, keeper:0.13, dynasty:0.055 };
    }

    return { redraft:0.45, keeper:0.22, dynasty:0.10 };
  }

  function tfMergePenaltyParts(parts){
    return parts.reduce((total,part) => ({
      redraft:total.redraft + (part.redraft || 0),
      keeper:total.keeper + (part.keeper || 0),
      dynasty:total.dynasty + (part.dynasty || 0)
    }),{redraft:0,keeper:0,dynasty:0});
  }

  function tfBuildInjuryLookup(){
    const raw = window.tradeForgeInjuryData || {};
    const lookup = {};

    Object.keys(raw).forEach(name => {
      lookup[tfNormalizeName(name)] = raw[name];
    });

    return lookup;
  }

  function tfGetPlayerInjury(player,lookup){
    return lookup[tfNormalizeName(player.name)] || null;
  }

  function tfCalculateInjuryPenalty(player,injury){
    if (!injury) {
      return { redraft:0, keeper:0, dynasty:0 };
    }

    const status = tfCleanStatus(injury.status);
    const severity = tfCleanLower(injury.severity,"low");
    const recurrence = tfCleanLower(injury.recurrence,"low");

    const preset = STATUS_PRESETS[status] || STATUS_PRESETS.QUESTIONABLE;
    const severityRisk = SEVERITY_ADJUSTMENTS[severity] || SEVERITY_ADJUSTMENTS.low;
    const recurrenceRisk = RECURRENCE_ADJUSTMENTS[recurrence] || RECURRENCE_ADJUSTMENTS.low;
    const bodyPartRisk = tfGetBodyPartRisk(player,injury);
    const weeksRisk = tfGetWeeksRisk(injury);

    let combined = tfMergePenaltyParts([preset,severityRisk,recurrenceRisk,bodyPartRisk,weeksRisk]);

    if (typeof injury.redraftPenalty === "number") combined.redraft = injury.redraftPenalty;
    if (typeof injury.keeperPenalty === "number") combined.keeper = injury.keeperPenalty;
    if (typeof injury.dynastyPenalty === "number") combined.dynasty = injury.dynastyPenalty;

    combined.redraft = tfClamp(combined.redraft,0,0.90);
    combined.keeper = tfClamp(combined.keeper,0,0.75);
    combined.dynasty = tfClamp(combined.dynasty,0,0.60);

    return combined;
  }
     function tfApplyPenalty(value,penalty){
    return tfRound(tfClamp(value * (1 - penalty),0,100));
  }

  function tfCreateInjuryNote(player,injury,penalty){
    if (!injury) return "";

    const status = STATUS_PRESETS[tfCleanStatus(injury.status)]?.label || injury.status || "Injury concern";
    const bodyPart = injury.bodyPart ? ` • ${injury.bodyPart}` : "";
    const weeks = injury.expectedWeeks ? ` • Est. ${injury.expectedWeeks} week(s)` : "";
    const note = injury.note ? ` — ${injury.note}` : "";
    const redraftImpact = Math.round((penalty.redraft || 0) * 100);

    return `${status}${bodyPart}${weeks} • Redraft impact: -${redraftImpact}%${note}`;
  }

  function tfResetPlayerToBase(player){
    if (typeof player.baseRedraft === "number") player.redraft = player.baseRedraft;
    if (typeof player.baseKeeper === "number") player.keeper = player.baseKeeper;
    if (typeof player.baseDynasty === "number") player.dynasty = player.baseDynasty;

    player.injuryAdjusted = false;
    player.injuryStatus = "";
    player.injuryBodyPart = "";
    player.injuryNote = "";
    player.injuryPenalty = { redraft:0, keeper:0, dynasty:0 };
  }

  function tfPrepareBaseValues(player){
    if (typeof player.baseRedraft !== "number") player.baseRedraft = player.redraft;
    if (typeof player.baseKeeper !== "number") player.baseKeeper = player.keeper;
    if (typeof player.baseDynasty !== "number") player.baseDynasty = player.dynasty;
  }

  function tfApplyInjuryToPlayer(player,injury){
    tfPrepareBaseValues(player);
    tfResetPlayerToBase(player);

    if (!injury) return player;

    const penalty = tfCalculateInjuryPenalty(player,injury);

    player.redraft = tfApplyPenalty(player.baseRedraft,penalty.redraft);
    player.keeper = tfApplyPenalty(player.baseKeeper,penalty.keeper);
    player.dynasty = tfApplyPenalty(player.baseDynasty,penalty.dynasty);

    player.injuryAdjusted = true;
    player.injuryStatus = tfCleanStatus(injury.status);
    player.injuryBodyPart = injury.bodyPart || "";
    player.injuryNote = tfCreateInjuryNote(player,injury,penalty);
    player.injuryPenalty = {
      redraft:tfRound(penalty.redraft * 100),
      keeper:tfRound(penalty.keeper * 100),
      dynasty:tfRound(penalty.dynasty * 100)
    };

    return player;
  }

  function tfApplyTradeForgeInjuryEngine(){
    if (!Array.isArray(window.playerDatabase)) {
      console.warn("TradeForge Injury Engine: playerDatabase not found. Make sure player-rater.js loads before injury-engine.js.");
      return { ok:false, adjusted:0, message:"playerDatabase not found" };
    }

    const lookup = tfBuildInjuryLookup();
    let adjusted = 0;

    window.playerDatabase.forEach(player => {
      const injury = tfGetPlayerInjury(player,lookup);
      tfApplyInjuryToPlayer(player,injury);
      if (injury) adjusted++;
    });

    window.tradeForgeInjuryEngineSummary = {
      ok:true,
      version:window.TRADEFORGE_INJURY_ENGINE_VERSION,
      adjustedPlayers:adjusted,
      injuryRecords:Object.keys(window.tradeForgeInjuryData || {}).length,
      updatedAt:new Date().toISOString()
    };

    console.log(`TradeForge Injury Engine loaded: ${adjusted} player(s) adjusted.`);
    return window.tradeForgeInjuryEngineSummary;
  }

  function tfAddOrUpdatePlayerInjury(playerName,injury){
    if (!playerName || typeof playerName !== "string") {
      console.error("TradeForge Injury Engine: player name is required.");
      return false;
    }

    window.tradeForgeInjuryData[playerName] = injury || {};
    tfApplyTradeForgeInjuryEngine();
    return true;
  }

  function tfRemovePlayerInjury(playerName){
    if (!playerName || typeof playerName !== "string") {
      console.error("TradeForge Injury Engine: player name is required.");
      return false;
    }

    delete window.tradeForgeInjuryData[playerName];
    tfApplyTradeForgeInjuryEngine();
    return true;
  }

  function tfGetPlayerInjuryReport(playerName){
    if (!Array.isArray(window.playerDatabase)) return null;

    const normalized = tfNormalizeName(playerName);
    const player = window.playerDatabase.find(p => tfNormalizeName(p.name) === normalized);

    if (!player) return null;

    return {
      name:player.name,
      pos:player.pos,
      base:{
        redraft:player.baseRedraft ?? player.redraft,
        keeper:player.baseKeeper ?? player.keeper,
        dynasty:player.baseDynasty ?? player.dynasty
      },
      adjusted:{
        redraft:player.redraft,
        keeper:player.keeper,
        dynasty:player.dynasty
      },
      injuryAdjusted:!!player.injuryAdjusted,
      injuryStatus:player.injuryStatus || "",
      injuryBodyPart:player.injuryBodyPart || "",
      injuryPenalty:player.injuryPenalty || { redraft:0, keeper:0, dynasty:0 },
      injuryNote:player.injuryNote || ""
    };
  }

  window.applyTradeForgeInjuryEngine = tfApplyTradeForgeInjuryEngine;
  window.refreshTradeForgeInjuryEngine = tfApplyTradeForgeInjuryEngine;
  window.addOrUpdatePlayerInjury = tfAddOrUpdatePlayerInjury;
  window.removePlayerInjury = tfRemovePlayerInjury;
  window.getPlayerInjuryReport = tfGetPlayerInjuryReport;

  tfApplyTradeForgeInjuryEngine();
})();
