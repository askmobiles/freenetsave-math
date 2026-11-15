/* freenetsave math practice — practice, fun challenge and printable worksheets. Nothing is saved or sent. */
(function(){
"use strict";
var F=window.FNS_MATH,G=F.G,n=F.n,pick=F.pick,R=F.R,M="−";
var $=function(id){return document.getElementById(id);};
var grade=1,mode="practice",topic=0;           // topic: index or "mix"
var list=[],idx=0,right=0,cur=null,typed="",locked=false,results=[],missed=[];
var ch={on:false,left:60,score:0,streak:0,best:0,count:0,timer:null,wait:null},sessionBest={};

function gen(){var t=topic==="mix"?pick(G[grade]):G[grade][topic];return t.f();}
function many(k){var seen={},out=[],tries=0;while(out.length<k&&tries<k*40){var q=gen();tries++;if(seen[q.q]&&tries<k*30)continue;seen[q.q]=1;out.push(q);}return out;}
function topicName(){return topic==="mix"?"Mix of everything":G[grade][topic].t;}
function show(a){return a.replace(/-/g,M);}
function ansText(q){return q.s?show(q.s):n(q.a);}
function parse(t){if(t===""||t==="-")return null;var p=t.split("/");if(p.length===2){var a=parseFloat(p[0]),b=parseFloat(p[1]);if(isNaN(a)||isNaN(b)||b===0)return null;return a/b;}var v=parseFloat(t);return isNaN(v)?null:v;}
function isRight(t,q){if(q.x)return t===q.s;var v=parse(t);return v!==null&&Math.abs(v-q.a)<1e-6;}

/* ----- picker ----- */
function showGrades(){var box=$("grades");for(var g=1;g<=12;g++){var b=document.createElement("button");b.type="button";b.textContent=g;b.setAttribute("aria-pressed","false");b.setAttribute("aria-label","Grade "+g);b.dataset.g=g;b.onclick=function(){setGrade(+this.dataset.g);};box.appendChild(b);}}
function setGrade(g){
  grade=g;
  [].forEach.call($("grades").children,function(b){b.setAttribute("aria-pressed",String(+b.dataset.g===g));});
  var box=$("topics");box.innerHTML="";
  var cats=[],by={};
  G[g].forEach(function(tp,i){if(!by[tp.c]){by[tp.c]=[];cats.push(tp.c);}by[tp.c].push(i);});
  function grid(){var d=document.createElement("div");d.className="tgrid";box.appendChild(d);return d;}
  function btn(par,title,desc,val,cls){var b=document.createElement("button");b.type="button";if(cls)b.className=cls;var s=document.createElement("b");s.textContent=title;var e=document.createElement("span");e.textContent=desc;b.appendChild(s);b.appendChild(e);b.onclick=function(){launch(val);};par.appendChild(b);}
  var h=document.createElement("p");h.className="cat";h.textContent="Everything";box.appendChild(h);
  btn(grid(),"Mix of everything","All Grade "+g+" topics, shuffled","mix","mix");
  cats.forEach(function(c){var p=document.createElement("p");p.className="cat";p.textContent=c;box.appendChild(p);var gr=grid();by[c].forEach(function(i){btn(gr,G[g][i].t,G[g][i].d,i);});});
  try{history.replaceState(null,"","#g"+g);}catch(e){}
}
function setMode(m){mode=m;[].forEach.call($("modes").children,function(b){b.setAttribute("aria-pressed",String(b.dataset.m===m));});}
function launch(t){topic=t;if(mode==="sheet")openSheet();else if(mode==="challenge")startChallenge();else startPractice();}
function screen(name){
  stopClock();
  $("pick").style.display=name==="pick"?"":"none";
  $("play").classList.toggle("on",name==="play");
  $("done").classList.toggle("on",name==="done");
  $("sheetwrap").classList.toggle("on",name==="sheet");
  document.body.classList.toggle("playing",name==="play");
  var el={pick:"pick",play:"play",done:"done",sheet:"sheetwrap"}[name];
  var top=$(el).getBoundingClientRect().top+window.pageYOffset-10;
  window.scrollTo({top:name==="pick"?0:top,behavior:"auto"});
}

/* ----- practice ----- */
function startPractice(){
  ch.on=false;idx=0;right=0;results=[];missed=[];list=many(10);
  $("play").classList.remove("ch");
  $("tag").textContent="Grade "+grade+" · "+topicName();
  screen("play");showQ();
}
function dots(){var d=$("dots");d.innerHTML="";for(var i=0;i<10;i++){var e=document.createElement("i");if(results[i]===true)e.className="ok";else if(results[i]===false)e.className="no";else if(i===idx)e.className="now";d.appendChild(e);}}
function putQ(q){var el=$("q");el.innerHTML=q.q;el.classList.toggle("long",q.q.replace(/<[^>]+>/g,"").length>42);}
function showQ(){
  cur=list[idx];typed="";locked=false;
  $("qn").textContent="Question "+(idx+1)+" of 10";
  putQ(cur);$("ans").textContent="";
  $("fb").className="fb";$("fb").innerHTML="";
  $("go").textContent="Check";dots();
}
function feedback(ok,head,body){var fb=$("fb");fb.className="fb "+(ok?"ok":"no");fb.innerHTML="";var b=document.createElement("b");b.textContent=head;fb.appendChild(b);if(body){var s=document.createElement("span");s.textContent=body;fb.appendChild(s);}}
function check(){
  if(parse(typed)===null){feedback(false,"Type an answer first.","Use the number pad or a keyboard.");return;}
  var ok=isRight(typed,cur);
  if(!ok&&cur.x&&Math.abs(parse(typed)-cur.a)<1e-6){feedback(false,"Right value, but not the simplest form yet.","Divide the top and bottom by the same number and try again.");return;}
  results[idx]=ok;if(ok)right++;else missed.push({q:cur,yours:show(typed)});
  locked=true;
  feedback(ok,ok?pick(["Correct!","Right!","Well done!","Yes!","Nice work!"]):"Not quite. The answer is "+ansText(cur)+".",cur.h);
  $("go").textContent=idx===9?"See score":"Next";dots();
}
function next(){idx++;if(idx<10){showQ();return;}finishPractice();}
function stars(k){var s="";for(var i=0;i<3;i++)s+=i<k?"★":"<i>★</i>";$("stars").innerHTML=s;}
function finishPractice(){
  stars(right===10?3:(right>=8?2:(right>=5?1:0)));
  $("score").textContent=right+" / 10";
  $("doneMsg").textContent=right===10?"Perfect score!":(right>=8?"Great work!":(right>=5?"Good effort!":"Keep practising!"));
  $("doneSub").textContent="Grade "+grade+" · "+topicName()+". Every round has new questions.";
  review();screen("done");$("again").focus();
}
function review(){
  var box=$("review");box.innerHTML="";if(!missed.length)return;
  var h=document.createElement("h3");h.textContent="Have another look at these";box.appendChild(h);
  missed.slice(0,10).forEach(function(m){var d=document.createElement("div");d.innerHTML=m.q.q.replace(/<br>/g," &nbsp; ").replace(/<small>/g," <small>");var e=document.createElement("em");e.textContent="Answer: "+ansText(m.q)+". "+m.q.h;d.appendChild(e);box.appendChild(d);});
}

/* ----- fun challenge ----- */
function stopClock(){if(ch.timer){clearInterval(ch.timer);ch.timer=null;}if(ch.wait){clearTimeout(ch.wait);ch.wait=null;}}
function startChallenge(){
  ch.on=true;ch.left=60;ch.score=0;ch.streak=0;ch.best=0;ch.count=0;right=0;missed=[];
  $("play").classList.add("ch");
  $("tag").textContent="Grade "+grade+" · "+topicName();
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
  $("qcard").className="qcard";$("go").textContent="Enter";
}
function checkCh(){
  if(parse(typed)===null)return;
  var ok=isRight(typed,cur);locked=true;
  if(ok){right++;ch.streak++;ch.best=Math.max(ch.best,ch.streak);ch.score+=10+Math.min(ch.streak-1,5)*2;$("qcard").className="qcard flash-ok";}
  else{ch.streak=0;missed.push({q:cur,yours:show(typed)});$("qcard").className="qcard flash-no";feedback(false,"Answer: "+ansText(cur),"");}
  hud();
  ch.wait=setTimeout(function(){ch.wait=null;if(ch.on&&ch.timer)nextCh();},ok?280:1300);
}
function finishChallenge(){
  stopClock();ch.on=false;
  var key=grade+"|"+topic,prev=sessionBest[key]||0,isBest=ch.score>prev&&prev>0;
  if(ch.score>prev)sessionBest[key]=ch.score;
  stars(ch.score>=150?3:(ch.score>=80?2:(ch.score>=30?1:0)));
  $("score").textContent=ch.score;
  $("doneMsg").textContent=isBest?"New best this visit!":(ch.score>=150?"Lightning fast!":(ch.score>=80?"Great speed!":(ch.score>=30?"Nice run!":"Good try. Go again!")));
  $("doneSub").textContent=right+" correct in 60 seconds · best streak "+ch.best+(prev&&!isBest?" · your best this visit: "+prev:"")+". Grade "+grade+" · "+topicName()+".";
  review();screen("done");$("again").focus();
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
  var title="Grade "+grade+" Math: "+topicName();
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
function toTopics(){screen("pick");}
$("back").onclick=toTopics;$("other").onclick=toTopics;$("sback").onclick=toTopics;
$("again").onclick=function(){if(mode==="challenge")startChallenge();else startPractice();};
$("toSheet").onclick=function(){openSheet();};
$("modes").addEventListener("click",function(e){var b=e.target.closest("button");if(b)setMode(b.dataset.m);});
showGrades();
var m=location.hash.match(/^#g(\d+)$/);setGrade(m&&G[+m[1]]?+m[1]:1);
})();
