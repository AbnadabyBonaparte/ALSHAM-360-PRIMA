import LayoutSupremo from '@/components/LayoutSupremo';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  avatar_url?: string;
  created_at: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContacts() {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('id, name, email, phone, company, avatar_url, created_at')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setContacts(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadContacts();
  }, []);

  return (
    <LayoutSupremo title="Contatos">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <UserGroupIcon className="w-16 h-16 text-primary" />
            <div>
              <h1 className="text-5xl font-bold text-white">Contatos</h1>
              <p className="text-xl text-gray-400 mt-2">
                {contacts.length} contatos ativos • {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <button className="bg-primary hover:bg-primary/90 px-8 py-4 rounded-xl font-bold text-xl transition-all transform hover:scale-105">
            + Novo Contato
          </button>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 text-2xl">Erro ao carregar contatos: {error}</p>
          </div>
        )}

        {!loading && contacts.length === 0 && (
          <div className="text-center py-20">
            <UserGroupIcon className="w-32 h-32 text-gray-600 mx-auto mb-8" />
            <p className="text-3xl text-gray-400">Nenhum contato encontrado</p>
            <p className="text-xl text-gray-500 mt-4">Comece importando ou criando seu primeiro contato</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 hover:border-primary/50 transition-all hover:transform hover:scale-105 cursor-pointer"
            >
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                  {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white">{contact.name}</h3>
                  <p className="text-gray-300">{contact.company || 'Sem empresa'}</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <p className="text-cyan-400 flex items-center gap-3">
                  <EnvelopeIcon className="w-5 h-5" />
                  {contact.email}
                </p>
                {contact.phone && (
                  <p className="text-green-400 flex items-center gap-3">
                    <PhoneIcon className="w-5 h-5" />
                    {contact.phone}
                  </p>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-6">
                Adicionado em {new Date(contact.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </LayoutSupremo>
  );
}
