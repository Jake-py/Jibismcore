import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import TestConfig from "./components/TestConfig";
import TestRunner from "./components/TestRunner";
import Results from "./components/Results";
import Menu from "./components/Menu";

function App() {
  const [step, setStep] = useState("menu");     // menu | upload | config | run | results
  const [questions, setQuestions] = useState([]); // вопросы из файла
  const [config, setConfig] = useState(null);     // настройки теста
  const [results, setResults] = useState(null);   // результаты прохождения

  // после загрузки файла
  const handleFileLoad = (parsedQuestions) => {
    setQuestions(parsedQuestions);
    setStep("config");
  };

  // после настройки теста
  const handleConfig = (cfg) => {
    setConfig(cfg);
    setStep("run");
  };

  // после прохождения теста
  const handleFinish = (res) => {
    setResults(res);
    setStep("results");
  };

  // сброс
  const handleRestart = () => {
    setQuestions([]);
    setConfig(null);
    setResults(null);
    setStep("menu");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-2xl p-6">
        {step === "menu" && <Menu onStart={() => setStep("upload")} />}
        {step === "upload" && <FileUpload onFileLoad={handleFileLoad} />}
        {step === "config" && <TestConfig onConfig={handleConfig} />}
        {step === "run" && (
          <TestRunner
            questions={questions}
            config={config}
            onFinish={handleFinish}
          />
        )}
        {step === "results" && (
          <Results results={results} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
}

export default App;
