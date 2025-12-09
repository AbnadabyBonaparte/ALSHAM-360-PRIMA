import LayoutSupremo from '@/components/LayoutSupremo';
import { InboxIcon } from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function InboxPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('messages')
        .select('id, from, subject, body, created_at, read')
        .order('created_at', { ascending: false })
        .limit(20);
      setMessages(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <LayoutSupremo title="Caixa de Entrada">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <InboxIcon className="w-12 h-12 text-primary" />
          <h1 className="text-4xl font-bold">Caixa de Entrada</h1>
          <span className="text-xl text-pink-400">
            {messages.filter(m => !m.read).length} não lidas
          </span>
        </div>

        <div className="space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`p-6 rounded-2xl border ${msg.read ? 'bg-white/5 border-white/10' : 'bg-gradient-to-r from-purple-900/60 to-pink-900/60 border-pink-500'} hover:shadow-2xl transition-all`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-white">{msg.from}</p>
                  <p className="text-xl text-gray-200 mt-1">{msg.subject}</p>
                  <p className="text-gray-400 mt-3 line-clamp-2">{msg.body}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(msg.created_at).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LayoutSupremo>
  );
}
