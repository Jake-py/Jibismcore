import React from "react";

const Results = ({ answers = {}, questions = [], onRestart }) => {
  if (!questions || questions.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Результаты</h2>
        <p>Нет данных о пройденных вопросах.</p>
        <button onClick={onRestart} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded focus:outline-none">Вернуться в меню</button>
      </div>
    );
  }

  let correctCount = 0;
  questions.forEach((q, idx) => {
    const a = answers[idx];
    if (a && typeof a.correct !== "undefined") {
      if (a.correct) correctCount += 1;
    } else {
      // fallback: compare by text if `correct` flag missing
      const userAnswer = a?.selected;
      const correctAnswer = q.answers.find(ans => ans.correct)?.text;
      if (userAnswer && userAnswer === correctAnswer) correctCount += 1;
    }
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Результаты</h2>
      <div className="mb-4">
        Вы ответили правильно: <strong>{correctCount}</strong> из <strong>{questions.length}</strong>
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => {
          const a = answers[idx];
          const correctAnswer = q.answers.find(ans => ans.correct)?.text;
          // prefer explicit flag, otherwise fallback to text comparison
          const isCorrect = a ? (typeof a.correct !== "undefined" ? !!a.correct : a.selected === correctAnswer) : false;

          return (
            <div key={idx} className="p-3 border rounded">
              <div className="font-semibold">{idx + 1}. {q.question}</div>
              <div className="mt-1">
                <div>Ваш ответ: <span className={isCorrect ? "text-green-600" : "text-red-600"}>{a?.selected ?? "—"}</span></div>
                {!isCorrect && (
                  <div className="text-sm text-gray-600">Правильный ответ: {correctAnswer ?? "—"}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={onRestart} className="px-4 py-2 bg-gray-700 text-white rounded focus:outline-none">Вернуться в меню</button>
      </div>
    </div>
  );
};

export default Results;
