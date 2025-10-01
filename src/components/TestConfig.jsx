import React, { useState } from "react";

const TestConfig = ({ onStart }) => {
  const [timeLimit, setTimeLimit] = useState(60); // минуты
  const [questionCount, setQuestionCount] = useState(10);
  const [shuffle, setShuffle] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onStart({ timeLimit, questionCount, shuffle });
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">⚙️ Настройки теста</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label>
          Время (мин):
          <input
            type="number"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </label>

        <label>
          Количество вопросов:
          <input
            type="number"
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={shuffle}
            onChange={() => setShuffle(!shuffle)}
          />
          Перемешивать вопросы
        </label>

        <button
          type="submit"
          className="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded"
        >
          🚀 Начать
        </button>
      </form>
    </div>
  );
};

export default TestConfig;
