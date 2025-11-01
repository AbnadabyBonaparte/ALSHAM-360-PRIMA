import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase, getCurrentSession } from "./lib/supabase";
import LayoutSupremo from "./components/LayoutSupremo";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import Financeiro from "./pages/Financeiro";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const s = await getCurrentSession();
      setSession(s);
      setLoading(false);
    }
    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) =>
      setSession(sess)
    );

    return () => listener.subscription.unsubscribe();
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-white">
        <h1 className="text-3xl font-bold mb-4">🚀 ALSHAM 360° PRIMA</h1>
        <p className="text-gray-400 mb-6">Nenhuma sessão ativa.</p>
        <button
          onClick={async () => {
            await supabase.auth.signInWithOAuth({ provider: "google" });
          }}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold"
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
      </Route>

      <Route path="*" element={<Navigate to="/app/home" replace />} />
    </Routes>
  </BrowserRouter>
);
