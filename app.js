'use strict';
const choices = [
  { amount: '1억원', probability: 1 },
  { amount: '4억원', probability: 0.52 },
  { amount: '30억원', probability: 0.23 },
  { amount: '1조원', probability: 0.08 },
];
const result = document.querySelector('dialog');
document.querySelectorAll('.choice').forEach(button => {
  button.addEventListener('click', () => {
    if (result.open) return;
    const choice = choices[Number(button.dataset.choice)];
    const draw = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
    const won = draw < choice.probability;
    document.querySelector('#result-tag').textContent = won ? '당첨!' : '아쉽지만 다음 기회에';
    document.querySelector('#result-title').textContent = won ? choice.amount : '0원';
    document.querySelector('#result-description').textContent = `${Math.round(choice.probability * 100)}% 확률의 ${choice.amount} 버튼을 선택했습니다.`;
    result.showModal();
  });
});
result.addEventListener('click', event => {
  const bounds = result.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) result.close();
});
