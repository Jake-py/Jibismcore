import React from "react";

const Menu = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-200 to-purple-200 flex flex-col items-center justify-center">
      <div className="flex flex-col gap-4 items-center justify-center min-h-screen text-center">
        <h1 className="text-4xl font-extrabold text-pink drop-shadow-lg">
        🎓 Jibismcore
        </h1>
        <button onClick={() => onSelect("upload")} className="bg-white text-purple-600 px-6 py-3 rounded-2xl shadow hover:bg-purple-100">
        📂 Загрузить тест
        </button>
        <button onClick={() => onSelect("config")} className="bg-white text-purple-600 px-6 py-3 rounded-2xl shadow hover:bg-purple-100" >
        ⚙️ Настройки
        </button>
      </div>
    </div>
  );
};

export default Menu;
