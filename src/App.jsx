import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import TestConfig from "./components/TestConfig";
import TestRunner from "./components/TestRunner";
import Results from "./components/Results";
import Menu from "./components/Menu";
import { parseTestFile } from "./utils/parser";

function App() {
  const [step, setStep] = useState("menu"); // menu | upload | config | run | results
  const [questions, setQuestions] = useState([]);
  const [config, setConfig] = useState(null);
  const [results, setResults] = useState(null);

  // после загрузки файла
  const handleFileLoad = (text) => {
    const parsedQuestions = parseTestFile(text);
    setQuestions(parsedQuestions);
    setStep("config");
  };

  // после настройки теста
  const handleConfig = (cfg) => {
    setConfig(cfg);
    setStep("run");
  };

  // после прохождения теста
  const handleFinish = (answers) => {
    setResults(answers);
    setStep("results");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-2xl p-6">
        {step === "menu" && <Menu onSelect={(s) => setStep(s)} />}
        {step === "upload" && <FileUpload onFileLoad={handleFileLoad} />}
        {step === "config" && <TestConfig onStart={handleConfig} />}
        {step === "run" && (
          <TestRunner
            questions={questions}
            config={config}
            onFinish={handleFinish}
          />
        )}
        {step === "results" && (
          <Results
            answers={results}
            questions={questions}
            onRestart={() => {
              setStep("menu");
              setQuestions([]);
              setConfig(null);
              setResults(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
