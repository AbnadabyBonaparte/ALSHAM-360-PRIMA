import LayoutSupremo from '@/components/LayoutSupremo';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('contacts')
        .select('id, name, email, phone, company, created_at')
        .order('created_at', { ascending: false });
      setContacts(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <LayoutSupremo title="Contatos">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <UserGroupIcon className="w-12 h-12 text-primary" />
          <h1 className="text-4xl font-bold">Contatos</h1>
          <span className="text-2xl font-medium text-cyan-400">
            {contacts.length} contatos cadastrados
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map(c => (
              <div key={c.id} className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-2xl p-6 border border-white/10 hover:border-primary transition-all">
                <h3 className="text-xl font-bold text-white">{c.name}</h3>
                <p className="text-gray-300">{c.company}</p>
                <p className="text-cyan-400 mt-2">{c.email}</p>
                <p className="text-gray-400 text-sm mt-4">
                  {new Date(c.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutSupremo>
  );
}
