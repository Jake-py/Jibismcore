import React, { useState, useEffect, useMemo } from "react";
import shuffle from "../utils/shuffle";

const TestRunner = ({ questions, config, onFinish }) => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(config.timeLimit * 60);

  // Таймер
  useEffect(() => {
    if (!config.timeLimit) return; // если таймера нет
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
  }, [config.timeLimit, answers, onFinish]);

  const currentQuestion = questions[current];

  // 👇 перемешивание вариантов ответа — один раз на вопрос
  const options = useMemo(
    () => shuffle(currentQuestion.answers),
    [currentQuestion.question] // можно question.id если есть
  );

  const handleAnswer = (option) => {
    setAnswers({ ...answers, [current]: option });
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      onFinish({ ...answers, [current]: option });
    }
  };

  return (
    <div className="p-4">
      {config.timeLimit > 0 && (
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
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              {opt.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TestRunner;
