@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #1e293b; }
::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }

.animate-in {
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  background: #a855f7;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  margin-top: -6px;
}

input[type="range"]::-webkit-slider-track {
  background: #334155;
  height: 8px;
  border-radius: 4px;
}
