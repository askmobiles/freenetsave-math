/* freenetsave math lessons: worked examples, practice, matching game, test and challenge. Runs on the visitor's device; progress stays in this browser. */
(function(){
"use strict";
var L=window.LESSON,KEY="fns_math_lessons";
function $(s,r){return (r||document).querySelector(s);}
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")||{};}catch(e){return {};}}
function save(o){try{localStorage.setItem(KEY,JSON.stringify(o));}catch(e){}}
function mark(k,v){var o=load(),id=L.unit+"/"+L.slug;o[id]=o[id]||{};if(v===true||!(o[id][k]>=v))o[id][k]=v;save(o);paint();}
function paint(){var o=load();document.querySelectorAll("[data-done]").forEach(function(a){var p=a.getAttribute("data-done").split("|"),r=o[p[0]]||{};a.classList.toggle("isdone",p[1]==="test"?r.test>=8:!!r[p[1]]);});}
function norm(t){return String(t).replace(/−/g,"-").replace(/[\s,]/g,"");}
function parse(t){if(t===""||t==="-")return null;var p=t.split("/");if(p.length===2){var a=parseFloat(p[0]),b=parseFloat(p[1]);if(isNaN(a)||isNaN(b)||b===0)return null;return a/b;}var v=parseFloat(t);return isNaN(v)?null:v;}
function right(t,q){if(q.x)return t===q.s;var v=parse(t);return v!==null&&Math.abs(v-q.a)<1e-6;}
function ans(q){return q.x?q.s:String(q.a).replace("-","−");}
function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function topic(){if(!L||!window.FNS_MATH)return null;var g=window.FNS_MATH.G[L.g]||[];for(var i=0;i<g.length;i++)if(g[i].t===L.topic)return g[i];return null;}
function field(box,onEnter){var row=el("div","row"),inp=el("input");inp.type="text";inp.setAttribute("inputmode","decimal");inp.setAttribute("autocomplete","off");inp.setAttribute("aria-label","Your answer");
  row.appendChild(inp);[["−","-"],["/","/"]].forEach(function(k){var b=el("button","k",k[0]);b.type="button";b.setAttribute("aria-label",k[0]==="/"?"fraction bar":"minus sign");b.onclick=function(){inp.value+=k[1];inp.focus();};row.appendChild(b);});
  inp.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();onEnter();}});box.appendChild(row);return {inp:inp,row:row};}

/* ----- See: one more worked example from the question maker ----- */
function see(){var b=$("#seeMore"),out=$("#seeOut"),t=topic();if(!b||!t){if(b)b.hidden=true;return;}
  b.onclick=function(){var q=t.f();out.innerHTML='<div class="ex"><b class="q">'+q.q+'</b><p>'+q.h+'</p><p class="exans">Answer: '+ans(q)+'</p></div>';mark("see",true);};}

/* ----- Try and Test ----- */
function quiz(root,isTest){var t=topic();if(!root)return;if(!t){root.innerHTML="<p>The questions could not be loaded. Refresh the page.</p>";return;}
  var N=10,i=0,ok=0,cur=null,log=[],locked=false,ui={};
  function start(){i=0;ok=0;log=[];root.innerHTML="";ui.cnt=el("div","cnt");ui.bar=el("div","bar","<i></i>");ui.q=el("div","qq");root.appendChild(ui.cnt);root.appendChild(ui.bar);root.appendChild(ui.q);
    var f=field(root,act);ui.inp=f.inp;ui.go=el("button","btn2","Check");ui.go.type="button";ui.go.onclick=act;f.row.appendChild(ui.go);ui.fb=el("div");ui.fb.setAttribute("aria-live","polite");root.appendChild(ui.fb);next();}
  function next(){cur=t.f();locked=false;ui.cnt.textContent="Question "+(i+1)+" of "+N+(isTest?"":"   ·   "+ok+" right so far");ui.bar.firstChild.style.width=(i/N*100)+"%";ui.q.innerHTML=cur.q;ui.inp.value="";ui.inp.disabled=false;ui.go.textContent="Check";ui.fb.className="";ui.fb.innerHTML="";ui.inp.focus({preventScroll:true});}
  function act(){if(locked){i++;if(i>=N)return end();return next();}
    var v=norm(ui.inp.value);if(parse(v)===null){ui.fb.className="fb no";ui.fb.innerHTML="<b>Type an answer first.</b>";return;}
    var r=right(v,cur);if(!r&&cur.x&&Math.abs(parse(v)-cur.a)<1e-6){ui.fb.className="fb no";ui.fb.innerHTML="<b>Right value, but not in simplest form yet.</b>Divide the top and bottom by the same number and try again.";return;}
    if(r)ok++;log.push({q:cur,y:ui.inp.value,r:r});locked=true;ui.inp.disabled=true;ui.go.textContent=i+1>=N?"See my result":"Next question";
    ui.fb.className="fb "+(r?"ok":"no");ui.fb.innerHTML=isTest?"<b>"+(r?"Correct.":"Not quite.")+"</b>The steps are shown at the end.":"<b>"+(r?"Correct!":"Not quite. The answer is "+ans(cur)+".")+"</b>"+cur.h;ui.go.focus();}
  function end(){mark(isTest?"test":"try",ok);var pass=ok>=8,h='<div class="end"><b>'+ok+" out of "+N+"</b>";
    if(isTest)h+=pass?"You passed. This lesson is complete.":"You need 8 to pass. Look over the steps below, practise again, then retake the test.";else h+=ok>=8?"Strong work. You are ready for the test.":"Keep going. Read the worked examples again, then try another set.";
    h+="</div>";if(isTest||ok<N){h+='<ul class="rev">';log.forEach(function(x,k){if(isTest||!x.r)h+="<li><b>"+(k+1)+". "+x.q.q.replace(/<small>/g," <small>")+"</b> "+(x.r?"✓ ":"✗ You typed "+x.y+". ")+"Answer: "+ans(x.q)+".<br>"+x.q.h+"</li>";});h+="</ul>";}
    root.innerHTML=h;var b=el("button","btn2 alt",isTest?"Take the test again":"Practise 10 more");b.type="button";b.style.marginTop="12px";b.onclick=start;root.appendChild(b);
    if(isTest&&pass){var nb=$("#nextbox");if(nb){nb.hidden=false;nb.scrollIntoView({block:"nearest"});}}}
  var s=el("button","btn2"+(isTest?" or":""),isTest?"Start the test":"Start practising");s.type="button";s.onclick=start;root.appendChild(s);}

