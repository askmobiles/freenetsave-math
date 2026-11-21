/* freenetsave math practice — practice, fun challenge and printable worksheets. Nothing is saved or sent. */
(function(){
"use strict";
var F=window.FNS_MATH,G=F.G,n=F.n,pick=F.pick,R=F.R,M="−";
var $=function(id){return document.getElementById(id);};
var N=10;
var grade=1,mode="practice",view="grade",strand=null,band=null;
var sel={pool:[],label:"",list:[],pos:-1};   // what is being practised now
var list=[],idx=0,right=0,cur=null,typed="",locked=false,results=[],missed=[];
var ch={on:false,left:60,score:0,streak:0,best:0,count:0,timer:null,wait:null},sessionBest={};

/* every topic, with its grade and its all-grades subject */
var SUBJ=[[/Word/,"Word problems"],[/Trig/,"Trigonometry"],[/Calculus|Vectors/,"Calculus & vectors"],[/Money &|Percent|Ratio|Financial/,"Percent, ratio & money"],[/Data|Chance|Counting/,"Data & chance"],[/Fraction|Decimal/,"Fractions & decimals"],[/Adding|Taking/,"Adding & subtracting"],[/Times|Groups|Multiplying/,"Multiplying & dividing"],[/Measur|Shapes, money|Money, time/,"Measuring, time & money"],[/Geometry|Coordinate/,"Geometry"],[/^Numbers$|Number sense|Whole numbers|Integers/,"Numbers & place value"]];
var ORDER=["Numbers & place value","Adding & subtracting","Multiplying & dividing","Fractions & decimals","Percent, ratio & money","Measuring, time & money","Geometry","Algebra & equations","Data & chance","Trigonometry","Calculus & vectors","Word problems"];
var ALL=[];
(function(){for(var g=1;g<=12;g++)G[g].forEach(function(t){var s="Algebra & equations";for(var i=0;i<SUBJ.length;i++)if(SUBJ[i][0].test(t.c)){s=SUBJ[i][1];break;}ALL.push({g:g,t:t,s:s});});})();

var LS=window.FNS_LESSONS||{};
function lessonOf(it){return LS[it.g+"|"+it.t.t]||LS[it.t.t]||[];}
function gen(){var it=pick(sel.pool),q=it.t.f();q.it=it;return q;}
function many(k){var seen={},out=[],tries=0;while(out.length<k&&tries<k*40){var q=gen();tries++;if(seen[q.q]&&tries<k*30)continue;seen[q.q]=1;out.push(q);}return out;}
function show(a){return a.replace(/-/g,M);}
function ansText(q){return q.s?show(q.s):n(q.a);}
function parse(t){if(t===""||t==="-")return null;var p=t.split("/");if(p.length===2){var a=parseFloat(p[0]),b=parseFloat(p[1]);if(isNaN(a)||isNaN(b)||b===0)return null;return a/b;}var v=parseFloat(t);return isNaN(v)?null:v;}
function isRight(t,q){if(q.x)return t===q.s;var v=parse(t);return v!==null&&Math.abs(v-q.a)<1e-6;}

/* ----- picker ----- */
function sym(c){var m=[[/Adding/,"+"],[/Taking/,"−"],[/Times|Groups|Multiplying/,"×"],[/Fraction|Decimal/,"½"],[/Percent|Ratio|Money &/,"%"],[/Measur|money|Money, time/,"cm"],[/Geometry|Shapes|Coordinate/,"△"],[/Trig/,"θ"],[/Calculus/,"∫"],[/Powers|Exponents/,"x²"],[/Sequences|Series/,"…"],[/Vectors/,"→"],[/Integers/,"±"],[/Data|Chance|Counting/,"⚄"],[/Word/,"?"],[/Equation/,"="],[/Pattern|Linear/,"↗"],[/Financial/,"$"],[/Algebra/,"x"],[/Number|Whole/,"123"]];for(var i=0;i<m.length;i++)if(m[i][0].test(c))return m[i][1];return "x";}
function confetti(){if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches)return;var box=document.createElement("div");box.className="confetti";var col=["#2563eb","#f97316","#16a34a","#a855f7","#ec4899","#facc15"];for(var i=0;i<40;i++){var s=document.createElement("i");s.style.left=R(0,100)+"%";s.style.background=col[i%6];s.style.animationDelay=(R(0,60)/100)+"s";s.style.animationDuration=(R(140,260)/100)+"s";box.appendChild(s);}document.body.appendChild(box);setTimeout(function(){box.remove();},3400);}
function chips(box,names,cur,fn){box.innerHTML="";names.forEach(function(c){var b=document.createElement("button");b.type="button";b.textContent=c;b.setAttribute("aria-pressed",String(c===cur));b.onclick=function(){fn(c);};box.appendChild(b);});box.style.display=names.length>1?"":"none";}
function catCards(box,cats,cur,inG,fn){box.innerHTML="";box.style.display="";cats.forEach(function(c,k){var ts=inG.filter(function(it){return it.t.c===c;}),b=document.createElement("button");b.type="button";b.className="k"+(k%12);b.setAttribute("aria-pressed",String(c===cur));var ic=document.createElement("i");ic.textContent=sym(c);ic.setAttribute("aria-hidden","true");var w=document.createElement("span");w.className="tx";var s=document.createElement("b");s.textContent=c;var e=document.createElement("span");e.textContent=ts.slice(0,3).map(function(it){return it.t.t;}).join(", ")+(ts.length>3?" and more":"");w.appendChild(s);w.appendChild(e);var ar=document.createElement("em");ar.textContent="›";ar.setAttribute("aria-hidden","true");b.appendChild(ic);b.appendChild(w);b.appendChild(ar);b.onclick=function(){fn(c);};box.appendChild(b);});}
function cards(items,badge){
  var box=$("topics");box.innerHTML="";
  items.forEach(function(it,k){var b=document.createElement("button");b.type="button";b.className="c"+(k%5);var ic=document.createElement("i");ic.textContent=sym(it.t.c);ic.setAttribute("aria-hidden","true");var w=document.createElement("span");w.className="tx";var s=document.createElement("b");s.textContent=it.t.t;var e=document.createElement("span");e.textContent=(badge?"Grade "+it.g+" · ":"")+it.t.d;w.appendChild(s);w.appendChild(e);b.appendChild(ic);b.appendChild(w);b.onclick=function(){launchOne(items,k);};box.appendChild(b);});
  $("none").style.display=items.length?"none":"block";
}
var BANDS=[["Grades 1–3",1,3],["Grades 4–6",4,6],["Grades 7–9",7,9],["Grades 10–12",10,12]];
function render(){
  var q=$("find").value.trim().toLowerCase();
  [].forEach.call($("views").children,function(b){b.setAttribute("aria-pressed",String(!q&&b.dataset.v===view));});
  $("grades").style.display=(!q&&view==="grade")?"":"none";
  $("subjects").style.display=(!q&&view==="subject")?"":"none";
  $("pickLab").textContent=q?"Topics that match":(view==="grade"?"Pick a grade":"Pick a subject");
  var gv=!q&&view==="grade";$("cats").className="cats"+(gv?" big":"");$("catH").parentNode.parentNode.style.display=gv?"":"none";
  var hr=$("hero");if(gv){hr.style.backgroundImage="url(banners/"+(grade>=6?"older":"younger")+".jpg?v=4)";hr.classList.add("pic");}else{hr.style.backgroundImage="";hr.classList.remove("pic");}
  $("heroH").innerHTML=gv?'<span class="gp">Grade '+grade+'</span> Math':"Free math practice, Grades 1 to 12";
  $("heroP").textContent=gv?"Learn, practice and master Grade "+grade+" math. Free, no sign-up, nothing saved.":"Learn how, practice, race the clock, or print a worksheet. No sign-up, nothing saved.";
  $("tLab").textContent=q?"":"Pick a topic";
  if(q){
    $("cats").style.display="none";$("mix").style.display="none";
    cards(ALL.filter(function(it){return (it.t.t+" "+it.t.d+" "+it.t.c+" "+it.s+" grade "+it.g).toLowerCase().indexOf(q)>-1;}).slice(0,40),true);
    return;
  }
  $("mix").style.display=mode==="learn"?"none":"";
  if(view==="grade"){
    [].forEach.call($("grades").children,function(b){b.setAttribute("aria-pressed",String(+b.dataset.g===grade));});
    var inG=ALL.filter(function(it){return it.g===grade;}),cats=[];
    inG.forEach(function(it){if(cats.indexOf(it.t.c)<0)cats.push(it.t.c);});
    if(cats.indexOf(band)<0)band=cats[0];
    catCards($("cats"),cats,band,inG,function(c){band=c;render();try{$("mLab").scrollIntoView({behavior:"smooth",block:"start"});}catch(e){}});
    var inB=inG.filter(function(it){return it.t.c===band;});
    $("catH").textContent="Grade "+grade+" Math Topics";var cs=$("catSub");if(cs){cs.innerHTML=grade<=8?'Choose a topic group to learn, practice and test your skills. <a class="glink" style="margin-left:6px;font-weight:800;color:#1d4ed8;text-decoration:none;border-bottom:2px solid #93c5fd" href="/grade-'+grade+'/">Open the full Grade '+grade+' lessons \u2192</a>':"Choose a topic group to practice and test your skills.";}$("catN").textContent=cats.length+" topic groups · "+inG.length+" topics";
    $("tLab").textContent=band+" · "+inB.length+" topic"+(inB.length>1?"s":"");
    cards(inB,false);
    $("mix").textContent="Mixed review: all of Grade "+grade;
    $("mix").onclick=function(){launchMix(inG,"Grade "+grade+" · Mix of everything");};
  }else{
    [].forEach.call($("subjects").children,function(b){b.setAttribute("aria-pressed",String(b.textContent===strand));});
    var inS=ALL.filter(function(it){return it.s===strand;});
    var bs=BANDS.filter(function(b){return inS.some(function(it){return it.g>=b[1]&&it.g<=b[2];});});
    var names=bs.map(function(b){return b[0];});
    if(names.indexOf(band)<0)band=names[0];
    chips($("cats"),names,band,function(c){band=c;render();});
    var bb=bs[names.indexOf(band)],show=inS.filter(function(it){return it.g>=bb[1]&&it.g<=bb[2];});
    cards(show,true);
    $("mix").textContent="Or mix all "+strand+", "+band;
    $("mix").onclick=function(){launchMix(show,strand+" · "+band+" mix");};
  }
  try{history.replaceState(null,"",view==="grade"?"#g"+grade:"#topics");}catch(e){}
}
function setup(){
  var box=$("grades"),g;
  for(g=1;g<=12;g++){var b=document.createElement("button");b.type="button";b.textContent=g;b.setAttribute("aria-pressed","false");b.setAttribute("aria-label","Grade "+g);b.dataset.g=g;b.onclick=function(){grade=+this.dataset.g;band=null;render();};box.appendChild(b);}
  ORDER.forEach(function(s){var b=document.createElement("button");b.type="button";b.textContent=s;b.setAttribute("aria-pressed","false");b.onclick=function(){strand=s;band=null;render();};$("subjects").appendChild(b);});
  strand=ORDER[0];
  $("views").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;view=b.dataset.v;band=null;$("find").value="";render();});
  $("find").addEventListener("input",render);
}
var MD={adaptive:"Miss a question and you get an easier one on the same skill from the grade below. Then you come back and carry on.",learn:"See how to do it, step by step, with worked examples.",practice:"Each question shows how it is worked out. Every round has new questions.",challenge:"60 seconds on the clock. How many can you get?",sheet:"A printable page of questions with an answer key."};
function setMode(m){mode=m;[].forEach.call($("modes").children,function(b){b.setAttribute("aria-pressed",String(b.dataset.m===m));});$("mdesc").textContent=MD[m];$("plen").style.display=(m==="practice"||m==="adaptive")?"":"none";if($("mix"))$("mix").style.display=(m==="learn"||$("find").value.trim())?"none":"";}
function go(){if(mode==="learn"&&sel.pool.length===1)openLearn();else if(mode==="sheet")openSheet();else if(mode==="challenge")startChallenge();else startPractice();}
function launchOne(items,k){sel={pool:[items[k]],label:"Grade "+items[k].g+" · "+items[k].t.t,list:items,pos:k};go();}
function launchMix(items,label){sel={pool:items,label:label,list:[],pos:-1};go();}
var onPick=true;function histStep(name){var p=name==="pick";try{if(!p&&onPick)history.pushState({fnsAct:1},"",location.href);}catch(e){}onPick=p;}
function screen(name){
  stopClock();histStep(name);
  $("pick").style.display=name==="pick"?"":"none";
  $("play").classList.toggle("on",name==="play");
  $("done").classList.toggle("on",name==="done");
  $("sheetwrap").classList.toggle("on",name==="sheet");
  $("learn").classList.toggle("on",name==="learn");
  document.body.classList.toggle("playing",name==="play");document.body.classList.toggle("inside",name!=="pick");
  var nx=sel.pos>-1&&sel.pos<sel.list.length-1?sel.list[sel.pos+1]:null;
  $("nextT").style.display=nx?"":"none";if(nx)$("nextT").textContent="Next topic: "+nx.t.t;
  var el={pick:"pick",play:"play",done:"done",sheet:"sheetwrap",learn:"learn"}[name];
  var top=$(el).getBoundingClientRect().top+window.pageYOffset-10;
  window.scrollTo({top:name==="pick"?0:top,behavior:"auto"});
}

