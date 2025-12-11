// src/pages/Contacts.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Contatos Alienígena 1000/1000
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Contacts.tsx

import { UserGroupIcon, PhoneIcon, EnvelopeIcon, BuildingOfficeIcon, SparklesIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  avatar_url?: string;
  created_at: string;
  last_contact?: string;
  score: number;
  tags: string[];
  revenue_potential?: number;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'recent' | 'revenue'>('score');

  useEffect(() => {
    async function loadSupremeContacts() {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, email, phone, company, title, avatar_url, created_at, last_contact, score, tags, revenue_potential')
        .order(sortBy === 'score' ? 'score' : sortBy === 'revenue' ? 'revenue_potential' : 'last_contact', { ascending: false, nullsLast: true });

      if (!error && data) {
        setContacts(data);
      }
      setLoading(false);
    }
    loadSupremeContacts();
  }, [sortBy]);

  const totalRevenue = contacts.reduce((sum, c) => sum + (c.revenue_potential || 0), 0);
  const hotContacts = contacts.filter(c => c.score >= 90).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
        {/* Header Supremo */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-8">
            <UserGroupIcon className="w-20 h-20 text-primary animate-pulse" />
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Contatos Alienígena
              </h1>
              <p className="text-3xl text-gray-300 mt-6">
                {contacts.length} contatos • {hotContacts} quentes • R$ {totalRevenue.toLocaleString('pt-BR')} em potencial
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setSortBy('score')}
              className={`px-8 py-5 rounded-2xl font-bold text-xl transition-all ${sortBy === 'score' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-white/10'}`}
            >
              IA Score
            </button>
            <button
              onClick={() => setSortBy('recent')}
              className={`px-8 py-5 rounded-2xl font-bold text-xl transition-all ${sortBy === 'recent' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-white/10'}`}
            >
              Mais Recente
            </button>
            <button
              onClick={() => setSortBy('revenue')}
              className={`px-8 py-5 rounded-2xl font-bold text-xl transition-all ${sortBy === 'revenue' ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'bg-white/10'}`}
            >
              Maior Potencial
            </button>
          </div>
        </div>

        {/* Grid Supremo */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="group relative bg-gradient-to-br from-gray-900/90 via-black/95 to-gray-900/90 backdrop-blur-2xl rounded-3xl p-10 border border-[var(--border)] hover:border-primary/70 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-4"
            >
              {/* IA Score Badge */}
              <div className={`absolute -top-4 -right-4 px-6 py-3 rounded-full font-bold text-lg shadow-2xl ${
                contact.score >= 90 ? 'bg-gradient-to-r from-pink-600 to-purple-600' :
                contact.score >= 70 ? 'bg-gradient-to-r from-orange-600 to-red-600' :
                'bg-gradient-to-r from-gray-600 to-gray-500'
              }`}>
                IA Score: {contact.score}/100
                {contact.score >= 90 && <SparklesIcon className="w-6 h-6 inline ml-2 animate-pulse" />}
              </div>

              {/* Avatar + Nome */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="w-28 h-28 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-5xl font-bold text-[var(--text-primary)] shadow-2xl">
                    {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  {contact.score >= 90 && (
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                      <StarIcon className="w-8 h-8 text-[var(--text-primary)]" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-[var(--text-primary)]">{contact.name}</h2>
                  <p className="text-xl text-gray-300 mt-2">{contact.title || 'Sem cargo'}</p>
                  <div className="flex items-center gap-3 mt-4">
                    <BuildingOfficeIcon className="w-6 h-6 text-gray-500" />
                    <p className="text-lg text-gray-400">{contact.company || 'Sem empresa'}</p>
                  </div>
                </div>
              </div>

              {/* Contatos */}
              <div className="space-y-5 mb-8">
                <div className="flex items-center gap-4">
                  <EnvelopeIcon className="w-7 h-7 text-cyan-400" />
                  <p className="text-lg text-gray-200">{contact.email}</p>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-4">
                    <PhoneIcon className="w-7 h-7 text-green-400" />
                    <p className="text-lg text-gray-200">{contact.phone}</p>
                  </div>
                )}
              </div>

              {/* Tags + Revenue */}
              <div className="flex flex-wrap gap-3 mb-6">
                {contact.tags?.slice(0, 4).map((tag, i) => (
                  <span key={i} className="px-4 py-2 bg-primary/20 rounded-full text-primary text-sm font-medium border border-primary/30">
                    {tag}
                  </span>
                ))}
                {contact.tags && contact.tags.length > 4 && (
                  <span className="px-4 py-2 bg-white/10 rounded-full text-gray-400 text-sm">
                    +{contact.tags.length - 4}
                  </span>
                )}
              </div>

              {contact.revenue_potential && (
                <div className="text-right">
                  <p className="text-4xl font-bold text-green-400">
                    R$ {contact.revenue_potential.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-gray-500 text-sm">Potencial de receita</p>
                </div>
              )}

              <p className="text-gray-500 text-sm mt-8 flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Último contato: {contact.last_contact ? new Date(contact.last_contact).toLocaleDateString('pt-BR') : 'Nunca'}
              </p>
            </div>
          ))}
        </div>

        {/* Empty State Supremo */}
        {!loading && contacts.length === 0 && (
          <div className="text-center py-40">
            <UserGroupIcon className="w-40 h-40 text-gray-700 mx-auto mb-12 opacity-50" />
            <h2 className="text-5xl font-bold text-gray-400 mb-8">
              Nenhum contato ainda
            </h2>
            <p className="text-2xl text-gray-500">
              Quando o primeiro lead entrar, o Citizen Supremo X.1 vai começar a trabalhar.
            </p>
          </div>
        )}
      </div>
  );
}
