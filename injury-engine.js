let teamA=[],teamB=[],scoringMode="ppr",leagueMode="redraft",qbMode="oneqb",tePremiumMode="off",sleeperTeamA=[],sleeperTeamB=[],sleeperScoringMode="ppr",sleeperLeagueMode="redraft",sleeperQbMode="oneqb",sleeperTePremiumMode="off",sleeperCalculationContext=!1,sleeperUser=null,syncedLeague=null,syncedRosters=[],syncedUsers=[],sleeperPlayers={},sleeperRosterA="",sleeperRosterB="",sleeperTrendMarket={},sleeperIdByName={},leagueTradeFinderBuilds=[],syncedProvider="",espnLeagueRaw=null,tradeForgeFeedMeta=null;
const SUPERSTAR_FACTOR=1,PACKAGE_WEIGHTS=[1,.95,.9,.85,.8,.8,.8,.8],multipliers={RB:{ppr:1,half:.98,standard:.95},WR:{ppr:1,half:.96,standard:.91},TE:{ppr:1,half:.95,standard:.89},QB:{ppr:1,half:1,standard:1},K:{ppr:1,half:1,standard:1},DST:{ppr:1,half:1,standard:1}},playerDatabase=window.playerDatabase,picks=window.picks,dst=window.dst,$=e=>document.getElementById(e),key=e=>e.sleeperId||e.pos+"|"+e.name,norm=e=>String(e||"").toLowerCase().replace(/[.'’\-]/g,"").replace(/\b(jr|sr|ii|iii|iv)\b/g,"").replace(/[^a-z0-9]/g,""),esc=e=>String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"),assets=()=>"dynasty"===leagueMode?playerDatabase.concat(picks):playerDatabase,TRADEFORGE_ENGINE={
enabled:!0,weights:{performance:.35,opportunity:.2,scarcity:.15,market:.1,consistency:.1,availability:.05,situation:.05},performanceInputs:{projection:.6,consensus:.25,recent:.15},
keeperWeights:{redraft:.65,dynasty:.35},dynastyYears:{year1:.5,year2:.3,year3:.2},replacementRanks:{QB:15,RB:36,WR:42,TE:15,K:5,DST:5},scarcityBoost:.75,eliteCurveExponent:1.1,
marketSignalGap:8,useSleeperTrendingMarket:!1,useDynamicPickValues:!1,marketAdjustmentMax:.08,futurePickDiscounts:[1,.91,.84,.78]
},tfClamp=(e,t,r)=>Math.max(t,Math.min(r,e)),tfRound=e=>Math.round(10*e)/10,tfIsNumber=e=>("number"==typeof e||"string"==typeof e&&""!==e.trim())&&Number.isFinite(Number(e)),tfNum=(e,t)=>tfIsNumber(e)?Number(e):t,tfStoredRawValue=(e,t)=>tfNum(e?.[t],.1);
function tfHasComponentData(e){
return!!e&&["performance","projection","consensus","recent","upside","opportunity","roleConfidence","scarcity","replacement","market","marketChange","marketMomentum","consistency","consistencyScore","availability","availabilityScore","availabilityValue","situation","situationScore","roleSecurity","year1","year2","year3","prospect","draftCapital","age","ageScore","nflGames"].some(t=>tfIsNumber(e[t]))
}
function tfHasRedraftData(e){return tfHasComponentData(e.engine?.redraft)}
function tfHasDynastyData(e){const t=e.engine?.dynasty;return tfHasComponentData(t)||!0===t?.isRookie}
function tfHasAnyEngineData(e){return tfHasRedraftData(e)||tfHasDynastyData(e)||tfHasComponentData(e.engine?.keeper)}
function tfWeightedSum(e){const t=TRADEFORGE_ENGINE.weights;return e.performance*t.performance+e.opportunity*t.opportunity+e.scarcity*t.scarcity+e.market*t.market+e.consistency*t.consistency+e.availability*t.availability+e.situation*t.situation}
function tfTraitValue(e,t,r=.8,n=1.05){if(!tfIsNumber(t))return e;const a=tfClamp(Number(t),0,100)/100;return tfClamp(e*(r+(n-r)*a),.1,100)}
function tfApplyEliteCurve(e){return e=tfClamp(tfNum(e,.1),.1,100),tfClamp(100*Math.pow(e/100,TRADEFORGE_ENGINE.eliteCurveExponent),.1,100)}
function tfDynastyAgeFactor(e,t){
return!tfIsNumber(t)||Number(t)<=0?1:(t=Number(t),
"RB"===e?t<=23?1.05:t<=25?1.02:26===t?.99:27===t?.95:28===t?.9:.83:"WR"===e?t<=24?1.04:t<=27?1.02:28===t?.99:29===t?.95:30===t?.9:.84:"TE"===e?t<=25?1.03:t<=29?1.02:30===t?.98:t<=32?.94:.88:"QB"===e?t<=25?1.03:t<=32?1.02:t<=35?.98:.92:1)
}
function tfReplacementRank(e){let t=TRADEFORGE_ENGINE.replacementRanks[e]??12;return"QB"===e&&"superflex"===qbMode&&(t=28),"TE"===e&&"off"!==tePremiumMode&&(t=18),t}
function tfReplacementRaw(e,t){const r=playerDatabase.filter(t=>t.pos===e).map(e=>tfStoredRawValue(e,t)).filter(Number.isFinite).sort((e,t)=>t-e);if(!r.length)return 0;return r[Math.min(r.length-1,Math.max(0,tfReplacementRank(e)-1))]}
function tfScarcityValue(e,t,r,n={}){if(tfIsNumber(n.scarcity))return tfClamp(Number(n.scarcity),.1,100);const a=tfIsNumber(n.replacement)?Number(n.replacement):tfReplacementRaw(e.pos,t);return tfClamp(r+(r-a)*TRADEFORGE_ENGINE.scarcityBoost,.1,100)}
function tfAutoMarketChange(e){if(!sleeperCalculationContext||!TRADEFORGE_ENGINE.useSleeperTrendingMarket)return 0;const t=e.sleeperId||sleeperIdByName[norm(e.name)];return t&&Number.isFinite(sleeperTrendMarket[t])?sleeperTrendMarket[t]:0}
function tfMarketValue(e,t,r){
let n=tfIsNumber(t?.market)?Number(t.market):tfIsNumber(t?.consensus)?Number(t.consensus):r;
const a=tfIsNumber(t?.marketChange)?Number(t.marketChange):tfIsNumber(t?.marketMomentum)?Number(t.marketMomentum):tfAutoMarketChange(e);
return Math.abs(a)<=1&&(n*=1+tfClamp(a,-TRADEFORGE_ENGINE.marketAdjustmentMax,TRADEFORGE_ENGINE.marketAdjustmentMax)),tfClamp(n,.1,100)
}
function tfPerformanceValue(e,t){if(tfIsNumber(e?.performance))return tfClamp(Number(e.performance),.1,100);if(!["projection","consensus","recent"].some(t=>tfIsNumber(e?.[t])))return t;const r=TRADEFORGE_ENGINE.performanceInputs;return tfClamp(tfNum(e.projection,t)*r.projection+tfNum(e.consensus,t)*r.consensus+tfNum(e.recent,t)*r.recent,.1,100)}
function tfOpportunityValue(e,t){return tfIsNumber(e?.opportunity)?tfClamp(Number(e.opportunity),.1,100):tfIsNumber(e?.roleSecurity)?tfClamp(Number(e.roleSecurity),.1,100):tfIsNumber(e?.roleConfidence)?tfTraitValue(t,e.roleConfidence,.75,1.08):t}
function tfConsistencyValue(e,t){if(tfIsNumber(e?.consistency))return tfClamp(Number(e.consistency),.1,100);if(tfIsNumber(e?.consistencyScore))return tfTraitValue(t,e.consistencyScore,.8,1.06);if(tfIsNumber(e?.projection)&&tfIsNumber(e?.recent)){const r=Math.abs(Number(e.projection)-Number(e.recent));return tfTraitValue(t,tfClamp(100-2*r,35,100),.82,1.05)}return t}
function tfAvailabilityValue(e,t){if(tfIsNumber(e?.availabilityValue))return tfClamp(Number(e.availabilityValue),.1,100);if(tfIsNumber(e?.availabilityScore))return tfClamp(t*tfClamp(Number(e.availabilityScore),0,100)/100,.1,100);if(tfIsNumber(e?.availability)){const r=Number(e.availability);return tfClamp(r<=1.25?t*tfClamp(r,0,1):r,.1,100)}return t}
function tfSituationValue(e,t){return tfIsNumber(e?.situation)?tfClamp(Number(e.situation),.1,100):tfIsNumber(e?.situationScore)?tfTraitValue(t,e.situationScore,.8,1.06):tfIsNumber(e?.roleConfidence)?tfTraitValue(t,e.roleConfidence,.82,1.05):t}
function tfRedraftComponents(e){const t=tfStoredRawValue(e,"redraft"),r=e.engine?.redraft||{},n=tfPerformanceValue(r,t);return{performance:n,opportunity:tfOpportunityValue(r,t),scarcity:tfScarcityValue(e,"redraft",n,r),market:tfMarketValue(e,r,t),consistency:tfConsistencyValue(r,t),availability:tfAvailabilityValue(r,t),situation:tfSituationValue(r,t)}}
function tfRedraftRaw(e){return tfHasRedraftData(e)?tfClamp(tfRound(tfWeightedSum(tfRedraftComponents(e))),.1,100):tfStoredRawValue(e,"redraft")}
function tfDynastyAnchor(e,t,r){if(!["year1","year2","year3"].some(e=>tfIsNumber(t?.[e])))return r;const n=TRADEFORGE_ENGINE.dynastyYears;return tfClamp(tfNum(t.year1,r)*n.year1+tfNum(t.year2,r)*n.year2+tfNum(t.year3,r)*n.year3,.1,100)}
function tfDynastySituationValue(e,t,r){return tfIsNumber(t?.situation)?tfClamp(Number(t.situation),.1,100):!0===t?.isRookie?tfClamp(.3*tfNum(t.prospect,r)+.25*tfNum(t.draftCapital,r)+.25*tfNum(t.roleSecurity,r)+.2*tfNum(t.opportunity,r),.1,100):tfIsNumber(t?.roleSecurity)?tfClamp(Number(t.roleSecurity),.1,100):tfSituationValue(t,r)}
function tfDynastyComponents(e){
const t=tfStoredRawValue(e,"dynasty"),r=e.engine?.dynasty||{},n=tfDynastyAnchor(e,r,t);let a=t;
if(tfIsNumber(r.consistency))a=tfClamp(Number(r.consistency),.1,100);else if(tfIsNumber(r.year1)&&tfIsNumber(r.year2)&&tfIsNumber(r.year3)){const e=[Number(r.year1),Number(r.year2),Number(r.year3)],t=Math.max(...e)-Math.min(...e);a=tfTraitValue(n,tfClamp(100-1.5*t,35,100),.84,1.05)}
const s=Object.keys(r).length?r:e.engine?.redraft||{};return{performance:tfIsNumber(r.performance)?tfClamp(Number(r.performance),.1,100):n,opportunity:tfOpportunityValue(r,n),scarcity:tfScarcityValue(e,"dynasty",n,r),market:tfMarketValue(e,r,t),consistency:a,availability:tfAvailabilityValue(s,n),situation:tfDynastySituationValue(e,r,n)}
}
function tfDynastyRaw(e){if(!tfHasDynastyData(e))return tfStoredRawValue(e,"dynasty");const t=e.engine?.dynasty||{};let r=tfWeightedSum(tfDynastyComponents(e));return tfIsNumber(t.age)&&(r*=tfDynastyAgeFactor(e.pos,Number(t.age))),tfClamp(tfRound(r),.1,100)}
function tfKeeperRaw(e){
if(!tfHasAnyEngineData(e))return tfStoredRawValue(e,"keeper");const t=e.engine?.keeper;
if(tfHasComponentData(t)){const r=tfStoredRawValue(e,"keeper");return tfClamp(tfRound(tfWeightedSum({performance:tfPerformanceValue(t,r),opportunity:tfOpportunityValue(t,r),scarcity:tfScarcityValue(e,"keeper",r,t),market:tfMarketValue(e,t,r),consistency:tfConsistencyValue(t,r),availability:tfAvailabilityValue(t,r),situation:tfSituationValue(t,r)})),.1,100)}
const r=TRADEFORGE_ENGINE.keeperWeights;return tfClamp(tfRound(tfRedraftRaw(e)*r.redraft+tfDynastyRaw(e)*r.dynasty),.1,100)
}
function tfDynamicPickValue(e){const t="superflex"===qbMode?e.superflex:e.oneqb;if(!TRADEFORGE_ENGINE.useDynamicPickValues)return t;const r=Number(String(e.name).match(/20\d{2}/)?.[0]);if(!r)return t;const n=(new Date).getFullYear()+1,a=Math.max(0,r-n),s=TRADEFORGE_ENGINE.futurePickDiscounts,o=s[Math.min(a,s.length-1)]??s[s.length-1];return tfClamp(tfRound(t*o),.1,100)}
function tfApplyLeagueSettings(e,t,r){let n=t*(multipliers[e.pos]?.[scoringMode]||1);return"superflex"===qbMode&&"QB"===e.pos&&(n*="dynasty"===r?1.45:"keeper"===r?1.4:1.35),"TE"===e.pos&&"half"===tePremiumMode&&(n*=n>=75?1.1:n>=50?1.08:n>=25?1.06:1.04),"TE"===e.pos&&"full"===tePremiumMode&&(n*=n>=75?1.18:n>=50?1.14:n>=25?1.1:1.06),tfClamp(tfRound(n),.1,100)}
function legacyValue(e){return"PICK"===e.pos?"superflex"===qbMode?e.superflex:e.oneqb:tfApplyLeagueSettings(e,tfStoredRawValue(e,leagueMode),leagueMode)}
function value(e){if("PICK"===e.pos)return tfDynamicPickValue(e);if(!TRADEFORGE_ENGINE.enabled||!tfHasAnyEngineData(e))return legacyValue(e);let t;return t="dynasty"===leagueMode?tfDynastyRaw(e):"keeper"===leagueMode?tfKeeperRaw(e):tfRedraftRaw(e),t=tfApplyEliteCurve(t),tfApplyLeagueSettings(e,t,leagueMode)}
function updateEngineStatus(){
const e=playerDatabase.filter(tfHasAnyEngineData).length;let t=e?`Weighted model • ${e}/${playerDatabase.length} data-enhanced players`:`Weighted model ready • ${playerDatabase.length} baseline players`;
if(tradeForgeFeedMeta?.week&&(t+=` • Week ${tradeForgeFeedMeta.week}`),tradeForgeFeedMeta?.generatedAt){const e=new Date(tradeForgeFeedMeta.generatedAt);Number.isNaN(e.getTime())||(t+=` • Updated ${e.toLocaleString()}`)}$("engine-status").textContent=t
}
async function loadTradeForgeFeed(){
try{
const e=await fetch(`./tradeforge-data.json?v=${Date.now()}`,{cache:"no-store"});if(!e.ok)throw new Error(`Feed HTTP ${e.status}`);const t=await e.json();tradeForgeFeedMeta=t.meta||null;let r=0;
playerDatabase.forEach(e=>{const n=t.players?.[norm(e.name)];n?.engine&&(e.engine=n.engine,e.liveData=n,r++)});
const n=e=>{const t=playerDatabase.find(t=>t.pos===e.pos&&norm(t.name)===norm(e.name));return t?{...e,engine:t.engine,liveData:t.liveData}:e};
teamA=teamA.map(n),teamB=teamB.map(n),sleeperTeamA=sleeperTeamA.map(n),sleeperTeamB=sleeperTeamB.map(n),leagueTradeFinderBuilds=[],$("trade-finder-results").textContent="Values updated. Run Find Trades again.",console.log(`TradeForge feed applied to ${r} players.`),renderBoard(),render(),syncedLeague&&!$("league-page").classList.contains("page-hidden")&&buildLeaguePage()
}catch(e){console.warn("TradeForge live feed unavailable; baseline values remain active.",e),tradeForgeFeedMeta=null,renderBoard(),render()}
}
function adjustedPlayer(e){return e<=0?0:e}
function adjustedCore(e){return e.map(e=>adjustedPlayer(value(e))).sort((e,t)=>t-e).reduce((e,t,r)=>e+t*(PACKAGE_WEIGHTS[r]??.8),0)}
function consolidationPremium(e,t){if(!e?.length||!t?.length||e.length>=t.length)return 0;const r=Math.max(...e.map(e=>value(e))),n=tfClamp(r/100,0,1),a=t.length-e.length;return 1===e.length&&2===t.length?.08+.07*n:1===e.length&&t.length>=3||a>=2?.15+.1*n:.05+.05*n}
function adjusted(e,t=null){let r=adjustedCore(e);return t&&(r*=1+consolidationPremium(e,t)),r}
function adjustedTradeValues(e,t){return{a:adjusted(e,t),b:adjusted(t,e),premiumA:consolidationPremium(e,t),premiumB:consolidationPremium(t,e)}}
function base(e){return e.reduce((e,t)=>e+value(t),0)}
function diff(e,t){const r=(e+t)/2;return r?Math.abs(e-t)/r*100:0}
function advisorMetadata(e){
if(["PICK","DST"].includes(e.pos))return{};
const t=e.sleeperId||sleeperIdByName[norm(e.name)],r=t?sleeperPlayers[t]:null,n=r&&r.position===e.pos&&norm(r.full_name||[r.first_name,r.last_name].filter(Boolean).join(" "))===norm(e.name),a=[n?r.age:null,e.engine?.dynasty?.age,e.liveData?.age].find(e=>tfIsNumber(e)&&Number(e)>0),s=n&&tfIsNumber(r.years_exp)&&Number.isInteger(Number(r.years_exp))&&Number(r.years_exp)>=0?Number(r.years_exp):null;
return{age:void 0===a?null:Number(a),years:s,rookie:0===s||null===s&&!0===e.engine?.dynasty?.isRookie}
}
function advisorTopAsset(e){return e.slice().sort((e,t)=>value(t)-value(e))[0]||null}
function advisorTeamPositions(e){const t={QB:0,RB:0,WR:0,TE:0,K:0,DST:0,PICK:0};return e.forEach(e=>{t[e.pos]=(t[e.pos]||0)+1}),t}
function advisorFutureProfile(e){
if(!e||"PICK"===e.pos)return"future draft asset";const t=tfIsNumber(e.redraft)?Number(e.redraft):0,r=tfIsNumber(e.dynasty)?Number(e.dynasty):0,n=tfIsNumber(e.keeper)?Number(e.keeper):0,a=advisorMetadata(e),s=[];
return null!==a.age&&s.push("age "+a.age),a.rookie?s.push("rookie"):null!==a.years&&s.push(a.years+" "+(1===a.years?"year":"years")+" experience"),r>=t+8?s.push("dynasty value is stronger than redraft value"):t>=r+8?s.push("current-season value is stronger than dynasty value"):s.push("redraft and dynasty values are close"),"keeper"===leagueMode&&n&&s.push("keeper value "+n.toFixed(1)),s.join(" • ")
}
function advisorRosterPositionRank(e,t){
if(!syncedLeague||!e||!syncedRosters.length)return null;const r=syncedRosters.map(e=>({id:String(e.roster_id),v:dashboardPositionValue(dashboardRosterPlayers(e),t)})).sort((e,t)=>t.v-e.v),n=r.findIndex(t=>String(t.id)===String(e));return n<0?null:{rank:n+1,total:r.length,value:r[n].v}
}
function advisorNeedNote(e,t,r){
if(!e||!t||!r||!["QB","RB","WR","TE"].includes(t.pos))return"";const n=advisorRosterPositionRank(e,t.pos);if(!n)return"";return n.rank>Math.ceil(.65*n.total)?`This also addresses a ${t.pos} weakness: that roster ranks ${ordinal(n.rank)} of ${n.total} at ${t.pos}.`:n.rank<=Math.ceil(.25*n.total)?`This adds to an already strong ${t.pos} room: that roster ranks ${ordinal(n.rank)} of ${n.total} at ${t.pos}.`:`This is a neutral roster-fit move at ${t.pos}: that roster ranks ${ordinal(n.rank)} of ${n.total} at the position.`
}
function advisorPackageNote(e,t){
if(e.length<t.length)return"Receiving the smaller side of the package concentrates value into fewer roster spots, which usually helps a contender or a team trying to upgrade starters.";
if(e.length>t.length)return"Receiving more players can help depth, but it also spreads value across more roster spots and may be less helpful if those players do not start.";
return"The package sizes are equal, so the recommendation leans more on player quality, format, and value profile than roster-slot pressure."
}
function advisorSideLabel(e){return"A"===e?"Team A":"Team B"}
function advisorContextLine(e,t,r){
const n=advisorTopAsset(t),a=advisorTopAsset(r),s=[];if(n&&a){s.push(`${esc(n.name)} is the best asset on ${advisorSideLabel(e)}'s side at ${value(n).toFixed(1)}. ${advisorFutureProfile(n)}.`);s.push(`${esc(a.name)} is the best asset on the other side at ${value(a).toFixed(1)}. ${advisorFutureProfile(a)}.`)}
const o=advisorPackageNote(t,r);return o&&s.push(o),s
}
function renderTradeAdvisor(e,t,r,n,a=null){
const s=$(e);if(!s)return;
if(!t.length||!r.length)return s.className="trade-advisor-box empty",void(s.textContent="Add players to both sides to get AI Trade Advisor guidance.");
const o=n.a,l=n.b,i=diff(o,l),d=o>=l?"A":"B",u="A"===d?"B":"A",c="A"===d?t:r,p="A"===d?r:t,m=advisorTopAsset(c),g=advisorTopAsset(p);let f="",h="hold",y=[];
if(i<=5)f="Fair but context dependent",h="hold",y.push(`The value gap is only ${i.toFixed(1)}%, so this is inside the TradeForge fair range.`);
else if(i<=10)f=`Slight edge to ${advisorSideLabel(d)}`,h="hold",y.push(`${advisorSideLabel(d)} receives a small value edge. ${advisorSideLabel(u)} should only accept if the roster fit or player profile is better for their team.`);
else if(i<=20)f=`Accept for ${advisorSideLabel(d)} / ask for more for ${advisorSideLabel(u)}`,h="make",y.push(`${advisorSideLabel(d)} receives a clear value edge. ${advisorSideLabel(u)} should request another asset before accepting.`);
else f=`Do not accept as ${advisorSideLabel(u)}`,h="stop",y.push(`${advisorSideLabel(u)} is giving up too much adjusted value. ${advisorSideLabel(d)} would be getting the better side unless there is outside context not in this app.`);
if(m&&g){
if("dynasty"===leagueMode){const e=Number(m.dynasty)-Number(m.redraft),t=Number(g.dynasty)-Number(g.redraft);e>=8&&y.push(`${esc(m.name)} has a stronger long-term profile than current-season profile, which makes this more dynasty-friendly for ${advisorSideLabel(d)}.`),t>=8&&y.push(`${esc(g.name)} carries future value too, so ${advisorSideLabel(u)} may be giving up dynasty upside.`);Number(m.redraft)-Number(m.dynasty)>=8&&y.push(`${esc(m.name)} is more current-season weighted than dynasty weighted, so this side may be more win-now than rebuild.`)}
else if("redraft"===leagueMode)y.push("Redraft mode focuses on this season, so long-term youth and future upside matter less than current TradeForge value.");
else y.push("Keeper mode blends current and future value. This advisor does not know keeper cost, so use this as value guidance only.");
}
y=y.concat(advisorContextLine(d,c,p));
const b=a?("A"===d?a.rosterA:a.rosterB):null,w=a?("A"===d?a.rosterB:a.rosterA):null;
if(b&&m){const e=advisorNeedNote(b,m,c);e&&y.push(e)}
if(w&&g){const e=advisorNeedNote(w,g,p);e&&y.push(e)}
const v=t.length+r.length;if(v>=4)y.push("Because this is a multi-player trade, check your bench cuts and starting lineup after the trade. A fair value trade can still be bad if it forces you to drop useful depth.");
s.className="trade-advisor-box",s.innerHTML=`<div class="trade-advisor-verdict ${h}">${esc(f)}</div><div class="trade-advisor-detail">Advisor read: ${esc(advisorSideLabel(d))} has the stronger side by ${i.toFixed(1)}% adjusted value.</div><ul class="trade-advisor-list">${y.filter(Boolean).slice(0,6).map(e=>`<li>${e}</li>`).join("")}</ul><div class="trade-advisor-context">AI Trade Advisor is a rules-based TradeForge advisor using only app data: values, format, package size, synced roster context, and available player metadata. It does not use outside injuries, news, projections, or private keeper costs.</div>`
}

function injurySleeperRecord(e){
const t=e?.sleeperId||sleeperIdByName[norm(e?.name)];
return t?sleeperPlayers[t]||null:null
}
function injuryCleanStatus(e){
return String(e||"").trim()
}
function injuryEngineExplicitAvailability(e){
if(!e||["PICK","DST"].includes(e.pos))return null;
const t=[e.engine?.[leagueMode],e.engine?.redraft,e.engine?.dynasty,e.engine?.keeper].filter(Boolean);
for(const e of t){
if(tfIsNumber(e.availabilityScore))return tfClamp(Number(e.availabilityScore),0,100);
if(tfIsNumber(e.availability)){const t=Number(e.availability);return tfClamp(t<=1.25?100*t:t,0,100)}
}
return null
}
function injuryEngineStatusPenalty(e){
const t=injuryCleanStatus(e).toLowerCase();
if(!t)return null;
if(t.includes("ir")||t.includes("pup")||t.includes("nfi"))return 45;
if(t.includes("out"))return 35;
if(t.includes("doubt"))return 50;
if(t.includes("question"))return 72;
if(t.includes("suspend"))return 55;
if(t.includes("healthy")||t.includes("active"))return 100;
return 85
}
function injuryEnginePlayerProfile(e){
if(!e)return null;
if(e.pos==="PICK")return{player:e,score:100,label:"Low",className:"low",status:"Draft pick",notes:[`${esc(e.name)} is a future draft asset, so injury risk is not applied directly.`]};
if(e.pos==="DST")return{player:e,score:92,label:"Low",className:"low",status:"Team defense",notes:[`${esc(e.name)} is a team-defense asset, so individual player injury risk is not applied.`]};
const t=advisorMetadata(e),r=injurySleeperRecord(e),n=injuryCleanStatus(r?.injury_status||r?.injuryStatus||r?.status||e.liveData?.injury_status||e.engine?.[leagueMode]?.injuryStatus||""),a=injuryCleanStatus(r?.injury_body_part||r?.injuryBodyPart||e.liveData?.injury_body_part||""),s=injuryEngineStatusPenalty(n),o=injuryEngineExplicitAvailability(e);
let l=tfIsNumber(o)?Number(o):100;
if(tfIsNumber(s))l=Math.min(l,Number(s));
const i=[];
if(n){i.push(`${esc(e.name)} has a current synced/app designation of ${esc(n)}${a?` (${esc(a)})`:""}.`)}
else{i.push(`No current injury designation is detected for ${esc(e.name)} in the synced/app data available to TradeForge.`)}
if(tfIsNumber(o)&&o<100)i.push(`The TradeForge availability input for ${esc(e.name)} is ${Number(o).toFixed(0)} / 100 before age and position context.`);
if(null!==t.age){
const r=tfDynastyAgeFactor(e.pos,t.age);
if(r<.9){l-=10;i.push(`${esc(e.name)} is age ${t.age}, which creates a stronger career-horizon discount for ${e.pos} in long-term formats.`)}
else if(r<1){l-=5;i.push(`${esc(e.name)} is age ${t.age}, so TradeForge applies some long-term age/career-window caution.`)}
else if(r>1){i.push(`${esc(e.name)} is age ${t.age}, which supports a longer runway in dynasty/keeper formats.`)}
}
if("RB"===e.pos){l-=6;i.push("RBs receive extra availability caution because the position carries more workload and contact exposure.")}
else if("TE"===e.pos){l-=3;i.push("TEs receive mild availability caution because of blocking and contact usage.")}
else if("QB"===e.pos){i.push("QBs generally receive less position-based injury volatility than RB/WR/TE in the TradeForge risk layer.")}
if("redraft"===leagueMode&&l<85)i.push("Redraft mode makes short-term availability more important because missed games are harder to recover from this season.");
if("dynasty"===leagueMode&&l<85)i.push("Dynasty mode reduces the impact of short-term missed time, but age and recurrence risk still matter for long-term value.");
l=tfClamp(Math.round(l),5,100);
const d=l>=90?"Low":l>=75?"Moderate":l>=55?"Elevated":"High",u=l>=90?"low":l>=75?"moderate":l>=55?"elevated":"high";
return{player:e,score:l,label:d,className:u,status:n||"No current designation",notes:i}
}
function injuryEngineSideScore(e){
if(!e.length)return 100;
let t=0,r=0;
e.forEach(e=>{const n=injuryEnginePlayerProfile(e),a=Math.max(1,value(e));t+=n.score*a;r+=a});
return r?tfClamp(Math.round(t/r),5,100):100
}
function injuryEngineWorst(e){
return e.map(injuryEnginePlayerProfile).sort((e,t)=>e.score-t.score)[0]||null
}
function injuryEngineLabel(e){return e>=90?{label:"Low",className:"low"}:e>=75?{label:"Moderate",className:"moderate"}:e>=55?{label:"Elevated",className:"elevated"}:{label:"High",className:"high"}}
function renderInjuryEngine(e,t,r){
const n=$(e);if(!n)return;
if(!t.length||!r.length)return n.className="injury-engine-box empty",void(n.textContent="Add players to both sides to see Injury Intelligence Engine context.");
const a=injuryEngineSideScore(t),s=injuryEngineSideScore(r),o=injuryEngineLabel(Math.min(a,s)),l=injuryEngineWorst(t),i=injuryEngineWorst(r),d=[];
d.push(`Team A package availability score: ${a} / 100. Team B package availability score: ${s} / 100.`);
if(l)d.push(`Team A main availability watch: ${esc(l.player.name)} — ${l.label} risk. ${l.notes[0]||"No extra injury note available."}`);
if(i)d.push(`Team B main availability watch: ${esc(i.player.name)} — ${i.label} risk. ${i.notes[0]||"No extra injury note available."}`);
const u=[l?.notes?.[1],i?.notes?.[1]].filter(Boolean);u.forEach(e=>d.push(e));
if(Math.abs(a-s)>=10)d.push(`${a>s?"Team B":"Team A"} carries the higher availability concern in this trade based on the current TradeForge injury inputs and player context.`);
else d.push("Neither side has a major package-level availability edge based on the current TradeForge injury inputs.");
n.className="injury-engine-box",n.innerHTML=`<div class="injury-engine-head"><div><div class="injury-engine-title">Availability Risk: ${o.label}</div><div class="sub">Lower score means more injury/availability concern.</div></div><div class="injury-engine-score ${o.className}">${Math.min(a,s)} / 100</div></div><ul class="injury-engine-list">${d.filter(Boolean).slice(0,7).map(e=>`<li>${e}</li>`).join("")}</ul><div class="injury-engine-context">Injury Intelligence Engine uses only app/synced data: current designation when available, TradeForge availability inputs, age/career-window context, position risk, and league format. It does not diagnose injuries or pull outside medical news.</div>`
}

function modeLabel(){return`${"ppr"===scoringMode?"PPR":"half"===scoringMode?"0.5 PPR":"No PPR"} • ${leagueMode[0].toUpperCase()+leagueMode.slice(1)} • ${"superflex"===qbMode?"Superflex":"1QB"}${"half"===tePremiumMode?" • TEP +0.5":"full"===tePremiumMode?" • TEP +1.0":""}`}
function sleeperModeLabel(){return`${"ppr"===sleeperScoringMode?"PPR":"half"===sleeperScoringMode?"0.5 PPR":"No PPR"} • ${sleeperLeagueMode[0].toUpperCase()+sleeperLeagueMode.slice(1)} • ${"superflex"===sleeperQbMode?"Superflex":"1QB"}${"half"===sleeperTePremiumMode?" • TEP +0.5":"full"===sleeperTePremiumMode?" • TEP +1.0":""}`}
function syncedProviderName(){return"espn"===syncedProvider?"ESPN":"Sleeper"}
function updateSyncedProviderCopy(){
const e=syncedProviderName();
$("sleeper-info")&&($("sleeper-info").textContent=`${e} league settings are isolated from the main TradeForge calculator.`),
$("disconnect")&&($("disconnect").textContent=`Disconnect ${e}`),$("trade-center-provider-label")&&($("trade-center-provider-label").textContent=`${e} trade tools`),
$("synced-trade-calculator-title")&&($("synced-trade-calculator-title").textContent=`${e} Trade Calculator`),
$("synced-trade-calculator-sub")&&($("synced-trade-calculator-sub").textContent=`Uses the selected ${e} rosters`),
$("synced-advisor-sub")&&($("synced-advisor-sub").textContent=`AI Trade Advisor guidance for your ${e} league.`),
$("synced-injury-sub")&&($("synced-injury-sub").textContent=`Injury Intelligence Engine context for your ${e} league.`),
$("trade-finder-roster-copy")&&($("trade-finder-roster-copy").textContent=`TradeForge searches your valued ${e} roster for 1-for-1, 2-for-1, and 3-for-1 packages and ranks them by adjusted trade value.`)
}
function withSleeperModes(e){
const t={scoringMode:scoringMode,leagueMode:leagueMode,qbMode:qbMode,tePremiumMode:tePremiumMode,sleeperCalculationContext:sleeperCalculationContext};
scoringMode=sleeperScoringMode,leagueMode=sleeperLeagueMode,qbMode=sleeperQbMode,tePremiumMode=sleeperTePremiumMode,sleeperCalculationContext=!0;
try{return e()}finally{scoringMode=t.scoringMode,leagueMode=t.leagueMode,qbMode=t.qbMode,tePremiumMode=t.tePremiumMode,sleeperCalculationContext=t.sleeperCalculationContext}
}
function sleeperValue(e){return withSleeperModes(()=>value(e))}
function renderTop(e,t){
const r=playerDatabase.filter(t=>t.pos===e&&Number.isFinite(legacyValue(t))).slice().sort((e,t)=>legacyValue(t)-legacyValue(e)||e.rank-t.rank).slice(0,3);
$(t).innerHTML=r.length?r.map((e,t)=>`\n<div class="top-row">\n<span>#${t+1} ${esc(e.name)}</span>\n<strong>${legacyValue(e).toFixed(1)}</strong>\n</div>\n`).join(""):'<div class="sub">No ranked players</div>'
}
function renderBoard(){$("mode-label").textContent=modeLabel(),updateEngineStatus(),renderTop("RB","top-rb"),renderTop("WR","top-wr"),renderTop("QB","top-qb"),renderTop("TE","top-te")}
function renderTeam(e){
const t="A"===e?teamA:teamB,r=$("A"===e?"team-a":"team-b");
t.length?r.innerHTML=t.map((t,r)=>`\n<div class="player">\n\n<div>\n<strong>${esc(t.name)}</strong>\n<small>${esc(t.pos)}${t.nflTeam?" • "+esc(t.nflTeam):""}</small>\n</div>\n\n<strong>${value(t).toFixed(1)}</strong>\n\n<button class="remove" onclick="removePlayer('${e}',${r})">×</button>\n\n</div>\n`).join(""):r.innerHTML='\n<div class="sub" style="padding:20px 0">\nSearch above to add players.\n</div>\n'
}
function removePlayer(e,t){("A"===e?teamA:teamB).splice(t,1),render()}
function clearSearchResults(e=""){["a","b"].forEach(t=>{const r=$(e+"results-"+t);r.innerHTML="",r.classList.remove("show")})}
function render(){clearSearchResults(),renderTeam("A"),renderTeam("B"),calculate()}
function calculate(){
const e=base(teamA),t=base(teamB),r=adjustedTradeValues(teamA,teamB),n=r.a,a=r.b,s=diff(n,a);
$("base-a").textContent=e.toFixed(1),$("base-b").textContent=t.toFixed(1),$("adj-a").textContent=n.toFixed(1),$("adj-b").textContent=a.toFixed(1),$("marker").style.left=(n+a?Math.max(5,Math.min(95,a/(n+a)*100)):50)+"%";
const o=$("verdict");
if(o.className="",!teamA.length||!teamB.length)return o.innerHTML="\nBuild a Trade\n<small>Add players to both sides.</small>\n",$("grade").textContent="—",tfSafeRenderTradeAdvisor("trade-advisor",teamA,teamB,r),tfSafeRenderInjuryEngine("injury-engine",teamA,teamB),void($("trade-ideas").textContent="Build a trade to see suggested trade ideas.");
let l,i;s<=5?(l="FAIR TRADE",i="fair"):s<=10?(l="SLIGHT ADVANTAGE",i="slight"):s<=20?(l="ADVANTAGE",i="adv"):(l="MAJOR ADVANTAGE",i="major"),o.className=i,
o.innerHTML=`\n${l}\n<small>\n${s.toFixed(1)}% difference\n${s>5?" • "+(n>a?"Team A":"Team B")+" has more adjusted value":""}\n</small>\n`,
$("grade").textContent=s<=5?"A+":s<=10?"A":s<=20?"B":s<=30?"C":s<=40?"D":"F",tfSafeRenderTradeAdvisor("trade-advisor",teamA,teamB,r),tfSafeRenderInjuryEngine("injury-engine",teamA,teamB),tfSafeTradeIdeas(n,a)
}
function tradeIdeas(e,t){
const r=$("trade-ideas");if(!teamA.length||!teamB.length)return void(r.textContent="Build a trade to see suggested trade ideas.");const n=diff(e,t);
if(n<=5)return void(r.innerHTML='\n<div class="suggestion">\n<strong>No adjustment needed.</strong>\n<br><br>\nThis trade is already inside the 5% TradeForge fair range.\n</div>\n');
const a=e>t?"B":"A",s=new Set(teamA.concat(teamB).map(key)),o=assets().filter(e=>!s.has(key(e))),l=e=>{
const t=adjustedTradeValues("A"===a?teamA.concat(e):teamA,"B"===a?teamB.concat(e):teamB),r=diff(t.a,t.b);return r>=n?null:{additions:e,recalculated:t,newDifference:r,fair:r<=5,close:r>5&&r<=10,improvement:n-r}},i=[];
o.forEach(e=>{const t=l([e]);t&&i.push(t)});
const d=Math.abs(e-t),u=o.slice().sort((e,t)=>Math.abs(value(e)-d)-Math.abs(value(t)-d)).slice(0,35);
for(let e=0;e<u.length;e++)for(let t=e+1;t<u.length;t++){const r=l([u[e],u[t]]);r&&i.push(r)}
if(!i.some(e=>e.fair)){const e=u.slice(0,18);for(let t=0;t<e.length;t++)for(let r=t+1;r<e.length;r++)for(let n=r+1;n<e.length;n++){const a=l([e[t],e[r],e[n]]);a&&i.push(a)}}
i.sort((e,t)=>e.fair!==t.fair?e.fair?-1:1:e.additions.length!==t.additions.length&&e.fair&&t.fair?e.additions.length-t.additions.length:e.close!==t.close?e.close?-1:1:e.newDifference-t.newDifference);
const c=[],p=new Set;for(const e of i){const t=e.additions.map(key).sort().join("|");if(!p.has(t)&&(p.add(t),(e.fair||!(e.improvement<2))&&(c.push(e),c.length>=3)))break}
c.length?r.innerHTML=c.map((r,s)=>{const o=r.additions.map(e=>esc(e.name)).join(" + ");
return`\n<div class="suggestion">\n\n<strong>Idea ${s+1} — ${r.fair?"FAIR MATCH":r.close?"VERY CLOSE":"BEST AVAILABLE"}</strong>\n\n<br><br>\n\n<strong>Add ${o} to Team ${a}'s side.</strong>\n\n<br><br>\n\nCurrent:\nTeam A ${e.toFixed(1)}\nvs\nTeam B ${t.toFixed(1)}\n\n<br>\n\nAfter suggestion:\nTeam A ${r.recalculated.a.toFixed(1)}\nvs\nTeam B ${r.recalculated.b.toFixed(1)}\n\n<br>\n\nDifference:\n${n.toFixed(1)}%\n→\n${r.newDifference.toFixed(1)}%\n\n${r.fair?"\n<br><br>\n<strong>✓ Inside the 5% TradeForge fair range</strong>\n":""}\n\n</div>\n`
}).join(""):r.innerHTML='\n<div class="suggestion">\nTradeForge could not find a reasonable addition that meaningfully improves the trade.\n</div>\n'
}

function tfSafeRenderTradeAdvisor(e,t,r,n,a){
const s=$(e),o=window.tradeForgeRenderAIAdvisor;
if("function"==typeof o){try{return void o(e,t,r,n,a)}catch(l){console.warn("TradeForge AI Advisor 2.0 failed; using built-in fallback.",l)}}
try{return void renderTradeAdvisor(e,t,r,n,a)}catch(l){console.warn("TradeForge AI Advisor fallback failed.",l),s&&(s.className="trade-advisor-box empty",s.textContent="AI Trade Advisor could not render. Check the browser console for the exact error.")}
}
function tfSafeRenderInjuryEngine(e,t,r){
const n=$(e);
try{"function"==typeof window.applyTradeForgeInjuryEngine&&window.applyTradeForgeInjuryEngine()}catch(a){console.warn("TradeForge Injury Engine refresh failed before render.",a)}
try{return void renderInjuryEngine(e,t,r)}catch(a){console.warn("TradeForge Injury Intelligence render failed.",a),n&&(n.className="injury-engine-box empty",n.textContent="Injury Intelligence could not render. Check the browser console for the exact error.")}
}
function tfSafeTradeIdeas(e,t){
const r=$("trade-ideas");
try{return void tradeIdeas(e,t)}catch(n){console.warn("TradeForge Suggested Trade Ideas failed.",n),r&&(r.innerHTML='<div class="suggestion"><strong>Suggested Trade Ideas could not render.</strong><br><br>Check the browser console for the exact error.</div>')}
}
function tfSafeSleeperTradeIdeas(e,t){
const r=$("sleeper-trade-ideas");
try{return void sleeperTradeIdeas(e,t)}catch(n){console.warn("TradeForge synced Suggested Trade Ideas failed.",n),r&&(r.innerHTML='<div class="suggestion"><strong>Synced Suggested Trade Ideas could not render.</strong><br><br>Check the browser console for the exact error.</div>')}
}

function setupSearch(e){
const t=$("A"===e?"search-a":"search-b"),r=$("A"===e?"results-a":"results-b");
t.oninput=()=>{const n=t.value.trim().toLowerCase();if(!n)return void r.classList.remove("show");
const a=new Set(teamA.concat(teamB).map(key)),s=assets().filter(e=>!a.has(key(e))&&(e.name.toLowerCase().includes(n)||e.pos.toLowerCase().includes(n))).sort((e,t)=>value(t)-value(e)).slice(0,15);
r.innerHTML=s.length?s.map((e,t)=>`\n<div class="result-item" data-i="${t}">\n<span>\n${esc(e.name)}\n<small class="sub">${esc(e.pos)}</small>\n</span>\n<strong>${value(e).toFixed(1)}</strong>\n</div>\n`).join(""):'<div class="result-item"><span>No matching players found</span></div>',
r.classList.add("show"),r.querySelectorAll("[data-i]").forEach((n,a)=>{n.onclick=()=>{const n=s[a];assets().some(e=>key(e)===key(n))&&!teamA.concat(teamB).some(e=>key(e)===key(n))&&(("A"===e?teamA:teamB).push({...n}),t.value="",r.classList.remove("show"),render())}})
}}
function applyControls(){scoringMode=$("scoring").value,leagueMode=$("league").value,qbMode=$("qb").value,tePremiumMode=$("tep").value,"dynasty"!==leagueMode&&(teamA=teamA.filter(e=>"PICK"!==e.pos),teamB=teamB.filter(e=>"PICK"!==e.pos)),renderBoard(),render()}
function rosterAssets(e){const t=syncedRosters.find(t=>String(t.roster_id)===String(e));return t?(t.players||[]).map(e=>matchSleeper(String(e))).filter(Boolean).sort((e,t)=>sleeperValue(t)-sleeperValue(e)):[]}
function sleeperSelectedRoster(e){return"A"===e?sleeperRosterA:sleeperRosterB}
function sleeperPool(e){const t=sleeperSelectedRoster(e);if(!syncedLeague||!t)return[];const r=rosterAssets(t);return"dynasty"===sleeperLeagueMode?r.concat(picks):r}
function renderSleeperTeam(e){
const t="A"===e?sleeperTeamA:sleeperTeamB,r=$("A"===e?"sleeper-team-a":"sleeper-team-b");
t.length?r.innerHTML=t.map((t,r)=>`\n<div class="player">\n\n<div>\n<strong>${esc(t.name)}</strong>\n<small>\n${esc(t.pos)}\n${t.nflTeam?" • "+esc(t.nflTeam):""}\n</small>\n</div>\n\n<strong>${sleeperValue(t).toFixed(1)}</strong>\n\n<button class="remove" onclick="removeSleeperPlayer('${e}',${r})">\n×\n</button>\n\n</div>\n`).join(""):r.innerHTML='\n<div class="sub" style="padding:20px 0">\nSearch the selected synced roster above to add players.\n</div>\n'
}
function removeSleeperPlayer(e,t){("A"===e?sleeperTeamA:sleeperTeamB).splice(t,1),renderSleeper()}
function renderSleeper(){clearSearchResults("sleeper-"),renderSleeperTeam("A"),renderSleeperTeam("B"),sleeperCalculate()}
function sleeperCalculate(){withSleeperModes(()=>{
const e=base(sleeperTeamA),t=base(sleeperTeamB),r=adjustedTradeValues(sleeperTeamA,sleeperTeamB),n=r.a,a=r.b,s=diff(n,a);
$("sleeper-base-a").textContent=e.toFixed(1),$("sleeper-base-b").textContent=t.toFixed(1),$("sleeper-adj-a").textContent=n.toFixed(1),$("sleeper-adj-b").textContent=a.toFixed(1),$("sleeper-marker").style.left=(n+a?Math.max(5,Math.min(95,a/(n+a)*100)):50)+"%";
const o=$("sleeper-verdict");if(o.className="",!sleeperTeamA.length||!sleeperTeamB.length)return o.innerHTML="\nBuild a Trade\n<small>Add players from both synced rosters.</small>\n",$("sleeper-grade").textContent="—",tfSafeRenderTradeAdvisor("sleeper-trade-advisor",sleeperTeamA,sleeperTeamB,r,{rosterA:sleeperRosterA,rosterB:sleeperRosterB}),tfSafeRenderInjuryEngine("sleeper-injury-engine",sleeperTeamA,sleeperTeamB),void($("sleeper-trade-ideas").textContent=`Build a trade from the synced ${syncedProviderName()} league to see suggested trade ideas.`);
let l,i;s<=5?(l="FAIR TRADE",i="fair"):s<=10?(l="SLIGHT ADVANTAGE",i="slight"):s<=20?(l="ADVANTAGE",i="adv"):(l="MAJOR ADVANTAGE",i="major"),o.className=i,
o.innerHTML=`\n${l}\n<small>\n${s.toFixed(1)}% difference\n${s>5?" • "+(n>a?"Team A":"Team B")+" has more adjusted value":""}\n</small>\n`,
$("sleeper-grade").textContent=s<=5?"A+":s<=10?"A":s<=20?"B":s<=30?"C":s<=40?"D":"F",tfSafeRenderTradeAdvisor("sleeper-trade-advisor",sleeperTeamA,sleeperTeamB,r,{rosterA:sleeperRosterA,rosterB:sleeperRosterB}),tfSafeRenderInjuryEngine("sleeper-injury-engine",sleeperTeamA,sleeperTeamB),tfSafeSleeperTradeIdeas(n,a)
})}
function sleeperTradeIdeas(e,t){
const r=$("sleeper-trade-ideas");
if(!sleeperTeamA.length||!sleeperTeamB.length)return void(r.textContent=`Build a trade from the synced ${syncedProviderName()} league to see suggested trade ideas.`);
const n=diff(e,t);
if(n<=5)return void(r.innerHTML='\n<div class="suggestion">\n<strong>No adjustment needed.</strong>\n<br><br>\nThis trade is already inside the 5% TradeForge fair range.\n</div>\n');
const a=e>t?"B":"A",s="A"===a?sleeperRosterA:sleeperRosterB,o=new Set(sleeperTeamA.concat(sleeperTeamB).map(key)),l=rosterAssets(s).filter(e=>!o.has(key(e))&&"PICK"!==e.pos);
if(!l.length)return void(r.innerHTML=`\n<div class="suggestion">\n<strong>Team ${a} needs more value.</strong>\n<br><br>\nTradeForge could not find another valued player on Team ${a}'s roster to add to the trade.\n</div>\n`);
const i=e=>sleeperValue(e),d=e=>{
const t="A"===a?sleeperTeamA.concat(e):sleeperTeamA,r="B"===a?sleeperTeamB.concat(e):sleeperTeamB,s=withSleeperModes(()=>adjustedTradeValues(t,r)),o=diff(s.a,s.b);
return o>=n?null:{additions:e,recalculated:s,newDifference:o,fair:o<=5,close:o>5&&o<=10,improvement:n-o}},u=[];
l.forEach(e=>{const t=d([e]);t&&u.push(t)});
const c=Math.abs(e-t),p=l.slice().sort((e,t)=>Math.abs(i(e)-c)-Math.abs(i(t)-c)).slice(0,30);
for(let e=0;e<p.length;e++)for(let t=e+1;t<p.length;t++){const r=d([p[e],p[t]]);r&&u.push(r)}
if(!u.some(e=>e.fair)){const e=p.slice(0,16);for(let t=0;t<e.length;t++)for(let r=t+1;r<e.length;r++)for(let n=r+1;n<e.length;n++){const a=d([e[t],e[r],e[n]]);a&&u.push(a)}}
if(!u.length)return void(r.innerHTML=`\n<div class="suggestion">\n<strong>Team ${a} needs more value.</strong>\n<br><br>\nTradeForge could not find an additional player or combination from Team ${a}'s roster that improves the trade.\n</div>\n`);
u.sort((e,t)=>e.fair!==t.fair?e.fair?-1:1:e.fair&&t.fair?e.additions.length!==t.additions.length?e.additions.length-t.additions.length:e.newDifference-t.newDifference:e.close!==t.close?e.close?-1:1:Math.abs(e.newDifference-t.newDifference)>.25?e.newDifference-t.newDifference:e.additions.length-t.additions.length);
const m=[],f=new Set;for(const e of u){const t=e.additions.map(e=>key(e)).sort().join("|");if(!f.has(t)&&(f.add(t),(e.fair||!(e.improvement<2))&&(m.push(e),m.length>=3)))break}
m.length?r.innerHTML=m.map((r,s)=>{const o=r.additions.map(e=>esc(e.name)).join(" + ");
return`\n<div class="suggestion">\n\n<strong>Idea ${s+1} — ${r.fair?"FAIR MATCH":r.close?"VERY CLOSE":"BEST AVAILABLE"}</strong>\n\n<br><br>\n\n<strong>\nTeam ${a} adds ${o} to Team ${a}'s side of the trade.\n</strong>\n\n<br><br>\n\nCurrent:\nTeam A ${e.toFixed(1)}\nvs\nTeam B ${t.toFixed(1)}\n\n<br>\n\nAfter suggestion:\nTeam A ${r.recalculated.a.toFixed(1)}\nvs\nTeam B ${r.recalculated.b.toFixed(1)}\n\n<br>\n\nDifference:\n${n.toFixed(1)}%\n→\n${r.newDifference.toFixed(1)}%\n\n${r.fair?"\n<br><br>\n<strong>✓ Inside the 5% TradeForge fair range</strong>\n":""}\n\n</div>\n`
}).join(""):r.innerHTML=`\n<div class="suggestion">\n<strong>Team ${a} needs more value.</strong>\n<br><br>\nTradeForge could not find a reasonable addition from Team ${a}'s roster that gets the trade close enough to recommend.\n</div>\n`
}
function setupSleeperSearch(e){
const t=$("A"===e?"sleeper-search-a":"sleeper-search-b"),r=$("A"===e?"sleeper-results-a":"sleeper-results-b");t.oninput=()=>{
const n=t.value.trim().toLowerCase();if(!n)return void r.classList.remove("show");
const a=new Set(sleeperTeamA.concat(sleeperTeamB).map(key)),s=sleeperPool(e).filter(e=>!a.has(key(e))&&(e.name.toLowerCase().includes(n)||e.pos.toLowerCase().includes(n))).sort((e,t)=>sleeperValue(t)-sleeperValue(e)).slice(0,15);
r.innerHTML=s.length?s.map((e,t)=>`\n<div class="result-item" data-i="${t}">\n\n<span>\n${esc(e.name)}\n<small class="sub">${esc(e.pos)}</small>\n</span>\n\n<strong>${sleeperValue(e).toFixed(1)}</strong>\n\n</div>\n`).join(""):'\n<div class="result-item">\n<span>No matching players found on this roster</span>\n</div>\n',
r.classList.add("show"),r.querySelectorAll("[data-i]").forEach((n,a)=>{n.onclick=()=>{const n=s[a];sleeperPool(e).some(e=>key(e)===key(n))&&!sleeperTeamA.concat(sleeperTeamB).some(e=>key(e)===key(n))&&(("A"===e?sleeperTeamA:sleeperTeamB).push({...n}),t.value="",r.classList.remove("show"),renderSleeper())}})
}}
function getMyRosterId(){if("espn"===syncedProvider)return String(sleeperRosterA||"");const e=syncedRosters.find(e=>String(e.owner_id)===String(sleeperUser?.user_id));return String(e?e.roster_id:sleeperRosterA||"")}
function getSleeperRosterPlayer(e){
const t=matchSleeper(e=String(e));if(t)return{name:t.name,pos:t.pos,team:t.nflTeam||"",tradePlayer:t};
const r=sleeperPlayers[e];return r?{name:r.full_name||[r.first_name,r.last_name].filter(Boolean).join(" ")||"Unknown Player",pos:r.position||"",team:r.team||"",tradePlayer:null}:null
}
function renderLeagueRoster(e,t,r,n){
const a=syncedRosters.find(t=>String(t.roster_id)===String(e));if(!a)return $(r).textContent="Roster Not Found",$(n).textContent="",void($(t).innerHTML="");
const s=(a.players||[]).map(getSleeperRosterPlayer).filter(Boolean).sort((e,t)=>(t.tradePlayer?sleeperValue(t.tradePlayer):-1)-(e.tradePlayer?sleeperValue(e.tradePlayer):-1)),o=s.filter(e=>e.tradePlayer),l=o.reduce((e,t)=>e+sleeperValue(t.tradePlayer),0);
$(r).textContent=rosterName(a),$(n).textContent=`${s.length} players • ${o.length} valued • ${l.toFixed(1)} value`,$(t).innerHTML=s.map(e=>{
const t=e.tradePlayer?sleeperValue(e.tradePlayer).toFixed(1):"—",r=[e.pos,e.team].filter(Boolean).join(" • ");
return`\n<div class="roster-player">\n\n<div>\n<strong>${esc(e.name)}</strong>\n<small>${esc(r)}</small>\n${e.tradePlayer?"":'\n<div class="not-valued">\nNot yet in TradeForge database\n</div>\n'}\n</div>\n\n<div class="roster-value">${t}</div>\n\n</div>\n`
}).join("")
}
["scoring","league","qb","tep"].forEach(e=>$(e).onchange=applyControls);
$("swap").onclick=()=>{[teamA,teamB]=[teamB,teamA],render()};
$("clear").onclick=()=>{teamA=[],teamB=[],render()};
$("theme-toggle").onclick=()=>{const e=document.documentElement,t="dark"===e.dataset.theme?"light":"dark";e.dataset.theme=t,$("theme-toggle").textContent="dark"===t?"☀ Light Theme":"☾ Dark Theme"};
setupSearch("A"),setupSearch("B"),setupSleeperSearch("A"),setupSleeperSearch("B");
$("sleeper-swap").onclick=()=>{[sleeperTeamA,sleeperTeamB]=[sleeperTeamB,sleeperTeamA],[sleeperRosterA,sleeperRosterB]=[sleeperRosterB,sleeperRosterA],syncedLeague&&($("sleeper-roster-a").value=sleeperRosterA,$("sleeper-roster-b").value=sleeperRosterB),renderSleeper()};
$("sleeper-clear").onclick=()=>{sleeperTeamA=[],sleeperTeamB=[],renderSleeper()};
const DASHBOARD_POSITIONS=["QB","RB","WR","TE"];
function ordinal(e){const t=(e=Number(e)||0)%100;if(t>=11&&t<=13)return`${e}th`;switch(e%10){case 1:return`${e}st`;case 2:return`${e}nd`;case 3:return`${e}rd`;default:return`${e}th`}}
function sleeperValueForMode(e,t){const r=sleeperLeagueMode;sleeperLeagueMode=t;try{return sleeperValue(e)}finally{sleeperLeagueMode=r}}
function dashboardRosterPlayers(e){return e?(e.players||[]).map(e=>matchSleeper(String(e))).filter(Boolean):[]}
function dashboardValue(e,t=null){return t?sleeperValueForMode(e,t):sleeperValue(e)}
function dashboardCanFill(e,t){const r=e.pos;return t===r||("DEF"===t&&"DST"===r||("FLEX"===t||"WRRBTE_FLEX"===t?["RB","WR","TE"].includes(r):"WRRB_FLEX"===t?["RB","WR"].includes(r):"REC_FLEX"===t?["WR","TE"].includes(r):("SUPER_FLEX"===t||"OP"===t)&&["QB","RB","WR","TE"].includes(r)))}
function dashboardStarterSlots(){const e=new Set(["BN","IR","TAXI"]);return(syncedLeague?.roster_positions||[]).filter(t=>!e.has(t))}
function dashboardStarterValue(e,t=null){
const r=dashboardRosterPlayers(e);if(!r.length)return 0;const n=dashboardStarterSlots();
if(!n.length)return r.slice().sort((e,r)=>dashboardValue(r,t)-dashboardValue(e,t)).slice(0,Math.min(9,r.length)).reduce((e,r)=>e+dashboardValue(r,t),0);
const a=r.slice(),s=n.slice().sort((e,t)=>r.filter(t=>dashboardCanFill(t,e)).length-r.filter(e=>dashboardCanFill(e,t)).length);let o=0;
return s.forEach(e=>{let r=-1,n=-1;a.forEach((a,s)=>{if(!dashboardCanFill(a,e))return;const o=dashboardValue(a,t);o>n&&(n=o,r=s)}),r>=0&&(o+=n,a.splice(r,1))}),o
}
function dashboardPositionCap(e){return"QB"===e?"superflex"===sleeperQbMode?2:1:"RB"===e||"WR"===e?3:"TE"===e?2:1}
function dashboardPositionValue(e,t,r=null){return e.filter(e=>e.pos===t).sort((e,t)=>dashboardValue(t,r)-dashboardValue(e,r)).slice(0,dashboardPositionCap(t)).reduce((e,t)=>e+dashboardValue(t,r),0)}
function dashboardMetrics(e){
const t=dashboardRosterPlayers(e),r=t.reduce((e,t)=>e+dashboardValue(t),0),n=dashboardStarterValue(e),a=Math.max(0,r-n),s=dashboardStarterValue(e,"redraft"),o=t.reduce((e,t)=>e+dashboardValue(t,"dynasty"),0),l={};
DASHBOARD_POSITIONS.forEach(e=>{l[e]=dashboardPositionValue(t,e)});const i=.6*n+.2*a+.2*r;return{roster:e,rosterId:String(e.roster_id),name:rosterName(e),players:t,total:r,starters:n,depth:a,redraftStarters:s,dynastyTotal:o,positions:l,matched:t.length,power:i}
}
function dashboardRank(e,t,r){const n=e.slice().sort((e,r)=>r[t]-e[t]).findIndex(e=>e.rosterId===String(r));return n>=0?n+1:e.length}
function dashboardPositionRank(e,t,r){const n=e.slice().sort((e,r)=>r.positions[t]-e.positions[t]).findIndex(e=>e.rosterId===String(r));return n>=0?n+1:e.length}
function dashboardTeamProfile(e,t){
if("dynasty"===sleeperLeagueMode){const r=dashboardRank(t,"redraftStarters",e.rosterId),n=dashboardRank(t,"dynastyTotal",e.rosterId);
return r+2<n?{label:"Win-now leaning",detail:`Current lineup strength ranks ${ordinal(r)} while long-term dynasty value ranks ${ordinal(n)}.`}:n+2<r?{label:"Future-focused",detail:`Long-term dynasty value ranks ${ordinal(n)} while current lineup strength ranks ${ordinal(r)}.`}:{label:"Balanced roster",detail:`Current lineup strength ranks ${ordinal(r)} and long-term dynasty value ranks ${ordinal(n)}.`}}
const r=dashboardRank(t,"starters",e.rosterId),n=dashboardRank(t,"depth",e.rosterId);
return r+2<n?{label:"Starter-heavy",detail:`The starting lineup ranks ${ordinal(r)}, while roster depth ranks ${ordinal(n)}.`}:n+2<r?{label:"Depth-heavy",detail:`Roster depth ranks ${ordinal(n)}, while the starting lineup ranks ${ordinal(r)}.`}:{label:"Balanced roster",detail:`Starting lineup ranks ${ordinal(r)} and depth ranks ${ordinal(n)}.`}
}
function dashboardTradeOpportunities(e,t){
const r=t.length,n=DASHBOARD_POSITIONS.map(r=>({pos:r,rank:dashboardPositionRank(t,r,e.rosterId)})).sort((e,t)=>t.rank-e.rank).slice(0,2),a=[],s=new Set;
for(const o of n){
const n=t.filter(t=>t.rosterId!==e.rosterId).map(e=>({...e,posRank:dashboardPositionRank(t,o.pos,e.rosterId)})).sort((e,t)=>e.posRank-t.posRank||t.positions[o.pos]-e.positions[o.pos]);
for(const e of n){if(s.has(e.rosterId))continue;const t=e.players.filter(e=>e.pos===o.pos).sort((e,t)=>sleeperValue(t)-sleeperValue(e));if(!t.length)continue;let n=0;t.length>=2&&"QB"!==o.pos&&(n=1),"QB"===o.pos&&"superflex"===sleeperQbMode&&t.length>=2&&(n=1);const l=t[n];a.push({need:o,partner:e,target:l,leagueSize:r}),s.add(e.rosterId);break}}
if(n[0]){
const o=n[0],l=t.filter(t=>t.rosterId!==e.rosterId&&!s.has(t.rosterId)).map(e=>({...e,posRank:dashboardPositionRank(t,o.pos,e.rosterId)})).sort((e,t)=>e.posRank-t.posRank||t.positions[o.pos]-e.positions[o.pos]).find(e=>e.players.some(e=>e.pos===o.pos));
if(l){const e=l.players.filter(e=>e.pos===o.pos).sort((e,t)=>sleeperValue(t)-sleeperValue(e)),t=e[e.length>=2?1:0];a.push({need:o,partner:l,target:t,leagueSize:r})}}
return a.slice(0,3)
}
function renderLeagueDashboard(){
if(!syncedLeague||!syncedRosters.length)return;const e=syncedRosters.map(dashboardMetrics).filter(e=>e.matched>0);if(!e.length)return;
const t=getMyRosterId(),r=e.find(e=>e.rosterId===String(t));if(!r)return;
const n=e.length,a=dashboardRank(e,"power",r.rosterId),s=dashboardRank(e,"starters",r.rosterId),o=dashboardRank(e,"depth",r.rosterId),l=dashboardRank(e,"dynasty"===sleeperLeagueMode?"dynastyTotal":"total",r.rosterId);
$("dashboard-overall-rank").textContent=`${ordinal(a)} / ${n}`,$("dashboard-overall-detail").textContent=`${r.power.toFixed(1)} power score`,
$("dashboard-starter-rank").textContent=`${ordinal(s)} / ${n}`,$("dashboard-starter-detail").textContent=`${r.starters.toFixed(1)} starter value`,
$("dashboard-depth-rank").textContent=`${ordinal(o)} / ${n}`,$("dashboard-depth-detail").textContent=`${r.depth.toFixed(1)} depth value`,
$("dashboard-future-label").textContent="dynasty"===sleeperLeagueMode?"FUTURE VALUE":"TOTAL ROSTER VALUE",$("dashboard-future-rank").textContent=`${ordinal(l)} / ${n}`,
$("dashboard-future-detail").textContent="dynasty"===sleeperLeagueMode?`${r.dynastyTotal.toFixed(1)} dynasty value`:`${r.total.toFixed(1)} total value`;
const i=syncedRosters.reduce((e,t)=>e+(t.players?.length||0),0),d=e.reduce((e,t)=>e+t.matched,0);
$("dashboard-coverage").textContent=`${d}/${i} rostered players matched`,$("dashboard-subtitle").textContent=`${syncedLeague.name} • ${sleeperModeLabel()} • TradeForge league analysis`;
const u=dashboardTeamProfile(r,e);$("dashboard-profile").textContent=u.label,$("dashboard-profile-detail").textContent=u.detail;
const c=DASHBOARD_POSITIONS.map(t=>({pos:t,rank:dashboardPositionRank(e,t,r.rosterId),value:r.positions[t]})).sort((e,t)=>e.rank-t.rank),p=c[0],m=c[c.length-1];
$("dashboard-position-summary").textContent=`Strongest: ${p.pos} • Biggest need: ${m.pos}`,
$("dashboard-position-detail").textContent=`${p.pos} ranks ${ordinal(p.rank)} in the league. ${m.pos} ranks ${ordinal(m.rank)}.`,
$("dashboard-position-grid").innerHTML=DASHBOARD_POSITIONS.map(t=>`\n<div class="dashboard-position-card">\n\n<div class="dashboard-position-head">\n<strong>${t}</strong>\n<span class="dashboard-position-rank">\n${ordinal(dashboardPositionRank(e,t,r.rosterId))} / ${n}\n</span>\n</div>\n\n<div class="dashboard-position-value">\n${r.positions[t].toFixed(1)} TradeForge positional value\n</div>\n\n</div>\n`).join("");
const f=dashboardTradeOpportunities(r,e);
$("dashboard-trade-opportunities").innerHTML=f.length?f.map((e,t)=>`\n<div class="trade-opportunity">\n\n<strong>\nOpportunity ${t+1}: ${esc(e.partner.name)}\n</strong>\n\n<div class="sub">\nYour ${e.need.pos} room ranks ${ordinal(e.need.rank)} of ${e.leagueSize}.\n${esc(e.partner.name)} ranks ${ordinal(e.partner.posRank)} at ${e.need.pos}.\nA player worth exploring is ${esc(e.target.name)} at ${sleeperValue(e.target).toFixed(1)} TradeForge value.\n</div>\n\n</div>\n`).join(""):'\n<div class="trade-opportunity">\n<div class="sub">\nNo clear roster-strength trade opportunities were found with the players currently matched in TradeForge.\n</div>\n</div>\n';
const g=e.slice().sort((e,t)=>t.power-e.power);
$("dashboard-power-body").innerHTML=g.map((t,n)=>{const a=DASHBOARD_POSITIONS.map(r=>({pos:r,rank:dashboardPositionRank(e,r,t.rosterId)})).sort((e,t)=>e.rank-t.rank)[0];
return`\n<tr class="${t.rosterId===r.rosterId?"my-row":""}">\n\n<td class="rank-cell">${n+1}</td>\n\n<td>\n<strong>${esc(t.name)}</strong>\n${t.rosterId===r.rosterId?' <span class="sub">(You)</span>':""}\n</td>\n\n<td>${t.power.toFixed(1)}</td>\n<td>${t.starters.toFixed(1)}</td>\n<td>${t.depth.toFixed(1)}</td>\n<td>${a.pos} • ${ordinal(a.rank)}</td>\n\n</tr>\n`
}).join("")
}
function leagueTradeFinderRosters(){const e=getMyRosterId();return syncedRosters.filter(t=>String(t.roster_id)!==String(e))}
function leagueTradeFinderPlayerKey(e){return String(e?.sleeperId||norm(e?.name))}
function populateLeagueTradeFinderTargets(e,t=!0){
const r=$("trade-finder-target"),n=t?r.value:"",a=rosterAssets(e);
r.innerHTML=a.length?a.map(e=>`<option value="${esc(leagueTradeFinderPlayerKey(e))}">${esc(e.name)} • ${esc(e.pos)} • ${sleeperValue(e).toFixed(1)}</option>`).join(""):'<option value="">No valued players available</option>',
t&&a.some(e=>leagueTradeFinderPlayerKey(e)===n)&&(r.value=n)
}
function buildLeagueTradeFinder(){
if(!syncedLeague)return;const e=$("trade-finder-team"),t=e.value,r=leagueTradeFinderRosters();
e.innerHTML=r.length?r.map(e=>`<option value="${e.roster_id}">${esc(rosterName(e))}</option>`).join(""):'<option value="">No other teams available</option>';let n=t;
r.some(e=>String(e.roster_id)===String(n))||(n=r[0]?String(r[0].roster_id):""),n&&(e.value=n),populateLeagueTradeFinderTargets(n,!0)
}
function leagueTradeFinderGrade(e){return e<=5?"A+":e<=10?"A":e<=20?"B":e<=30?"C":e<=40?"D":"F"}
function findLeagueTrades(){
const e=$("trade-finder-results");if(leagueTradeFinderBuilds=[],!syncedLeague)return void(e.textContent="Sync a Sleeper or ESPN league first.");
const t=getMyRosterId(),r=$("trade-finder-team").value,n=$("trade-finder-target").value,a=Math.max(1,Math.min(3,Number($("trade-finder-max").value)||3)),s=syncedRosters.find(e=>String(e.roster_id)===String(t)),o=syncedRosters.find(e=>String(e.roster_id)===String(r)),l=rosterAssets(r).find(e=>leagueTradeFinderPlayerKey(e)===n);
if(!s||!o||!l)return void(e.textContent="Choose a team and a valued target player first.");const i=rosterAssets(t);
if(!i.length)return void(e.textContent="TradeForge could not find any valued players on your roster.");e.textContent="Searching your roster for the best TradeForge packages...";
const d=[],u=e=>{const t=withSleeperModes(()=>adjustedTradeValues(e,[l])),r=diff(t.a,t.b);d.push({packagePlayers:e,values:t,difference:r,grade:leagueTradeFinderGrade(r)})};
for(let e=0;e<i.length;e++)u([i[e]]);
if(a>=2)for(let e=0;e<i.length;e++)for(let t=e+1;t<i.length;t++)u([i[e],i[t]]);
if(a>=3)for(let e=0;e<i.length;e++)for(let t=e+1;t<i.length;t++)for(let r=t+1;r<i.length;r++)u([i[e],i[t],i[r]]);
d.sort((e,t)=>{const r=e.difference<=5,n=t.difference<=5;return r!==n?r?-1:1:r&&n&&e.packagePlayers.length!==t.packagePlayers.length?e.packagePlayers.length-t.packagePlayers.length:Math.abs(e.difference-t.difference)>.05?e.difference-t.difference:e.packagePlayers.length-t.packagePlayers.length});
const c=[],p=new Set;for(const e of d){const t=e.packagePlayers.map(leagueTradeFinderPlayerKey).sort().join("|");if(!p.has(t)&&(p.add(t),c.push(e),c.length>=5))break}
if(!c.length)return void(e.textContent="TradeForge could not find a package for this target.");const m=rosterName(s),f=rosterName(o);
leagueTradeFinderBuilds=c.map(e=>({mineId:String(t),otherId:String(r),target:{...l},packagePlayers:e.packagePlayers.map(e=>({...e}))})),
e.innerHTML=c.map((e,t)=>{const r=e.packagePlayers.map(e=>esc(e.name)).join(" + "),n=e.packagePlayers.reduce((e,t)=>e+sleeperValue(t),0),a=sleeperValue(l);
return`\n<div class="trade-finder-result">\n\n<div class="trade-finder-result-head">\n<strong>Option ${t+1} — ${e.difference<=5?"FAIR MATCH":e.difference<=10?"VERY CLOSE":"BEST AVAILABLE"}</strong>\n<strong>Grade ${e.grade}</strong>\n</div>\n\n<div style="margin-top:9px">\n<strong>${esc(m)} sends:</strong>\n${r}\n</div>\n\n<div style="margin-top:5px">\n<strong>${esc(f)} sends:</strong>\n${esc(l.name)}\n</div>\n\n<div class="sub" style="margin-top:9px">\nBase value: ${n.toFixed(1)} for ${a.toFixed(1)} • Adjusted value: ${e.values.a.toFixed(1)} for ${e.values.b.toFixed(1)} • ${e.difference.toFixed(1)}% difference\n</div>\n\n<button\ntype="button"\nclass="trade-finder-build-button"\ndata-build-trade-index="${t}"\n>\nBuild Trade\n</button>\n\n</div>\n`
}).join(""),e.querySelectorAll("[data-build-trade-index]").forEach(e=>{e.addEventListener("click",()=>{buildLeagueFinderTrade(Number(e.dataset.buildTradeIndex))})})
}
function buildLeagueFinderTrade(e){
const t=leagueTradeFinderBuilds[e];if(!t||!syncedLeague)return;const r=rosterAssets(t.mineId),n=rosterAssets(t.otherId);
if(!t.packagePlayers.every(e=>r.some(t=>key(t)===key(e)))||!n.some(e=>key(e)===key(t.target)))return leagueTradeFinderBuilds=[],void($("trade-finder-results").textContent="Rosters changed. Run Find Trades again.");
sleeperRosterA=String(t.mineId),sleeperRosterB=String(t.otherId),$("sleeper-roster-a").value=sleeperRosterA,$("sleeper-roster-b").value=sleeperRosterB,sleeperTeamA=t.packagePlayers.map(e=>({...e})),sleeperTeamB=[{...t.target}],renderSleeper(),setTradeCenterTab("calculator"),$("trade-center-card")?.scrollIntoView({behavior:"smooth",block:"start"})
}
function setTradeCenterTab(e){
["calculator","finder","opportunities"].includes(e)||(e="finder"),document.querySelectorAll("[data-trade-center-tab]").forEach(t=>{const r=t.dataset.tradeCenterTab===e;t.classList.toggle("active",r),t.setAttribute("aria-selected",r?"true":"false")}),document.querySelectorAll("[data-trade-center-panel]").forEach(t=>{t.classList.toggle("active",t.dataset.tradeCenterPanel===e)})
}
function buildLeaguePage(){
if(!syncedLeague)return;$("league-page-name").textContent=syncedLeague.name+" • "+sleeperModeLabel();const e=getMyRosterId();
renderLeagueDashboard(),buildLeagueTradeFinder(),renderLeagueRoster(e,"my-team-roster","my-team-name","my-team-meta");
const t=syncedRosters.filter(t=>String(t.roster_id)!==String(e)),r=$("opponent-select").value;
$("opponent-select").innerHTML=t.map(e=>`\n<option value="${e.roster_id}">\n${esc(rosterName(e))}\n</option>\n`).join("");let n=r;
t.some(e=>String(e.roster_id)===String(n))||(n=t[0]?String(t[0].roster_id):""),n?($("opponent-select").value=n,renderLeagueRoster(n,"opponent-team-roster","opponent-team-name","opponent-team-meta")):($("opponent-team-name").textContent="No Other Team",$("opponent-team-meta").textContent="",$("opponent-team-roster").innerHTML=""),
$("sleeper-name").textContent=syncedLeague.name||`${syncedProviderName()} League`,$("sleeper-mode-label").textContent=sleeperModeLabel(),updateSyncedProviderCopy(),renderSleeper()
}
function setPage(e){"league"!==e||syncedLeague||(e="analyzer"),$("analyzer-page").classList.toggle("page-hidden","analyzer"!==e),$("league-page").classList.toggle("page-hidden","league"!==e),"league"===e&&buildLeaguePage(),window.scrollTo(0,0)}
$("trade-finder-team").onchange=()=>{leagueTradeFinderBuilds=[],populateLeagueTradeFinderTargets($("trade-finder-team").value,!1),$("trade-finder-results").textContent="Choose a target player and click Find Trades."};
$("trade-finder-target").onchange=()=>{leagueTradeFinderBuilds=[],$("trade-finder-results").textContent="Click Find Trades to search your roster for packages."};
$("trade-finder-max").onchange=()=>{leagueTradeFinderBuilds=[],$("trade-finder-results").textContent="Click Find Trades to search your roster for packages."};
$("trade-finder-run").onclick=findLeagueTrades;
document.querySelectorAll("[data-trade-center-tab]").forEach(e=>{e.onclick=()=>setTradeCenterTab(e.dataset.tradeCenterTab)});
setTradeCenterTab("finder");
$("opponent-select").onchange=e=>renderLeagueRoster(e.target.value,"opponent-team-roster","opponent-team-name","opponent-team-meta");
$("league-view-button").onclick=()=>{syncedLeague&&(location.hash="league",setPage("league"))};
$("back-to-analyzer").onclick=()=>{location.hash="analyzer",setPage("analyzer")};
window.addEventListener("hashchange",()=>{setPage("#league"===location.hash?"league":"analyzer")});
const modal=$("modal");
async function fetchJSON(e){const t=await fetch(e);if(!t.ok)throw new Error("Sleeper request failed ("+t.status+").");return t.json()}
async function fetchJSONSafe(e,t=[]){try{return await fetchJSON(e)}catch{return t}}
$("sync-button").onclick=()=>{modal.classList.add("show")};
$("modal-close").onclick=()=>{modal.classList.remove("show")};
$("find-leagues").onclick=async()=>{
const e=$("username").value.trim();
if(e){$("status").textContent="Finding your leagues...";try{
if(sleeperUser=await fetchJSON("https://api.sleeper.app/v1/user/"+encodeURIComponent(e)),!sleeperUser?.user_id)throw new Error("Username not found.");
const t=await fetchJSON("https://api.sleeper.app/v1/state/nfl"),r=t.league_season||t.season,n=await fetchJSON(`https://api.sleeper.app/v1/user/${sleeperUser.user_id}/leagues/nfl/${r}`);
if(!Array.isArray(n)||!n.length)throw new Error("No NFL leagues found for the current Sleeper season.");
$("league-picker").innerHTML=n.map(e=>`\n<option value="${e.league_id}">\n${esc(e.name)}\n</option>\n`).join(""),$("league-wrap").style.display="block",$("status").textContent=`Found ${n.length} league${1===n.length?"":"s"}.`
}catch(e){$("status").textContent=e.message||"Unable to find Sleeper leagues."}}else $("status").textContent="Enter your Sleeper username."
};
$("connect-league").onclick=async()=>{
const e=$("league-picker").value;
if(e){$("status").textContent="Syncing league...";try{
[syncedLeague,syncedRosters,syncedUsers,sleeperPlayers]=await Promise.all([fetchJSON(`https://api.sleeper.app/v1/league/${e}`),fetchJSON(`https://api.sleeper.app/v1/league/${e}/rosters`),fetchJSON(`https://api.sleeper.app/v1/league/${e}/users`),fetchJSON("https://api.sleeper.app/v1/players/nfl?active=true")]),
syncedProvider="sleeper",espnLeagueRaw=null,sleeperTrendMarket={},leagueTradeFinderBuilds=[],$("trade-finder-results").textContent="Choose a target player and click Find Trades.",
applySleeperSettings(),buildSleeperRosterSelectors(),buildSleeperNameMap(),sleeperTeamA=[],sleeperTeamB=[],$("sleeper-name").textContent=syncedLeague.name||"Sleeper League",
$("sleeper-mode-label").textContent=sleeperModeLabel(),updateSyncedProviderCopy(),$("sleeper-bar").style.display="block",$("sync-button").textContent="Sleeper Synced ✓",
$("espn-sync-button").textContent="Sync ESPN",$("league-view-button").disabled=!1,modal.classList.remove("show"),renderSleeper(),location.hash="league",setPage("league"),
TRADEFORGE_ENGINE.useSleeperTrendingMarket&&refreshSleeperTrends()
}catch(e){$("status").textContent=e.message||"Unable to sync this Sleeper league."}}else $("status").textContent="Choose a league first."
};
const espnModal=$("espn-modal"),ESPN_POSITION_MAP={1:"QB",2:"RB",3:"WR",4:"TE",5:"K",16:"DST"},ESPN_PRO_TEAM_MAP={0:"",1:"ATL",2:"BUF",3:"CHI",4:"CIN",5:"CLE",6:"DAL",7:"DEN",8:"DET",9:"GB",10:"TEN",11:"IND",12:"KC",13:"LV",14:"LAR",15:"MIA",16:"MIN",17:"NE",18:"NO",19:"NYG",20:"NYJ",21:"PHI",22:"ARI",23:"PIT",24:"LAC",25:"SF",26:"SEA",27:"TB",28:"WAS",29:"CAR",30:"JAC",33:"BAL",34:"HOU"},ESPN_LINEUP_SLOT_MAP={0:"QB",1:"QB",2:"RB",3:"WRRB_FLEX",4:"WR",5:"REC_FLEX",6:"TE",7:"SUPER_FLEX",16:"DEF",17:"K",20:"BN",21:"IR",23:"FLEX",24:"IR",25:"BN"};
function parseEspnLeagueInput(e){
e=String(e||"").trim();let t="",r="",n="";
if(/^\d+$/.test(e))t=e;else if(e){
try{const a=new URL(e);t=a.searchParams.get("leagueId")||a.searchParams.get("league_id")||"",r=a.searchParams.get("teamId")||a.searchParams.get("team_id")||"",n=a.searchParams.get("seasonId")||a.searchParams.get("season")||""}catch{}
if(!t){const r=e.match(/leagueId(?:=|\/)(\d+)/i)||e.match(/leagues\/(\d+)/i);t=r?.[1]||""}
if(!r){const t=e.match(/teamId(?:=|\/)(\d+)/i)||e.match(/teams\/(\d+)/i);r=t?.[1]||""}
if(!n){const t=e.match(/seasonId(?:=|\/)(\d{4})/i)||e.match(/seasons\/(\d{4})/i);n=t?.[1]||""}}
return{leagueId:/^\d+$/.test(t)?t:"",teamId:/^\d+$/.test(r)?r:"",seasonId:n}
}
async function fetchEspnJSON(e){
let t;try{t=await fetch(e,{credentials:"include",cache:"no-store",headers:{Accept:"application/json"}})}
catch(e){throw new Error("The ESPN request failed. Use a hosted or localhost page and make sure the league is public, or that you are signed into ESPN in this browser.")}
if(!t.ok){
if(401===t.status||403===t.status)throw new Error("ESPN denied access. Public leagues usually work in-browser. Private ESPN leagues generally require an authenticated server/proxy connection.");
throw new Error("ESPN request failed ("+t.status+").")}
const r=await t.json();return Array.isArray(r)?r[0]:r
}
function espnRosterPositions(e){const t=[];return Object.entries(e||{}).forEach(([e,r])=>{const n=ESPN_LINEUP_SLOT_MAP[Number(e)];if(!n)return;const a=Math.max(0,Number(r)||0);for(let e=0;e<a;e++)t.push(n)}),t}
function espnReceptionScoringItem(e){const t=e?.settings?.scoringSettings?.scoringItems||[];return t.find(e=>53===Number(e.statId))||t.find(e=>41===Number(e.statId))||t.find(e=>String(e.statAbbrev||e.abbrev||"").toLowerCase().includes("rec"))||null}
function applyEspnSettings(e){
const t=espnReceptionScoringItem(e),r=Number(t?.points||0),n=t?.pointsOverrides?.[4],a=Number(n),s=Number.isFinite(a)?Math.max(0,a-r):0,o=e?.settings?.rosterSettings?.lineupSlotCounts||{},l=Math.max(Number(e?.settings?.draftSettings?.keeperCount||0),Number(e?.settings?.draftSettings?.keeperCountFuture||0));
sleeperScoringMode=r>=.75?"ppr":r>=.25?"half":"standard",sleeperQbMode=Number(o[7]||0)>0||Number(o[0]||0)+Number(o[1]||0)>1?"superflex":"oneqb",sleeperTePremiumMode=s>=.75?"full":s>=.25?"half":"off",sleeperLeagueMode=l>0?"keeper":"redraft"
}
function espnTeamName(e){return e?.name||[e?.location,e?.nickname].filter(Boolean).join(" ")||e?.abbrev||"Team "+String(e?.id||"")}
function espnPlayerId(e){return String(e?.playerId??e?.playerPoolEntry?.player?.id??e?.playerPoolEntry?.id??e?.id??"")}
function espnPlayerRecord(e){
const t=e?.playerPoolEntry?.player||e?.player||{},r=espnPlayerId(e),n=t.fullName||[t.firstName,t.lastName].filter(Boolean).join(" ")||t.displayName||"Unknown Player",a=ESPN_POSITION_MAP[Number(t.defaultPositionId)]||t.defaultPositionAbbreviation||t.position||"",s=ESPN_PRO_TEAM_MAP[Number(t.proTeamId)]||t.proTeamAbbreviation||"";
return{id:r,full_name:n,first_name:t.firstName||n.split(" ")[0]||"",last_name:t.lastName||n.split(" ").slice(1).join(" "),position:a,team:s,espn_id:r,injury_status:t.injuryStatus||t.injury_status||"",injuryStatus:t.injuryStatus||t.injury_status||"",injury_body_part:t.injuryBodyPart||t.injuryDetail||"",injuryBodyPart:t.injuryBodyPart||t.injuryDetail||"",raw:t}
}
function normalizeEspnLeague(e,t=""){
const r=Array.isArray(e?.teams)?e.teams:[];
if(!r.length)throw new Error("ESPN returned the league, but no team rosters were available.");
if(t&&!r.some(e=>String(e.id)===String(t)))throw new Error("That team ID is not in this ESPN league.");
const n=Array.isArray(e?.members)?e.members:[],a={},s=[],o=[];
r.forEach(e=>{
const t=String(e.id),r=String(e.primaryOwner||e.owners?.[0]||"espn-team-"+t),l=Array.isArray(e?.roster?.entries)?e.roster.entries:[],i=[];
l.forEach(e=>{
const t=espnPlayerRecord(e);if(!t.id)return;i.push(t.id),a[t.id]=t
});
s.push({roster_id:t,owner_id:r,players:i,espnTeam:e,metadata:{team_name:espnTeamName(e)}});
const d=n.find(e=>String(e.id)===String(r))||n.find(t=>(e.owners||[]).some(e=>String(e)===String(t.id)));
o.push({user_id:r,display_name:d?.displayName||espnTeamName(e),username:d?.displayName||"",metadata:{team_name:espnTeamName(e)}})
});
const l=espnReceptionScoringItem(e),i=Number(l?.points||0),d=Number(l?.pointsOverrides?.[4]),u=Number.isFinite(d)?Math.max(0,d-i):0,c=Math.max(Number(e?.settings?.draftSettings?.keeperCount||0),Number(e?.settings?.draftSettings?.keeperCountFuture||0));
syncedLeague={...e,league_id:String(e?.id||""),name:e?.settings?.name||e?.name||"ESPN League",roster_positions:espnRosterPositions(e?.settings?.rosterSettings?.lineupSlotCounts),scoring_settings:{rec:i,bonus_rec_te:u},settings:{...(e?.settings||{}),type:c>0?1:0}},syncedRosters=s,syncedUsers=o,sleeperPlayers=a;
const p=String(t||""),m=p?s.find(e=>String(e.roster_id)===p):s[0];sleeperUser=m?{user_id:String(m.owner_id)}:null
}
async function loadEspnLeague(e,t){
const r=`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${encodeURIComponent(t)}/segments/0/leagues/${encodeURIComponent(e)}`;
try{
const e=await fetchEspnJSON(r+"?view=mSettings&view=mTeam&view=mRoster&view=mDraftDetail&view=mStatus");
if(Array.isArray(e?.teams)&&e.teams.some(e=>Array.isArray(e?.roster?.entries)&&e.roster.entries.length))return e
}catch(e){console.warn("ESPN primary roster request failed; trying scoring-period request.",e)}
const n=await fetchEspnJSON(r+"?view=mSettings&view=mTeam&view=mStatus"),a=Number(n?.scoringPeriodId||n?.status?.currentMatchupPeriod||n?.status?.latestScoringPeriod||1);
return fetchEspnJSON(r+"?view=mSettings&view=mTeam&view=mRoster&view=mDraftDetail&view=mStatus&scoringPeriodId="+encodeURIComponent(a))
}
$("sleeper-roster-a").onchange=e=>{sleeperRosterA=e.target.value,sleeperTeamA=[],leagueTradeFinderBuilds=[],renderSleeper(),buildLeaguePage()};
$("sleeper-roster-b").onchange=e=>{sleeperRosterB=e.target.value,sleeperTeamB=[],leagueTradeFinderBuilds=[],renderSleeper(),buildLeaguePage()};
$("disconnect").onclick=()=>{
syncedLeague=null,syncedRosters=[],syncedUsers=[],sleeperPlayers={},sleeperUser=null,syncedProvider="",espnLeagueRaw=null,sleeperRosterA="",sleeperRosterB="",sleeperTeamA=[],sleeperTeamB=[],sleeperTrendMarket={},sleeperIdByName={},leagueTradeFinderBuilds=[],
$("sleeper-bar").style.display="none",$("sync-button").textContent="Sync Sleeper",$("espn-sync-button").textContent="Sync ESPN",$("league-view-button").disabled=!0,location.hash="analyzer",setPage("analyzer"),renderBoard(),render()
};
location.hash||history.replaceState(null,"","#analyzer");
"#league"!==location.hash||syncedLeague||history.replaceState(null,"","#analyzer");
setPage("#league"===location.hash?"league":"analyzer"),renderBoard(),render(),loadTradeForgeFeed();

function calculateAdjustedTeamValue(e){return adjusted(Array.isArray(e)?e:[],[])}
window.calculateAdjustedTeamValue=calculateAdjustedTeamValue;
window.tradeForgeEngineRefresh=()=>{try{render()}catch(e){console.warn("TradeForge main refresh failed",e)}try{renderSleeper()}catch(e){console.warn("TradeForge synced refresh failed",e)}};
