import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  motion, 
  AnimatePresence,
  useSpring,
  useTransform,
  useMotionValue
} from 'framer-motion';
import { 
  Phone, Mail, MapPin, Linkedin, Globe, 
  Calendar, Clock, Shield, Zap, 
  MessageSquare, FileText, CheckCircle2, 
  AlertTriangle, TrendingUp, MoreVertical,
  Send, Brain, HeartPulse, History
} from 'lucide-react';
import LayoutSupremo from '@/components/LayoutSupremo';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔮 COMPONENTES VISUAIS (ATÔMICOS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const GlassPanel = ({ children, className = "" }: any) => (
  <div className={`relative overflow-hidden rounded-[32px] border border-white/5 bg-[#0a0a0a]/60 backdrop-blur-2xl ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
    {children}
  </div>
);

const ResonanceOrb = ({ score, mood }: { score: number, mood: 'happy' | 'neutral' | 'angry' }) => {
  const color = mood === 'happy' ? '#10b981' : mood === 'angry' ? '#ef4444' : '#3b82f6';
  
  return (
    <div className="relative grid place-content-center h-32 w-32">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ backgroundColor: color }}
      />
      <motion.div 
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="relative z-10 grid h-20 w-20 place-content-center rounded-full border-2 border-white/10 bg-black/40 backdrop-blur-md shadow-2xl"
        style={{ borderColor: color }}
      >
        <div className="text-center">
          <span className="block text-2xl font-bold text-white">{score}</span>
          <span className="text-[9px] uppercase tracking-widest text-white/50">Score</span>
        </div>
      </motion.div>
    </div>
  );
};

const Tag = ({ text, type = 'default' }: { text: string, type?: 'default' | 'alert' | 'gold' }) => {
  const styles = {
    default: "bg-white/5 text-white/60 border-white/10",
    alert: "bg-red-500/10 text-red-400 border-red-500/20",
    gold: "bg-amber-500/10 text-amber-400 border-amber-500/20"
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border ${styles[type]}`}>
      {text}
    </span>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧠 LOGIC HOOKS (REAL DATA)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function useCustomerData(id?: string) {
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDeepProfile() {
      setLoading(true);
      
      // 1. Tenta pegar o lead pelo ID da URL, ou o mais recente se não tiver ID
      let query = supabase.from('leads_crm').select('*');
      if (id) query = query.eq('id', id);
      else query = query.order('created_at', { ascending: false }).limit(1);

      const { data: leads } = await query;
      const currentLead = leads?.[0];

      if (currentLead) {
        // 2. Simula Intelligence Data (enquanto não temos tabelas de IA reais)
        const enrichedLead = {
          ...currentLead,
          role: currentLead.role || "Head de Inovação",
          company: currentLead.company_name || "TechCorp Global",
          location: "São Paulo, BR (GMT-3)",
          linkedin: "linkedin.com/in/perfil-falso",
          ltv: "R$ 142.000",
          pipeline: "R$ 45.000",
          mood: Math.random() > 0.5 ? 'happy' : 'neutral',
          score: Math.floor(Math.random() * (99 - 60) + 60),
          nextAction: "Enviar proposta revisada com desconto de 5%",
          tags: ["Tomador de Decisão", "Orçamento Aprovado", "Urgente"]
        };

        // 3. Mock Timeline (Stream) - Em produção viria de 'interactions' table
        const mockStream = [
          { id: 1, type: 'email', title: 'Proposta visualizada', desc: 'O cliente abriu o PDF da proposta v2.', date: new Date(Date.now() - 1000 * 60 * 30), icon: <FileText className="w-4 h-4 text-blue-400" /> },
          { id: 2, type: 'call', title: 'Call de Alinhamento', desc: 'Duração: 42min. Sentimento: Positivo.', date: new Date(Date.now() - 1000 * 60 * 60 * 24), icon: <Phone className="w-4 h-4 text-emerald-400" /> },
          { id: 3, type: 'note', title: 'Nota Interna', desc: 'Victor pediu para focar na feature de IA.', date: new Date(Date.now() - 1000 * 60 * 60 * 48), icon: <Shield className="w-4 h-4 text-amber-400" /> },
        ];

        setLead(enrichedLead);
        setTimeline(mockStream);
      }
      setLoading(false);
    }

    fetchDeepProfile();
  }, [id]);

  return { lead, timeline, loading };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 PAGE COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function Customer360() {
  const { id } = useParams();
  const { lead, timeline, loading } = useCustomerData(id);

  if (loading) return (
    <LayoutSupremo>
       <div className="h-screen flex items-center justify-center">
         <div className="animate-spin h-8 w-8 border-t-2 border-emerald-500 rounded-full" />
       </div>
    </LayoutSupremo>
  );

  if (!lead) return (
    <LayoutSupremo>
       <div className="h-screen flex flex-col items-center justify-center text-white/50">
         <Shield className="h-12 w-12 mb-4 opacity-20" />
         <p>Nenhum lead selecionado ou encontrado.</p>
       </div>
    </LayoutSupremo>
  );

  return (
    <LayoutSupremo title="Customer Neural Twin">
      <div className="min-h-screen p-6 lg:p-10 max-w-[1800px] mx-auto space-y-8">
        
        {/* TOP HEADER: IDENTITY CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8 items-end"
        >
          <div className="relative">
            <div className="h-32 w-32 rounded-[24px] overflow-hidden border-2 border-white/10 shadow-2xl">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.name}`} 
                alt={lead.name}
                className="h-full w-full object-cover bg-gradient-to-br from-gray-800 to-black"
              />
            </div>
            <div className="absolute -bottom-3 -right-3 h-10 w-10 bg-[#0a0a0a] rounded-full flex items-center justify-center border border-white/10">
              <div className={`h-3 w-3 rounded-full ${lead.mood === 'happy' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-white tracking-tight">{lead.name}</h1>
                <CheckCircle2 className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-xl text-white/50 font-light flex items-center gap-2">
                {lead.role} <span className="text-white/20">•</span> <span className="text-emerald-400">{lead.company}</span>
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Tag text="Tomador de Decisão" type="gold" />
              <Tag text="Orçamento Aprovado" type="default" />
              <Tag text="Risco de Churn: Baixo" type="default" />
            </div>

            <div className="flex gap-6 text-sm text-white/40">
              <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <Mail className="h-4 w-4" /> {lead.email}
              </div>
              <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <Phone className="h-4 w-4" /> {lead.phone}
              </div>
              <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <MapPin className="h-4 w-4" /> {lead.location}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <GlassPanel className="px-8 py-4 text-center min-w-[140px]">
              <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Pipeline</p>
              <p className="text-2xl font-bold text-white">{lead.pipeline}</p>
            </GlassPanel>
            <GlassPanel className="px-8 py-4 text-center min-w-[140px]">
              <p className="text-xs uppercase tracking-widest text-white/40 mb-1">LTV Est.</p>
              <p className="text-2xl font-bold text-emerald-400">{lead.ltv}</p>
            </GlassPanel>
          </div>
        </motion.div>

        {/* MAIN BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: INTELLIGENCE & CONTEXT (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* The Resonance Orb Card */}
            <GlassPanel className="p-8 flex flex-col items-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <Brain className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Saúde da Relação</h3>
              <ResonanceOrb score={lead.score} mood={lead.mood} />
              <p className="mt-6 text-center text-sm text-white/60 leading-relaxed max-w-[200px]">
                O engajamento aumentou <span className="text-emerald-400 font-bold">+14%</span> nos últimos 7 dias. Momento ideal para upsell.
              </p>
            </GlassPanel>

            {/* Next Best Action (AI) */}
            <GlassPanel className="p-6 bg-gradient-to-br from-purple-900/20 to-transparent border-purple-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-bold text-purple-200">Next Best Action</h3>
              </div>
              <p className="text-lg font-medium text-white mb-4 leading-snug">
                "{lead.nextAction}"
              </p>
              <button className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/50">
                <Zap className="h-4 w-4" /> Executar Agora
              </button>
            </GlassPanel>

            {/* Organization Info */}
            <GlassPanel className="p-6">
               <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Firmographics</h3>
               <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-white/60">Setor</span>
                   <span className="text-white">SaaS Enterprise</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-white/60">Funcionários</span>
                   <span className="text-white">1,000 - 5,000</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-white/60">Receita Anual</span>
                   <span className="text-white">$50M - $100M</span>
                 </div>
                 <div className="h-[1px] bg-white/5 my-2" />
                 <div className="flex items-center gap-3 mt-2">
                   <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs">boss</div>
                   <div>
                     <p className="text-xs text-white/40">Reporta para</p>
                     <p className="text-sm text-white">Roberto Justus (CEO)</p>
                   </div>
                 </div>
               </div>
            </GlassPanel>
          </div>

          {/* CENTER: THE STREAM (Timeline) (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
             <div className="flex items-center gap-4 bg-[#0a0a0a] p-1 rounded-xl border border-white/10 w-max">
               {['Overview', 'Atividades', 'Emails', 'Arquivos'].map((tab, i) => (
                 <button key={tab} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${i === 1 ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
                   {tab}
                 </button>
               ))}
             </div>

             <div className="relative space-y-8 pl-8 before:absolute before:left-[15px] before:top-4 before:bottom-4 before:w-[2px] before:bg-white/5">
                {/* Input Box */}
                <div className="relative -ml-8 mb-8">
                  <GlassPanel className="p-4">
                    <textarea 
                      placeholder="Adicionar nota, logar call ou colar email..." 
                      className="w-full bg-transparent border-none text-white placeholder-white/20 resize-none focus:ring-0 text-sm h-20"
                    />
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/5 rounded-lg text-white/40"><Phone className="h-4 w-4" /></button>
                        <button className="p-2 hover:bg-white/5 rounded-lg text-white/40"><Mail className="h-4 w-4" /></button>
                      </div>
                      <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide">
                        Salvar
                      </button>
                    </div>
                  </GlassPanel>
                </div>

                {/* Timeline Items */}
                {timeline.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative"
                  >
                    <div className="absolute -left-[41px] top-0 h-8 w-8 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-lg z-10">
                      {item.icon}
                    </div>
                    <GlassPanel className="p-5 hover:border-white/20 transition-colors group cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{item.title}</h4>
                        <span className="text-xs text-white/30 whitespace-nowrap">
                          {formatDistanceToNow(item.date, { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed">
                        {item.desc}
                      </p>
                    </GlassPanel>
                  </motion.div>
                ))}
             </div>
          </div>

          {/* RIGHT: QUICK DOCK & STATS (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all group">
                <Phone className="h-6 w-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-emerald-100">Ligar</span>
              </button>
              <button className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all group">
                <Mail className="h-6 w-6 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-blue-100">Email</span>
              </button>
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all group">
                <MessageSquare className="h-6 w-6 text-white/60 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white/60">WhatsApp</span>
              </button>
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all group">
                <MoreVertical className="h-6 w-6 text-white/60 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white/60">Mais</span>
              </button>
            </div>

            {/* Engagement Heatmap Mini */}
            <GlassPanel className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Engajamento</h3>
              <div className="grid grid-cols-7 gap-1 h-24">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`rounded-sm ${Math.random() > 0.7 ? 'bg-emerald-500/60' : Math.random() > 0.4 ? 'bg-emerald-500/20' : 'bg-white/5'}`} 
                  />
                ))}
              </div>
              <p className="mt-2 text-[10px] text-center text-white/30">Últimos 28 dias</p>
            </GlassPanel>

            {/* Upcoming */}
            <GlassPanel className="p-0">
               <div className="p-4 border-b border-white/5 flex justify-between items-center">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Próximo</h3>
                 <button className="text-[10px] bg-white/10 px-2 py-1 rounded hover:bg-white/20">+ Add</button>
               </div>
               <div className="p-4">
                 <div className="flex gap-3 items-start opacity-60">
                    <Calendar className="h-4 w-4 text-white mt-1" />
                    <div>
                      <p className="text-sm font-medium text-white">Reunião de Fechamento</p>
                      <p className="text-xs text-white/50">Amanhã, 14:00</p>
                    </div>
                 </div>
               </div>
            </GlassPanel>

          </div>
        </div>
      </div>
    </LayoutSupremo>
  );
}
