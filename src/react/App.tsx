// src/react/App.tsx
import { useEffect, useState } from "react";
import { supabase, getCurrentSession } from "./lib/supabase";
import DashboardSupremo from "./components/DashboardSupremo";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const s = await getCurrentSession();
        setSession(s);
      } catch (err) {
        console.error("Erro ao carregar sessão:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSession();

    // Listener de mudanças de autenticação (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ⏳ Tela de carregamento
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-gray-400 text-lg">
        Carregando sessão...
      </div>
    );
  }

  // 🚪 Login via Google (quando não há sessão)
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-white px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">🚀 ALSHAM 360° PRIMA</h1>
        <p className="text-gray-400 mb-6 max-w-md">
          Nenhuma sessão ativa. Faça login com sua conta Google para acessar o painel supremo.
        </p>
        <button
          onClick={async () => {
            try {
              await supabase.auth.signInWithOAuth({ provider: "google" });
            } catch (err) {
              console.error("Erro ao iniciar login:", err);
            }
          }}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold transition-all"
        >
          Entrar com Google
        </button>
      </div>
    );
  }

  // 🔥 Painel Supremo (usuário autenticado)
  return <DashboardSupremo />;
}
