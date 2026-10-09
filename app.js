'use strict';
const sets = {balanced:[{reward:2,p:1},{reward:4,p:.5},{reward:8,p:.25},{reward:20,p:.1}],original:[{reward:1,p:1},{reward:4,p:.52},{reward:30,p:.23},{reward:10000,p:.08}]};
let problem='balanced',choices=sets.balanced;
const label=(c,kind=problem)=>kind==='balanced'?`별 ${c.reward}개`:c.reward===10000?'1조원':`${c.reward}억원`;
const goalLabel=(id,kind=problem)=>kind==='balanced'?goals[id]:id==='need'?'1억원이 꼭 필요해요':'못 받아도 괜찮고, 큰 금액을 얻고 싶어요';
const meanLabel=(value,kind=problem)=>kind==='balanced'?`별 ${value}개`:`${value}억원`;
const key = 'choice-lab-daily-v1';
const $ = selector => document.querySelector(selector);
const buttons = [...document.querySelectorAll('.choice')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const day = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
let mode='practice', selected=0, busy=false, timer, reflectedRecord;
const trialsByProblem={balanced:sets.balanced.map(()=>({runs:0,wins:0})),original:sets.original.map(()=>({runs:0,wins:0}))};
let trials=trialsByProblem.balanced;
const goals={need:'별 2개가 꼭 필요해요',bonus:'별을 못 받아도 괜찮고, 많이 받고 싶어요'};
function readToday() {
 const r=JSON.parse(localStorage.getItem(key)||'null');
 return r && r.day===day() && Object.hasOwn(sets,r.problem) && Number.isInteger(r.index) && r.index>=0 && r.index<4 && typeof r.won==='boolean' && typeof r.reason==='string' && Object.hasOwn(goals,r.goal) ? r:null;
}
function renderTrials() {
 $('#experiments').replaceChildren(...choices.map((c,i)=>{const row=document.createElement('tr');const t=trials[i];for(const value of [`${label(c)} · ${c.p*100}%`,t.runs,Number((t.runs*c.p).toFixed(1)),t.wins,t.runs?(t.wins*c.reward/t.runs).toFixed(2):'—']){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}return row;}));
}
function renderReflection(r) {
 reflectedRecord=r;$('#reflection').hidden=!r;
 if(!r)return;
 $('#decision-recap').textContent=`내 목표: ${goalLabel(r.goal,r.problem)} / ${label(sets[r.problem][r.index],r.problem)} 버튼 / 받은 보상: ${r.won?label(sets[r.problem][r.index],r.problem):r.problem==='balanced'?'별 0개':'0원'} / 선택 이유: ${r.reason}`;
 const reflection=r.reflection||{};
 $('#understood').checked=reflection.understood===true;$('#matched').checked=reflection.matched===true;$('#reflection-text').value=typeof reflection.text==='string'?reflection.text:'';
}
function refresh() {
 let record=null,storageOK=true;try{record=readToday();}catch{storageOK=false;}
 if(mode==='decision'&&record){problem=record.problem;choices=sets[problem];trials=trialsByProblem[problem];$('#problem').value=problem;selected=record.index;$('#goal').value=record.goal;$('#reason').value=record.reason;setGoal();}
 $('#problem').disabled=mode==='decision'&&!!record;$('#goal').disabled=!!record;
 renderProblem();$('#reason').readOnly=!!record;
 buttons.forEach((button,i)=>{button.disabled=busy || mode==='decision'&&(!storageOK||!!record);button.setAttribute('aria-pressed',String(selected===i));});
 const c=choices[selected];$('#selection-info').textContent=`선택: ${label(c)} · 성공 ${c.p*100}% · 못 받을 확률 ${100-c.p*100}% · 기대값 ${meanLabel(Number((c.reward*c.p).toFixed(2)))}`;
 $('#review-choice').disabled=busy||!storageOK||!!record;
 $('#today-result').hidden=!record;$('#today-result').disabled=busy;
 $('#daily-status').textContent=!storageOK?'하루 한 번의 결정을 저장하려면 브라우저 저장 기능이 필요해요. 연습은 할 수 있어요.':record?'오늘의 결정은 저장됐어요. 내일 새 기회가 생겨요.':'오늘의 결정 기회가 남아 있어요.';
 if((record?.day)!==reflectedRecord?.day || (record?.reason)!==reflectedRecord?.reason)renderReflection(record);
}
function setMode(next) {
 mode=next;document.querySelectorAll('[data-mode]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.mode===mode)));
 $('#practice').hidden=mode!=='practice';$('#practice-tools').hidden=mode!=='practice';$('#decision').hidden=mode!=='decision';$('#decision-tools').hidden=mode!=='decision';refresh();
}
function setGoal() { $('#goal-context').textContent=$('#goal').value==='need'?'못 받으면 목표를 이루지 못해요. 확실함을 얼마나 중요하게 생각하나요?':'보상을 못 받아도 괜찮은 상황이에요. 큰 보상과 실패 가능성을 함께 비교해 보세요.'; }
buttons.forEach((button,i)=>button.addEventListener('click',()=>{if(busy)return;selected=i;refresh();}));
document.querySelectorAll('[data-mode]').forEach(el=>el.addEventListener('click',()=>setMode(el.dataset.mode)));
$('#goal').addEventListener('change',setGoal);
document.querySelectorAll('[data-runs]').forEach(el=>el.addEventListener('click',()=>{
 const n=Number(el.dataset.runs),t=trials[selected],c=choices[selected];if(t.runs+n>100000){$('#experiment-message').textContent='연습 기록을 지운 뒤 새 실험을 시작해 주세요.';return;}
 const random=crypto.getRandomValues(new Uint32Array(n));let wins=0;for(const value of random)if(value/4294967296<c.p)wins++;t.runs+=n;t.wins+=wins;renderTrials();$('#experiment-message').textContent=`이번 ${n}번: 예상 성공 ${n*c.p}번, 실제 성공 ${wins}번. 차이가 났어도 확률이 바뀐 것은 아니에요.`;
}));
$('#reset-practice').addEventListener('click',()=>{trials=choices.map(()=>({runs:0,wins:0}));trialsByProblem[problem]=trials;renderTrials();$('#experiment-message').textContent='새 실험을 해보세요.';});
$('#review-choice').addEventListener('click',()=>{
 if(!$('#reason').value.trim()){$('#reason').setCustomValidity('선택한 이유를 한 문장으로 적어 주세요.');$('#reason').reportValidity();return;}
 $('#reason').setCustomValidity('');const c=choices[selected];$('#confirm-summary').textContent=`목표: ${goalLabel($('#goal').value)} / ${label(c)} · 성공 ${c.p*100}% · 못 받음 ${100-c.p*100}%`;
 $('#confirm-reason').textContent=$('#reason').value.trim();$('#confirm-choice').returnValue='cancel';$('#confirm-choice').showModal();
});
$('#reason').addEventListener('input',()=>$('#reason').setCustomValidity(''));
async function commit() {
 const claim=()=>{const prior=readToday();if(prior)return prior;const c=choices[selected];const r={day:day(),problem,index:selected,won:crypto.getRandomValues(new Uint32Array(1))[0]/4294967296<c.p,goal:$('#goal').value,reason:$('#reason').value.trim().slice(0,240)};localStorage.setItem(key,JSON.stringify(r));return r;};
 return navigator.locks?navigator.locks.request(key,claim):claim();
}
$('#confirm-choice').addEventListener('close',async()=>{
 if($('#confirm-choice').returnValue!=='commit'||busy)return;busy=true;refresh();try{const record=await commit();renderReflection(record);showResult(record,false);}catch{busy=false;$('#daily-status').textContent='결정을 저장하지 못했어요. 저장 설정을 확인한 뒤 다시 시도해 주세요.';buttons.forEach(el=>el.disabled=true);}
});
function showResult(record,replay) {
 const c=sets[record.problem][record.index];const result=$('#learning-result');result.dataset.problem=record.problem;result.style.setProperty('--learning-art-position',`${(record.won?record.index:4)*25}%`);result.dataset.phase='drawing';result.dataset.outcome=record.won?'received':'empty';$('#learning-tag').textContent='선택을 확인하는 중…';$('#learning-title').textContent='잠시 기다려 주세요';$('#learning-description').textContent='선택은 저장됐어요. 결과를 기다려요.';$('#result-ok').disabled=true;result.showModal();
 timer=setTimeout(()=>{if(!result.open)return;result.dataset.phase='revealed';$('#learning-tag').textContent='오늘의 선택 완료';$('#learning-title').textContent=record.won?`가상 보상 ${label(c,record.problem)}${record.problem==='balanced'?'를':'을'} 받았어요`:'이번에는 보상을 받지 못했어요';$('#learning-description').textContent=`성공 확률 ${c.p*100}% · 받은 보상 ${record.won?label(c,record.problem):record.problem==='balanced'?'별 0개':'0원'}`;$('#result-ok').disabled=false;$('#result-ok').focus({preventScroll:true});},replay||reduced.matches?120:1000);
}
$('#result-ok').addEventListener('click',()=>$('#learning-result').close());
$('#learning-result').addEventListener('close',()=>{clearTimeout(timer);busy=false;refresh();});
$('#today-result').addEventListener('click',()=>{try{const r=readToday();if(r&&!busy){busy=true;showResult(r,true);}}catch{refresh();}});
$('#save-reflection').addEventListener('click',async()=>{
 const save=()=>{const current=readToday();if(!current||!reflectedRecord||current.day!==reflectedRecord.day)throw new Error('day-changed');current.reflection={understood:$('#understood').checked,matched:$('#matched').checked,text:$('#reflection-text').value.trim().slice(0,400)};localStorage.setItem(key,JSON.stringify(current));reflectedRecord=current;};
 try{if(navigator.locks)await navigator.locks.request(key,save);else save();$('#reflection-status').textContent='생각을 저장했어요. 결과보다 판단의 근거를 기억해요.';}catch{$('#reflection-status').textContent='날짜가 바뀌었거나 저장할 수 없어요. 오늘 결정을 다시 확인해 주세요.';refresh();}
});
window.addEventListener('storage',()=>{reflectedRecord=undefined;refresh();});window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});setInterval(refresh,30000);
function renderProblem() {
 $('.panel').setAttribute('aria-label',problem==='balanced'?'별 보상 선택':'가상 금액 선택');
 $('#experiments').closest('table').querySelector('th:last-child').textContent=problem==='balanced'?'평균 별 (개)':'평균 금액 (억원)';
 buttons.forEach((b,i)=>{b.querySelector('strong').textContent=label(choices[i]);b.querySelector('.chance').textContent=`${choices[i].p*100}% 확률`;});
 $('#goal').options[0].textContent=goalLabel('need');$('#goal').options[1].textContent=goalLabel('bonus');
 $('#problem-insight').textContent=problem==='balanced'?'네 선택의 기대값은 모두 별 2개. 목표와 위험 감수 정도를 비교해요.':'원래 문제: 기대값은 1억, 2.08억, 6.9억, 800억원. 평균이 커도 0원을 감수할 수 있는지는 다른 질문이에요.';
 $('#expected-heading').textContent=problem==='balanced'?'왜 네 선택의 기대값이 같을까요?':'1조원 버튼이 언제나 최선일까요?';
 $('#expected-explanation').textContent=problem==='balanced'?'보상 × 성공 확률은 모두 별 2개예요. 별 20개 × 10%도 별 2개예요. 한 번 선택해서 반드시 별 2개를 받는다는 뜻은 아니에요.':'1조원 × 8%의 기대값은 800억원이지만, 한 번 선택하면 1조원 또는 0원이에요. 92%의 실패 가능성과 내 목표도 함께 봐야 해요. 기대값 최대화와 반드시 보상을 얻는 목표는 다를 수 있어요.';
 renderTrials();
}
$('#problem').addEventListener('change',()=>{problem=$('#problem').value;choices=sets[problem];trials=trialsByProblem[problem];selected=0;setGoal();refresh();});
setGoal();renderTrials();refresh();