/* ----- learn ----- */
function fillSteps(ol,it){ol.innerHTML="";lessonOf(it).forEach(function(s){var li=document.createElement("li");li.textContent=s;ol.appendChild(li);});}
function examples(){
  var box=$("lex");box.innerHTML="";
  many(3).forEach(function(q){var d=document.createElement("div");d.className="ex";var a=document.createElement("div");a.className="exq";a.innerHTML=q.q;var b=document.createElement("p");var s=document.createElement("b");s.textContent="Answer: "+ansText(q);b.appendChild(s);var c=document.createElement("p");c.textContent=q.h;d.appendChild(a);d.appendChild(b);d.appendChild(c);box.appendChild(d);});
}
function slugT(t){t=t.toLowerCase().replace(/&/g,"and").replace(/\u00f7/g," divide ").replace(/\u00d7/g," times ").replace(/\+/g," plus ").replace(/%/g," percent ");t=t.replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");return t||"topic";}
var LSLUG={"8|Rational or irrational":"rational-and-irrational-numbers","8|Integer sums":"adding-and-subtracting-integers","8|Integers: multiply and divide":"multiplying-and-dividing-integers"};
function lessonURL(it){if(!it||it.g<1||it.g>8)return "";return "/grade-"+it.g+"/"+slugT(it.t.c)+"/"+(LSLUG[it.g+"|"+it.t.t]||slugT(it.t.t))+"/";}
function openLearn(){
  var it=sel.pool[0];
  var lu=lessonURL(it);if(lu){location.href=lu;return;}
  $("ltag").textContent="Grade "+it.g+" \u00b7 "+it.t.c;$("ltitle").textContent=it.t.t;
  fillSteps($("lsteps"),it);examples();screen("learn");
}
function setHelp(on){
  var ok=!ch.on&&cur&&cur.it&&lessonOf(cur.it).length>0;
  $("help").style.display=ok?"":"none";
  on=on&&ok;$("help").setAttribute("aria-expanded",String(on));$("helpbox").style.display=on?"block":"none";
  if(on)fillSteps($("helpbox"),cur.it);
}

/* ----- practice ----- */
/* ----- adaptive: a wrong answer opens an easier question on the same skill, one grade down, then two ----- */
var LADDER={"8|Scientific notation":["7|Powers of ten","5|Times 10, 100, 1000"],"8|Square roots":["7|Perfect squares","6|Factors and multiples"],"8|Powers":["7|Perfect squares","6|Factors and multiples"],"8|Rational or irrational":["7|Perfect squares","7|Fractions to decimals"],"8|Fractions, decimals and percents":["7|Fractions to decimals","6|Percents and decimals"],"8|Order of operations with powers":["7|Order of operations with integers","6|Order of operations"],"8|Integer sums":["7|Mixed integer sums","6|Negative numbers: add"],"8|Adding and subtracting fractions":["5|Adding fractions","5|Simplest form"],"8|Multiplying and dividing fractions":["6|Multiplying fractions","5|Fraction of a number"],"8|Percent problems":["6|Percent of a number","5|Easy percents"],"8|Percent change":["7|Percent change","6|Percent of a number"],"8|Discounts":["7|Sale prices","6|Percent of a number"],"8|Integers: multiply and divide":["7|Integers × and ÷","6|Negative numbers: add"],"8|Equations with brackets":["7|Two-step equations","6|One-step equations"],"8|Two-step equations":["7|Two-step equations","6|One-step equations"],"8|Collecting like terms":["7|Collecting like terms","6|Plug in a number"],"8|Mean":["7|Mean","5|Average (mean)"],"8|Area of a circle":["7|Circles","6|Area of a triangle"],"8|Sales tax":["7|Tips and tax","6|Percent of a number"],"8|Rates and proportions":["7|Proportions","6|Price for one"],"7|Powers of ten":["5|Times 10, 100, 1000"],"7|Order of operations with integers":["6|Order of operations","5|Order of operations"],"7|Fractions to decimals":["6|Percents and decimals"],"7|Mixed integer sums":["6|Negative numbers: add","6|Negative numbers: subtract"],"7|Integers × and ÷":["6|Negative numbers: add"]};
var ad={level:0,ok:true,base:null,help:0,helpOk:0};
function findT(key){var k=key.split("|");for(var i=0;i<ALL.length;i++)if(ALL[i].g===+k[0]&&ALL[i].t.t===k[1])return ALL[i];return null;}
function support(it,level){var L=LADDER[it.g+"|"+it.t.t];if(L){return L[level-1]?findT(L[level-1]):null;}var g=it.g-level;if(g<1)return null;var c=ALL.filter(function(z){return z.g===g&&z.s===it.s;});return c.length?pick(c):null;}
function adNext(){if(ad.ok||ad.level>=2){ad.level=0;return false;}var it=support(ad.base,ad.level+1);if(!it){ad.level=0;return false;}ad.level++;cur=it.t.f();cur.it=it;typed="";locked=false;
  $("qn").textContent="Easier one first · Grade "+it.g+" · "+it.t.t;putQ(cur);$("ans").textContent="";$("fb").className="fb";$("fb").innerHTML="";$("go").textContent="Check";setHelp(false);return true;}
function startPractice(){
  ad={level:0,ok:true,base:null,help:0,helpOk:0};
  ch.on=false;idx=0;right=0;results=[];missed=[];list=many(N);
  $("play").classList.remove("ch");
  $("tag").textContent=sel.label;
  screen("play");showQ();
}
function dots(){var d=$("dots");d.innerHTML="";d.classList.toggle("many",N>10);for(var i=0;i<N;i++){var e=document.createElement("i");if(results[i]===true)e.className="ok";else if(results[i]===false)e.className="no";else if(i===idx)e.className="now";d.appendChild(e);}}
function putQ(q){var el=$("q");el.innerHTML=q.q;el.classList.toggle("long",q.q.replace(/<[^>]+>/g,"").length>42);}
function showQ(){
  cur=list[idx];typed="";locked=false;
  $("qn").textContent="Question "+(idx+1)+" of "+N;
  putQ(cur);$("ans").textContent="";
  $("fb").className="fb";$("fb").innerHTML="";
  $("go").textContent="Check";dots();setHelp(false);
}
var SND=true,AC=null,run=0;
function snd(ok){if(!SND)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();var t=AC.currentTime;(ok?[660,880,1320]:[220,165]).forEach(function(f,i){var o=AC.createOscillator(),g=AC.createGain();o.type=ok?"triangle":"sine";o.frequency.value=f;g.gain.setValueAtTime(0.0001,t+i*0.09);g.gain.exponentialRampToValueAtTime(0.16,t+i*0.09+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+i*0.09+0.22);o.connect(g);g.connect(AC.destination);o.start(t+i*0.09);o.stop(t+i*0.09+0.25);});}catch(e){}}
function praise(){run++;var p=pick(["Correct! ⭐","Great job! 🎉","You got it! 👍","Super! 🌟","Well done! 👏","Yes! 😀","Nice work! 💪"]);return run>=3?run+" in a row! 🔥 "+p:p;}
(function(){var b=document.createElement("button");b.type="button";b.className="fns-snd";b.textContent="🔊";b.setAttribute("aria-label","Sound on. Tap to turn sound off.");b.style.cssText="position:fixed;right:14px;bottom:14px;z-index:99980;width:46px;height:46px;border-radius:50%;border:0;background:#fff;box-shadow:0 3px 12px rgba(23,32,51,.25);font-size:22px;cursor:pointer";b.onclick=function(){SND=!SND;b.textContent=SND?"🔊":"🔇";b.setAttribute("aria-label",SND?"Sound on. Tap to turn sound off.":"Sound off. Tap to turn sound on.");};function add(){document.body.appendChild(b);}if(document.body)add();else document.addEventListener("DOMContentLoaded",add);})();
function feedback(ok,head,body){snd(ok);if(!ok)run=0;var fb=$("fb");fb.className="fb "+(ok?"ok":"no");fb.innerHTML="";var b=document.createElement("b");b.textContent=head;fb.appendChild(b);if(body){var s=document.createElement("span");s.textContent=body;fb.appendChild(s);}}
function check(){
  if(parse(typed)===null){feedback(false,"Type an answer first.","Use the number pad or a keyboard.");return;}
  var ok=isRight(typed,cur);
  if(!ok&&cur.x&&Math.abs(parse(typed)-cur.a)<1e-6){feedback(false,"Right value, but not the simplest form yet.","Divide the top and bottom by the same number and try again.");return;}
  if(mode==="adaptive"&&ad.level>0){ad.help++;if(ok)ad.helpOk++;ad.ok=ok;locked=true;
    feedback(ok,ok?"That is it! Now back to Grade "+ad.base.g+".":"Not quite. The answer is "+ansText(cur)+".",cur.h);
    $("go").textContent=(!ok&&ad.level<2&&support(ad.base,ad.level+1))?"Try an easier one":"Back to Grade "+ad.base.g;return;}
  results[idx]=ok;if(ok)right++;else missed.push({q:cur,yours:show(typed)});
  locked=true;ad.ok=ok;ad.base=cur.it;ad.level=0;
  feedback(ok,ok?praise():"Not quite. The answer is "+ansText(cur)+".",cur.h);
  $("go").textContent=(mode==="adaptive"&&!ok&&support(cur.it,1))?"Try an easier one":(idx===N-1?"See score":"Next");dots();
}
function next(){if(mode==="adaptive"&&adNext())return;idx++;if(idx<N){showQ();return;}finishPractice();}
function stars(k){var s="";for(var i=0;i<3;i++)s+=i<k?"★":"<i>★</i>";$("stars").innerHTML=s;}
function finishPractice(){
  var pc=right/N;stars(pc===1?3:(pc>=.8?2:(pc>=.5?1:0)));
  $("score").textContent=right+" / "+N;
  $("doneMsg").textContent=pc===1?"Perfect score!":(pc>=.8?"Great work!":(pc>=.5?"Good effort!":"Keep practising!"));
  $("doneSub").textContent=sel.label+". "+(mode==="adaptive"&&ad.help?"Easier questions: "+ad.helpOk+" of "+ad.help+" right. ":"")+"Every round has new questions.";
  review();screen("done");$("again").focus();if(right/N>=.8)confetti();
}
function review(){
  var box=$("review");box.innerHTML="";if(!missed.length)return;
  var h=document.createElement("h3");h.textContent="Have another look at these";box.appendChild(h);
  missed.slice(0,30).forEach(function(m){var d=document.createElement("div");d.innerHTML=m.q.q.replace(/<br>/g," &nbsp; ").replace(/<small>/g," <small>");var e=document.createElement("em");e.textContent="Answer: "+ansText(m.q)+". "+m.q.h;d.appendChild(e);box.appendChild(d);});
}

