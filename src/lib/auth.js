import React from "react";

const AuthContext = React.createContext(null);

const DEMO_USER = {
  id: "demo-user",
  email: "demo@travelos.dev",
  displayName: "Demo Traveler",
};

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(DEMO_USER);
  const [loading, setLoading] = React.useState(false);

  async function login() {
    setUser(DEMO_USER);
  }

  async function signup() {
    setUser(DEMO_USER);
  }

  async function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

