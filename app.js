'use strict';
const choices=[{amount:'1억원',p:1},{amount:'4억원',p:.52},{amount:'30억원',p:.23},{amount:'1조원',p:.08}];
const $=selector=>document.querySelector(selector);
const buttons=[...document.querySelectorAll('.choice')];
const key='money-buttons-daily-v1';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const day=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
let busy=false,timer;
function readToday(){
 const valid=r=>r&&r.day===day()&&Number.isInteger(r.index)&&r.index>=0&&r.index<4&&typeof r.won==='boolean';
 const record=JSON.parse(localStorage.getItem(key)||'null');if(valid(record))return record;
 const prior=JSON.parse(localStorage.getItem('choice-lab-daily-v1')||'null');return valid(prior)&&prior.problem==='original'?prior:null;
}
function refresh(){let record=null,storageOK=true;try{record=readToday();}catch{storageOK=false;}
 buttons.forEach(el=>el.disabled=busy||!storageOK||!!record);$('#today-result').hidden=!record;$('#today-result').disabled=busy;
 $('#daily-status').textContent=!storageOK?'하루 한 번의 선택을 위해 브라우저 저장을 허용해 주세요.':record?'오늘 선택 완료. 다음 기회는 한국시간 자정.':'';
}
async function claim(index){const commit=()=>{const prior=readToday();if(prior)return prior;const r={day:day(),index,won:crypto.getRandomValues(new Uint32Array(1))[0]/4294967296<choices[index].p};localStorage.setItem(key,JSON.stringify(r));return r;};return navigator.locks?navigator.locks.request(key,commit):commit();}
function showResult(r,replay=false){
 const c=choices[r.index],result=$('#learning-result');result.dataset.problem='original';result.style.setProperty('--learning-art-position',`${(r.won?r.index:4)*25}%`);result.dataset.outcome=r.won?'received':'empty';result.dataset.phase='drawing';$('#learning-tag').textContent='추첨 중…';$('#learning-title').textContent='잠시 기다려 주세요';$('#learning-description').textContent='당신의 선택은 저장됐습니다.';$('#result-ok').disabled=true;result.showModal();
 timer=setTimeout(()=>{if(!result.open)return;result.dataset.phase='revealed';$('#learning-tag').textContent=r.won?(r.index===3?'JACKPOT!':'당첨!'):'아쉽지만…';$('#learning-title').textContent=r.won?c.amount:'0원';$('#learning-description').textContent=`${c.p*100}% 확률 · ${r.won?c.amount+' 당첨':'이번 선택은 꽝'}`;$('#result-ok').disabled=false;$('#result-ok').focus({preventScroll:true});},replay||reduced.matches?120:1200);
}
buttons.forEach((el,i)=>el.addEventListener('click',async()=>{if(busy||el.disabled)return;busy=true;refresh();try{showResult(await claim(i));}catch{busy=false;refresh();$('#daily-status').textContent='선택을 저장하지 못했습니다. 브라우저 저장 설정을 확인해 주세요.';}}));
$('#today-result').addEventListener('click',()=>{if(busy)return;try{const r=readToday();if(r){busy=true;refresh();showResult(r,true);}}catch{refresh();}});
$('#result-ok').addEventListener('click',()=>$('#learning-result').close());
$('#learning-result').addEventListener('close',()=>{clearTimeout(timer);busy=false;refresh();});
window.addEventListener('storage',refresh);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});setInterval(refresh,30000);refresh();