/* ----- fun challenge ----- */
function stopClock(){if(ch.timer){clearInterval(ch.timer);ch.timer=null;}if(ch.wait){clearTimeout(ch.wait);ch.wait=null;}}
function startChallenge(){
  ch.on=true;ch.left=60;ch.score=0;ch.streak=0;ch.best=0;ch.count=0;right=0;missed=[];
  $("play").classList.add("ch");
  $("tag").textContent=sel.label;
  screen("play");hud();nextCh();
  ch.end=Date.now()+60000;
  ch.timer=setInterval(function(){ch.left=Math.max(0,Math.ceil((ch.end-Date.now())/1000));hud();if(ch.left<=0)finishChallenge();},250);
}
function hud(){
  $("clock").textContent=ch.left;$("pts").textContent=ch.score;
  $("streak").textContent=ch.streak>=2?ch.streak+" in a row!":"";
  $("barIn").style.width=(ch.left/60*100)+"%";
}
function nextCh(){
  cur=gen();typed="";locked=false;ch.count++;
  $("qn").textContent="Question "+ch.count;
  putQ(cur);$("ans").textContent="";$("fb").className="fb";$("fb").innerHTML="";
  $("qcard").className="qcard";$("go").textContent="Enter";setHelp(false);
}
function checkCh(){
  if(parse(typed)===null)return;
  var ok=isRight(typed,cur);locked=true;
  if(ok){right++;ch.streak++;ch.best=Math.max(ch.best,ch.streak);ch.score+=10+Math.min(ch.streak-1,5)*2;$("qcard").className="qcard flash-ok";snd(true);}
  else{ch.streak=0;missed.push({q:cur,yours:show(typed)});$("qcard").className="qcard flash-no";feedback(false,"Answer: "+ansText(cur),"");}
  hud();
  ch.wait=setTimeout(function(){ch.wait=null;if(ch.on&&ch.timer)nextCh();},ok?280:1300);
}
function finishChallenge(){
  stopClock();ch.on=false;
  var key=sel.label,prev=sessionBest[key]||0,isBest=ch.score>prev&&prev>0;
  if(ch.score>prev)sessionBest[key]=ch.score;
  stars(ch.score>=150?3:(ch.score>=80?2:(ch.score>=30?1:0)));
  $("score").textContent=ch.score;
  $("doneMsg").textContent=isBest?"New best this visit!":(ch.score>=150?"Lightning fast!":(ch.score>=80?"Great speed!":(ch.score>=30?"Nice run!":"Good try. Go again!")));
  $("doneSub").textContent=right+" correct in 60 seconds · best streak "+ch.best+(prev&&!isBest?" · your best this visit: "+prev:"")+". "+sel.label+".";
  review();screen("done");$("again").focus();if(ch.score>=80)confetti();
}

