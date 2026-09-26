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
function tfApplyLeagueSettings(e,t,r){let n=t*(multipliers[e.pos]?.[scoringMode]||1);return"superflex"===qbMode&&"QB"===e.pos&&(n*=1.15),"TE"===e.pos&&"half"===tePremiumMode&&(n*=1.07),"TE"===e.pos&&"full"===tePremiumMode&&(n*=1.13),tfClamp(n,.1,100)}
function legacyValue(e){if("PICK"===e.pos)return tfDynamicPickValue(e);const t="dynasty"===leagueMode?e.dynasty:"keeper"===leagueMode?e.keeper:e.redraft;return tfApplyLeagueSettings(e,t,leagueMode)}
function value(e){if("PICK"===e.pos)return tfDynamicPickValue(e);if(!TRADEFORGE_ENGINE.enabled||!tfHasAnyEngineData(e))return legacyValue(e);let t;return t="dynasty"===leagueMode?tfDynastyRaw(e):"keeper"===leagueMode?tfKeeperRaw(e):tfRedraftRaw(e),t=tfApplyEliteCurve(t),tfApplyLeagueSettings(e,t,leagueMode)}
function base(e){return e.reduce((e,t)=>e+value(t),0)}
function packageValue(e){return e.slice().sort((e,t)=>value(t)-value(e)).reduce((e,t,r)=>e+value(t)*(PACKAGE_WEIGHTS[r]??PACKAGE_WEIGHTS.at(-1)),0)}
function consolidationPremium(e,t){if(e.length<t.length){const r=Math.min(.18,.05*(t.length-e.length));return packageValue(e)*r}return 0}
function adjusted(e,t){return packageValue(e)+consolidationPremium(e,t)}
function adjustedTradeValues(e,t){return{a:adjusted(e,t),b:adjusted(t,e),premiumA:consolidationPremium(e,t),premiumB:consolidationPremium(t,e)}}
function diff(e,t){return e||t?Math.abs(e-t)/(((e+t)/2)||1)*100:0}
function engineStatusText(){
const e=playerDatabase.filter(tfHasAnyEngineData).length,t=playerDatabase.length;return TRADEFORGE_ENGINE.enabled?e?`Weighted engine active • ${e}/${t} players using advanced data`:"Legacy value mode • add weighted data to player rater for advanced scoring":"Legacy value mode"
}
function updateEngineStatus(){ $("engine-status")&&($("engine-status").textContent=engineStatusText())}
function playerAge(e){return tfNum(e.engine?.dynasty?.age??e.engine?.keeper?.age??e.engine?.redraft?.age,null)}
function advisorPlayerValueBreakdown(e){if(!e)return"";const t=value(e),r=legacyValue(e);let n=`${esc(e.name)} is valued at ${t.toFixed(1)} in the current settings`;return TRADEFORGE_ENGINE.enabled&&tfHasAnyEngineData(e)&&Math.abs(t-r)>=1&&(n+=` after weighted adjustments from a ${r.toFixed(1)} base`),n}
function advisorAssetType(e){if(!e)return"asset";if("PICK"===e.pos)return"draft capital";const t=value(e);return t>=75?"elite cornerstone":t>=50?"premium starter":t>=25?"solid starter/flex asset":t>=10?"depth asset":"throw-in/deep depth asset"}
function advisorFutureProfile(e){if(!e)return"";if("PICK"===e.pos)return"future-focused draft capital";const t=e.dynasty-e.redraft,r=playerAge(e);if("RB"===e.pos&&r&&r>=28)return"older RB profile with more short-term than long-term insulation";if("WR"===e.pos&&r&&r<=25)return"young WR profile with long-term runway";if("TE"===e.pos&&r&&r<=25)return"young TE profile with long-term runway";if("QB"===e.pos&&r&&r<=27)return"young QB profile with multi-year value";return t>=8?"future-leaning dynasty profile":t<=-8?"win-now profile with less dynasty insulation":"balanced current and future profile"}
function advisorPackageNote(e,t){if(e.length>t.length)return"Team A is taking on more pieces; depth helps only if those players can start or fill real roster needs.";if(t.length>e.length)return"Team B is taking on more pieces; depth helps only if those players can start or fill real roster needs.";return""}
function advisorSideNotes(e,t,r){
const n=e.slice().sort((e,t)=>value(t)-value(e))[0],a=t.slice().sort((e,t)=>value(t)-value(e))[0],s=[];
n&&s.push(`Team A's best outgoing asset: ${advisorPlayerValueBreakdown(n)} (${advisorAssetType(n)}). ${advisorFutureProfile(n)}.`);
a&&s.push(`Team B's best outgoing asset: ${advisorPlayerValueBreakdown(a)} (${advisorAssetType(a)}). ${advisorFutureProfile(a)}.`);
const o=advisorPackageNote(e,t);return o&&s.push(o),s
}
function renderTradeAdvisor(e,t,r,n,a=null){
const s=$(e);if(!s)return;
if(!t.length||!r.length)return s.className="trade-advisor-box empty",void(s.textContent="Add players to both sides to get AI Trade Advisor guidance.");
const o=n?.a??adjusted(t,r),l=n?.b??adjusted(r,t),i=diff(o,l),d=o>=l?"Team A":"Team B",u=o>=l?"Team B":"Team A";let c,p,m;
i<=5?(c="Fair but context dependent",p="hold",m="This is inside the TradeForge fair range. Decide based on roster fit, starting-lineup need, and format context."):i<=10?(c=`Slight edge to ${d}`,p="hold",m=`${d} gets a small value edge, but ${u} can still justify it if the return better fits roster construction.`):i<=20?(c=`Accept for ${d} / ask for more for ${u}`,p="make",m=`${d} gets a clear value edge. ${u} should try to add another useful piece or pick.`):(c=`Do not accept as ${u}`,p="stop",m=`${u} is giving up too much adjusted value unless there is outside context TradeForge cannot see.`);
const f=advisorSideNotes(t,r,n).concat([`League context: ${"dynasty"===leagueMode?"Dynasty mode raises the importance of age, long-term value, and picks.":"keeper"===leagueMode?"Keeper mode blends current production with future value, but private keeper cost is not included.":"Redraft mode prioritizes current-season production."}`, "superflex"===qbMode?"Superflex settings increase the value of stable QB production.":"1QB settings reduce the need to overpay for non-elite quarterbacks."]);
s.className="trade-advisor-box",s.innerHTML=`<div class="trade-advisor-verdict ${p}">${esc(c)}</div><div class="trade-advisor-detail">${esc(m)}</div><ul class="trade-advisor-list">${f.filter(Boolean).slice(0,6).map(e=>`<li>${esc(e)}</li>`).join("")}</ul><div class="trade-advisor-context">AI Trade Advisor uses TradeForge values, package size, league format, position, age/future profile when available, and synced roster context when available. It does not know private keeper cost, waiver settings, or outside negotiations.</div>`
}
function advisorMetadata(e){const t=e?.engine?.dynasty||e?.engine?.keeper||e?.engine?.redraft||{};return{age:tfIsNumber(t.age)?Number(t.age):null}}
function injurySleeperRecord(e){
if(!e)return null;
if(e.liveData)return e.liveData;
const t=e.sleeperId||sleeperIdByName[norm(e.name)];
return t&&sleeperPlayers[t]?sleeperPlayers[t]:null
}
function injuryCleanStatus(e){return String(e||"").trim()}
function injuryEngineExplicitAvailability(e){
const t=[e.engine?.[leagueMode],e.engine?.redraft,e.engine?.keeper,e.engine?.dynasty].filter(Boolean);
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
$(t).innerHTML=r.length?r.map((e,t)=>`\n<div class="top-player">\n<span>\n${t+1}. ${esc(e.name)}\n</span>\n<strong>${legacyValue(e).toFixed(1)}</strong>\n</div>\n`).join(""):'<div class="sub">No ranked players</div>'
}
function renderBoard(){$("mode-label").textContent=modeLabel(),updateEngineStatus(),renderTop("RB","top-rb"),renderTop("WR","top-wr"),renderTop("QB","top-qb"),renderTop("TE","top-te")}
function renderTeam(e){
const t="A"===e?teamA:teamB,r=$("A"===e?"team-a":"team-b");
t.length?r.innerHTML=t.map((t,r)=>`\n<div class="player">\n<div>\n<strong>${esc(t.name)}</strong>\n<small>${esc(t.pos)}</small>\n</div>\n<strong>${value(t).toFixed(1)}</strong>\n<button class="remove" onclick="removePlayer('${e}',${r})">×</button>\n</div>\n`).join(""):r.innerHTML='<div class="sub" style="padding:20px 0">Search above to add players.</div>'
}
function removePlayer(e,t){("A"===e?teamA:teamB).splice(t,1),render()}
function clearSearchResults(e=""){["a","b"].forEach(t=>{const r=$(e+"results-"+t);r.innerHTML="",r.classList.remove("show")})}
function render(){clearSearchResults(),renderTeam("A"),renderTeam("B"),calculate()}
function calculate(){
const e=base(teamA),t=base(teamB),r=adjustedTradeValues(teamA,teamB),n=r.a,a=r.b,s=diff(n,a);
$("base-a").textContent=e.toFixed(1),$("base-b").textContent=t.toFixed(1),$("adj-a").textContent=n.toFixed(1),$("adj-b").textContent=a.toFixed(1),$("marker").style.left=(n+a?Math.max(5,Math.min(95,a/(n+a)*100)):50)+"%";
const o=$("verdict");if(o.className="",!teamA.length||!teamB.length)return o.innerHTML="\nBuild a Trade\n<small>Add players to both sides.</small>\n",$("grade").textContent="—",tfSafeRenderTradeAdvisor("trade-advisor",teamA,teamB,r),tfSafeRenderInjuryEngine("injury-engine",teamA,teamB),void($("trade-ideas").textContent="Build a trade to see suggested trade ideas.");
let l,i;s<=5?(l="FAIR TRADE",i="fair"):s<=10?(l="SLIGHT ADVANTAGE",i="slight"):s<=20?(l="ADVANTAGE",i="adv"):(l="MAJOR ADVANTAGE",i="major"),o.className=i,
o.innerHTML=`\n${l}\n<small>\n${s.toFixed(1)}% difference\n${s>5?" • "+(n>a?"Team A":"Team B")+" has more adjusted value":""}\n${r.premiumA||r.premiumB?` • Consolidation premium applied`:``}\n</small>\n`,
$("grade").textContent=s<=5?"A+":s<=10?"A":s<=20?"B":s<=30?"C":s<=40?"D":"F",tfSafeRenderTradeAdvisor("trade-advisor",teamA,teamB,r),tfSafeRenderInjuryEngine("injury-engine",teamA,teamB),tfSafeTradeIdeas(n,a)
}
function tradeIdeas(e,t){
const r=$("trade-ideas");if(!teamA.length||!teamB.length)return void(r.textContent="Build a trade to see suggested trade ideas.");const n=diff(e,t);
if(n<=5)return void(r.innerHTML='\n<div class="suggestion">\n<strong>No adjustment needed.</strong>\n<br><br>\nThis trade is already inside the 5% TradeForge fair range.\n</div>\n');
const a=e>t?"B":"A",s=new Set(teamA.concat(teamB).map(key)),o=assets().filter(e=>!s.has(key(e))&&"PICK"!==e.pos),l=e>t?e:t,i=e>t?t:e,d=e=>{
const t=adjustedTradeValues("A"===a?teamA.concat(e):teamA,"B"===a?teamB.concat(e):teamB),r=diff(t.a,t.b);return r>=n?null:{additions:e,recalculated:t,newDifference:r,fair:r<=5,close:r>5&&r<=10,improvement:n-r}},u=[];
o.forEach(e=>{const t=d([e]);t&&u.push(t)});
const c=Math.abs(l-i),p=o.slice().sort((e,t)=>Math.abs(value(e)-c)-Math.abs(value(t)-c)).slice(0,30);
for(let e=0;e<p.length;e++)for(let t=e+1;t<p.length;t++){const r=d([p[e],p[t]]);r&&u.push(r)}
if(!u.some(e=>e.fair)){const e=p.slice(0,16);for(let t=0;t<e.length;t++)for(let r=t+1;r<e.length;r++)for(let n=r+1;n<e.length;n++){const a=d([e[t],e[r],e[n]]);a&&u.push(a)}}
u.sort((e,t)=>e.fair!==t.fair?e.fair?-1:1:e.fair&&t.fair?e.additions.length!==t.additions.length?e.additions.length-t.additions.length:e.newDifference-t.newDifference:e.close!==t.close?e.close?-1:1:Math.abs(e.newDifference-t.newDifference)>.25?e.newDifference-t.newDifference:e.additions.length-t.additions.length);
const m=[],f=new Set;for(const e of u){const t=e.additions.map(e=>key(e)).sort().join("|");if(!f.has(t)&&(f.add(t),(e.fair||!(e.improvement<2))&&(m.push(e),m.length>=3)))break}
m.length?r.innerHTML=m.map((r,s)=>{const o=r.additions.map(e=>esc(e.name)).join(" + ");
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
const s=(a.players||[]).map(getSleeperRosterPlayer).filter(Boolean),o=s.map(e=>e.tradePlayer).filter(Boolean).sort((e,t)=>sleeperValue(t)-sleeperValue(e));
$(r).textContent=rosterName(a),$(n).textContent=`${o.length} matched TradeForge players • ${base(o).toFixed(1)} roster value`,
$(t).innerHTML=o.length?o.map(e=>`\n<div class="league-player-row">\n<span>${esc(e.name)}<small>${esc(e.pos)}${e.nflTeam?" • "+esc(e.nflTeam):""}</small></span><strong>${sleeperValue(e).toFixed(1)}</strong>\n</div>`).join(""):'<div class="sub">No matched TradeForge players found for this roster.</div>'
}
function getRosterValue(e){return base(rosterAssets(e))}
function rosterName(e){
if(!e)return"Unknown Team";
const t=syncedUsers.find(t=>String(t.user_id)===String(e.owner_id));
return e.metadata?.team_name||t?.metadata?.team_name||t?.display_name||("Roster "+e.roster_id)
}
function dashboardMetrics(e){
const t=rosterAssets(e.roster_id),r={roster:e,rosterId:String(e.roster_id),name:rosterName(e),matched:t.length,total:0,starters:0,depth:0,positions:{},ageScore:0,current:0,future:0,draftCapital:0,direction:"Balanced",indicator:"Balanced",needs:[],strengths:[],tradeAngles:[]};
if(!t.length)return r;
const n=t.slice().sort((e,t)=>sleeperValue(t)-sleeperValue(e));
r.total=base(n);
r.starters=base(n.slice(0,9));
r.depth=Math.max(0,r.total-r.starters);
["QB","RB","WR","TE"].forEach(e=>{const a=n.filter(t=>t.pos===e),s=base(a.slice(0,"QB"===e&&"superflex"===sleeperQbMode?2:"RB"===e||"WR"===e?3:1));r.positions[e]={count:a.length,value:s,top:a[0]||null}});
r.strengths=Object.entries(r.positions).sort((e,t)=>t[1].value-e[1].value).slice(0,2).map(e=>e[0]);
r.needs=Object.entries(r.positions).sort((e,t)=>e[1].value-t[1].value).slice(0,2).map(e=>e[0]);
r.current=n.reduce((e,t)=>e+(t.redraft||0),0);
r.future=n.reduce((e,t)=>e+(t.dynasty||0),0);
r.draftCapital=n.filter(e=>"PICK"===e.pos).reduce((e,t)=>e+sleeperValue(t),0);
r.direction=r.future>r.current+30?"Rebuilder":r.current>r.future+30?"Contender":"Balanced";
r.indicator=r.direction;
r.tradeAngles=buildTradeAngles(r,n);
return r
}
function buildTradeAngles(e,t){
const r=[];
if(e.strengths[0]&&e.needs[0])r.push(`Can shop ${e.strengths[0]} depth for ${e.needs[0]} help.`);
if("Contender"===e.direction)r.push("Win-now roster: target immediate starters over future depth.");
if("Rebuilder"===e.direction)r.push("Future-leaning roster: target picks and young ascending players.");
const n=t.filter(e=>"RB"===e.pos).slice(0,5);n.length>=4&&r.push("RB depth could be used to buy WR/QB stability.");
return r.slice(0,3)
}
function ordinal(e){const t=(e=Number(e)||0)%100;if(t>=11&&t<=13)return`${e}th`;switch(e%10){case 1:return`${e}st`;case 2:return`${e}nd`;case 3:return`${e}rd`;default:return`${e}th`}}
function renderLeagueDashboard(){
if(!syncedLeague||!syncedRosters.length)return;const e=syncedRosters.map(dashboardMetrics).filter(e=>e.matched>0);if(!e.length)return;
const t=getMyRosterId(),r=e.find(e=>e.rosterId===t)||e[0],n=e.slice().sort((e,t)=>t.total-e.total),a=n.findIndex(e=>e.rosterId===r.rosterId)+1;
$("league-dashboard-title").textContent=`TradeForge League Dashboard • ${syncedLeague.name||syncedProviderName()+" League"}`,
$("league-dashboard-summary").innerHTML=`\n<div class="league-summary-card"><span>Your Power Rank</span><strong>${ordinal(a)}</strong></div>\n<div class="league-summary-card"><span>Total Value</span><strong>${r.total.toFixed(1)}</strong></div>\n<div class="league-summary-card"><span>Team Direction</span><strong>${esc(r.direction)}</strong></div>\n<div class="league-summary-card"><span>Biggest Need</span><strong>${esc(r.needs[0]||"—")}</strong></div>\n`,
$("power-rankings").innerHTML=n.map((e,t)=>`\n<div class="league-rank-row ${e.rosterId===r.rosterId?"mine":""}"><span>${t+1}. ${esc(e.name)}<small>${esc(e.indicator)}</small></span><strong>${e.total.toFixed(1)}</strong></div>\n`).join(""),
$("team-analysis").innerHTML=e.map(e=>`\n<div class="league-team-card ${e.rosterId===r.rosterId?"mine":""}">\n<h4>${esc(e.name)}</h4>\n<div class="sub">${esc(e.direction)} • Starter value ${e.starters.toFixed(1)} • Depth ${e.depth.toFixed(1)}</div>\n<div class="position-grid">${["QB","RB","WR","TE"].map(t=>`<div><strong>${t}</strong><span>${(e.positions[t]?.value||0).toFixed(1)}</span><small>${e.positions[t]?.count||0} matched</small></div>`).join("")}</div>\n<ul>${e.tradeAngles.map(e=>`<li>${esc(e)}</li>`).join("")}</ul>\n</div>\n`).join(""),
$("league-opportunities").innerHTML=leagueOpportunities(e,r).map(e=>`\n<div class="suggestion">\n<strong>${esc(e.title)}</strong><br><br>${esc(e.detail)}\n</div>\n`).join("")||'<div class="sub">No obvious league-wide trade opportunities found yet.</div>',
setupLeagueTradeFinder(e),renderTradeOpportunities(e,r)
}
function leagueOpportunities(e,t){
const r=[];
e.filter(e=>e.rosterId!==t.rosterId).forEach(e=>{const n=t.needs[0],a=e.strengths[0];n&&a&&n===a&&r.push({title:`Talk to ${e.name}`,detail:`They are strongest at your biggest need (${n}). Look for a trade where you send from ${t.strengths[0]||"depth"} depth.`})});
return r.slice(0,4)
}
function leagueTradeFinderPlayerKey(e){return key(e)}
function getLeagueTradeFinderMineId(){return $("trade-finder-my-roster")?.value||getMyRosterId()}
function getLeagueTradeFinderOtherId(){return $("trade-finder-other-roster")?.value||""}
function getLeagueTradeFinderTarget(){const e=$("trade-finder-target")?.value||"";if(!e)return null;return rosterAssets(getLeagueTradeFinderOtherId()).find(t=>leagueTradeFinderPlayerKey(t)===e)||null}
function populateLeagueTradeFinderMine(e,t){
const r=$("trade-finder-my-roster");if(!r)return;
const n=r.value||e; r.innerHTML=t.map(e=>`<option value="${e.roster_id}">${esc(rosterName(e))}</option>`).join(""),r.value=t.some(e=>String(e.roster_id)===String(n))?n:e
}
function populateLeagueTradeFinderTargets(e,t=!1){
const r=$("trade-finder-target");if(!r)return;const n=r.value,a=rosterAssets(e).filter(e=>"PICK"!==e.pos).slice(0,40);
r.innerHTML=a.length?a.map(e=>`<option value="${esc(leagueTradeFinderPlayerKey(e))}">${esc(e.name)} • ${esc(e.pos)} • ${sleeperValue(e).toFixed(1)}</option>`).join(""):'<option value="">No valued players available</option>',
t&&a.some(e=>leagueTradeFinderPlayerKey(e)===n)&&(r.value=n)
}
function populateLeagueTradeFinderOthers(e,t){
const r=t.filter(t=>String(t.roster_id)!==String(e)),n=$("trade-finder-other-roster");if(!n)return;
n.innerHTML=r.length?r.map(e=>`<option value="${e.roster_id}">${esc(rosterName(e))}</option>`).join(""):'<option value="">No other teams available</option>';let a=n.value;
r.some(e=>String(e.roster_id)===String(a))||(a=r[0]?String(r[0].roster_id):""),a&&(n.value=a),populateLeagueTradeFinderTargets(a,!0)
}
function setupLeagueTradeFinder(e){
const t=$("trade-finder-results");if(!t)return;
const r=e.map(e=>e.roster),n=getMyRosterId();
populateLeagueTradeFinderMine(n,r),populateLeagueTradeFinderOthers(getLeagueTradeFinderMineId(),r);
const a=()=>{populateLeagueTradeFinderOthers(getLeagueTradeFinderMineId(),r),findLeagueTrades()};
$("trade-finder-my-roster").onchange=a,$("trade-finder-other-roster").onchange=()=>{populateLeagueTradeFinderTargets(getLeagueTradeFinderOtherId()),findLeagueTrades()},$("trade-finder-target").onchange=findLeagueTrades,$("trade-finder-run").onclick=findLeagueTrades;
findLeagueTrades()
}
function leagueTradeFinderGrade(e){return e<=5?"A+":e<=8?"A":e<=12?"B+":e<=18?"B":"C"}
function findLeagueTrades(){
const e=$("trade-finder-results");if(!e||!syncedLeague)return;
const t=getLeagueTradeFinderMineId(),r=getLeagueTradeFinderOtherId(),n=getLeagueTradeFinderTarget(),a=rosterAssets(t).filter(e=>"PICK"!==e.pos),s=rosterAssets(r);
leagueTradeFinderBuilds=[];
if(!t||!r||!n)return void(e.innerHTML='<div class="sub">Select both teams and a target player.</div>');
const o=new Set([key(n)]),l=s.filter(e=>!o.has(key(e)));
const i=a.slice(0,45).filter(e=>key(e)!==key(n));
const d=[],u=e=>{const t=withSleeperModes(()=>adjustedTradeValues(e,[l])),r=diff(t.a,t.b);d.push({packagePlayers:e,values:t,difference:r,grade:leagueTradeFinderGrade(r)})};
i.forEach(e=>u([e]));
for(let e=0;e<i.length;e++)for(let t=e+1;t<i.length;t++)u([i[e],i[t]]);
for(let e=0;e<Math.min(16,i.length);e++)for(let t=e+1;t<Math.min(16,i.length);t++)for(let r=t+1;r<Math.min(16,i.length);r++)u([i[e],i[t],i[r]]);
const c=d.filter(e=>e.values.a>=n?0:e.difference<=35).sort((e,t)=>e.difference-t.difference||e.packagePlayers.length-t.packagePlayers.length).slice(0,8);
if(!c.length)return void(e.innerHTML='<div class="sub">No reasonable packages found for this target.</div>');
leagueTradeFinderBuilds=c.map(e=>({...e,mineId:t,otherId:r,target:n}));
e.innerHTML=c.map((e,t)=>`\n<div class="suggestion league-trade-result">\n<strong>${e.grade} Match • ${e.difference.toFixed(1)}% difference</strong><br><br>\n<strong>You send:</strong> ${e.packagePlayers.map(e=>esc(e.name)).join(" + ")}<br>\n<strong>You receive:</strong> ${esc(n.name)}<br><br>\nValue: ${e.values.a.toFixed(1)} vs ${e.values.b.toFixed(1)}\n<br><br>\n<button class="secondary build-trade-btn" data-build-trade-index="${t}">Build Trade</button>\n</div>\n`).join(""),e.querySelectorAll("[data-build-trade-index]").forEach(e=>{e.addEventListener("click",()=>{buildLeagueFinderTrade(Number(e.dataset.buildTradeIndex))})})
}
function buildLeagueFinderTrade(e){
const t=leagueTradeFinderBuilds[e];if(!t||!syncedLeague)return;const r=rosterAssets(t.mineId),n=rosterAssets(t.otherId);
if(!t.packagePlayers.every(e=>r.some(t=>key(t)===key(e))))return alert("One or more package players are no longer on the selected roster.");
if(!n.some(e=>key(e)===key(t.target)))return alert("The target player is no longer on the selected roster.");
sleeperRosterA=String(t.mineId),sleeperRosterB=String(t.otherId),$("sleeper-roster-a").value=sleeperRosterA,$("sleeper-roster-b").value=sleeperRosterB,sleeperTeamA=t.packagePlayers.map(e=>({...e})),sleeperTeamB=[{...t.target}],renderSleeper(),setTradeCenterTab("calculator"),$("trade-center-card")?.scrollIntoView({behavior:"smooth",block:"start"})
}
function setTradeCenterTab(e){
["calculator","finder","opportunities"].includes(e)||("calculator"===e),["calculator","finder","opportunities"].forEach(t=>{$(`trade-tab-${t}`)?.classList.toggle("active",t===e),$(`trade-panel-${t}`)?.classList.toggle("active",t===e)})
}
function renderTradeOpportunities(e,t){
const r=$("trade-opportunities");if(!r)return;
const n=e.filter(e=>e.rosterId!==t.rosterId),a=[];
n.forEach(e=>{const r=t.needs[0],n=e.strengths[0];if(r&&n&&r===n){const s=rosterAssets(e.rosterId).filter(e=>e.pos===r).slice(0,2),o=rosterAssets(t.rosterId).filter(e=>e.pos===t.strengths[0]).slice(0,2);s[0]&&o[0]&&a.push({need:r,partner:e,target:s[0],send:o[0]})}});
r.innerHTML=a.length?a.slice(0,6).map(e=>`\n<div class="suggestion">\n<strong>${esc(e.partner.name)} fits your ${esc(e.need)} need</strong><br><br>\nPossible starting point: ${esc(e.send.name)} for ${esc(e.target.name)}.<br>\nUse League Trade Finder to refine the package.\n</div>\n`).join(""):'<div class="sub">No strong trade-opportunity matches found yet.</div>'
}
function buildLeaguePage(){if(!syncedLeague)return;updateSyncedProviderCopy(),renderLeagueDashboard(),renderLeagueRoster(sleeperRosterA,"my-team-roster","my-team-name","my-team-meta"),renderLeagueRoster(sleeperRosterB,"opponent-team-roster","opponent-team-name","opponent-team-meta")}
function updateOpponentOptions(){
if(!syncedLeague)return;const e=getMyRosterId(),t=syncedRosters.filter(t=>String(t.roster_id)!==String(e)),r=$("opponent-select")?.value;
$("opponent-select").innerHTML=t.map(e=>`\n<option value="${e.roster_id}">\n${esc(rosterName(e))}\n</option>\n`).join("");let n=r;
t.some(e=>String(e.roster_id)===String(n))||(n=t[0]?String(t[0].roster_id):""),n?($("opponent-select").value=n,renderLeagueRoster(n,"opponent-team-roster","opponent-team-name","opponent-team-meta")):($("opponent-team-name").textContent="No Other Team",$("opponent-team-meta").textContent="",$("opponent-team-roster").innerHTML=""),
sleeperRosterB=n||sleeperRosterB
}
function setPage(e){"league"!==e||syncedLeague||(e="analyzer"),$("analyzer-page").classList.toggle("page-hidden","analyzer"!==e),$("league-page").classList.toggle("page-hidden","league"!==e),$("league-view-button").style.display=syncedLeague?"inline-block":"none",$("league-view-button").textContent="league"===e?"Back to Analyzer":"League View","league"===e&&buildLeaguePage()}
function setupTradeCenterTabs(){["calculator","finder","opportunities"].forEach(e=>{$(`trade-tab-${e}`)?.addEventListener("click",()=>setTradeCenterTab(e))})}
async function fetchJson(e){const t=await fetch(e);if(!t.ok)throw new Error("Request failed: "+t.status);return t.json()}
async function refreshSleeperTrends(){try{const e=await fetchJson("https://api.sleeper.app/v1/players/nfl/trending/add?lookback_hours=168&limit=100"),t=await fetchJson("https://api.sleeper.app/v1/players/nfl/trending/drop?lookback_hours=168&limit=100");sleeperTrendMarket={},e.forEach(e=>{sleeperTrendMarket[e.player_id]=Math.min(TRADEFORGE_ENGINE.marketSignalGap,(e.count||0)/100)}),t.forEach(e=>{sleeperTrendMarket[e.player_id]=-Math.min(TRADEFORGE_ENGINE.marketSignalGap,(e.count||0)/100)}),render(),renderSleeper()}catch(e){console.warn("Sleeper trends unavailable",e)}}
async function syncSleeper(){
const e=$("username").value.trim();if(!e)return void($("status").textContent="Enter a Sleeper username.");
$("status").textContent="Finding Sleeper user...";
try{
const t=await fetchJson(`https://api.sleeper.app/v1/user/${encodeURIComponent(e)}`);if(!t?.user_id)throw new Error("Sleeper user not found.");sleeperUser=t;
const r=(new Date).getFullYear(),n=await fetchJson(`https://api.sleeper.app/v1/user/${t.user_id}/leagues/nfl/${r}`);if(!n.length)throw new Error("No Sleeper leagues found for this season.");
$("league-picker").innerHTML=n.map(e=>`\n<option value="${e.league_id}">\n${esc(e.name)}\n</option>\n`).join(""),$("league-wrap").style.display="block",$("status").textContent=`Found ${n.length} league${1===n.length?"":"s"}.`
}catch(e){$("status").textContent=e.message||"Unable to sync Sleeper."}
}
function mapSleeperIds(){sleeperIdByName={};Object.entries(sleeperPlayers||{}).forEach(([e,t])=>{const r=t.full_name||[t.first_name,t.last_name].filter(Boolean).join(" ");r&&(sleeperIdByName[norm(r)]=e)})}
function matchSleeper(e){
const t=sleeperPlayers[e];if(!t)return null;
const r=t.full_name||[t.first_name,t.last_name].filter(Boolean).join(" "),n=norm(r),a=playerDatabase.find(e=>norm(e.name)===n);
if(!a)return null;return{...a,sleeperId:e,nflTeam:t.team||"",liveData:t}
}
async function loadSleeperLeague(){
const e=$("league-picker").value;if(!e)return;
$("status").textContent="Loading league...";
try{
const [t,r,n]=await Promise.all([fetchJson(`https://api.sleeper.app/v1/league/${e}`),fetchJson(`https://api.sleeper.app/v1/league/${e}/rosters`),fetchJson(`https://api.sleeper.app/v1/league/${e}/users`)]);
syncedLeague=t,syncedRosters=r,syncedUsers=n,syncedProvider="sleeper",sleeperPlayers=Object.keys(sleeperPlayers).length?sleeperPlayers:await fetchJson("https://api.sleeper.app/v1/players/nfl"),mapSleeperIds();
const a=t.scoring_settings||{};sleeperScoringMode=(a.rec||0)>=1?"ppr":(a.rec||0)>=.5?"half":"standard",sleeperQbMode=(t.roster_positions||[]).includes("SUPER_FLEX")||(t.roster_positions||[]).filter(e=>"QB"===e).length>=2?"superflex":"oneqb",sleeperLeagueMode=t.settings?.type===2?"dynasty":"redraft";
const s=r.find(e=>String(e.owner_id)===String(sleeperUser.user_id))||r[0],o=r.find(e=>e.roster_id!==s.roster_id)||r[0];
sleeperRosterA=String(s.roster_id),sleeperRosterB=String(o.roster_id),$("sleeper-roster-a").innerHTML=r.map(e=>`\n<option value="${e.roster_id}">\n${esc(rosterName(e))}\n</option>\n`).join(""),$("sleeper-roster-b").innerHTML=$("sleeper-roster-a").innerHTML,$("sleeper-roster-a").value=sleeperRosterA,$("sleeper-roster-b").value=sleeperRosterB,$("status").textContent=`${t.name} synced ✓`,$("sync-button").textContent="Sleeper Synced ✓",$("league-view-button").disabled=!1,modal.classList.remove("show"),renderSleeper(),location.hash="league",setPage("league"), TRADEFORGE_ENGINE.useSleeperTrendingMarket&&refreshSleeperTrends()
}catch(e){$("status").textContent=e.message||"Unable to sync this Sleeper league."}
}
function showSleeperModal(){modal.classList.add("show")}
function showEspnModal(){espnModal.classList.add("show")}
function espnSlotToPos(e){return{0:"QB",2:"RB",4:"WR",6:"TE",16:"DST",17:"K",23:"FLEX"}[e]||""}
function espnNormalizePlayer(e){
const t=e.playerPoolEntry?.player||e.player||e,r=t.fullName||t.name||t.displayName||[t.firstName,t.lastName].filter(Boolean).join(" "),n=(t.defaultPositionId&&espnSlotToPos(t.defaultPositionId))||t.defaultPositionAbbreviation||t.position||"";
return{id:String(t.id||e.id||r),name:r,pos:n,team:t.proTeamAbbreviation||t.proTeamId||""}
}
function matchEspnPlayer(e){const t=norm(e.name),r=playerDatabase.find(e=>norm(e.name)===t);return r?{...r,espnId:e.id,nflTeam:e.team||"",liveData:e}:null}
async function syncEspnLeague(){
const e=$("espn-league-id").value.trim(),t=$("espn-season").value.trim()||String((new Date).getFullYear()),r=$("espn-swid").value.trim(),n=$("espn-s2").value.trim();
if(!e)return void($("espn-status").textContent="Enter an ESPN league ID.");
$("espn-status").textContent="Loading ESPN league...";
try{
const a=`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${encodeURIComponent(t)}/segments/0/leagues/${encodeURIComponent(e)}?view=mTeam&view=mRoster&view=mSettings`,s={};r&&n&&(s.headers={Cookie:`SWID=${r}; espn_s2=${n}`});
let o=await fetch(a,s);if(!o.ok&&(!r||!n))throw new Error("This ESPN league may be private. Add SWID and espn_s2 cookies.");
if(!o.ok)throw new Error("Unable to load ESPN league. Check league ID, season, and cookies.");
const l=await o.json();espnLeagueRaw=l,syncedProvider="espn",syncedLeague={league_id:e,name:l.settings?.name||"ESPN League",settings:l.settings||{}};
const i=(l.teams||[]).map(e=>({roster_id:String(e.id),owner_id:String(e.primaryOwner||e.id),metadata:{team_name:e.location&&e.nickname?`${e.location} ${e.nickname}`:e.name||`Team ${e.id}`},players:(e.roster?.entries||[]).map(e=>String(e.playerId||e.playerPoolEntry?.player?.id)).filter(Boolean),starters:(e.roster?.entries||[]).filter(e=>String(e.lineupSlotId)!=="20").map(e=>String(e.playerId||e.playerPoolEntry?.player?.id)).filter(Boolean),raw:e}));
syncedRosters=i,syncedUsers=(l.members||[]).map(e=>({user_id:String(e.id),display_name:e.displayName,metadata:{team_name:e.displayName}}));
sleeperPlayers={};(l.teams||[]).forEach(e=>(e.roster?.entries||[]).forEach(e=>{const t=espnNormalizePlayer(e);sleeperPlayers[t.id]={full_name:t.name,position:t.pos,team:t.team}}));
const d=l.settings?.scoringSettings?.scoringItems||[],u=d.find(e=>e.statId===53||/reception/i.test(e.statAbbrev||""))?.points||0;
sleeperScoringMode=u>=1?"ppr":u>=.5?"half":"standard";const c=l.settings?.rosterSettings?.lineupSlotCounts||{};sleeperQbMode=(c["23"]||0)>0||Number(c["0"]||0)>=2?"superflex":"oneqb",sleeperLeagueMode=(l.settings?.scheduleSettings?.matchupPeriodCount||14)>16?"dynasty":"redraft";
sleeperRosterA=String(i[0]?.roster_id||""),sleeperRosterB=String(i.find(e=>e.roster_id!==sleeperRosterA)?.roster_id||sleeperRosterA),$("sleeper-roster-a").innerHTML=i.map(e=>`<option value="${e.roster_id}">${esc(rosterName(e))}</option>`).join(""),$("sleeper-roster-b").innerHTML=$("sleeper-roster-a").innerHTML,$("sleeper-roster-a").value=sleeperRosterA,$("sleeper-roster-b").value=sleeperRosterB,$("espn-status").textContent=`${syncedLeague.name} synced ✓`,$("espn-sync-button").textContent="ESPN Synced ✓",$("league-view-button").disabled=!1, espnModal.classList.remove("show"),renderSleeper(),location.hash="league",setPage("league")
}catch(e){$("espn-status").textContent=e.message||"Unable to sync this ESPN league."}
}
function init(){
renderBoard(),setupSearch("A"),setupSearch("B"),setupSleeperSearch("A"),setupSleeperSearch("B"),setupTradeCenterTabs(),["scoring","league","qb","tep"].forEach(e=>$(e).onchange=applyControls),$("swap").onclick=()=>{[teamA,teamB]=[teamB,teamA],render()},$("clear").onclick=()=>{teamA=[],teamB=[],render()},$("sync-button").onclick=showSleeperModal,$("espn-sync-button").onclick=()=>{$("espn-season").value=$("espn-season").value||String((new Date).getFullYear()),$("espn-status").textContent="",espnModal.classList.add("show")};
$("sleeper-roster-a").onchange=e=>{sleeperRosterA=e.target.value,sleeperTeamA=[],leagueTradeFinderBuilds=[],renderSleeper(),buildLeaguePage()}; $("sleeper-roster-b").onchange=e=>{sleeperRosterB=e.target.value,sleeperTeamB=[],leagueTradeFinderBuilds=[],renderSleeper(),buildLeaguePage()};
$("disconnect").onclick=()=>{ syncedLeague=null,syncedRosters=[],syncedUsers=[],sleeperPlayers={},sleeperUser=null,syncedProvider="",espnLeagueRaw=null,sleeperRosterA="",sleeperRosterB="",sleeperTeamA=[],sleeperTeamB=[],leagueTradeFinderBuilds=[],$("sync-button").textContent="Sync Sleeper",$("espn-sync-button").textContent="Sync ESPN",$("league-view-button").disabled=!0,setPage("analyzer"),renderSleeper()};
$("sleeper-swap").onclick=()=>{[sleeperTeamA,sleeperTeamB]=[sleeperTeamB,sleeperTeamA],[sleeperRosterA,sleeperRosterB]=[sleeperRosterB,sleeperRosterA],syncedLeague&&($("sleeper-roster-a").value=sleeperRosterA,$("sleeper-roster-b").value=sleeperRosterB),renderSleeper()};
$("sleeper-clear").onclick=()=>{sleeperTeamA=[],sleeperTeamB=[],renderSleeper()};
$("league-view-button").onclick=()=>setPage($("league-page").classList.contains("page-hidden")?"league":"analyzer");
$("opponent-select").onchange=e=>{sleeperRosterB=e.target.value,renderLeagueRoster(sleeperRosterB,"opponent-team-roster","opponent-team-name","opponent-team-meta")};
$("sync-submit").onclick=syncSleeper,$("league-submit").onclick=loadSleeperLeague,$("espn-submit").onclick=syncEspnLeague,document.querySelectorAll("[data-close]").forEach(e=>e.onclick=()=>{modal.classList.remove("show"),espnModal.classList.remove("show")}),window.addEventListener("hashchange",()=>setPage(location.hash==="#league"?"league":"analyzer")),setPage(location.hash==="#league"?"league":"analyzer"),render()
}
function calculateAdjustedTeamValue(e){return adjusted(Array.isArray(e)?e:[],[])}
window.calculateAdjustedTeamValue=calculateAdjustedTeamValue;
window.tradeForgeEngineRefresh=()=>{try{render()}catch(e){console.warn("TradeForge main refresh failed",e)}try{renderSleeper()}catch(e){console.warn("TradeForge synced refresh failed",e)}};
document.addEventListener("DOMContentLoaded",init);
