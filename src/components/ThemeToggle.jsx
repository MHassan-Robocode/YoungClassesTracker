import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-2 rounded-md border border-gray-400 dark:border-gray-600
                 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700
                 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
    >
      {dark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
