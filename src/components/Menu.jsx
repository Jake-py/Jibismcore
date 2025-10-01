import React from "react";

const Menu = ({ onSelect }) => {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
        🎓 Jibismcore
      </h1>
      <button
        onClick={() => onSelect("upload")}
        className="bg-white text-purple-600 px-6 py-3 rounded-2xl shadow hover:bg-purple-100"
      >
        📂 Загрузить тест
      </button>
      <button
        onClick={() => onSelect("config")}
        className="bg-white text-purple-600 px-6 py-3 rounded-2xl shadow hover:bg-purple-100"
      >
        ⚙️ Настройки
      </button>
    </div>
  );
};

export default Menu;
