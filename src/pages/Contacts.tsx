// src/pages/Contacts.tsx
// ALSHAM 360° PRIMA v10 SUPREMO — Contatos Alienígena 1000/1000
// Link oficial: https://github.com/AbnadabyBonaparte/ALSHAM-360-PRIMA/blob/hotfix/recovery-prod/src/pages/Contacts.tsx

import { UserGroupIcon, PhoneIcon, EnvelopeIcon, BuildingOfficeIcon, SparklesIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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
    <div className="p-8 max-w-7xl mx-auto bg-[var(--bg)] text-[var(--text)]">
        {/* Header Supremo */}
        <Card className="mb-12 bg-[var(--grad-primary)] border-[var(--border)]">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-[var(--accent-1)]">
                    <UserGroupIcon className="w-10 h-10 animate-pulse" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl md:text-2xl lg:text-3xl bg-[var(--grad-primary)] bg-clip-text text-transparent">
                    Contatos Alienígena
                  </CardTitle>
                  <p className="text-3xl text-[var(--text-2)] mt-6">
                    {contacts.length} contatos • {hotContacts} quentes • R$ {totalRevenue.toLocaleString('pt-BR')} em potencial
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setSortBy('score')}
                  variant={sortBy === 'score' ? 'default' : 'outline'}
                  size="lg"
                  className="px-8 py-5 text-xl"
                >
                  IA Score
                </Button>
                <Button
                  onClick={() => setSortBy('recent')}
                  variant={sortBy === 'recent' ? 'default' : 'outline'}
                  size="lg"
                  className="px-8 py-5 text-xl"
                >
                  Mais Recente
                </Button>
                <Button
                  onClick={() => setSortBy('revenue')}
                  variant={sortBy === 'revenue' ? 'default' : 'outline'}
                  size="lg"
                  className="px-8 py-5 text-xl"
                >
                  Maior Potencial
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid Supremo */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10">
          {contacts.map((contact) => (
            <Card
              key={contact.id}
              className="group relative bg-[var(--surface)] border-[var(--border)] hover:border-[var(--accent-1)] transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--accent-1)]/30 hover:-translate-y-4"
            >
              {/* IA Score Badge */}
              <div className="absolute -top-4 -right-4 z-10">
                <Badge
                  variant={contact.score >= 90 ? 'default' : contact.score >= 70 ? 'destructive' : 'secondary'}
                  className="px-6 py-3 text-lg shadow-2xl"
                >
                  IA Score: {contact.score}/100
                  {contact.score >= 90 && <SparklesIcon className="w-6 h-6 inline ml-2 animate-pulse" />}
                </Badge>
              </div>

              {/* Avatar + Nome */}
              <CardContent className="p-10">
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <Avatar className="w-28 h-28">
                      <AvatarFallback className="bg-[var(--grad-primary)] text-5xl font-bold">
                        {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {contact.score >= 90 && (
                      <div className="absolute -bottom-2 -right-2">
                        <Avatar className="w-12 h-12 bg-[var(--accent-warm)]">
                          <AvatarFallback className="bg-[var(--accent-warm)] animate-bounce">
                            <StarIcon className="w-8 h-8 text-[var(--text)]" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-[var(--text)]">{contact.name}</h2>
                    <p className="text-xl text-[var(--text-2)] mt-2">{contact.title || 'Sem cargo'}</p>
                    <div className="flex items-center gap-3 mt-4">
                      <BuildingOfficeIcon className="w-6 h-6 text-[var(--text-muted)]" />
                      <p className="text-lg text-[var(--text-2)]">{contact.company || 'Sem empresa'}</p>
                    </div>
                  </div>
                </div>

                {/* Contatos */}
                <div className="space-y-5 mb-8">
                  <div className="flex items-center gap-4">
                    <EnvelopeIcon className="w-7 h-7 text-[var(--accent-2)]" />
                    <p className="text-lg text-[var(--text-2)]">{contact.email}</p>
                  </div>
                  {contact.phone && (
                    <div className="flex items-center gap-4">
                      <PhoneIcon className="w-7 h-7 text-[var(--accent-1)]" />
                      <p className="text-lg text-[var(--text-2)]">{contact.phone}</p>
                    </div>
                  )}
                </div>

                {/* Tags + Revenue */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {contact.tags?.slice(0, 4).map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-[var(--accent-1)] border-[var(--accent-1)]">
                      {tag}
                    </Badge>
                  ))}
                  {contact.tags && contact.tags.length > 4 && (
                    <Badge variant="secondary">
                      +{contact.tags.length - 4}
                    </Badge>
                  )}
                </div>

                {contact.revenue_potential && (
                  <div className="text-right">
                    <p className="text-4xl font-bold text-[var(--accent-1)]">
                      R$ {contact.revenue_potential.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-[var(--text-muted)] text-sm">Potencial de receita</p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm mt-8">
                  <ClockIcon className="w-5 h-5" />
                  Último contato: {contact.last_contact ? new Date(contact.last_contact).toLocaleDateString('pt-BR') : 'Nunca'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State Supremo */}
        {!loading && contacts.length === 0 && (
          <Card className="text-center py-40 bg-[var(--surface)] border-[var(--border)]">
            <CardContent>
              <UserGroupIcon className="w-40 h-40 text-[var(--text-muted)] mx-auto mb-12 opacity-50" />
              <h2 className="text-5xl font-bold text-[var(--text-2)] mb-8">
                Nenhum contato ainda
              </h2>
              <p className="text-2xl text-[var(--text-muted)]">
                Quando o primeiro lead entrar, o Citizen Supremo X.1 vai começar a trabalhar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
  );
}
