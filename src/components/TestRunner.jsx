import React, { useState, useEffect, useMemo } from "react";
import shuffle from "../utils/shuffle";

const TestRunner = ({ questions = [], config = {}, onFinish }) => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});

  const initialTime = config?.timeLimit ? config.timeLimit * 60 : 0;
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  // Таймер
  useEffect(() => {
    if (!config?.timeLimit || config.timeLimit <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          onFinish(answers);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [config?.timeLimit, answers, onFinish]);

  if (!questions || questions.length === 0) {
    return <div>Нет вопросов для теста. Вернитесь в главное меню.</div>;
  }

  const currentQuestion = questions[current];

  // перемешивание опций для текущего вопроса, мемоизируем по индексу+вопросу
  const options = useMemo(() => {
    // делаем копию, чтобы shuffle не изменял исходную структуру в questions
    const copy = currentQuestion.answers ? [...currentQuestion.answers] : [];
    return shuffle(copy);
  }, [currentQuestion, current]);

  const handleAnswer = (option) => {
    // сохраняем выбранный текст и метку correct
    const newAnswers = { ...answers, [current]: { selected: option.text, correct: !!option.correct } };
    setAnswers(newAnswers);

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      onFinish(newAnswers);
    }
  };

  return (
    <div className="p-4">
      {config?.timeLimit > 0 && (
        <div className="text-right text-red-600 mb-2">
          ⏳ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">{currentQuestion.question}</h2>

      <ul className="space-y-2">
        {options.map((opt, idx) => (
          <li key={idx}>
            <button
              onClick={() => handleAnswer(opt)}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 focus:outline-none"
            >
              {opt.text}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <div>Вопрос {current + 1} / {questions.length}</div>
        <div>
          <button
            onClick={() => {
              // возможность пропустить вопрос (сохраним как null)
              const newAnswers = { ...answers, [current]: { selected: null, correct: false } };
              setAnswers(newAnswers);
              if (current + 1 < questions.length) setCurrent(current + 1);
              else onFinish(newAnswers);
            }}
            className="px-3 py-1 rounded focus:outline-none"
          >
            Пропустить
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestRunner;
