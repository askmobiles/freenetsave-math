/* freenetsave math quiz and test maker. Questions are made on the visitor's device. Nothing is saved or sent. */
(function(){
"use strict";
var F=window.FNS_MATH,G=F.G,M="−";
var $=function(id){return document.getElementById(id);};
var keep=false,grade=1,chosen={},opt={n:20,l:"medium",m:"test",tm:0},seed=0,qs=[],ans=[],done=false,timer=null,left=0;
var LVN={easy:"Easy",medium:"Medium",hard:"Hard",mixed:"Mixed"};

function esc(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function key(g,i){return g+"."+i;}
function topic(k){var p=k.split(".");return {g:+p[0],i:+p[1],t:G[+p[0]][+p[1]]};}
function selKeys(){return Object.keys(chosen).filter(function(k){return chosen[k];}).sort(function(a,b){var x=topic(a),y=topic(b);return x.g-y.g||x.i-y.i;});}
function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function show(a){return String(a).replace(/-/g,M);}
function ansText(q){return q.s?show(q.s):(q.a<0?M+Math.abs(q.a):String(q.a));}
function parse(t){t=String(t).replace(/−/g,"-").replace(/[\s,]/g,"");if(t===""||t==="-")return null;var p=t.split("/");if(p.length===2){var a=parseFloat(p[0]),b=parseFloat(p[1]);if(isNaN(a)||isNaN(b)||b===0)return null;return a/b;}var v=parseFloat(t);return isNaN(v)?null:v;}
function clean(t){return String(t).replace(/−/g,"-").replace(/\s/g,"");}
function isRight(t,q){if(q.x)return clean(t)===clean(q.s);var v=parse(t);return v!==null&&Math.abs(v-q.a)<1e-6;}
function cx(q){var t=String(q.q||"").replace(/<[^>]+>/g," ")+" "+(q.s||String(q.a)),ns=t.match(/\d+(\.\d+)?/g)||[],sc=ns.length*0.5;ns.forEach(function(x){sc+=x.replace(".","").length+(x.indexOf(".")>-1?2:0);});try{sc+=(t.match(/\p{Extended_Pictographic}/gu)||[]).length*0.4;}catch(e){}return sc+((t.match(/[−-]/g)||[]).length+(t.match(/\//g)||[]).length)*1.5;}
function R(a,b){return a+Math.floor(Math.random()*(b-a+1));}
function make(tp,lv){
  if(lv==="mixed")lv=["easy","medium","hard"][R(0,2)];
  if(lv==="medium")return tp.t.f();
  var c=[];for(var i=0;i<6;i++){var z=tp.t.f();c.push([cx(z),Math.random(),z]);}
  c.sort(function(a,b){return a[0]-b[0]||a[1]-b[1];});
  return lv==="easy"?c[R(0,1)][2]:c[R(4,5)][2];
}
function build(){
  var ks=selKeys(),out=[],seen={},real=Math.random;
  Math.random=rng(seed);
  try{
    var order=ks.slice();for(var i=order.length-1;i>0;i--){var j=R(0,i),t=order[i];order[i]=order[j];order[j]=t;}
    for(var n=0;n<opt.n;n++){
      var tp=topic(order[n%order.length]),q=null;
      for(var tries=0;tries<25;tries++){q=make(tp,opt.l);if(!seen[q.q])break;}
      seen[q.q]=1;q.tp=tp;out.push(q);
    }
  }finally{Math.random=real;}
  return out;
}

/* ----- setup ----- */
function renderGrades(){
  var box=$("qgrades");box.innerHTML="";
  for(var g=1;g<=12;g++){var b=document.createElement("button");b.type="button";b.textContent=g;b.setAttribute("aria-label","Grade "+g);b.setAttribute("aria-pressed",String(g===grade));b.dataset.g=g;
    var c=selKeys().filter(function(k){return +k.split(".")[0]===+b.dataset.g;}).length;if(c){var s=document.createElement("sup");s.textContent=c;b.appendChild(s);}
    b.onclick=function(){grade=+this.dataset.g;renderAll();};box.appendChild(b);}
}
function groups(){var cs=[];G[grade].forEach(function(t,i){var k=cs.filter(function(c){return c.c===t.c;})[0];if(!k){k={c:t.c,items:[]};cs.push(k);}k.items.push(i);});return cs;}
function renderTopics(){
  var box=$("qtopics");box.innerHTML="";
  groups().forEach(function(gr){
    var d=document.createElement("div");d.className="qg";
    var all=gr.items.every(function(i){return chosen[key(grade,i)];});
    var h=document.createElement("label");h.className="qgh";var cb=document.createElement("input");cb.type="checkbox";cb.checked=all;
    cb.onchange=function(){var on=this.checked;gr.items.forEach(function(i){chosen[key(grade,i)]=on;});keep=false;renderAll();};
    h.appendChild(cb);var sp=document.createElement("span");sp.textContent=gr.c;h.appendChild(sp);var sm=document.createElement("small");sm.textContent=gr.items.length+" topic"+(gr.items.length>1?"s":"");h.appendChild(sm);d.appendChild(h);
    var ul=document.createElement("div");ul.className="qgl";
    gr.items.forEach(function(i){var t=G[grade][i],l=document.createElement("label");l.className="qt";var c=document.createElement("input");c.type="checkbox";c.checked=!!chosen[key(grade,i)];c.onchange=function(){chosen[key(grade,i)]=this.checked;keep=false;renderAll();};
      var w=document.createElement("span");var b=document.createElement("b");b.textContent=t.t;w.appendChild(b);if(t.d){var e=document.createElement("em");e.textContent=t.d;w.appendChild(e);}l.appendChild(c);l.appendChild(w);ul.appendChild(l);});
    d.appendChild(ul);box.appendChild(d);
  });
}
function renderSamples(){
  var box=$("qsamples");box.innerHTML="";
  var add=function(title,sub,ks,n,l,m){var b=document.createElement("button");b.type="button";b.className="qs";b.innerHTML="<b>"+esc(title)+"</b><span>"+esc(sub)+"</span>";b.onclick=function(){chosen={};ks.forEach(function(k){chosen[k]=true;});opt.n=n;opt.l=l;opt.m=m;opt.tm=0;newSeed();renderAll();start();};box.appendChild(b);};
  var allK=G[grade].map(function(t,i){return key(grade,i);});
  add("Grade "+grade+" practice test","All topics · 30 questions · mixed levels",allK,30,"mixed","test");
  add("Grade "+grade+" quick quiz","All topics · 10 questions · medium",allK,10,"medium","quiz");
  groups().forEach(function(gr){add(gr.c+" unit test","Grade "+grade+" · "+Math.min(20,Math.max(10,gr.items.length*4))+" questions · medium",gr.items.map(function(i){return key(grade,i);}),Math.min(20,Math.max(10,gr.items.length*4)),"medium","test");});
}
function renderOpts(){
  [["qn","n"],["ql","l"],["qm","m"],["qtm","tm"]].forEach(function(p){[].forEach.call($(p[0]).querySelectorAll("button"),function(b){b.setAttribute("aria-pressed",String(String(opt[p[1]])===b.dataset.v));});});
  var ks=selKeys(),gs=[];ks.forEach(function(k){var g=k.split(".")[0];if(gs.indexOf(g)<0)gs.push(g);});
  $("qsum").textContent=ks.length?ks.length+" topic"+(ks.length>1?"s":"")+" chosen from Grade"+(gs.length>1?"s ":" ")+gs.join(", "):"No topics chosen yet. Tick at least one topic, or pick a ready-made test below.";
  ["qstart","qprint","qlink"].forEach(function(id){$(id).disabled=!ks.length;});
  $("qmdesc").textContent=opt.m==="quiz"?"Quiz: check each answer as you go and see how it is worked out.":"Test: answer everything, then hand it in to see your mark and the worked answers.";
}
function renderAll(){renderGrades();$("qgH").textContent="Grade "+grade+" topics";renderTopics();renderSamples();renderOpts();}
function newSeed(){seed=Math.floor(Math.random()*900000)+100000;}
function bindOpts(){
  [["qn","n",true],["ql","l"],["qm","m"],["qtm","tm",true]].forEach(function(p){$(p[0]).addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;opt[p[1]]=p[2]?+b.dataset.v:b.dataset.v;keep=false;renderOpts();});});
  $("qall").onclick=function(){G[grade].forEach(function(t,i){chosen[key(grade,i)]=true;});keep=false;renderAll();};
  $("qnone").onclick=function(){chosen={};keep=false;renderAll();};
  $("qstart").onclick=function(){if(!keep)newSeed();keep=false;start();};
  $("qprint").onclick=function(){if(!keep)newSeed();keep=true;qs=build();printSheet();};
  $("qlink").onclick=copyLink;
}
function linkURL(){return location.origin+location.pathname+"#t="+selKeys().join(",")+"&n="+opt.n+"&l="+opt.l+"&m="+opt.m+"&tm="+opt.tm+"&s="+seed;}
function copyLink(){if(!keep){newSeed();keep=true;}var u=linkURL(),done=function(){var b=$("qlink"),o=b.textContent;b.textContent="Link copied";setTimeout(function(){b.textContent=o;},1800);};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(u).then(done,function(){window.prompt("Copy this link:",u);});}else window.prompt("Copy this link:",u);}
function readHash(){
  var h=location.hash.replace(/^#/,"");if(!h)return false;var p={};h.split("&").forEach(function(x){var kv=x.split("=");p[kv[0]]=decodeURIComponent(kv[1]||"");});
  if(p.g&&!p.t){var g=+p.g;if(g>=1&&g<=12)grade=g;return false;}
  if(!p.t)return false;chosen={};
  p.t.split(",").forEach(function(k){var a=k.split("."),g=+a[0],i=+a[1];if(G[g]&&G[g][i])chosen[key(g,i)]=true;});
  var ks=selKeys();if(!ks.length)return false;grade=topic(ks[0]).g;
  if([10,15,20,30,40].indexOf(+p.n)>-1)opt.n=+p.n;if(LVN[p.l])opt.l=p.l;if(p.m==="quiz"||p.m==="test")opt.m=p.m;if([0,10,20,30,45].indexOf(+p.tm)>-1)opt.tm=+p.tm;
  seed=+p.s||0;if(!seed)newSeed();keep=true;return true;
}

/* ----- taking the quiz or test ----- */
var inRun=false;
function screen(n){$("qsetup").style.display=n==="setup"?"":"none";$("qrun").style.display=n==="run"?"":"none";$("qres").style.display=n==="res"?"":"none";
  if(n!=="setup"&&!inRun){try{history.pushState({q:1},"",location.href);}catch(e){}inRun=true;}if(n==="setup")inRun=false;
  window.scrollTo({top:Math.max(0,$("qmain").getBoundingClientRect().top+window.pageYOffset-10),behavior:"auto"});}
function title(){var ks=selKeys(),gs=[];ks.forEach(function(k){var g=k.split(".")[0];if(gs.indexOf(g)<0)gs.push(g);});return (opt.m==="quiz"?"Math quiz":"Math test")+": Grade"+(gs.length>1?"s ":" ")+gs.join(", ")+" · "+LVN[opt.l];}
function start(){
  if(!selKeys().length)return;qs=build();ans=qs.map(function(){return {v:"",checked:false,ok:null};});done=false;
  $("rtitle").textContent=title();$("rsub").textContent=qs.length+" questions · "+selKeys().length+" topic"+(selKeys().length>1?"s":"")+" · Test code "+seed;
  var box=$("rlist");box.innerHTML="";
  qs.forEach(function(q,i){
    var c=document.createElement("div");c.className="rq";c.id="rq"+i;
    c.innerHTML='<div class="rqh"><span class="rnum">'+(i+1)+'</span><span class="rtp">'+esc(q.tp.t.t)+'</span></div><div class="rqq">'+q.q+'</div>';
    var row=document.createElement("div");row.className="rrow";
    var inp=document.createElement("input");inp.type="text";inp.autocomplete="off";inp.setAttribute("inputmode","text");inp.setAttribute("aria-label","Answer to question "+(i+1));inp.placeholder="Your answer";
    inp.oninput=function(){ans[i].v=this.value;progress();};
    inp.onkeydown=function(e){if(e.key==="Enter"){e.preventDefault();if(opt.m==="quiz")checkOne(i);else{var nx=$("rq"+(i+1));if(nx)nx.querySelector("input").focus();}}};
    row.appendChild(inp);
    if(opt.m==="quiz"){var b=document.createElement("button");b.type="button";b.className="rchk";b.textContent="Check";b.onclick=function(){checkOne(i);};row.appendChild(b);}
    c.appendChild(row);var fb=document.createElement("div");fb.className="rfb";c.appendChild(fb);box.appendChild(c);
  });
  $("rsubmit").textContent=opt.m==="quiz"?"Finish and see my score":"Hand in my test";
  stopClock();if(opt.tm){left=opt.tm*60;tick();timer=setInterval(tick,1000);$("rclock").style.display="";}else $("rclock").style.display="none";
  progress();screen("run");
}
function tick(){var m=Math.floor(left/60),s=left%60;$("rclock").textContent=m+":"+(s<10?"0":"")+s;$("rclock").classList.toggle("low",left<=60);if(left<=0){stopClock();finish(true);return;}left--;}
function stopClock(){if(timer){clearInterval(timer);timer=null;}}
function progress(){var a=ans.filter(function(x){return x.v.trim()!=="";}).length;$("rprog").textContent=a+" of "+qs.length+" answered";$("rbar").style.width=(qs.length?a/qs.length*100:0)+"%";}
function checkOne(i){
  var q=qs[i],a=ans[i],c=$("rq"+i),fb=c.querySelector(".rfb");
  if(parse(a.v)===null&&!q.x){fb.className="rfb warn";fb.textContent="Type an answer first.";return;}
  if(a.checked)return;a.checked=true;a.ok=isRight(a.v,q);
  c.classList.add(a.ok?"ok":"no");c.querySelector("input").disabled=true;var b=c.querySelector(".rchk");if(b)b.disabled=true;
  fb.className="rfb "+(a.ok?"good":"bad");fb.innerHTML=(a.ok?"<b>Correct!</b> ":"<b>Not quite.</b> The answer is <b>"+esc(ansText(q))+"</b>. ")+(q.h?"<span>"+esc(q.h)+"</span>":"");
}
function finish(timeUp){
  if(done)return;done=true;stopClock();
  var right=0,by={};
  qs.forEach(function(q,i){var a=ans[i];if(!a.checked){a.ok=a.v.trim()!==""&&isRight(a.v,q);}if(a.ok)right++;var k=q.tp.g+"|"+q.tp.t.t;by[k]=by[k]||{t:q.tp.t.t,g:q.tp.g,key:key(q.tp.g,q.tp.i),r:0,n:0};by[k].n++;if(a.ok)by[k].r++;});
  var pct=Math.round(right/qs.length*100);
  $("xscore").textContent=right+" / "+qs.length;$("xpct").textContent=pct+"%";
  $("xmsg").textContent=(timeUp?"Time is up. ":"")+(pct>=90?"Excellent work!":pct>=75?"Great job!":pct>=60?"Good effort. Review the ones you missed.":"Keep practising. Look at the worked answers below.");
  $("xtitle").textContent=title();
  var tb=$("xtopics");tb.innerHTML="";var weak=[];
  Object.keys(by).forEach(function(k){var o=by[k],r=document.createElement("div");r.className="xt";var p=Math.round(o.r/o.n*100);if(p<75)weak.push(o.key);
    r.innerHTML="<span>"+esc(o.t)+(selKeys().some(function(z){return topic(z).g!==o.g;})?" <small>Grade "+o.g+"</small>":"")+"</span><b>"+o.r+"/"+o.n+"</b><i><u style=\"width:"+p+"%\" class=\""+(p>=75?"g":p>=50?"m":"b")+"\"></u></i>";tb.appendChild(r);});
  $("xweak").style.display=weak.length?"":"none";
  $("xweak").onclick=function(){chosen={};weak.forEach(function(k){chosen[k]=true;});opt.m="quiz";newSeed();renderAll();start();};
  var rv=$("xreview");rv.innerHTML="";
  qs.forEach(function(q,i){var a=ans[i],d=document.createElement("div");d.className="xr "+(a.ok?"ok":"no");
    d.innerHTML='<div class="xrh"><span class="rnum">'+(i+1)+'</span><span class="rtp">'+esc(q.tp.t.t)+'</span><b>'+(a.ok?"✓ Correct":"✗ "+(a.v.trim()?"Your answer: "+esc(a.v):"Not answered"))+'</b></div><div class="rqq">'+q.q+'</div><p class="xa">Answer: <b>'+esc(ansText(q))+'</b></p>'+(q.h?'<p class="xh">'+esc(q.h)+'</p>':"");rv.appendChild(d);});
  screen("res");
}

/* ----- printing ----- */
function printSheet(){
  var t=title(),h='<table class="prt"><thead><tr><td><div class="prh">freenetsave.com · Free math tests and worksheets</div></td></tr></thead><tfoot><tr><td><div class="prf">freenetsave.com</div></td></tr></tfoot><tbody><tr><td><div class="ps"><div class="pst"><h2>'+esc(t)+'</h2><span>Test code '+seed+'</span></div><div class="psm"><span>Name<i></i></span><span>Date<i></i></span><span>Score<i class="sm"></i>/ '+qs.length+'</span></div><ol class="psq">';
  qs.forEach(function(q,i){h+='<li><b>'+(i+1)+'.</b><span>'+q.q+'</span><u></u></li>';});
  h+='</ol><p class="pfoot">© freenetsave.com · Free to print for home and classroom use. Do not repost online.</p></div></td></tr></tbody></table>';
  if($("pkey").checked){h+='<table class="prt"><thead><tr><td><div class="prh">freenetsave.com · Free math tests and worksheets</div></td></tr></thead><tfoot><tr><td><div class="prf">freenetsave.com</div></td></tr></tfoot><tbody><tr><td><div class="ps pkey"><div class="pst"><h2>Answer key</h2><span>Test code '+seed+'</span></div><ol class="psk">';qs.forEach(function(q,i){h+='<li><b>'+(i+1)+'.</b> '+esc(ansText(q))+'</li>';});h+='</ol><p class="pfoot">© freenetsave.com</p></div></td></tr></tbody></table>';}
  $("qprintout").innerHTML=h;setTimeout(function(){window.print();},60);
}

/* ----- start up ----- */
function init(){
  if(!F||!G){return;}
  var fromLink=readHash();bindOpts();
  $("rsubmit").onclick=function(){var miss=ans.filter(function(x){return x.v.trim()==="";}).length;if(miss&&!window.confirm(miss+" question"+(miss>1?"s are":" is")+" not answered yet. Hand in anyway?"))return;finish(false);};
  $("rback").onclick=function(){history.back();};
  $("xagain").onclick=function(){newSeed();start();};
  $("xsame").onclick=function(){start();};
  $("xsetup").onclick=function(){history.back();};
  $("xprint").onclick=function(){printSheet();};
  window.addEventListener("popstate",function(){if(inRun){stopClock();inRun=false;screen("setup");renderAll();}});
  if(!seed)newSeed();renderAll();
  if(fromLink){$("qfrom").style.display="";}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
