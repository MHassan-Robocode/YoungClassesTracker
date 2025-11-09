import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Sidebar() {
  const { user } = useAuth();
  const { dark } = useTheme();

  const role = user?.email?.includes("admin") ? "admin" : "teacher";

  return (
    <div className="h-screen w-60 bg-gray-200 dark:bg-gray-800 p-5 flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">
        RBProgressTracker
      </h2>
      <nav className="flex flex-col space-y-3">
        {role === "admin" ? (
          <>
            <Link
              to="/admin"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500"
            >
              📊 Dashboard
            </Link>
            <Link
              to="/admin/classes"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500"
            >
              🏫 Classes
            </Link>
            <Link
              to="/admin/students"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500"
            >
              👩‍🎓 Students
            </Link>
            <Link
              to="/admin/projects"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500"
            >
              🤖 Projects
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/class"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500"
            >
              👨‍🏫 My Class
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}
