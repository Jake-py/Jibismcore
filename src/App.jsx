import React, { useState } from "react";
import { useEffect } from "react";
import OllamaChat from "./components/OllamaChat";
import FileUpload from "./components/FileUpload";
import TestConfig from "./components/TestConfig";
import TestRunner from "./components/TestRunner";
import Results from "./components/Results";
import Menu from "./components/Menu";
import { parseTestFile } from "./utils/parser";
import shuffleArray from "./utils/shuffle";

function App() {
  const [step, setStep] = useState("menu"); // menu | upload | config | run | results
  const [questions, setQuestions] = useState([]); // все вопросы (оригинал)
  const [selectedQuestions, setSelectedQuestions] = useState([]); // финальный набор для теста
  const [config, setConfig] = useState(null);
  const [results, setResults] = useState(null);
  // чат отображается как боковая панель
  // URL для запроса к мосту Ollama. Можно переопределить через Vite: VITE_ASK_URL
  const askUrl = (import.meta && import.meta.env && import.meta.env.VITE_ASK_URL) || "/api/chat";

  // после загрузки файла
  const handleFileLoad = (text) => {
    const parsedQuestions = parseTestFile(text);
    setQuestions(parsedQuestions);
    setStep("config");
  };

  // после настройки теста
  const handleConfig = (cfg) => {
    if (!questions || questions.length === 0) {
      alert("Вы не загрузили тест. Возврат в меню.");
      setStep("menu");
      return;
    }

    // определяем количество вопросов
    const count = cfg?.questionCount && cfg.questionCount > 0
      ? Math.min(cfg.questionCount, questions.length)
      : questions.length;

    // перемешиваем, если нужно
    const shuffled = cfg.shuffle ? shuffleArray([...questions]) : [...questions];
    const selected = shuffled.slice(0, count);

    setConfig(cfg);
    setSelectedQuestions(selected);
    setStep("run");
  };

  // после прохождения теста
  const handleFinish = (answersArray) => {
    // answersArray может быть либо массивом (старый формат), либо объектом { index: { selected, correct } }
    let formattedAnswers = {};

    if (Array.isArray(answersArray)) {
      // старый формат: массив выбранных значений
      answersArray.forEach((ans, idx) => {
        formattedAnswers[idx] = { selected: ans };
      });
    } else if (answersArray && typeof answersArray === "object") {
      // новый формат: уже объект с нужными полями
      formattedAnswers = answersArray;
    }

  setResults({ answers: formattedAnswers });
  setStep("results");
  // чат теперь открывается вручную через кнопку в правом нижнем углу

  };

  // сброс
  const handleRestart = () => {
    setStep("menu");
    setQuestions([]);
    setSelectedQuestions([]);
    setConfig(null);
    setResults(null);
  };

  // chat handled by <OllamaChat /> component

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4 relative">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-2xl p-6">
        {step === "menu" && <Menu onSelect={(s) => setStep(s)} />}
        {step === "upload" && <FileUpload onFileLoad={handleFileLoad} />}
        {step === "config" && <TestConfig onStart={handleConfig} questionsCount={questions.length} />}
        {step === "run" && (
          <TestRunner
            questions={selectedQuestions}
            config={config}
            onFinish={handleFinish}
          />
        )}
        {step === "results" && (
          <Results
            answers={results?.answers || {}}
            questions={selectedQuestions}
            onRestart={handleRestart}
          />
        )}
  </div>
  {/* render chat at root so fixed positioning is not clipped by inner container */}
  <OllamaChat askUrl={askUrl} />
    </div>
  );
}

export default App;
