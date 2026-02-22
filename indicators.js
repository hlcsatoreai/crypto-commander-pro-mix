@tailwind base;
@tailwind components;
@tailwind utilities;

:root{ color-scheme: dark; }
html, body { height: 100%; }
body{
  background: radial-gradient(1200px 600px at 50% -10%, rgba(212,175,55,0.08), transparent 60%),
              radial-gradient(900px 500px at 80% 0%, rgba(0,245,160,0.06), transparent 55%),
              #070A10;
}
*::-webkit-scrollbar { width: 10px; height: 10px; }
*::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.25); border-radius: 999px; }
*::-webkit-scrollbar-track { background: rgba(15,23,42,0.2); }
