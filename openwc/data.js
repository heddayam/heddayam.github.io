/* ============================================================
   World Cup 2026 Tracker — data
   Extracted from the live tournament feed (group results,
   Monte-Carlo forecast, third-place advancement model).
   Last data snapshot: 2026-06-25
   ============================================================ */

window.WC = (function () {
  // Each team: s=short, code=flag iso (gb-eng / gb-sct special), group, slug,
  // pp=possible finishing places, mk=make round of 32 prob,
  // p1/p2/p3q/p3e/p4 = finish 1st / 2nd / 3rd-and-advance / 3rd-and-out / 4th,
  // r16/qf/sf/fi/ch = reach R16 / QF / SF / Final / champion.
  const TEAMS = [
    // Group A
    { s:"MEX", name:"Mexico", code:"mx", group:"A", slug:"mexico", pp:[1], mk:1, p1:1, r16:.57832, qf:.212, sf:.07053, fi:.02062, ch:.00507 },
    { s:"RSA", name:"South Africa", code:"za", group:"A", slug:"south-africa", pp:[2], mk:1, p2:1, r16:.31137, qf:.06702, sf:.00774, fi:.00107, ch:.00009 },
    { s:"KOR", name:"South Korea", code:"kr", group:"A", slug:"south-korea", pp:[3], mk:.93981, p3q:.93981, p3e:.06019, r16:.45135, qf:.18469, sf:.04028, fi:.01006, ch:.00203 },
    { s:"CZE", name:"Czech Republic", code:"cz", group:"A", slug:"czech-republic", pp:[4], mk:0, p4:1 },
    // Group B
    { s:"SUI", name:"Switzerland", code:"ch", group:"B", slug:"switzerland", pp:[1], mk:1, p1:1, r16:.54121, qf:.19833, sf:.05976, fi:.0195, ch:.00489 },
    { s:"CAN", name:"Canada", code:"ca", group:"B", slug:"canada", pp:[2], mk:1, p2:1, r16:.68863, qf:.25422, sf:.05646, fi:.01478, ch:.00348 },
    { s:"BOS", name:"Bosnia and Herzegovina", code:"ba", group:"B", slug:"bosnia-and-herzegovina", pp:[3], mk:1, p3q:1, r16:.30338, qf:.12825, sf:.02369, fi:.00509, ch:.00108 },
    { s:"QAT", name:"Qatar", code:"qa", group:"B", slug:"qatar", pp:[4], mk:0, p4:1 },
    // Group C
    { s:"BRA", name:"Brazil", code:"br", group:"C", slug:"brazil", pp:[1], mk:1, p1:1, r16:.63954, qf:.38946, sf:.21595, fi:.11217, ch:.05048 },
    { s:"MAR", name:"Morocco", code:"ma", group:"C", slug:"morocco", pp:[2], mk:1, p2:1, r16:.39165, qf:.24054, sf:.06538, fi:.02062, ch:.00607 },
    { s:"SCO", name:"Scotland", code:"gb-sct", group:"C", slug:"scotland", pp:[3], mk:.37453, p3q:.37453, p3e:.62547, r16:.14351, qf:.04043, sf:.01363, fi:.00405, ch:.00096 },
    { s:"HAI", name:"Haiti", code:"ht", group:"C", slug:"haiti", pp:[4], mk:0, p4:1 },
    // Group D
    { s:"USA", name:"United States", code:"us", group:"D", slug:"united-states", pp:[1], mk:1, p1:1, r16:.69635, qf:.42741, sf:.13575, fi:.04834, ch:.0163 },
    { s:"AUS", name:"Australia", code:"au", group:"D", slug:"australia", pp:[2,3], mk:.90895, p2:.54384, p3q:.36511, p3e:.09105, r16:.23764, qf:.03806, sf:.0114, fi:.00211, ch:.0002 },
    { s:"PAR", name:"Paraguay", code:"py", group:"D", slug:"paraguay", pp:[2,3], mk:.85379, p2:.45616, p3q:.39763, p3e:.14621, r16:.28588, qf:.0631, sf:.02337, fi:.00609, ch:.00123 },
    { s:"TUR", name:"Turkey", code:"tr", group:"D", slug:"turkey", pp:[4], mk:0, p4:1 },
    // Group E
    { s:"GER", name:"Germany", code:"de", group:"E", slug:"germany", pp:[1], mk:1, p1:1, r16:.75961, qf:.3133, sf:.20522, fi:.09687, ch:.04465 },
    { s:"CIV", name:"Ivory Coast", code:"ci", group:"E", slug:"ivory-coast", pp:[2,3,4], mk:.95259, p2:.86017, p3q:.09242, p3e:.01742, p4:.02999, r16:.37513, qf:.13378, sf:.04948, fi:.01583, ch:.00431 },
    { s:"ECU", name:"Ecuador", code:"ec", group:"E", slug:"ecuador", pp:[2,3,4], mk:.21509, p2:.02999, p3q:.1851, p3e:.56164, p4:.22327, r16:.08159, qf:.02598, sf:.00801, fi:.00237, ch:.0005 },
    { s:"CUW", name:"Curacao", code:"cw", group:"E", slug:"curacao", pp:[2,3,4], mk:.13983, p2:.10984, p3q:.02999, p3e:.11343, p4:.74674, r16:.02069, qf:.00257, sf:.00037, fi:.00009, ch:0 },
    // Group F
    { s:"NED", name:"Netherlands", code:"nl", group:"F", slug:"netherlands", pp:[1,2,3], mk:1, p1:.62192, p2:.36655, p3q:.01153, r16:.58126, qf:.40962, sf:.17761, fi:.08151, ch:.035 },
    { s:"JPN", name:"Japan", code:"jp", group:"F", slug:"japan", pp:[1,2,3], mk:1, p1:.29969, p2:.43646, p3q:.26385, r16:.39083, qf:.20465, sf:.07423, fi:.0255, ch:.00794 },
    { s:"SWE", name:"Sweden", code:"se", group:"F", slug:"sweden", pp:[1,2,3], mk:.93837, p1:.07839, p2:.19699, p3q:.66299, p3e:.06163, r16:.20793, qf:.06936, sf:.02102, fi:.00527, ch:.00102 },
    { s:"TUN", name:"Tunisia", code:"tn", group:"F", slug:"tunisia", pp:[4], mk:0, p4:1 },
    // Group G
    { s:"EGY", name:"Egypt", code:"eg", group:"G", slug:"egypt", pp:[1,2,3], mk:1, p1:.60481, p2:.16229, p3q:.2329, r16:.42078, qf:.13549, sf:.02813, fi:.00629, ch:.00138 },
    { s:"BEL", name:"Belgium", code:"be", group:"G", slug:"belgium", pp:[1,2,3,4], mk:.90236, p1:.2179, p2:.6015, p3q:.08296, p3e:.01827, p4:.07937, r16:.66769, qf:.33454, sf:.17753, fi:.08589, ch:.03749 },
    { s:"IRN", name:"Iran", code:"ir", group:"G", slug:"iran", pp:[1,2,3,4], mk:.56861, p1:.17729, p2:.1698, p3q:.22152, p3e:.38262, p4:.04877, r16:.19273, qf:.04387, sf:.00827, fi:.00151, ch:.00025 },
    { s:"NZL", name:"New Zealand", code:"nz", group:"G", slug:"new-zealand", pp:[2,3,4], mk:.09747, p2:.06641, p3q:.03106, p3e:.03067, p4:.87186, r16:.03135, qf:.00403, sf:.00078, fi:.00014, ch:0 },
    // Group H
    { s:"ESP", name:"Spain", code:"es", group:"H", slug:"spain", pp:[1,2,3], mk:1, p1:.83967, p2:.09956, p3q:.06077, r16:.81104, qf:.57972, sf:.46898, fi:.30237, ch:.19445 },
    { s:"CPV", name:"Cape Verde", code:"cv", group:"H", slug:"cape-verde", pp:[1,2,3,4], mk:.65598, p1:.02187, p2:.54855, p3q:.08556, p3e:.13611, p4:.20791, r16:.07108, qf:.01631, sf:.00302, fi:.00031, ch:.00002 },
    { s:"URU", name:"Uruguay", code:"uy", group:"H", slug:"uruguay", pp:[1,2,3,4], mk:.31874, p1:.13846, p2:.0615, p3q:.11878, p3e:.52407, p4:.15719, r16:.15111, qf:.06546, sf:.03244, fi:.01138, ch:.0034 },
    { s:"KSA", name:"Saudi Arabia", code:"sa", group:"H", slug:"saudi-arabia", pp:[2,3,4], mk:.34407, p2:.29039, p3q:.05368, p3e:.02103, p4:.6349, r16:.03208, qf:.00727, sf:.00127, fi:.00018, ch:.00001 },
    // Group I
    { s:"FRA", name:"France", code:"fr", group:"I", slug:"france", pp:[1,2], mk:1, p1:.82942, p2:.17058, r16:.85584, qf:.62131, sf:.49103, fi:.32047, ch:.2099 },
    { s:"NOR", name:"Norway", code:"no", group:"I", slug:"norway", pp:[1,2], mk:1, p1:.17058, p2:.82942, r16:.60567, qf:.26095, sf:.12069, fi:.04603, ch:.01491 },
    { s:"SEN", name:"Senegal", code:"sn", group:"I", slug:"senegal", pp:[3,4], mk:.64321, p3q:.64321, p3e:.22498, p4:.13181, r16:.27686, qf:.13972, sf:.05635, fi:.02193, ch:.00721 },
    { s:"IRQ", name:"Iraq", code:"iq", group:"I", slug:"iraq", pp:[3,4], mk:.02682, p3q:.02682, p3e:.10499, p4:.86819, r16:.00343, qf:.00065, sf:.00012, fi:.00001, ch:0 },
    // Group J
    { s:"ARG", name:"Argentina", code:"ar", group:"J", slug:"argentina", pp:[1], mk:1, p1:1, r16:.85091, qf:.62173, sf:.41465, fi:.24229, ch:.12212 },
    { s:"AUT", name:"Austria", code:"at", group:"J", slug:"austria", pp:[2,3], mk:.95029, p2:.66593, p3q:.28436, p3e:.04971, r16:.2859, qf:.10764, sf:.04338, fi:.01322, ch:.00366 },
    { s:"ALG", name:"Algeria", code:"dz", group:"J", slug:"algeria", pp:[2,3], mk:.7571, p2:.33407, p3q:.42303, p3e:.2429, r16:.2409, qf:.07955, sf:.02489, fi:.00687, ch:.00136 },
    { s:"JOR", name:"Jordan", code:"jo", group:"J", slug:"jordan", pp:[4], mk:0, p4:1 },
    // Group K
    { s:"COL", name:"Colombia", code:"co", group:"K", slug:"colombia", pp:[1,2], mk:1, p1:.45063, p2:.54937, r16:.58494, qf:.27325, sf:.125, fi:.04878, ch:.01606 },
    { s:"POR", name:"Portugal", code:"pt", group:"K", slug:"portugal", pp:[1,2,3], mk:1, p1:.54937, p2:.44729, p3q:.00334, r16:.73447, qf:.4751, sf:.28794, fi:.15994, ch:.0822 },
    { s:"DRC", name:"DR Congo", code:"cd", group:"K", slug:"democratic-republic-of-the-congo", pp:[2,3,4], mk:.42998, p2:.00334, p3q:.42664, p3e:.2593, p4:.31072, r16:.07776, qf:.02498, sf:.00618, fi:.00117, ch:.0002 },
    { s:"UZB", name:"Uzbekistan", code:"uz", group:"K", slug:"uzbekistan", pp:[3,4], mk:.03001, p3q:.03001, p3e:.28071, p4:.68928, r16:.00406, qf:.00096, sf:.00013, fi:.00004, ch:0 },
    // Group L
    { s:"ENG", name:"England", code:"gb-eng", group:"L", slug:"england", pp:[1,2,3], mk:1, p1:.84584, p2:.15335, p3q:.00081, r16:.76409, qf:.54079, sf:.34727, fi:.20335, ch:.10875 },
    { s:"GHA", name:"Ghana", code:"gh", group:"L", slug:"ghana", pp:[1,2,3], mk:.99999, p1:.05639, p2:.3742, p3q:.5694, p3e:.00001, r16:.24603, qf:.07823, sf:.0191, fi:.00414, ch:.00073 },
    { s:"CRO", name:"Croatia", code:"hr", group:"L", slug:"croatia", pp:[1,2,3], mk:.95241, p1:.09777, p2:.47245, p3q:.38219, p3e:.04759, r16:.40541, qf:.18568, sf:.08297, fi:.03175, ch:.0106 },
    { s:"PAN", name:"Panama", code:"pa", group:"L", slug:"panama", pp:[4], mk:0, p4:1 }
  ];

  // Group-stage matches. [num, t1, t2, g1, g2, status, ISOdate, location, group]
  // status: "F" final, "S" scheduled. g1/g2 null when not played.
  const MATCHES = [
    [1,"MEX","RSA",2,0,"F","2026-06-11T19:00:00Z","Mexico City","A"],
    [2,"KOR","CZE",2,1,"F","2026-06-12T02:00:00Z","Guadalajara","A"],
    [3,"CAN","BOS",1,1,"F","2026-06-12T19:00:00Z","Toronto","B"],
    [4,"USA","PAR",4,1,"F","2026-06-13T01:00:00Z","Los Angeles","D"],
    [5,"HAI","SCO",0,1,"F","2026-06-14T01:00:00Z","Boston","C"],
    [6,"AUS","TUR",2,0,"F","2026-06-14T04:00:00Z","Vancouver","D"],
    [7,"BRA","MAR",1,1,"F","2026-06-13T22:00:00Z","East Rutherford","C"],
    [8,"QAT","SUI",1,1,"F","2026-06-13T19:00:00Z","Santa Clara","B"],
    [9,"CIV","ECU",1,0,"F","2026-06-14T23:00:00Z","Philadelphia","E"],
    [10,"GER","CUW",7,1,"F","2026-06-14T17:00:00Z","Houston","E"],
    [11,"NED","JPN",2,2,"F","2026-06-14T20:00:00Z","Dallas","F"],
    [12,"SWE","TUN",5,1,"F","2026-06-15T02:00:00Z","Monterrey","F"],
    [13,"KSA","URU",1,1,"F","2026-06-15T22:00:00Z","Miami","H"],
    [14,"ESP","CPV",0,0,"F","2026-06-15T16:00:00Z","Atlanta","H"],
    [15,"IRN","NZL",2,2,"F","2026-06-16T01:00:00Z","Los Angeles","G"],
    [16,"BEL","EGY",1,1,"F","2026-06-15T19:00:00Z","Seattle","G"],
    [17,"FRA","SEN",3,1,"F","2026-06-16T19:00:00Z","East Rutherford","I"],
    [18,"IRQ","NOR",1,4,"F","2026-06-16T22:00:00Z","Boston","I"],
    [19,"ARG","ALG",3,0,"F","2026-06-17T01:00:00Z","Kansas City","J"],
    [20,"AUT","JOR",3,1,"F","2026-06-17T04:00:00Z","Santa Clara","J"],
    [21,"GHA","PAN",1,0,"F","2026-06-17T23:00:00Z","Toronto","L"],
    [22,"ENG","CRO",4,2,"F","2026-06-17T20:00:00Z","Dallas","L"],
    [23,"POR","DRC",1,1,"F","2026-06-17T17:00:00Z","Houston","K"],
    [24,"UZB","COL",1,3,"F","2026-06-18T02:00:00Z","Mexico City","K"],
    [25,"CZE","RSA",1,1,"F","2026-06-18T16:00:00Z","Atlanta","A"],
    [26,"SUI","BOS",4,1,"F","2026-06-18T19:00:00Z","Los Angeles","B"],
    [27,"CAN","QAT",6,0,"F","2026-06-18T22:00:00Z","Vancouver","B"],
    [28,"MEX","KOR",1,0,"F","2026-06-19T01:00:00Z","Guadalajara","A"],
    [29,"BRA","HAI",3,0,"F","2026-06-20T00:30:00Z","Philadelphia","C"],
    [30,"SCO","MAR",0,1,"F","2026-06-19T22:00:00Z","Boston","C"],
    [31,"TUR","PAR",0,1,"F","2026-06-20T03:00:00Z","Santa Clara","D"],
    [32,"USA","AUS",2,0,"F","2026-06-19T19:00:00Z","Seattle","D"],
    [33,"GER","CIV",2,1,"F","2026-06-20T20:00:00Z","Toronto","E"],
    [34,"ECU","CUW",0,0,"F","2026-06-21T00:00:00Z","Kansas City","E"],
    [35,"NED","SWE",5,1,"F","2026-06-20T17:00:00Z","Houston","F"],
    [36,"TUN","JPN",0,4,"F","2026-06-21T04:00:00Z","Monterrey","F"],
    [37,"URU","CPV",2,2,"F","2026-06-21T22:00:00Z","Miami","H"],
    [38,"ESP","KSA",4,0,"F","2026-06-21T16:00:00Z","Atlanta","H"],
    [39,"BEL","IRN",0,0,"F","2026-06-21T19:00:00Z","Los Angeles","G"],
    [40,"NZL","EGY",1,3,"F","2026-06-22T01:00:00Z","Vancouver","G"],
    [41,"NOR","SEN",3,2,"F","2026-06-23T00:00:00Z","East Rutherford","I"],
    [42,"FRA","IRQ",3,0,"F","2026-06-22T21:00:00Z","Philadelphia","I"],
    [43,"ARG","AUT",2,0,"F","2026-06-22T17:00:00Z","Dallas","J"],
    [44,"JOR","ALG",1,2,"F","2026-06-23T03:00:00Z","Santa Clara","J"],
    [45,"ENG","GHA",0,0,"F","2026-06-23T20:00:00Z","Boston","L"],
    [46,"PAN","CRO",0,1,"F","2026-06-23T23:00:00Z","Toronto","L"],
    [47,"POR","UZB",5,0,"F","2026-06-23T17:00:00Z","Houston","K"],
    [48,"COL","DRC",1,0,"F","2026-06-24T02:00:00Z","Guadalajara","K"],
    [49,"SCO","BRA",0,3,"F","2026-06-24T22:00:00Z","Miami","C"],
    [50,"MAR","HAI",4,2,"F","2026-06-24T22:00:00Z","Atlanta","C"],
    [51,"SUI","CAN",2,1,"F","2026-06-24T19:00:00Z","Vancouver","B"],
    [52,"BOS","QAT",3,1,"F","2026-06-24T19:00:00Z","Seattle","B"],
    [53,"CZE","MEX",0,3,"F","2026-06-25T01:00:00Z","Mexico City","A"],
    [54,"RSA","KOR",1,0,"F","2026-06-25T01:00:00Z","Monterrey","A"],
    [55,"CUW","CIV",null,null,"S","2026-06-25T20:00:00Z","Philadelphia","E"],
    [56,"ECU","GER",null,null,"S","2026-06-25T20:00:00Z","East Rutherford","E"],
    [57,"JPN","SWE",null,null,"S","2026-06-25T23:00:00Z","Dallas","F"],
    [58,"TUN","NED",null,null,"S","2026-06-25T23:00:00Z","Kansas City","F"],
    [59,"TUR","USA",null,null,"S","2026-06-26T02:00:00Z","Los Angeles","D"],
    [60,"PAR","AUS",null,null,"S","2026-06-26T02:00:00Z","Santa Clara","D"],
    [61,"NOR","FRA",null,null,"S","2026-06-26T19:00:00Z","Boston","I"],
    [62,"SEN","IRQ",null,null,"S","2026-06-26T19:00:00Z","Toronto","I"],
    [63,"EGY","IRN",null,null,"S","2026-06-27T03:00:00Z","Seattle","G"],
    [64,"NZL","BEL",null,null,"S","2026-06-27T03:00:00Z","Vancouver","G"],
    [65,"CPV","KSA",null,null,"S","2026-06-27T00:00:00Z","Houston","H"],
    [66,"URU","ESP",null,null,"S","2026-06-27T00:00:00Z","Guadalajara","H"],
    [67,"PAN","ENG",null,null,"S","2026-06-27T21:00:00Z","East Rutherford","L"],
    [68,"CRO","GHA",null,null,"S","2026-06-27T21:00:00Z","Philadelphia","L"],
    [69,"ALG","AUT",null,null,"S","2026-06-28T02:00:00Z","Kansas City","J"],
    [70,"JOR","ARG",null,null,"S","2026-06-28T02:00:00Z","Dallas","J"],
    [71,"COL","POR",null,null,"S","2026-06-27T23:30:00Z","Miami","K"],
    [72,"DRC","UZB",null,null,"S","2026-06-27T23:30:00Z","Atlanta","K"]
  ];

  // Knockout bracket structure. [num, round, location, team1desc, team2desc, ISOdate]
  const KNOCKOUTS = [
    [73,"Round of 32","Los Angeles","Group A runner-up","Group B runner-up","2026-06-28T19:00:00Z"],
    [74,"Round of 32","Boston","Group E winner","3rd from Groups A, B, C, D or F","2026-06-29T20:30:00Z"],
    [75,"Round of 32","Monterrey","Group F winner","Group C runner-up","2026-06-30T01:00:00Z"],
    [76,"Round of 32","Houston","Group C winner","Group F runner-up","2026-06-29T17:00:00Z"],
    [77,"Round of 32","New York/New Jersey","Group I winner","3rd from Groups C, D, F, G or H","2026-06-30T21:00:00Z"],
    [78,"Round of 32","Dallas","Group E runner-up","Group I runner-up","2026-06-30T17:00:00Z"],
    [79,"Round of 32","Mexico City","Group A winner","3rd from Groups C, E, F, H or I","2026-07-01T01:00:00Z"],
    [80,"Round of 32","Atlanta","Group L winner","3rd from Groups E, H, I, J or K","2026-07-01T16:00:00Z"],
    [81,"Round of 32","San Francisco Bay Area","Group D winner","3rd from Groups B, E, F, I or J","2026-07-02T00:00:00Z"],
    [82,"Round of 32","Seattle","Group G winner","3rd from Groups A, E, H, I or J","2026-07-01T20:00:00Z"],
    [83,"Round of 32","Toronto","Group K runner-up","Group L runner-up","2026-07-02T23:00:00Z"],
    [84,"Round of 32","Los Angeles","Group H winner","Group J runner-up","2026-07-02T19:00:00Z"],
    [85,"Round of 32","Vancouver","Group B winner","3rd from Groups E, F, G, I or J","2026-07-03T03:00:00Z"],
    [86,"Round of 32","Miami","Group J winner","Group H runner-up","2026-07-03T22:00:00Z"],
    [87,"Round of 32","Kansas City","Group K winner","3rd from Groups D, E, I, J or L","2026-07-04T01:30:00Z"],
    [88,"Round of 32","Dallas","Group D runner-up","Group G runner-up","2026-07-03T18:00:00Z"],
    [89,"Round of 16","Philadelphia","Match 74 winner","Match 77 winner","2026-07-04T21:00:00Z"],
    [90,"Round of 16","Houston","Match 73 winner","Match 75 winner","2026-07-04T17:00:00Z"],
    [91,"Round of 16","New York/New Jersey","Match 76 winner","Match 78 winner","2026-07-05T20:00:00Z"],
    [92,"Round of 16","Mexico City","Match 79 winner","Match 80 winner","2026-07-06T00:00:00Z"],
    [93,"Round of 16","Dallas","Match 83 winner","Match 84 winner","2026-07-06T19:00:00Z"],
    [94,"Round of 16","Seattle","Match 81 winner","Match 82 winner","2026-07-07T00:00:00Z"],
    [95,"Round of 16","Atlanta","Match 86 winner","Match 88 winner","2026-07-07T16:00:00Z"],
    [96,"Round of 16","Vancouver","Match 85 winner","Match 87 winner","2026-07-07T20:00:00Z"],
    [97,"Quarterfinal","Boston","Match 89 winner","Match 90 winner","2026-07-09T20:00:00Z"],
    [98,"Quarterfinal","Los Angeles","Match 93 winner","Match 94 winner","2026-07-10T19:00:00Z"],
    [99,"Quarterfinal","Miami","Match 91 winner","Match 92 winner","2026-07-11T21:00:00Z"],
    [100,"Quarterfinal","Kansas City","Match 95 winner","Match 96 winner","2026-07-12T01:00:00Z"],
    [101,"Semifinal","Dallas","Match 97 winner","Match 98 winner","2026-07-14T19:00:00Z"],
    [102,"Semifinal","Atlanta","Match 99 winner","Match 100 winner","2026-07-15T19:00:00Z"],
    [103,"Third-place","Miami","Match 101 loser","Match 102 loser","2026-07-18T21:00:00Z"],
    [104,"Final","New York/New Jersey","Match 101 winner","Match 102 winner","2026-07-19T19:00:00Z"]
  ];

  // Third-place advancement model — chance of reaching R32 as a 3rd-place team.
  const THIRD_ADV = {
    fourPlus: 0.9999,
    threePts: { "2":0.999, "1":0.9985, "0":0.997, "-1":0.9547, "-2":0.8349, "-3":0.5036, "-4":0.2616, "-5":0.1393, "-6":0.0633 },
    twoOrFewer: 0.0043
  };

  // Best-third-by-group model output: which group most likely sends a 3rd-place team through.
  const BEST_THIRD = [
    { group:"B", total:1.0, teams:[["BOS",1.0,3]] },
    { group:"L", total:.9524, teams:[["GHA",.5694,2],["CRO",.38219,3],["ENG",.00081,1]] },
    { group:"A", total:.93981, teams:[["KOR",.93981,3]] },
    { group:"F", total:.93837, teams:[["SWE",.66299,3],["JPN",.26385,2],["NED",.01153,1]] },
    { group:"D", total:.76274, teams:[["PAR",.39763,3],["AUS",.36511,2]] },
    { group:"J", total:.70739, teams:[["ALG",.42303,3],["AUT",.28436,2]] },
    { group:"I", total:.67003, teams:[["SEN",.64321,3],["IRQ",.02682,4]] },
    { group:"G", total:.56844, teams:[["EGY",.2329,1],["IRN",.22152,2],["BEL",.08296,3],["NZL",.03106,4]] },
    { group:"K", total:.45999, teams:[["DRC",.42664,3],["UZB",.03001,4],["POR",.00334,2]] },
    { group:"C", total:.37453, teams:[["SCO",.37453,3]] },
    { group:"H", total:.31879, teams:[["URU",.11878,2],["CPV",.08556,3],["ESP",.06077,1],["KSA",.05368,4]] },
    { group:"E", total:.30751, teams:[["ECU",.1851,3],["CIV",.09242,2],["CUW",.02999,4]] }
  ];

  const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
  const LAST_UPDATED = "2026-06-25T15:01:22Z";

  return { TEAMS, MATCHES, KNOCKOUTS, THIRD_ADV, BEST_THIRD, GROUPS, LAST_UPDATED };
})();
