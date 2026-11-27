/* freenetsave math: "My province" box on grade lesson pages. Same saved choice as learn.freenetsave.com (this device only). */
(function(){
var m=location.pathname.match(/^\/grade-(\d{1,2})\/$/);if(!m)return;var G=+m[1];
var lede=document.querySelector("main .lede");if(!lede)return;
var P={BC:"British Columbia",AB:"Alberta",SK:"Saskatchewan",MB:"Manitoba",ON:"Ontario",QC:"Quebec",NB:"New Brunswick",NS:"Nova Scotia",PE:"Prince Edward Island",NL:"Newfoundland and Labrador",YT:"Yukon",NT:"Northwest Territories",NU:"Nunavut"};
var W={BC:1,AB:1,SK:1,MB:1,YT:1,NT:1,NU:1,NB:1,NS:1,PE:1,NL:1};
/* course names we are sure of */
var C={AB:{10:"Math 10C",11:"Math 20-1",12:"Math 30-1 (and Math 31 for calculus)"},BC:{10:"Foundations of Math and Pre-calculus 10",11:"Pre-calculus 11",12:"Pre-calculus 12 (and Calculus 12)"},YT:{10:"Foundations of Math and Pre-calculus 10",11:"Pre-calculus 11",12:"Pre-calculus 12"},SK:{10:"Foundations and Pre-calculus 10",11:"Pre-calculus 20",12:"Pre-calculus 30 (and Calculus 30)"},MB:{10:"Introduction to Applied and Pre-Calculus Mathematics 20S",11:"Pre-Calculus Mathematics 30S",12:"Pre-Calculus Mathematics 40S"},NT:{10:"Math 10C",11:"Math 20-1",12:"Math 30-1"},NU:{10:"Math 10C",11:"Math 20-1",12:"Math 30-1"}};
/* where the pre-calculus topics of other provinces are on this site */
var T={10:[["Factoring polynomials",10,"algebra-and-factoring"],["Trigonometry with right triangles",10,"trigonometry"],["Linear relations and systems",10,"linear-systems"],["Radicals and exponent laws",11,"radicals-and-expressions"]],
11:[["Quadratic functions and equations",10,"quadratics"],["Radicals and rational expressions",11,"radicals-and-expressions"],["Absolute value and reciprocal functions",11,"functions"],["Sequences and series",11,"sequences-and-series"],["Sine law and cosine law",11,"trigonometry"]],
12:[["Transformations of functions",11,"transformations"],["Exponential and logarithmic functions",11,"exponents-and-logarithms"],["Unit circle and trig identities",12,"trigonometry"],["Polynomial functions",12,"polynomial-and-rational-functions"],["Permutations, combinations and the binomial theorem",12,"counting-and-probability"]]};
function get(){try{return localStorage.getItem("fns_prov")||""}catch(e){return ""}}
function put(v){try{localStorage.setItem("fns_prov",v)}catch(e){}}
var box=document.createElement("div");
box.style.cssText="background:#eef6ff;border:1px solid #cfe0f5;border-radius:12px;padding:10px 14px;margin:12px 0 18px";
var o='<label style="font-weight:700">📍 My province or territory: <select id="mprov" style="font-size:16px;padding:4px 6px;border-radius:8px"><option value="">Choose…</option>';
for(var k in P)o+='<option value="'+k+'">'+P[k]+'</option>';
box.innerHTML=o+'</select></label><div id="mprovmsg" style="margin-top:6px;font-size:16px;line-height:1.5"></div>';
lede.parentNode.insertBefore(box,lede.nextSibling);
var s=document.getElementById("mprov"),msg=document.getElementById("mprovmsg");
function show(c){
 if(!P[c]){msg.innerHTML="";return}
 var h='<a href="https://learn.freenetsave.com/my-province/#'+c+'-'+G+'">See all '+P[c]+' Grade '+G+' subjects</a>. ';
 if(c==="ON"){msg.innerHTML=h+"These lessons follow the Ontario curriculum.";return}
 if(c==="QC"){msg.innerHTML=h+(G>=7?"In Quebec, Grade "+G+" is Secondary "+Math.min(G-6,5)+". ":"")+"Most topics match. Use the lesson list or search to find what your class is studying.";return}
 var name=C[c]&&C[c][G];
 if(name)h+="In "+P[c]+", Grade "+G+" math is usually <b>"+name+"</b>. ";
 h+="Lessons are labelled with the Ontario grade. Most topics are the same, sometimes a grade earlier or later.";
 if(W[c]&&T[G]){h+='<br><b>'+P[c]+' Grade '+G+' classes also study:</b> '+T[G].map(function(t){return '<a href="/grade-'+t[1]+'/'+t[2]+'/">'+t[0]+(t[1]===G?"":" (Grade "+t[1]+" lessons)")+'</a>'}).join(" · ")}
 msg.innerHTML=h;
}
var q=(location.search.match(/[?&]prov=([A-Z]{2})/)||[])[1];if(P[q])put(q);
var v=get();if(P[v]){s.value=v;show(v)}
s.onchange=function(){put(s.value);show(s.value)};
})();