/* ----- keypad ----- */
function key(k){
  if(k==="go"){if(ch.on){if(!locked)checkCh();return;}return locked?next():check();}
  if(locked)return;
  var part=typed.split("/").pop();
  if(k==="back"){typed=typed.slice(0,-1);}
  else if(k==="-"){typed=typed.charAt(0)==="-"?typed.slice(1):"-"+typed;}
  else if(k==="."){if(part.indexOf(".")<0)typed+=(part===""||part==="-")?"0.":".";}
  else if(k==="/"){if(typed.indexOf("/")<0&&/\d$/.test(typed))typed+="/";}
  else if(typed.replace(/[^0-9]/g,"").length<12){if(part==="0")typed=typed.slice(0,-1);typed+=k;}
  $("ans").textContent=show(typed);
}
$("pad").addEventListener("click",function(e){var b=e.target.closest("button");if(b){key(b.dataset.k);if(b.dataset.k!=="go")b.blur();}});
document.addEventListener("keydown",function(e){
  if(!$("play").classList.contains("on")||e.ctrlKey||e.metaKey||e.altKey)return;
  var k=e.key;
  if(/^[0-9]$/.test(k))key(k);
  else if(k==="."||k===",")key(".");
  else if(k==="-")key("-");
  else if(k==="/"){e.preventDefault();key("/");}
  else if(k==="Backspace"){e.preventDefault();key("back");}
  else if(k==="Enter"){var a=document.activeElement;if(a&&a.id==="back")return;e.preventDefault();key("go");}
});

