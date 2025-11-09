import { useAuth } from "../context/AuthContext";

export default function Navbar({ title }) {
  const { logout, user } = useAuth();

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
        <h1 className="text-xl font-semibold">{title || "Dashboard"}</h1>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm opacity-90">{user.email}</span>
          )}
          <button
            onClick={logout}
            className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100 font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
