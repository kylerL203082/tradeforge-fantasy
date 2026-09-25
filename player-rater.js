/*
TradeForge Player Rater
Single source of truth for base player values and draft-pick values.

Format for TRADEFORGE_PLAYER_ROWS:
[Position, Player Name, Redraft Value, Keeper Value, Dynasty Value]

Important:
- Keep injury discounts out of this file when possible.
- Use tradeforge-injury-engine.js for temporary injury/availability adjustments.
- This file intentionally exposes window.playerDatabase because the current app uses browser globals.
*/

window.TRADEFORGE_PLAYER_RATER_VERSION = "2026-09-25 Stable Baseline";
window.TRADEFORGE_PLAYER_RATER_NOTES = "Base player values only. Temporary injury adjustments should live in tradeforge-injury-engine.js.";

const TRADEFORGE_ALLOWED_POSITIONS = new Set(["QB","RB","WR","TE","K","DST"]);

const TRADEFORGE_PLAYER_ROWS = [
  ["RB","Jahmyr Gibbs",100,100,100],
  ["RB","Bijan Robinson",96.7,97.9,100],
  ["WR","Ja'Marr Chase",96.1,96.7,97.7],
  ["WR","Puka Nacua",87,83.4,76.8],
  ["WR","Jaxon Smith-Njigba",86.8,88,90.1],
  ["WR","Amon-Ra St. Brown",86.2,81.6,73],
  ["RB","Jonathan Taylor",80.9,72.3,56.4],
  ["RB","Christian McCaffrey",80.4,67.9,44.8],
  ["WR","CeeDee Lamb",78,72.3,61.7],
  ["WR","Justin Jefferson",77.8,72.8,63.4],
  ["RB","James Cook III",73.4,67.8,57.4],
  ["RB","Chase Brown",73,64.6,49],
  ["RB","Ashton Jeanty",70.5,68,63.5],
  ["RB","Kenneth Walker III",69,62.6,50.7],
  ["RB","De'Von Achane",66.4,63.8,58.9],
  ["RB","Saquon Barkley",66.3,58.4,43.6],
  ["RB","Omarion Hampton",65.6,64,61],
  ["TE","Brock Bowers",65.5,67.5,71.1],
  ["WR","Drake London",64.2,61,55.1],
  ["TE","Trey McBride",64,63.4,62.4],
  ["RB","Derrick Henry",63.5,51.5,29.1],
  ["WR","Nico Collins",62.4,57.3,47.9],
  ["WR","George Pickens",62,58.3,51.4],
  ["WR","Chris Olave",60.3,55.9,47.8],
  ["WR","Malik Nabers",57.7,59.6,63],
  ["WR","DeVonta Smith",57.3,53.3,45.8],
  ["QB","Josh Allen",57.1,59.1,62.7],
  ["WR","Zay Flowers",56.6,53,46.3],
  ["RB","Jeremiyah Love",54.9,57.5,62.2],
  ["WR","Rashee Rice",53.1,45.9,32.5],
  ["RB","Javonte Williams",52.7,45.7,32.8],
  ["RB","Breece Hall",51.6,49.7,46.1],
  ["WR","A.J. Brown",49.9,43.8,32.5],
  ["RB","Kyren Williams",49.5,43.4,32],
  ["WR","Ladd McConkey",49.3,48.3,46.4],
  ["WR","Tee Higgins",48.9,43.5,33.6],
  ["RB","Travis Etienne Jr.",48.7,41.1,27.1],
  ["WR","Garrett Wilson",48.2,47.5,46.1],
  ["WR","Emeka Egbuka",48.2,48.6,49.3],
  ["TE","Colston Loveland",48.1,49.4,51.7],
  ["WR","Tetairoa McMillan",48,48.4,49.1],
  ["QB","Lamar Jackson",47.6,47,45.9],
  ["RB","D'Andre Swift",44.5,38.8,28.2],
  ["RB","Cam Skattebo",43.6,39.2,31.1],
  ["WR","Jaylen Waddle",43.5,39.9,33.2],
  ["WR","Luther Burden III",42.2,43.4,45.7],
  ["WR","DJ Moore",41.2,35.2,24.2],
  ["TE","Tyler Warren",41,42.9,46.5],
  ["RB","Bucky Irving",40.7,37.2,30.7],
  ["RB","David Montgomery",40.3,33.6,21.3],
  ["RB","Quinshon Judkins",39.3,40.3,42.2],
  ["QB","Joe Burrow",37.9,39.6,42.7],
  ["WR","Christian Watson",37.8,34.3,27.9],
  ["WR","Davante Adams",37.5,30.5,17.4],
  ["WR","Jameson Williams",37.4,35.1,30.8],
  ["RB","Jadarian Price",37.3,39.6,43.9],
  ["QB","Caleb Williams",35.7,38.7,44.2],
  ["RB","Bhayshul Tuten",35.4,32.1,26],
  ["WR","Mike Evans",35.4,29.1,17.4],
  ["WR","Parker Washington",34.6,34.1,33.3],
  ["WR","Rome Odunze",34.6,34.3,33.8],
  ["QB","Drake Maye",34,38.6,47.2],
  ["QB","Jalen Hurts",33.9,32.5,29.8],
  ["WR","Terry McLaurin",33.6,27.8,16.9],
  ["QB","Jayden Daniels",33.4,34.9,37.8],
  ["TE","Tucker Kraft",33,33,33],
  ["WR","Carnell Tate",31.6,35.9,43.9],
  ["WR","Marvin Harrison Jr.",31.4,30,27.3],
  ["RB","TreVeyon Henderson",30.6,30.4,29.9],
  ["QB","Justin Herbert",30.1,31.9,35.3],
  ["RB","Rhamondre Stevenson",29,25.2,18.2],
  ["QB","Trevor Lawrence",28.4,30.6,34.6],
  ["RB","Josh Jacobs",28,23.2,14.2],
  ["TE","Sam LaPorta",27.8,27.5,26.9],
  ["QB","Dak Prescott",27.8,26.2,23.1],
  ["QB","Jaxson Dart",27.7,28.5,30],
  ["TE","George Kittle",27.6,23.6,16.3],
  ["WR","Brian Thomas Jr.",27.5,26.9,25.8],
  ["WR","Wan'Dale Robinson",27.5,23.6,16.5],
  ["RB","Jaylen Warren",27.4,23.5,16.4],
  ["TE","Kyle Pitts Sr.",27.1,26.1,24.1],
  ["TE","Isaiah Likely",26.6,24.2,19.8],
  ["WR","De'Zhaun Stribling",26.5,24.6,21],
  ["WR","Chris Godwin Jr.",26.3,22.6,15.6],
  ["WR","Jakobi Meyers",26.1,21.6,13.2],
  ["WR","DK Metcalf",25.9,22.9,17.2],
  ["TE","Harold Fannin Jr.",25.9,26.7,28.2],
  ["WR","Makai Lemon",25.5,26.4,28.1],
  ["WR","Alec Pierce",25.4,23.8,20.8],
  ["WR","Rashid Shaheed",25.1,20.6,12.1],
  ["QB","Bo Nix",25,26.2,28.3],
  ["WR","Jayden Reed",24.4,21.6,16.4],
  ["RB","Zach Charbonnet",24.3,21.4,16.1],
  ["WR","Quentin Johnston",24.2,21.9,17.7],
  ["WR","Matthew Golden",24.1,23.4,22],
  ["WR","Jordan Addison",23.9,22.4,19.7],
  ["WR","Romeo Doubs",23.8,20.2,13.6],
  ["TE","Dalton Kincaid",23.5,21.5,17.9],
  ["QB","Brock Purdy",23.5,25,27.8],
  ["TE","Jake Ferguson",23.4,20.2,14.4],
  ["WR","Josh Downs",23.1,21.2,17.7],
  ["RB","Jordan Mason",23.1,20,14.3],
  ["WR","Stefon Diggs",22.9,19.1,12.1],
  ["WR","Courtland Sutton",22.9,20,14.6],
  ["WR","KC Concepcion Jr.",22.9,24.6,27.9],
  ["QB","Patrick Mahomes",22.9,24.7,28],
  ["RB","Blake Corum",22.8,21.6,19.4],
  ["WR","Denzel Boston",22.3,21.1,19],
  ["WR","Jalen McMillan",21.8,18.9,13.5],
  ["RB","Jonathon Brooks",21.7,20.7,18.9],
  ["WR","Michael Pittman Jr.",21.7,19.7,16.1],
  ["WR","Xavier Worthy",21.6,19.3,14.9],
  ["RB","Chuba Hubbard",21.5,19.9,16.9],
  ["RB","RJ Harvey",21.5,19.9,16.9],
  ["WR","Jordyn Tyson",21.5,24.8,31],
  ["QB","Jordan Love",21.5,22.4,24.2],
  ["RB","Tony Pollard",20.7,17.8,12.3],
  ["QB","Jared Goff",20.6,20.1,19.3],
  ["RB","Kenny Gainwell",20.4,17.9,13.4],
  ["QB","Matthew Stafford",20.1,17.8,13.6],
  ["QB","Baker Mayfield",20.1,19.9,19.4],
  ["RB","Rico Dowdle",19.5,18,15.1],
  ["WR","Michael Wilson",18.5,19.7,21.9],
  ["RB","MarShawn Lloyd",18.3,17,14.6],
  ["TE","T.J. Hockenson",17.8,15.6,11.6],
  ["RB","Jacory Croskey-Merritt",17.6,17.3,16.8],
  ["TE","Dallas Goedert",17.2,15.7,12.8],
  ["RB","Rachaad White",17.1,15.3,11.9],
  ["RB","J.K. Dobbins",16.9,16.2,14.8],
  ["QB","C.J. Stroud",16.4,17.1,18.5],
  ["WR","Jalen Coker",15.9,17.2,19.6],
   /*
TradeForge Player Rater
Single source of truth for base player values and draft-pick values.

Format for TRADEFORGE_PLAYER_ROWS:
[Position, Player Name, Redraft Value, Keeper Value, Dynasty Value]

Important:
- Keep injury discounts out of this file when possible.
- Use tradeforge-injury-engine.js for temporary injury/availability adjustments.
- This file intentionally exposes window.playerDatabase because the current app uses browser globals.
*/

window.TRADEFORGE_PLAYER_RATER_VERSION = "2026-09-25 Stable Baseline";
window.TRADEFORGE_PLAYER_RATER_NOTES = "Base player values only. Temporary injury adjustments should live in tradeforge-injury-engine.js.";

const TRADEFORGE_ALLOWED_POSITIONS = new Set(["QB","RB","WR","TE","K","DST"]);

const TRADEFORGE_PLAYER_ROWS = [
  ["RB","Jahmyr Gibbs",100,100,100],
  ["RB","Bijan Robinson",96.7,97.9,100],
  ["WR","Ja'Marr Chase",96.1,96.7,97.7],
  ["WR","Puka Nacua",87,83.4,76.8],
  ["WR","Jaxon Smith-Njigba",86.8,88,90.1],
  ["WR","Amon-Ra St. Brown",86.2,81.6,73],
  ["RB","Jonathan Taylor",80.9,72.3,56.4],
  ["RB","Christian McCaffrey",80.4,67.9,44.8],
  ["WR","CeeDee Lamb",78,72.3,61.7],
  ["WR","Justin Jefferson",77.8,72.8,63.4],
  ["RB","James Cook III",73.4,67.8,57.4],
  ["RB","Chase Brown",73,64.6,49],
  ["RB","Ashton Jeanty",70.5,68,63.5],
  ["RB","Kenneth Walker III",69,62.6,50.7],
  ["RB","De'Von Achane",66.4,63.8,58.9],
  ["RB","Saquon Barkley",66.3,58.4,43.6],
  ["RB","Omarion Hampton",65.6,64,61],
  ["TE","Brock Bowers",65.5,67.5,71.1],
  ["WR","Drake London",64.2,61,55.1],
  ["TE","Trey McBride",64,63.4,62.4],
  ["RB","Derrick Henry",63.5,51.5,29.1],
  ["WR","Nico Collins",62.4,57.3,47.9],
  ["WR","George Pickens",62,58.3,51.4],
  ["WR","Chris Olave",60.3,55.9,47.8],
  ["WR","Malik Nabers",57.7,59.6,63],
  ["WR","DeVonta Smith",57.3,53.3,45.8],
  ["QB","Josh Allen",57.1,59.1,62.7],
  ["WR","Zay Flowers",56.6,53,46.3],
  ["RB","Jeremiyah Love",54.9,57.5,62.2],
  ["WR","Rashee Rice",53.1,45.9,32.5],
  ["RB","Javonte Williams",52.7,45.7,32.8],
  ["RB","Breece Hall",51.6,49.7,46.1],
  ["WR","A.J. Brown",49.9,43.8,32.5],
  ["RB","Kyren Williams",49.5,43.4,32],
  ["WR","Ladd McConkey",49.3,48.3,46.4],
  ["WR","Tee Higgins",48.9,43.5,33.6],
  ["RB","Travis Etienne Jr.",48.7,41.1,27.1],
  ["WR","Garrett Wilson",48.2,47.5,46.1],
  ["WR","Emeka Egbuka",48.2,48.6,49.3],
  ["TE","Colston Loveland",48.1,49.4,51.7],
  ["WR","Tetairoa McMillan",48,48.4,49.1],
  ["QB","Lamar Jackson",47.6,47,45.9],
  ["RB","D'Andre Swift",44.5,38.8,28.2],
  ["RB","Cam Skattebo",43.6,39.2,31.1],
  ["WR","Jaylen Waddle",43.5,39.9,33.2],
  ["WR","Luther Burden III",42.2,43.4,45.7],
  ["WR","DJ Moore",41.2,35.2,24.2],
  ["TE","Tyler Warren",41,42.9,46.5],
  ["RB","Bucky Irving",40.7,37.2,30.7],
  ["RB","David Montgomery",40.3,33.6,21.3],
  ["RB","Quinshon Judkins",39.3,40.3,42.2],
  ["QB","Joe Burrow",37.9,39.6,42.7],
  ["WR","Christian Watson",37.8,34.3,27.9],
  ["WR","Davante Adams",37.5,30.5,17.4],
  ["WR","Jameson Williams",37.4,35.1,30.8],
  ["RB","Jadarian Price",37.3,39.6,43.9],
  ["QB","Caleb Williams",35.7,38.7,44.2],
  ["RB","Bhayshul Tuten",35.4,32.1,26],
  ["WR","Mike Evans",35.4,29.1,17.4],
  ["WR","Parker Washington",34.6,34.1,33.3],
  ["WR","Rome Odunze",34.6,34.3,33.8],
  ["QB","Drake Maye",34,38.6,47.2],
  ["QB","Jalen Hurts",33.9,32.5,29.8],
  ["WR","Terry McLaurin",33.6,27.8,16.9],
  ["QB","Jayden Daniels",33.4,34.9,37.8],
  ["TE","Tucker Kraft",33,33,33],
  ["WR","Carnell Tate",31.6,35.9,43.9],
  ["WR","Marvin Harrison Jr.",31.4,30,27.3],
  ["RB","TreVeyon Henderson",30.6,30.4,29.9],
  ["QB","Justin Herbert",30.1,31.9,35.3],
  ["RB","Rhamondre Stevenson",29,25.2,18.2],
  ["QB","Trevor Lawrence",28.4,30.6,34.6],
  ["RB","Josh Jacobs",28,23.2,14.2],
  ["TE","Sam LaPorta",27.8,27.5,26.9],
  ["QB","Dak Prescott",27.8,26.2,23.1],
  ["QB","Jaxson Dart",27.7,28.5,30],
  ["TE","George Kittle",27.6,23.6,16.3],
  ["WR","Brian Thomas Jr.",27.5,26.9,25.8],
  ["WR","Wan'Dale Robinson",27.5,23.6,16.5],
  ["RB","Jaylen Warren",27.4,23.5,16.4],
  ["TE","Kyle Pitts Sr.",27.1,26.1,24.1],
  ["TE","Isaiah Likely",26.6,24.2,19.8],
  ["WR","De'Zhaun Stribling",26.5,24.6,21],
  ["WR","Chris Godwin Jr.",26.3,22.6,15.6],
  ["WR","Jakobi Meyers",26.1,21.6,13.2],
  ["WR","DK Metcalf",25.9,22.9,17.2],
  ["TE","Harold Fannin Jr.",25.9,26.7,28.2],
  ["WR","Makai Lemon",25.5,26.4,28.1],
  ["WR","Alec Pierce",25.4,23.8,20.8],
  ["WR","Rashid Shaheed",25.1,20.6,12.1],
  ["QB","Bo Nix",25,26.2,28.3],
  ["WR","Jayden Reed",24.4,21.6,16.4],
  ["RB","Zach Charbonnet",24.3,21.4,16.1],
  ["WR","Quentin Johnston",24.2,21.9,17.7],
  ["WR","Matthew Golden",24.1,23.4,22],
  ["WR","Jordan Addison",23.9,22.4,19.7],
  ["WR","Romeo Doubs",23.8,20.2,13.6],
  ["TE","Dalton Kincaid",23.5,21.5,17.9],
  ["QB","Brock Purdy",23.5,25,27.8],
  ["TE","Jake Ferguson",23.4,20.2,14.4],
  ["WR","Josh Downs",23.1,21.2,17.7],
  ["RB","Jordan Mason",23.1,20,14.3],
  ["WR","Stefon Diggs",22.9,19.1,12.1],
  ["WR","Courtland Sutton",22.9,20,14.6],
  ["WR","KC Concepcion Jr.",22.9,24.6,27.9],
  ["QB","Patrick Mahomes",22.9,24.7,28],
  ["RB","Blake Corum",22.8,21.6,19.4],
  ["WR","Denzel Boston",22.3,21.1,19],
  ["WR","Jalen McMillan",21.8,18.9,13.5],
  ["RB","Jonathon Brooks",21.7,20.7,18.9],
  ["WR","Michael Pittman Jr.",21.7,19.7,16.1],
  ["WR","Xavier Worthy",21.6,19.3,14.9],
  ["RB","Chuba Hubbard",21.5,19.9,16.9],
  ["RB","RJ Harvey",21.5,19.9,16.9],
  ["WR","Jordyn Tyson",21.5,24.8,31],
  ["QB","Jordan Love",21.5,22.4,24.2],
  ["RB","Tony Pollard",20.7,17.8,12.3],
  ["QB","Jared Goff",20.6,20.1,19.3],
  ["RB","Kenny Gainwell",20.4,17.9,13.4],
  ["QB","Matthew Stafford",20.1,17.8,13.6],
  ["QB","Baker Mayfield",20.1,19.9,19.4],
  ["RB","Rico Dowdle",19.5,18,15.1],
  ["WR","Michael Wilson",18.5,19.7,21.9],
  ["RB","MarShawn Lloyd",18.3,17,14.6],
  ["TE","T.J. Hockenson",17.8,15.6,11.6],
  ["RB","Jacory Croskey-Merritt",17.6,17.3,16.8],
  ["TE","Dallas Goedert",17.2,15.7,12.8],
  ["RB","Rachaad White",17.1,15.3,11.9],
  ["RB","J.K. Dobbins",16.9,16.2,14.8],
  ["QB","C.J. Stroud",16.4,17.1,18.5],
  ["WR","Jalen Coker",15.9,17.2,19.6],
     ["QB","Tua Tagovailoa",3.9,4.4,5.4],
  ["TE","Noah Fant",3.9,3.9,3.4],
  ["DST","Kansas City Chiefs DST",3.8,3.2,2.1],
  ["TE","Darnell Washington",3.8,5.1,7.4],
  ["QB","Spencer Rattler",3.7,4.4,6.2],
  ["WR","Isaac TeSlaa",3.6,5.9,10.3],
  ["QB","Dillon Gabriel",3.6,5,8.1],
  ["WR","Rashod Bateman",3.5,5,7.8],
  ["WR","Zachariah Branch",3.5,6.5,12],
  ["K","Harrison Mevis",3.5,2.9,1.9],
  ["QB","J.J. McCarthy",3.5,4.9,6.6],
  ["WR","Chris Brazzell II",3.5,5.5,7.9],
  ["QB","Quinn Ewers",3.5,5.4,9],
  ["TE","Cade Stover",3.5,5.9,9.7],
  ["WR","Antonio Williams",3.4,6.8,13.2],
  ["WR","Darnell Mooney",3.4,4.4,6.3],
  ["RB","Donovan Edwards",3.4,5.6,8.7],
  ["WR","Savion Williams",3.4,6.3,10.9],
  ["WR","Cooper Kupp",3.3,4.1,5.7],
  ["QB","Will Levis",3.3,3.8,4.8],
  ["RB","Emanuel Wilson",3.2,3.9,5.2],
  ["K","Tyler Loop",3.2,2.7,1.8],
  ["WR","Brandon Aiyuk",3.2,1.9,0.3],
  ["QB","Tanner McKee",3.2,4.8,7.8],
  ["TE","Cade Otton",3.1,5,8.5],
  ["RB","Devin Neal",3.1,2.3,1.3],
  ["RB","Emari Demercado",3.1,3.2,3.1],
  ["K","Cairo Santos",3,2.5,1.7],
  ["RB","Phil Mafah",3,4.8,7.1],
  ["WR","Jalen Royals",3,5.8,9.9],
  ["TE","Greg Dulcich",2.9,5,8.8],
  ["TE","Darren Waller",2.9,3.1,3.6],
  ["RB","Jawhar Jordan",2.9,4,5.8],
  ["WR","Tai Felton",2.9,5.4,9.2],
  ["RB","Jaylen Wright",2.8,5,9],
  ["QB","Justin Fields",2.8,2.7,2.6],
  ["RB","Dameon Pierce",2.8,2.7,2.5],
  ["WR","Dyami Brown",2.8,3.6,4.8],
  ["RB","Kendre Miller",2.7,4.1,6.6],
  ["RB","LeQuint Allen Jr.",2.7,4.5,7.7],
  ["TE","Max Klare",2.7,4.9,7.6],
  ["RB","Jaydon Blue",2.7,1.9,0.9],
  ["RB","Corey Kiner",2.7,4.3,6.6],
  ["QB","Jameis Winston",2.7,2.6,2.2],
  ["WR","Jaylin Lane",2.7,5,8.7],
  ["RB","Isaiah Davis",2.6,4.1,6.8],
  ["TE","Pat Freiermuth",2.6,5,9.5],
  ["WR","Devontez Walker",2.6,4.7,7.8],
  ["RB","Tyler Badie",2.5,3.1,4.2],
  ["WR","Treylon Burks",2.5,3.9,5.8],
  ["WR","Germie Bernard",2.4,6.1,13.1],
  ["WR","Jahan Dotson",2.4,3.8,6.4],
  ["TE","Tyler Conklin",2.4,2.5,2.3],
  ["WR","Demarcus Robinson",2.4,2,1.4],
  ["WR","Bryce Lance",2.3,4.1,7.4],
  ["WR","Jack Bech",2.3,4.9,9.7],
  ["WR","Tez Johnson",2.3,4.1,6.3],
  ["QB","Trey Lance",2.3,3.3,5.2],
  ["WR","Tyquan Thornton",2.2,3.6,6.1],
  ["WR","Joshua Palmer",2.2,3.7,6.4],
  ["WR","DeMario Douglas",2.2,4.1,7.6],
  ["TE","Mike Gesicki",2.2,1.7,1],
  ["RB","Dylan Laube",2.2,3.2,5],
  ["QB","Davis Mills",2.2,3.1,4.7],
  ["WR","Theo Wease Jr.",2.2,4.4,7.4],
  ["WR","Keon Coleman",2.1,4.6,9.3],
  ["WR","Malik Benson",2.1,4,7.6],
  ["WR","Calvin Austin III",2.1,1.4,0.6],
  ["TE","Jake Tonges",2.1,3.5,5.3],
  ["WR","Isaiah Williams",2.1,3.4,5.5],
  ["WR","Xavier Legette",2,3.5,6.3],
  ["RB","Ronnie Rivers",2,2.2,2.5],
  ["WR","Colbie Young",1.9,3.5,6.1],
  ["WR","Kalif Raymond",1.8,1.4,0.9],
  ["WR","Darius Slayton",1.7,2.8,4.8],
  ["WR","Kyle Williams",1.7,4.4,9.3],
  ["TE","Michael Mayer",1.6,5.1,11.6],
  ["TE","Gunnar Helm",1.6,4.5,9.9],
  ["TE","Elijah Arroyo",1.6,4.3,9.2],
  ["WR","KaVontae Turpin",1.5,1.9,2.6],
  ["TE","Evan Engram",1.5,3,5.7],
  ["TE","Charlie Kolar",1.5,2.7,5],
  ["QB","Shedeur Sanders",1.4,3.2,6.6],
  ["QB","Deshaun Watson",1.4,2.9,5.6],
  ["RB","Kareem Hunt",1.3,1.1,0.7],
  ["RB","Ollie Gordon II",1.3,3.6,7.9],
  ["QB","Tyrod Taylor",1.3,1.1,0.7],
  ["RB","Ty Johnson",1.2,2.1,3.7],
  ["RB","Brashard Smith",1.2,3,6.3],
  ["RB","Jacob Saylors",1.2,2.4,4.7],
  ["RB","Sione Vaki",1.2,1.7,2.7],
  ["RB","Devin Singletary",1.1,1.8,3.1],
  ["RB","Adam Randall",1.1,3.6,8.3],
  ["QB","Carson Beck",1.1,3.6,8.2],
  ["WR","Tory Horton",1.1,4.1,9.6],
  ["QB","Joe Flacco",1.1,0.8,0.4],
  ["WR","Kendrick Bourne",1,1.9,3.5],
  ["WR","Andrei Iosivas",1,2.5,5.2],
  ["WR","Zavion Thomas",1,3.9,9.3],
  ["WR","Troy Franklin",1,4,9.5],
  ["WR","Xavier Hutchinson",0.9,3.2,7.6],
  ["WR","Tank Dell",0.9,4,9.8],
  ["WR","Skyler Bell",0.9,3.9,9.4],
  ["WR","Brenen Thompson",0.9,2.9,6.6],
  ["WR","Barion Brown",0.8,3.4,8],
  ["WR","Elic Ayomanor",0.8,3.6,8.9],
  ["WR","Roman Wilson",0.8,2.8,6.4],
  ["RB","Roschon Johnson",0.8,2.6,5.9],
  ["WR","Marvin Mims Jr.",0.8,3.2,7.8],
  ["QB","Garrett Nussmeier",0.8,1.2,1.6],
  ["TE","Oscar Delp",0.8,3.6,7],
  ["RB","Tahj Brooks",0.7,2.2,5.1],
  ["WR","Ashton Dulin",0.7,0.7,0.6],
  ["WR","Odell Beckham Jr.",0.7,0.6,0.3],
  ["TE","Oronde Gadsden II",0.7,5,13.1],
  ["TE","Colby Parkinson",0.7,3,7.4],
  ["QB","Drew Allar",0.7,4.8,9.8],
  ["TE","Tyler Higbee",0.7,0.8,0.8],
  ["TE","Erick All Jr.",0.6,2,4.7],
  ["RB","Rasheen Ali",0.6,1.5,3.2],
  ["RB","DJ Giddens",0.6,2.7,6.6],
  ["RB","Bam Knight",0.6,1.2,2.4],
  ["QB","Anthony Richardson",0.6,3,5.9],
  ["QB","Mac Jones",0.5,4.4,9.1],
  ["QB","Carson Wentz",0.5,0.3,0.1],
  ["QB","Cade Klubnik",0.4,3.2,6.6],
     ["QB","Gardner Minshew",0.3,0.3,0.4],
  ["QB","Taylen Green",0.3,1.6,3.1],
  ["RB","J'Mari Taylor",0.3,0.4,0.6],
  ["QB","Drew Lock",0.2,1.6,3.2],
  ["TE","Ben Sinnott",0.2,0.9,1.8],
  ["RB","Zavier Scott",0.2,0.2,0.2],
  ["QB","Cooper Rush",0.2,0.2,0.1],
  ["WR","Chimere Dike",0.2,3.1,6.6],
  ["WR","Brandin Cooks",0.1,0.1,0.1],
  ["WR","Mack Hollins",0.1,0.3,0.5]
];

function tradeForgeIsValidNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function validateTradeForgePlayerRows(rows) {
  const errors = [];
  const warnings = [];
  const seenNames = new Set();

  if (!Array.isArray(rows)) {
    errors.push("TRADEFORGE_PLAYER_ROWS must be an array.");
    console.error("TradeForge Player Rater validation failed:", errors);
    return { ok:false, errors, warnings };
  }

  rows.forEach((row,index) => {
    const rowNumber = index + 1;

    if (!Array.isArray(row) || row.length !== 5) {
      errors.push(`Row ${rowNumber} must be [pos,name,redraft,keeper,dynasty].`);
      return;
    }

    const [pos,name,redraft,keeper,dynasty] = row;

    if (!TRADEFORGE_ALLOWED_POSITIONS.has(pos)) {
      errors.push(`Row ${rowNumber} has invalid position: ${pos}.`);
    }

    if (typeof name !== "string" || !name.trim()) {
      errors.push(`Row ${rowNumber} is missing a valid player name.`);
    } else {
      const cleanName = name.trim().toLowerCase();
      if (seenNames.has(cleanName)) {
        warnings.push(`Duplicate player name detected: ${name}.`);
      }
      seenNames.add(cleanName);
    }

    [["redraft",redraft],["keeper",keeper],["dynasty",dynasty]].forEach(([label,value]) => {
      if (!tradeForgeIsValidNumber(value)) {
        errors.push(`Row ${rowNumber} ${name || "Unknown"} has invalid ${label} value: ${value}.`);
      } else if (value < 0 || value > 100) {
        warnings.push(`Row ${rowNumber} ${name} has unusual ${label} value: ${value}.`);
      }
    });
  });

  if (errors.length) {
    console.error("TradeForge Player Rater validation failed:", errors);
  }

  if (warnings.length) {
    console.warn("TradeForge Player Rater validation warnings:", warnings);
  }

  if (!errors.length) {
    console.log(`TradeForge Player Rater loaded: ${rows.length} players • ${window.TRADEFORGE_PLAYER_RATER_VERSION}`);
  }

  return { ok:errors.length === 0, errors, warnings };
}

function buildTradeForgePlayerDatabase(rows) {
  return rows.map((row,index) => ({
    rank:index + 1,
    pos:row[0],
    name:row[1],
    redraft:row[2],
    keeper:row[3],
    dynasty:row[4]
  }));
}

window.tradeForgePlayerRows = TRADEFORGE_PLAYER_ROWS;
window.validateTradeForgePlayerRows = validateTradeForgePlayerRows;
window.tradeForgePlayerRaterValidation = validateTradeForgePlayerRows(TRADEFORGE_PLAYER_ROWS);
window.playerDatabase = buildTradeForgePlayerDatabase(TRADEFORGE_PLAYER_ROWS);

const TRADEFORGE_PICK_ROWS = [
  ["2027 Early 1st",52,58],
  ["2027 Mid 1st",44,50],
  ["2027 Late 1st",36,42],
  ["2027 Early 2nd",26,29],
  ["2027 Mid 2nd",22,25],
  ["2027 Late 2nd",18,21],
  ["2027 Early 3rd",13,15],
  ["2027 Mid 3rd",10,12],
  ["2027 Late 3rd",7,9],
  ["2028 Early 1st",47,53],
  ["2028 Mid 1st",40,46],
  ["2028 Late 1st",33,39],
  ["2028 Early 2nd",23,26],
  ["2028 Mid 2nd",19,22],
  ["2028 Late 2nd",15,18],
  ["2028 Early 3rd",11,13],
  ["2028 Mid 3rd",8,10],
  ["2028 Late 3rd",5,7]
];

function validateTradeForgePickRows(rows) {
  const errors = [];

  rows.forEach((row,index) => {
    const rowNumber = index + 1;

    if (!Array.isArray(row) || row.length !== 3) {
      errors.push(`Pick row ${rowNumber} must be [name,oneqb,superflex].`);
      return;
    }

    const [name,oneqb,superflex] = row;

    if (typeof name !== "string" || !name.trim()) {
      errors.push(`Pick row ${rowNumber} is missing a valid pick name.`);
    }

    if (!tradeForgeIsValidNumber(oneqb) || !tradeForgeIsValidNumber(superflex)) {
      errors.push(`Pick row ${rowNumber} has invalid values.`);
    }
  });

  if (errors.length) {
    console.error("TradeForge draft-pick validation failed:", errors);
  } else {
    console.log(`TradeForge draft picks loaded: ${rows.length} picks`);
  }

  return { ok:errors.length === 0, errors };
}

window.tradeForgePickRows = TRADEFORGE_PICK_ROWS;
window.tradeForgePickValidation = validateTradeForgePickRows(TRADEFORGE_PICK_ROWS);
window.picks = TRADEFORGE_PICK_ROWS.map((row,index) => ({
  rank:1001 + index,
  name:row[0],
  pos:"PICK",
  oneqb:row[1],
  superflex:row[2]
}));

window.dst = {
  HOU:"Houston Texans DST",
  DEN:"Denver Broncos DST",
  SEA:"Seattle Seahawks DST",
  LAR:"Los Angeles Rams DST",
  PIT:"Pittsburgh Steelers DST",
  LAC:"Los Angeles Chargers DST",
  NE:"New England Patriots DST",
  MIN:"Minnesota Vikings DST",
  PHI:"Philadelphia Eagles DST",
  GB:"Green Bay Packers DST",
  BAL:"Baltimore Ravens DST",
  JAC:"Jacksonville Jaguars DST",
  KC:"Kansas City Chiefs DST"
};
