// src/utils/shuffle.js
/**
 * Перемешивает массив случайным образом (Fisher–Yates shuffle)
 * @param {Array} array - массив для перемешивания
 * @returns {Array} новый массив с перемешанными элементами
 */
export default function shuffle(array) {
  // создаём копию, чтобы не мутировать исходный массив
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    // случайный индекс от 0 до i
    const j = Math.floor(Math.random() * (i + 1));
    // меняем местами arr[i] и arr[j]
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
