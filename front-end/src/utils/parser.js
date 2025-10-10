// Парсер .txt файлов с тестами в структуру вопросов
// Формат:
// ? Вопрос
// + Правильный ответ
// - Неправильный ответ
// - Неправильный ответ
// - Неправильный ответ

export function parseTestFile(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);

  const questions = [];
  let currentQuestion = null;

  for (let line of lines) {
    if (line.startsWith("?")) {
      // Новый вопрос
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        question: line.slice(1).trim(),
        answers: []
      };
    } else if (line.startsWith("+")) {
      currentQuestion?.answers.push({
        text: line.slice(1).trim(),
        correct: true
      });
    } else if (line.startsWith("-")) {
      currentQuestion?.answers.push({
        text: line.slice(1).trim(),
        correct: false
      });
    }
  }

  // Добавляем последний вопрос
  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  return questions;
}
