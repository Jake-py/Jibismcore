import React from "react";

export default function FileUpload({ onFileLoad }) {
  // Обработчик выбора файла
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      onFileLoad(text); // передаём содержимое файла в App
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Скрытый input */}
      <input
        type="file"
        id="fileUpload"
        accept=".txt"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Красивая кнопка */}
      <label
        htmlFor="fileUpload"
        className="cursor-pointer bg-white/30 backdrop-blur-sm border border-white/40 text-white font-medium px-6 py-3 rounded-xl shadow-md hover:bg-white/40 transition"
      >
        📂 Загрузить тест (.txt)
      </label>
    </div>
  );
}
