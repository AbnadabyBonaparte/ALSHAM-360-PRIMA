import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getSupabaseClient } from "../lib/supabase";

export default function DashboardSupremo() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    getSupabaseClient()
      .then((client) => client.auth.getUser())
      .then(({ data }) => {
        if (isMounted) {
          setUser(data?.user);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar usuário Supabase:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white px-8 py-10">
      <header className="flex justify-between items-center border-b border-neutral-800 pb-4 mb-8">
        <h1 className="text-2xl font-bold">
          ⚜️ ALSHAM 360° PRIMA <span className="text-emerald-500">Supremo</span>
        </h1>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-400">
              {user.email}
            </span>
          )}
          <button
            onClick={async () => {
              const client = await getSupabaseClient();
              await client.auth.signOut();
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Leads", "Vendas", "Campanhas"].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-lg hover:border-emerald-500 transition-all"
          >
            <h2 className="text-lg font-semibold mb-2">{item}</h2>
            <p className="text-gray-400 text-sm">
              Dados dinâmicos em breve…
            </p>
          </motion.div>
        ))}
      </main>
    </div>
  );
}
