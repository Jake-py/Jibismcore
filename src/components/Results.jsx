import React from "react";

const Results = ({ answers, questions, onRestart }) => {
  const score = Object.keys(answers).reduce((acc, key) => {
    if (answers[key] === questions[key].answer) {
      return acc + 1;
    }
    return acc;
  }, 0);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4">🎉 Результаты</h2>
      <p className="mb-2">
        Правильных ответов: <span className="font-bold">{score}</span> из{" "}
        {questions.length}
      </p>
      <button
        onClick={onRestart}
        className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded"
      >
        🔄 Пройти заново
      </button>
    </div>
  );
};

export default Results;
