/* TradeForge Injury Engine v3
   Keeps player-rater.js as the base value file.
   Applies temporary injury adjustments to window.playerDatabase.
   Also writes injury status into player.liveData and player.engine so the existing
   TradeForge Injury Intelligence UI can actually read and display it.
*/

window.TRADEFORGE_INJURY_ENGINE_VERSION = "2026-09-25 Injury Engine v3";

const TRADEFORGE_INJURY_ROWS = [
  ["Puka Nacua","OUT","Hip/Groin","moderate",1,"medium","Short-term redraft hit; smaller keeper/dynasty impact."],
  ["Jayden Daniels","OUT","Left elbow","high",2,"medium","Stronger short-term QB availability penalty."],
  ["Caleb Williams","QUESTIONABLE","Hamstring","moderate",1,"medium","Short-term redraft concern."],
  ["Omar Cooper Jr.","IR_SHORT","Ankle","high",4,"medium","Minimum four-game absence."],
  ["Ja'Kobi Lane","IR_SHORT","Wrist","moderate",4,"low","Minimum four-game absence."],
  ["Demarcus Robinson","IR_SHORT","Ankle","high",4,"medium","High ankle style absence risk."],
  ["Zay Flowers","QUESTIONABLE","Hamstring","moderate",1,"medium","Monitor practice status."],
  ["Mike Evans","QUESTIONABLE","Hip","low",1,"low","Limited short-term concern."],
  ["Charlie Kolar","QUESTIONABLE","Undisclosed","moderate",1,"low","Practice participation concern."],
  ["Brenen Thompson","QUESTIONABLE","Undisclosed","moderate",1,"low","Practice participation concern."],
  ["Keon Coleman","QUESTIONABLE","Undisclosed","low",1,"low","Limited participation concern."],
  ["DJ Moore","QUESTIONABLE","Undisclosed","low",1,"low","Limited participation concern."],
  ["Cooper Kupp","QUESTIONABLE","Undisclosed","low",1,"medium","Limited participation concern with some recurrence caution."],
  ["Chig Okonkwo","QUESTIONABLE","Undisclosed","moderate",1,"low","Practice participation concern."],
  ["Jalen Coker","QUESTIONABLE","Undisclosed","low",1,"low","Limited participation concern."],
  ["Xavier Legette","QUESTIONABLE","Undisclosed","low",1,"low","Limited participation concern."],
  ["Caleb Douglas","QUESTIONABLE","Undisclosed","moderate",1,"low","Practice participation concern."],
  ["Jaylen Wright","QUESTIONABLE","Undisclosed","moderate",1,"medium","Practice participation concern."],
  ["Andrei Iosivas","QUESTIONABLE","Undisclosed","moderate",1,"low","Practice participation concern."],
  ["Rico Dowdle","QUESTIONABLE","Undisclosed","moderate",1,"low","Practice participation concern."],
  ["Michael Pittman Jr.","QUESTIONABLE","Undisclosed","low",1,"low","Limited participation concern."],
  ["Jaylen Warren","QUESTIONABLE","Undisclosed","low",1,"medium","Limited participation concern."],
  ["Adonai Mitchell","QUESTIONABLE","Undisclosed","low",1,"low","Limited participation concern."],
  ["Nico Collins","QUESTIONABLE","Undisclosed","moderate",1,"medium","Practice participation concern."],
  ["Dalton Schultz","QUESTIONABLE","Undisclosed","moderate",1,"low","Practice participation concern."],
  ["Ashton Dulin","QUESTIONABLE","Undisclosed","moderate",1,"low","Practice participation concern."],
  ["Alec Pierce","QUESTIONABLE","Undisclosed","moderate",1,"medium","Practice participation concern."],
  ["LeQuint Allen Jr.","QUESTIONABLE","Undisclosed","low",1,"low","Limited participation concern."],
  ["Tony Pollard","QUESTIONABLE","Undisclosed","low",1,"medium","Limited participation concern."],
  ["Tyjae Spears","QUESTIONABLE","Undisclosed","low",1,"medium","Limited participation concern."],
  ["Jaxson Dart","QUESTIONABLE","Undisclosed","moderate",1,"low","Practice participation concern."],
  ["Brock Bowers","QUESTIONABLE","Undisclosed","moderate",1,"medium","Practice participation concern."],
  ["Barion Brown","QUESTIONABLE","Undisclosed","moderate",1,"low","Practice participation concern."],
  ["Colby Parkinson","QUESTIONABLE","Undisclosed","moderate",1,"low","Practice participation concern."],
  ["Jonah Coleman","QUESTIONABLE","Undisclosed","moderate",1,"low","Practice participation concern."],
  ["Marvin Mims Jr.","QUESTIONABLE","Undisclosed","low",1,"low","Limited participation concern."],
  ["Saquon Barkley","QUESTIONABLE","Undisclosed","low",1,"medium","Limited participation concern."],
  ["Tank Bigsby","QUESTIONABLE","Undisclosed","moderate",1,"low","Practice participation concern."],
  ["Dallas Goedert","QUESTIONABLE","Undisclosed","moderate",1,"medium","Practice participation concern."],
  ["Will Shipley","QUESTIONABLE","Undisclosed","moderate",1,"low","Practice participation concern."],
  ["DeVonta Smith","QUESTIONABLE","Undisclosed","moderate",1,"medium","Practice participation concern."]
];

