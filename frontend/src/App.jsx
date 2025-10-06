import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddExpense from "./pages/AddExpense";
import EditExpense from "./pages/EditExpense";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== "admin") {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "10px",
            color: "#333",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          }}
        >
          <h2>🚫 Access Denied</h2>
          <p>This page is for administrators only.</p>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: "0.5rem 1rem",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "1rem",
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

const NavigateToCorrectDashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Auto-redirect admin to admin dashboard
  if (user.role === "admin") {
    return <Navigate to="/admin" />;
  }

  // Regular users go to normal dashboard
  return <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* User Dashboard - Accessible to all logged-in users */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Dashboard - Accessible only to admins */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Expense Management Routes */}
            <Route
              path="/add-expense"
              element={
                <ProtectedRoute>
                  <AddExpense />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/edit-expense/:id"
              element={
                <ProtectedRoute>
                  <EditExpense />
                </ProtectedRoute>
              }
            />
            
            {/* Root path - redirect to appropriate dashboard */}
            <Route path="/" element={<NavigateToCorrectDashboard />} />
            
            {/* Catch all route - redirect to login */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;