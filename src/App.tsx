import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ErrorBoundary } from "./components/layout/ErrorBoundary";
import { useAuth } from "./hooks/useAuth";
import Home from "./pages/Home";
import Decks from "./pages/Decks";
import Matches from "./pages/Matches";
import Stats from "./pages/Stats";
import Tournaments from "./pages/Tournaments";
import Login from "./pages/Login";
import Play from "./pages/Play";
import Admin from "./pages/Admin";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

function App() {
  const { session, loading } = useAuth();

  useEffect(() => {
    document.title = "Grand Archive Tracker";
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        {!session ? (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/decks" element={<Decks />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/play" element={<Play />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        )}
      </Router>
    </ErrorBoundary>
  );
}

export default App;