/* ----- printable worksheet ----- */
var sheetQs=[];
function openSheet(){screen("sheet");buildSheet(true);}
function buildSheet(fresh){
  var k=+$("sn").value;
  if(fresh||sheetQs.length!==k)sheetQs=many(k);
  var title="Math: "+sel.label.replace(" \u00b7 ",": ");
  var h='<div class="sh-top"><h2></h2><span>math.freenetsave.com</span></div>'+
        '<div class="sh-meta"><span>Name<i></i></span><span>Date<i></i></span><span>Score<i class="sm"></i>/ '+k+'</span></div>'+
        '<ol class="sh-q'+($("swork").checked?" work":"")+'">';
  sheetQs.forEach(function(q,i){h+="<li><b>"+(i+1)+".</b><span>"+q.q+"</span><u></u></li>";});
  h+="</ol>";
  if($("skey").checked){h+='<div class="sh-key"><h3>Answer key: '+title.replace(/&/g,"&amp;")+'</h3><ol>';sheetQs.forEach(function(q,i){h+="<li><b>"+(i+1)+".</b> "+ansText(q)+"</li>";});h+="</ol></div>";}
  h+='<p class="sh-foot">Free to print and copy for home and classroom use · math.freenetsave.com</p>';
  $("sheet").innerHTML=h;$("sheet").querySelector("h2").textContent=title;
}
$("sn").onchange=function(){buildSheet(true);};
$("skey").onchange=function(){buildSheet(false);};
$("swork").onchange=function(){buildSheet(false);};
$("snew").onclick=function(){buildSheet(true);};
$("sprint").onclick=function(){window.print();};