/* ----- Play: match the pairs ----- */
function match(root){if(!root||!L.game)return;
  function start(){root.innerHTML="";var A=el("div"),B=el("div"),sel=null,left=L.game.length,grid=el("div","mt"),msg=el("p");msg.setAttribute("aria-live","polite");msg.style.marginTop="10px";
    function mk(txt,id,side){var b=el("button","",txt);b.type="button";b.onclick=function(){if(b.classList.contains("hit"))return;
        if(!sel||sel.side===side){if(sel)sel.b.classList.remove("sel");sel={b:b,id:id,side:side};b.classList.add("sel");return;}
        if(sel.id===id){[b,sel.b].forEach(function(x){x.classList.remove("sel");x.classList.add("hit");x.disabled=true;});left--;msg.textContent=left?left+" to go.":"All matched. Well done!";if(!left){mark("play",true);var r=el("button","btn2 alt","Play again");r.type="button";r.style.marginTop="10px";r.onclick=start;root.appendChild(r);}}
        else{var o=sel.b;[b,o].forEach(function(x){x.classList.add("miss");});setTimeout(function(){[b,o].forEach(function(x){x.classList.remove("miss","sel");});},500);msg.textContent="Not a match. Try again.";}
        sel=null;};return b;}
    shuffle(L.game.map(function(p,k){return [p[0],k];})).forEach(function(p){A.appendChild(mk(p[0],p[1],"a"));});
    shuffle(L.game.map(function(p,k){return [p[1],k];})).forEach(function(p){B.appendChild(mk(p[0],p[1],"b"));});
    grid.appendChild(A);grid.appendChild(B);root.appendChild(grid);root.appendChild(msg);}
  start();}

/* ----- Challenge ----- */
function challenge(root){if(!root||!L.challenge)return;var solved=0;
  L.challenge.forEach(function(c,k){var d=el("div","ch qz"),p=el("p","q",(k+1)+". "+c.q);d.appendChild(p);var fb=el("div");fb.setAttribute("aria-live","polite");
    function act(){var v=norm(f.inp.value);if(parse(v)===null){fb.className="fb no";fb.innerHTML="<b>Type an answer first.</b>";return;}var r=Math.abs(parse(v)-c.a)<1e-6;fb.className="fb "+(r?"ok":"no");
      fb.innerHTML=r?"<b>Correct!</b>"+c.h:"<b>Not yet.</b>"+(d.tries?c.h+" The answer is "+(c.show||String(c.a).replace("-","\u2212"))+".":"Have another go. "+(c.hint||""));d.tries=1;if(r&&!d.ok){d.ok=1;solved++;if(solved===L.challenge.length)mark("challenge",true);}}
    var f=field(d,act),b=el("button","btn2","Check");b.type="button";b.onclick=act;f.row.appendChild(b);d.appendChild(fb);root.appendChild(d);});}

function unit(){var o=load();document.querySelectorAll(".ul a[data-id]").forEach(function(a){var r=o[a.getAttribute("data-id")]||{};if(r.test>=8){a.classList.add("isdone");var n=a.querySelector(".num");if(n)n.textContent="✓";var s=a.querySelector(".d");if(s)s.textContent+="  ·  Complete (best test score "+r.test+" out of 10)";}});}
function init(){if(L){see();quiz($("#try"),false);match($("#play"));quiz($("#test"),true);challenge($("#challenge"));var id=L.unit+"/"+L.slug,r=load()[id]||{};if(r.test>=8){var nb=$("#nextbox");if(nb)nb.hidden=false;}mark("learn",true);}else unit();}

(function(){if(!L||!L.topic)return;var nav=document.querySelector(".ls-steps");if(!nav)return;
 var st=document.createElement("style");st.textContent=".mbar2{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:10px 0 4px}.mbar2>span{font-weight:700;color:var(--muted,#5b6b85);font-size:14px;margin-right:4px}.mbar2 a{border:1.5px solid #dde5f2;background:#fff;border-radius:999px;padding:7px 13px;font-weight:700;font-size:15px;color:#172033;text-decoration:none}.mbar2 a:hover{border-color:#2563eb;color:#2563eb}.mbar2 a.on{background:#2563eb;border-color:#2563eb;color:#fff}@media print{.mbar2{display:none}}";document.head.appendChild(st);
 var base="/#t="+L.g+"/"+encodeURIComponent(L.topic)+"&m=";var d=document.createElement("div");d.className="mbar2";d.setAttribute("aria-label","Choose how you want to work");
 d.innerHTML="<span>Choose how you want to work:</span>"+[["#learn","📖 Learn",1],[base+"practice","✏️ Practice"],[base+"adaptive","📈 Adaptive"],[base+"challenge","⏱️ Fun challenge"],[base+"sheet","🖨️ Worksheet"]].map(function(x){return '<a href="'+x[0]+'"'+(x[2]?' class="on"':'')+'>'+x[1]+"</a>";}).join("");
 nav.parentNode.insertBefore(d,nav.nextSibling);})();
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
