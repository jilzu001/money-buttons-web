'use strict';
const choices = [
  { amount: '1억원', value: 1, probability: 1, color: 'yellow' },
  { amount: '4억원', value: 4, probability: .52, color: 'blue' },
  { amount: '30억원', value: 30, probability: .23, color: 'coral' },
  { amount: '1조원', value: 10000, probability: .08, color: 'green' },
];
const key = 'money-buttons-stats-v1';
const empty = () => choices.map(() => ({ attempts: 0, wins: 0 }));
let stats = empty();
let storageAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem(key));
  if (Array.isArray(saved) && saved.length === 4 && saved.every(s => s && Number.isSafeInteger(s.attempts) && s.attempts >= 0 && s.attempts <= 1000000000 && Number.isSafeInteger(s.wins) && s.wins >= 0 && s.wins <= s.attempts)) stats = saved;
} catch { storageAvailable = false; }
const formatCount = value => value.toLocaleString('ko-KR');
function formatAmount(value) {
  if (!value) return '0원';
  const trillion = Math.floor(value / 10000);
  const billion = value % 10000;
  return (trillion ? `${formatCount(trillion)}조` : '') + (billion ? `${trillion ? ' ' : ''}${formatCount(billion)}억` : '') + '원';
}
function renderStats() {
  const attempts = stats.reduce((sum, s) => sum + s.attempts, 0);
  const wins = stats.reduce((sum, s) => sum + s.wins, 0);
  const amount = stats.reduce((sum, s, i) => sum + s.wins * choices[i].value, 0);
  document.querySelector('#total-count').replaceChildren(document.createTextNode(formatCount(attempts)), Object.assign(document.createElement('span'), { textContent: '회' }));
  document.querySelector('#win-rate').textContent = attempts ? `${(wins / attempts * 100).toFixed(1)}%` : '—';
  document.querySelector('#total-amount').textContent = formatAmount(amount);
  document.querySelector('#button-stats').innerHTML = choices.map((choice, i) => {
    const s = stats[i];
    const rate = s.attempts ? s.wins / s.attempts * 100 : 0;
    return `<div class="stat-row"><div class="stat-row-top"><span class="stat-row-label"><span class="swatch ${choice.color}"></span>${choice.amount}</span><span class="stat-ratio"><b>${formatCount(s.wins)}</b> / ${formatCount(s.attempts)}회 · ${s.attempts ? rate.toFixed(1) + '%' : '—'}</span></div><div class="track" aria-hidden="true"><div class="bar" style="width:${rate}%"></div></div></div>`;
  }).join('');
  document.querySelector('#storage-note').textContent = storageAvailable ? '이 브라우저에 자동 저장됩니다.' : '현재 기록은 이 화면에서만 유지됩니다.';
  document.querySelector('#reset').disabled = attempts === 0;
}
function saveStats() {
  try { localStorage.setItem(key, JSON.stringify(stats)); storageAvailable = true; }
  catch { storageAvailable = false; }
  renderStats();
}
const result = document.querySelector('#result');
document.querySelectorAll('.choice').forEach(button => {
  button.addEventListener('click', () => {
    if (result.open) return;
    const index = Number(button.dataset.choice);
    if (stats[index].attempts >= 1000000000) return;
    const choice = choices[index];
    const draw = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
    const won = draw < choice.probability;
    stats[index].attempts++;
    if (won) stats[index].wins++;
    saveStats();
    document.querySelector('#result-tag').textContent = won ? '오, 당첨이에요!' : '이번엔 아쉬워요!';
    document.querySelector('#result-title').textContent = won ? choice.amount : '0원';
    document.querySelector('#result-description').textContent = `${Math.round(choice.probability * 100)}% 확률의 ${choice.amount} 버튼을 선택했습니다.`;
    result.showModal();
  });
});
result.addEventListener('click', event => {
  if (event.target !== result) return;
  const bounds = result.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) result.close();
});
const resetDialog = document.querySelector('#reset-dialog');
document.querySelector('#reset').addEventListener('click', () => {
  resetDialog.returnValue = 'cancel';
  resetDialog.showModal();
});
resetDialog.addEventListener('close', () => {
  if (resetDialog.returnValue !== 'reset') return;
  stats = empty();
  saveStats();
});
renderStats();
