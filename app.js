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
 const button=buttons[r.index],result=$('#result'),again=$('.again');
    const choice = choices[r.index];
    const won = r.won;
    buttons.forEach(el => { el.disabled = true; });
    button.classList.add('pulling');
    result.dataset.phase = 'drawing';
    result.className = '';
    result.dataset.theme = 'gold';
    document.querySelector('.reward-decor').replaceChildren();
    document.querySelector('.loss-amount').textContent = '';
    document.querySelector('#result-tag').textContent = '두근두근… 추첨 중!';
    document.querySelector('#result-title').textContent = '?';
    document.querySelector('#result-description').textContent = `${choice.amount}의 행운을 기다리는 중…`;
    again.disabled = true;
    again.textContent = '추첨 중…';
    result.showModal();
    timer = setTimeout(() => {
      if (!result.open) return;
      result.dataset.phase = 'revealed';
      result.classList.add(won ? 'won' : 'lost');
      result.dataset.theme = won ? ['gold', 'blue', 'coral', 'gold'][r.index] : 'miss';
      document.querySelector('.loss-amount').textContent = won ? '' : '꽝!';
      const count = won ? [6, 8, 10, 14][r.index] : 4;
      document.querySelector('.reward-decor').replaceChildren(...Array.from({ length: count }, (_, i) => {
        const el = document.createElement('span');
        el.className = won ? (i % 3 === 0 ? 'reward-star' : 'reward-coin') : 'sad-spark';
        el.textContent = won ? (i % 3 === 0 ? '✦' : '₩') : '✧';
        const side = i % 2;
        el.style.left = `${side ? 83 + i % 3 * 2 : 3 + i % 3 * 2}%`;
        el.style.top = `${20 + Math.floor(i / 2) * 8}%`;
        el.style.setProperty('--tilt', `${(i % 3 - 1) * 22}deg`);
        el.style.setProperty('--delay', `${i * .08}s`);
        return el;
      }));
      if (won && choice.p <= .08) result.classList.add('jackpot');
      document.querySelector('#result-tag').textContent = won ? (choice.p <= .08 ? 'JACKPOT!' : choice.p === .23 ? '대박 당첨!' : '당첨!') : '아쉽지만…';
      document.querySelector('#result-title').textContent = won ? choice.amount : '0원';
      document.querySelector('#result-description').textContent = won ? `${Math.round(choice.p * 100)}% 확률 · ${choice.amount} 당첨` : '다음 기회에 다시 도전!';
      if (won && !reduced.matches) {
        document.querySelector('.particles').replaceChildren(...Array.from({ length: 16 }, (_, i) => {
          const spark = document.createElement('span');
          const angle = i * Math.PI / 8;
          spark.style.setProperty('--x', `${Math.cos(angle) * 140}px`);
          spark.style.setProperty('--y', `${Math.sin(angle) * 130}px`);
          spark.style.setProperty('--turn', `${i * 65}deg`);
          spark.style.setProperty('--spark', ['#ffe34a', '#5275d4', '#f08a76', '#a9d881'][i % 4]);
          return spark;
        }));
      }
      again.disabled = false;
      again.textContent = '확인';
      again.focus({ preventScroll: true });
    }, replay || reduced.matches ? 120 : 1500);
}

buttons.forEach((el,i)=>el.addEventListener('click',async()=>{if(busy||el.disabled)return;busy=true;refresh();try{showResult(await claim(i));}catch{busy=false;refresh();$('#daily-status').textContent='선택을 저장하지 못했습니다. 브라우저 저장 설정을 확인해 주세요.';}}));
$('#today-result').addEventListener('click',()=>{if(busy)return;try{const r=readToday();if(r){busy=true;refresh();showResult(r,true);}}catch{refresh();}});
$('.again').addEventListener('click',()=>$('#result').close());
$('#result').addEventListener('close',()=>{clearTimeout(timer);busy=false;buttons.forEach(el=>el.classList.remove('pulling'));$('.particles').replaceChildren();$('.reward-decor').replaceChildren();refresh();});
window.addEventListener('storage',refresh);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});setInterval(refresh,30000);refresh();
