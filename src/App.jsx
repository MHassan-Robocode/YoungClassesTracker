import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ClassDashboard from "./pages/ClassDashboard";

export default function App() {
  const { user } = useAuth();

  const isAdmin = user?.email?.includes("admin");

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to={isAdmin ? "/admin" : "/class"} /> : <Login />}
        />
        <Route
          path="/admin"
          element={user && isAdmin ? <AdminDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/class"
          element={user && !isAdmin ? <ClassDashboard /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