/* ----- wiring ----- */
function rawTopics(){screen("pick");}
function toTopics(){var st=null;try{st=history.state;}catch(e){}if(!onPick&&st&&st.fnsAct){history.back();return;}rawTopics();}
window.addEventListener("popstate",function(){if(!onPick)rawTopics();});
$("back").onclick=toTopics;$("other").onclick=toTopics;$("sback").onclick=toTopics;
$("again").onclick=function(){if(mode==="challenge")startChallenge();else startPractice();};
$("toSheet").onclick=function(){openSheet();};
$("modes").addEventListener("click",function(e){var b=e.target.closest("button");if(b)setMode(b.dataset.m);});
$("plen").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;N=+b.dataset.n;[].forEach.call($("plen").querySelectorAll("button"),function(x){x.setAttribute("aria-pressed",String(x===b));});});
$("help").onclick=function(){setHelp($("help").getAttribute("aria-expanded")!=="true");};
$("lback").onclick=toTopics;$("lmore").onclick=examples;$("lprac").onclick=function(){startPractice();};$("lsheet").onclick=function(){openSheet();};
$("nextT").onclick=function(){launchOne(sel.list,sel.pos+1);};
setup();setMode("practice");
var m=location.hash.match(/^#g(\d+)$/);if(m&&G[+m[1]])grade=+m[1];if(location.hash==="#topics")view="subject";
render();
})();
