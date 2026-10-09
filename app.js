'use strict';
const choices = [
  { amount: '1억원', probability: 1 },
  { amount: '4억원', probability: .52 },
  { amount: '30억원', probability: .23 },
  { amount: '1조원', probability: .08 },
];
const result = document.querySelector('#result');
const buttons = [...document.querySelectorAll('.choice')];
const again = document.querySelector('.again');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let busy = false;
let revealTimer;
buttons.forEach(button => {
  button.addEventListener('click', () => {
    if (busy || result.open) return;
    busy = true;
    const choice = choices[Number(button.dataset.choice)];
    const draw = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
    const won = draw < choice.probability;
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
    revealTimer = setTimeout(() => {
      if (!result.open) return;
      result.dataset.phase = 'revealed';
      result.classList.add(won ? 'won' : 'lost');
      result.dataset.theme = won ? ['gold', 'blue', 'coral', 'gold'][Number(button.dataset.choice)] : 'miss';
      document.querySelector('.loss-amount').textContent = won ? '' : '꽝!';
      const count = won ? [6, 8, 10, 14][Number(button.dataset.choice)] : 4;
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
      if (won && choice.probability <= .08) result.classList.add('jackpot');
      document.querySelector('#result-tag').textContent = won ? (choice.probability <= .08 ? 'JACKPOT!' : choice.probability === .23 ? '대박 당첨!' : '당첨!') : '아쉽지만…';
      document.querySelector('#result-title').textContent = won ? choice.amount : '0원';
      document.querySelector('#result-description').textContent = won ? `${Math.round(choice.probability * 100)}% 확률 · ${choice.amount} 당첨` : '다음 기회에 다시 도전!';
      if (won && !reducedMotion.matches) {
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
      again.textContent = '다시 선택하기';
      again.focus({ preventScroll: true });
    }, reducedMotion.matches ? 150 : 1500);
  });
});
result.addEventListener('close', () => {
  clearTimeout(revealTimer);
  busy = false;
  buttons.forEach(el => { el.disabled = false; el.classList.remove('pulling'); });
  document.querySelector('.particles').replaceChildren();
  document.querySelector('.reward-decor').replaceChildren();
  delete result.dataset.phase;
});
result.addEventListener('click', event => {
  if (event.target !== result) return;
  const bounds = result.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) result.close();
});
