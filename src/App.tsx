import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getSupabaseClient, getCurrentSession } from "./lib/supabase";

// Layout
import LayoutSupremo from "./components/LayoutSupremo";

// Páginas
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import Financeiro from "./pages/Financeiro";
import Gamificacao from "./pages/Gamificacao";
import Automacoes from "./pages/Automacoes";
import Seguranca from "./pages/Seguranca";
import Publicacao from "./pages/Publicacao";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    async function initializeSession() {
      try {
        const currentSession = await getCurrentSession();
        if (isMounted) {
          setSession(currentSession);
          setLoading(false);
        }

        const client = await getSupabaseClient();
        const { data: listener } = client.auth.onAuthStateChange((_event, sess) => {
          setSession(sess);
        });
        unsubscribe = () => listener.subscription.unsubscribe();
      } catch (error) {
        console.error("Erro ao inicializar Supabase:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeSession();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-gray-400">
        Carregando sessão...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-white text-center px-4">
        <h1 className="text-3xl font-bold mb-4">🚀 ALSHAM 360° PRIMA</h1>
        <p className="text-gray-400 mb-6 max-w-md">
          Nenhuma sessão ativa. Faça login com sua conta Google para acessar o painel supremo.
        </p>
        <button
          onClick={async () => {
            const client = await getSupabaseClient();
            await client.auth.signInWithOAuth({ provider: "google" });
          }}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold transition-all"
        >
          Entrar com Google
        </button>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/app" element={<LayoutSupremo />}>
          <Route index element={<Navigate to="/app/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="gamificacao" element={<Gamificacao />} />
          <Route path="automacoes" element={<Automacoes />} />
          <Route path="seguranca" element={<Seguranca />} />
          <Route path="publicacao" element={<Publicacao />} />
        </Route>

        <Route path="*" element={<Navigate to="/app/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
