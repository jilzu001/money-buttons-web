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
    result.classList.remove('won', 'lost', 'jackpot');
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
      if (won && choice.probability <= .08) result.classList.add('jackpot');
      document.querySelector('#result-tag').textContent = won ? (choice.probability <= .08 ? 'JACKPOT!' : '당첨!') : '아쉽지만 다음 기회에';
      document.querySelector('#result-title').textContent = won ? choice.amount : '0원';
      document.querySelector('#result-description').textContent = `${Math.round(choice.probability * 100)}% 확률의 ${choice.amount} 버튼을 선택했습니다.`;
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
  delete result.dataset.phase;
});
result.addEventListener('click', event => {
  if (event.target !== result) return;
  const bounds = result.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) result.close();
});