window.tradeForgeInjuryData = TRADEFORGE_INJURY_ROWS.reduce((data,row) => {
  data[row[0]] = {
    status:row[1],
    bodyPart:row[2],
    severity:row[3],
    expectedWeeks:row[4],
    recurrence:row[5],
    note:row[6]
  };
  return data;
},{});

window.injuryData = window.tradeForgeInjuryData;

(function(){
  const STATUS_PRESETS = {
    HEALTHY:{redraft:0,keeper:0,dynasty:0,availability:100,label:"Healthy"},
    QUESTIONABLE:{redraft:0.06,keeper:0.03,dynasty:0.01,availability:72,label:"Questionable"},
    DOUBTFUL:{redraft:0.18,keeper:0.08,dynasty:0.03,availability:55,label:"Doubtful"},
    OUT:{redraft:0.26,keeper:0.12,dynasty:0.05,availability:45,label:"Out"},
    IR_SHORT:{redraft:0.36,keeper:0.18,dynasty:0.08,availability:40,label:"Short-term IR"},
    IR_LONG:{redraft:0.55,keeper:0.32,dynasty:0.16,availability:28,label:"Long-term IR"},
    SEASON_ENDING:{redraft:0.78,keeper:0.55,dynasty:0.32,availability:12,label:"Season-ending"},
    SUSPENDED:{redraft:0.22,keeper:0.10,dynasty:0.04,availability:55,label:"Suspended"}
  };

  const SEVERITY_ADJUSTMENTS = {
    low:{redraft:0,keeper:0,dynasty:0,availability:0},
    moderate:{redraft:0.04,keeper:0.02,dynasty:0.01,availability:-6},
    high:{redraft:0.09,keeper:0.05,dynasty:0.025,availability:-12}
  };

  const RECURRENCE_ADJUSTMENTS = {
    low:{redraft:0,keeper:0,dynasty:0,availability:0},
    medium:{redraft:0.025,keeper:0.015,dynasty:0.01,availability:-4},
    high:{redraft:0.06,keeper:0.035,dynasty:0.02,availability:-8}
  };

  function tfNormalizeName(name){
    return String(name || "").trim().toLowerCase().replace(/\s+/g," ");
  }

  function tfRound(value){
    return Math.round(Number(value || 0) * 10) / 10;
  }

  function tfClamp(value,min,max){
    return Math.max(min,Math.min(max,Number(value || 0)));
  }

  function tfCleanStatus(status){
    return String(status || "HEALTHY").trim().toUpperCase().replace(/\s+/g,"_");
  }

  function tfCleanLower(value,fallback){
    return String(value || fallback || "low").trim().toLowerCase();
  }

  function tfPenaltyPart(part){
    return part || {redraft:0,keeper:0,dynasty:0,availability:0};
  }

  function tfGetBodyPartRisk(player,injury){
    const bodyPart = String(injury.bodyPart || "").toLowerCase();
    const pos = player.pos;
    const risk = {redraft:0,keeper:0,dynasty:0,availability:0};

    const lowerBody = ["hamstring","knee","ankle","foot","achilles","calf","quad","groin","toe","hip"];
    const upperBody = ["shoulder","elbow","wrist","hand","finger"];
    const core = ["back","neck","rib","oblique"];

    if (lowerBody.some(part => bodyPart.includes(part))) {
      if (["RB","WR","TE"].includes(pos)) {
        risk.redraft += 0.04;
        risk.keeper += 0.02;
        risk.dynasty += 0.01;
        risk.availability -= 5;
      }
      if (pos === "RB") {
        risk.redraft += 0.025;
        risk.keeper += 0.015;
        risk.availability -= 3;
      }
    }

    if (upperBody.some(part => bodyPart.includes(part))) {
      if (pos === "QB") {
        risk.redraft += 0.05;
        risk.keeper += 0.025;
        risk.dynasty += 0.015;
        risk.availability -= 6;
      }
      if (["WR","TE"].includes(pos)) {
        risk.redraft += 0.02;
        risk.keeper += 0.01;
        risk.availability -= 3;
      }
    }

    if (core.some(part => bodyPart.includes(part))) {
      risk.redraft += 0.025;
      risk.keeper += 0.015;
      risk.dynasty += 0.01;
      risk.availability -= 4;
    }

    return risk;
  }
     function tfGetWeeksRisk(injury){
    const weeks = Number(injury.expectedWeeks || 0);
    if (!Number.isFinite(weeks) || weeks <= 0) return {redraft:0,keeper:0,dynasty:0,availability:0};
    if (weeks <= 1) return {redraft:0.02,keeper:0.005,dynasty:0,availability:-2};
    if (weeks <= 3) return {redraft:0.07,keeper:0.025,dynasty:0.01,availability:-6};
    if (weeks <= 6) return {redraft:0.16,keeper:0.07,dynasty:0.025,availability:-12};
    if (weeks <= 10) return {redraft:0.28,keeper:0.13,dynasty:0.055,availability:-20};
    return {redraft:0.45,keeper:0.22,dynasty:0.10,availability:-30};
  }

  function tfBuildInjuryLookup(){
    const raw = window.tradeForgeInjuryData || {};
    return Object.keys(raw).reduce((lookup,name) => {
      lookup[tfNormalizeName(name)] = raw[name];
      return lookup;
    },{});
  }

  function tfGetPlayerInjury(player,lookup){
    return lookup[tfNormalizeName(player.name)] || null;
  }

  function tfCalculatePenalty(player,injury){
    if (!injury) return {redraft:0,keeper:0,dynasty:0,availability:100};

    const status = tfCleanStatus(injury.status);
    const severity = tfCleanLower(injury.severity,"low");
    const recurrence = tfCleanLower(injury.recurrence,"low");

    const preset = tfPenaltyPart(STATUS_PRESETS[status] || STATUS_PRESETS.QUESTIONABLE);
    const severityRisk = tfPenaltyPart(SEVERITY_ADJUSTMENTS[severity]);
    const recurrenceRisk = tfPenaltyPart(RECURRENCE_ADJUSTMENTS[recurrence]);
    const bodyPartRisk = tfGetBodyPartRisk(player,injury);
    const weeksRisk = tfGetWeeksRisk(injury);

    let redraft = preset.redraft + severityRisk.redraft + recurrenceRisk.redraft + bodyPartRisk.redraft + weeksRisk.redraft;
    let keeper = preset.keeper + severityRisk.keeper + recurrenceRisk.keeper + bodyPartRisk.keeper + weeksRisk.keeper;
    let dynasty = preset.dynasty + severityRisk.dynasty + recurrenceRisk.dynasty + bodyPartRisk.dynasty + weeksRisk.dynasty;
    let availability = preset.availability + severityRisk.availability + recurrenceRisk.availability + bodyPartRisk.availability + weeksRisk.availability;

    if (typeof injury.redraftPenalty === "number") redraft = injury.redraftPenalty;
    if (typeof injury.keeperPenalty === "number") keeper = injury.keeperPenalty;
    if (typeof injury.dynastyPenalty === "number") dynasty = injury.dynastyPenalty;
    if (typeof injury.availabilityScore === "number") availability = injury.availabilityScore;

    return {
      redraft:tfClamp(redraft,0,0.90),
      keeper:tfClamp(keeper,0,0.75),
      dynasty:tfClamp(dynasty,0,0.60),
      availability:tfClamp(availability,5,100)
    };
  }

  function tfApplyPenalty(value,penalty){
    return tfRound(tfClamp(value * (1 - penalty),0,100));
  }

  function tfStatusLabel(status){
    const clean = tfCleanStatus(status);
    return (STATUS_PRESETS[clean] && STATUS_PRESETS[clean].label) || clean;
  }

  function tfPrepareBaseValues(player){
    if (typeof player.baseRedraft !== "number") player.baseRedraft = Number(player.redraft || 0);
    if (typeof player.baseKeeper !== "number") player.baseKeeper = Number(player.keeper || 0);
    if (typeof player.baseDynasty !== "number") player.baseDynasty = Number(player.dynasty || 0);
  }

  function tfResetToBase(player){
    tfPrepareBaseValues(player);
    player.redraft = player.baseRedraft;
    player.keeper = player.baseKeeper;
    player.dynasty = player.baseDynasty;
    player.injuryAdjusted = false;
    player.injuryStatus = "";
    player.injuryBodyPart = "";
    player.injuryNote = "";
    player.injuryPenalty = {redraft:0,keeper:0,dynasty:0};
  }

  function tfWriteEngineFields(player,injury,penalty){
    const statusLabel = tfStatusLabel(injury.status);
    const bodyPart = injury.bodyPart || "";
    const note = injury.note || "";
    const availability = tfRound(penalty.availability);

    player.liveData = Object.assign({},player.liveData || {},{
      injury_status:statusLabel,
      injuryStatus:statusLabel,
      injury_body_part:bodyPart,
      injuryBodyPart:bodyPart
    });

    player.engine = player.engine || {};

    ["redraft","keeper","dynasty"].forEach(mode => {
      player.engine[mode] = Object.assign({},player.engine[mode] || {},{
        injuryStatus:statusLabel,
        injuryBodyPart:bodyPart,
        injuryNote:note,
        availabilityScore:availability,
        availability:availability / 100
      });
    });
  }

  function tfApplyInjuryToPlayer(player,injury){
    tfResetToBase(player);

    if (!injury) return player;

    const penalty = tfCalculatePenalty(player,injury);

    player.redraft = tfApplyPenalty(player.baseRedraft,penalty.redraft);
    player.keeper = tfApplyPenalty(player.baseKeeper,penalty.keeper);
    player.dynasty = tfApplyPenalty(player.baseDynasty,penalty.dynasty);

    player.injuryAdjusted = true;
    player.injuryStatus = tfStatusLabel(injury.status);
    player.injuryBodyPart = injury.bodyPart || "";
    player.injuryNote = `${player.injuryStatus}${player.injuryBodyPart ? " • " + player.injuryBodyPart : ""} • Availability ${tfRound(penalty.availability)} / 100${injury.note ? " — " + injury.note : ""}`;
    player.injuryPenalty = {
      redraft:tfRound(penalty.redraft * 100),
      keeper:tfRound(penalty.keeper * 100),
      dynasty:tfRound(penalty.dynasty * 100)
    };

    tfWriteEngineFields(player,injury,penalty);

    return player;
  }

  function tfApplyTradeForgeInjuryEngine(){
    if (!Array.isArray(window.playerDatabase)) {
      console.warn("TradeForge Injury Engine: playerDatabase not found. Make sure player-rater.js loads before injury-engine.js.");
      return {ok:false,adjustedPlayers:0,injuryRecords:Object.keys(window.tradeForgeInjuryData || {}).length};
    }

    const lookup = tfBuildInjuryLookup();
    let adjusted = 0;
    let unmatched = [];

    window.playerDatabase.forEach(player => {
      const injury = tfGetPlayerInjury(player,lookup);
      tfApplyInjuryToPlayer(player,injury);
      if (injury) adjusted++;
    });

    Object.keys(window.tradeForgeInjuryData || {}).forEach(name => {
      const found = window.playerDatabase.some(player => tfNormalizeName(player.name) === tfNormalizeName(name));
      if (!found) unmatched.push(name);
    });

    window.tradeForgeInjuryEngineSummary = {
      ok:true,
      version:window.TRADEFORGE_INJURY_ENGINE_VERSION,
      adjustedPlayers:adjusted,
      injuryRecords:Object.keys(window.tradeForgeInjuryData || {}).length,
      unmatchedPlayers:unmatched,
      updatedAt:new Date().toISOString()
    };

    console.log(`TradeForge Injury Engine loaded: ${adjusted} player(s) adjusted.`);
    if (unmatched.length) console.warn("TradeForge Injury Engine unmatched names:",unmatched);

    window.dispatchEvent(new CustomEvent("tradeforge:injuries-applied",{detail:window.tradeForgeInjuryEngineSummary}));

    return window.tradeForgeInjuryEngineSummary;
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
      injuryPenalty:player.injuryPenalty || {redraft:0,keeper:0,dynasty:0},
      injuryNote:player.injuryNote || "",
      engine:player.engine || null,
      liveData:player.liveData || null
    };
  }

  function tfAddOrUpdatePlayerInjury(playerName,injury){
    if (!playerName || typeof playerName !== "string") return false;
    window.tradeForgeInjuryData[playerName] = injury || {};
    window.injuryData = window.tradeForgeInjuryData;
    tfApplyTradeForgeInjuryEngine();
    return true;
  }

  function tfRemovePlayerInjury(playerName){
    if (!playerName || typeof playerName !== "string") return false;
    delete window.tradeForgeInjuryData[playerName];
    window.injuryData = window.tradeForgeInjuryData;
    tfApplyTradeForgeInjuryEngine();
    return true;
  }

  window.applyTradeForgeInjuryEngine = tfApplyTradeForgeInjuryEngine;
  window.refreshTradeForgeInjuryEngine = tfApplyTradeForgeInjuryEngine;
  window.getPlayerInjuryReport = tfGetPlayerInjuryReport;
  window.addOrUpdatePlayerInjury = tfAddOrUpdatePlayerInjury;
  window.removePlayerInjury = tfRemovePlayerInjury;

  tfApplyTradeForgeInjuryEngine();
})();
