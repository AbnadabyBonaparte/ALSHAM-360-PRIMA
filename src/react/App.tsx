import { useEffect, useState } from "react";
import { supabase, getCurrentSession } from "./lib/supabase";

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

    // Listener de mudanças de autenticação
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-gray-400 text-lg">
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-white">
      <h1 className="text-3xl font-bold mb-2">🔥 ALSHAM 360° PRIMA</h1>
      <p className="text-gray-400">Usuário autenticado:</p>
      <pre className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-sm mt-2">
        {JSON.stringify(session.user, null, 2)}
      </pre>
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.reload();
        }}
        className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-semibold"
      >
        Sair
      </button>
    </div>
  );
}
