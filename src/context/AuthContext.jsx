import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext(null);


const sameUser = (a, b) =>
  a?.id === b?.id && a?.email === b?.email;


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


useEffect(() => {
  let mounted = true;

  const loadSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (mounted) {
      const nextUser = session?.user ?? null;

      setUser((prevUser) =>
        sameUser(prevUser, nextUser) ? prevUser : nextUser
      );

      setLoading(false);
    }
  };

  loadSession();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (mounted) {
      const nextUser = session?.user ?? null;

      setUser((prevUser) =>
        sameUser(prevUser, nextUser) ? prevUser : nextUser
      );
    }
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);


  const signUp = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    return { data, error };
  };
  const updatePassword = async (newPassword) => {
    return await supabase.auth.updateUser({
      password: newPassword,
    });
  };
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  };
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });

  return { data, error };
};

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error };
    }

    setUser(null);

    return { error: null };
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        loading,
        signUp,
        login,
        logout,
        updatePassword,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
