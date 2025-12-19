// src/pages/LandingPageBuilder.tsx
// ALSHAM VORTEX ARCHITECT — VERSÃO 2000/1000 — CANÔNICA, EQUILIBRADA E IMORTAL
// Totalmente integrada ao layout global (HeaderSupremo + SidebarSupremo + Tema Dinâmico)
// Sem layout duplicado • Proporções harmoniosas • 100% variáveis de tema • Poder máximo mantido

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Monitor, Tablet, Smartphone, Globe, Wand2,
  Plus, Save, Trash2, Copy, Layout, Zap, MousePointer2, Type, Crown, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client'; // ajuste o path se necessário
import toast from 'react-hot-toast';

type BlockType = 'hero' | 'features' | 'cta' | 'testimonials' | 'pricing';
type Device = 'desktop' | 'tablet' | 'mobile';

interface HeroBlock { id: string; type: 'hero'; content: { headline: string; subheadline: string; cta: string; } }
interface FeaturesBlock { id: string; type: 'features'; content: { title: string; items: { title: string; desc: string }[] } }
interface CtaBlock { id: string; type: 'cta'; content: { title: string; button: string; } }
interface TestimonialBlock { id: string; type: 'testimonials'; content: { quote: string; author: string; company: string } }
interface PricingBlock { id: string; type: 'pricing'; content: { plan: string; price: string; period: string; features?: string[] } }

type Block = HeroBlock | FeaturesBlock | CtaBlock | TestimonialBlock | PricingBlock;

const DEFAULTS: Record<BlockType, Block['content']> = {
  hero: { headline: "ENTRE NO VÓRTICE", subheadline: "Onde ambição vira império em segundos.", cta: "ACESSAR O PORTAL" },
  features: { title: "PODER ABSOLUTO", items: [{ title: "Velocidade Quântica", desc: "10x mais rápido" }, { title: "Segurança Eterna", desc: "Criptografia de outro mundo" }, { title: "Escalabilidade Infinita", desc: "Sem limites" }] },
  cta: { title: "PRONTO PARA O PRÓXIMO NÍVEL?", button: "ATIVAR DOMÍNIO" },
  testimonials: { quote: "Eu vi o futuro. E ele tem o logo da ALSHAM.", author: "Victor A.", company: "Fundador" },
  pricing: { plan: "DOMÍNIO", price: "R$ 9.997", period: "/mês", features: ["Tudo ilimitado", "Suporte divino", "IA Suprema incluída"] }
};

const BlockPreview = ({ block, selected, onSelect, device }: { block: Block; selected: boolean; onSelect: () => void; device: Device }) => {
  const deviceWidth = device === 'mobile' ? 'w-full max-w-md' : device === 'tablet' ? 'w-full max-w-4xl' : 'w-full max-w-6xl';

  return (
    <Reorder.Item value={block} className="relative mb-8">
      <motion.div
        layout
        onClick={onSelect}
        className={`relative cursor-pointer rounded-3xl overflow-hidden border-4 transition-all ${selected ? 'border-[var(--accent-1)] ring-8 ring-[var(--accent-1)]/30 z-50' : 'border-transparent hover:border-[var(--border)]'}`}
      >
        {selected && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-[var(--background)] text-xs font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-2xl">
            {block.type.toUpperCase()}
          </div>
        )}
        <div className={`${deviceWidth} mx-auto`}>
          {/* HERO */}
          {block.type === 'hero' && (
            <div className="py-32 px-10 text-center bg-gradient-to-br from-[var(--accent-1)]/20 via-[var(--background)] to-[var(--accent-2)]/20">
              <h1 className="text-5xl font-black text-[var(--text)] mb-8">{block.content.headline}</h1>
              <p className="text-2xl text-[var(--text)]/80 mb-12 max-w-4xl mx-auto">{block.content.subheadline}</p>
              <button className="px-16 py-8 bg-[var(--accent-1)] text-[var(--background)] text-3xl font-black rounded-full hover:scale-110 transition-transform shadow-2xl">
                {block.content.cta}
              </button>
            </div>
          )}
          {/* FEATURES */}
          {block.type === 'features' && (
            <div className="py-32 px-10 bg-[var(--surface)]/60">
              <h2 className="text-4xl font-black text-center text-[var(--text)] mb-20">{block.content.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl mx-auto">
                {block.content.items.map((f, i) => (
                  <div key={i} className="text-center">
                    <div className="w-32 h-32 mx-auto mb-10 bg-gradient-to-br from-[var(--accent-1)]/40 to-[var(--accent-2)]/40 rounded-3xl border-4 border-[var(--accent-1)]/40" />
                    <h3 className="text-3xl font-black text-[var(--accent-1)] mb-4">{f.title}</h3>
                    <p className="text-xl text-[var(--text)]/80">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* CTA */}
          {block.type === 'cta' && (
            <div className="py-40 px-10 text-center bg-gradient-to-r from-[var(--accent-1)]/30 to-[var(--accent-2)]/30">
              <h2 className="text-5xl font-black text-[var(--text)] mb-16">{block.content.title}</h2>
              <button className="px-28 py-12 bg-[var(--surface)] text-[var(--text)] text-5xl font-black rounded-3xl border-8 border-[var(--border)] hover:scale-110 transition-transform shadow-2xl">
                {block.content.button}
              </button>
            </div>
          )}
          {/* TESTIMONIALS */}
          {block.type === 'testimonials' && (
            <div className="py-40 px-10 bg-[var(--surface)]/80 text-center">
              <p className="text-5xl italic text-[var(--text)]/90 mb-16 max-w-5xl mx-auto leading-tight">"{block.content.quote}"</p>
              <p className="text-3xl font-black text-[var(--accent-1)]">{block.content.author}</p>
              <p className="text-2xl text-[var(--text)]/60">{block.content.company}</p>
            </div>
          )}
          {/* PRICING */}
          {block.type === 'pricing' && (
            <div className="py-40 px-10 bg-gradient-to-b from-[var(--background)] to-[var(--surface)]/50 text-center">
              <p className="text-4xl text-[var(--text)]/60 uppercase tracking-widest mb-10">PLANO</p>
              <h2 className="text-5xl font-black text-[var(--text)] mb-6">{block.content.plan}</h2>
              <p className="text-9xl font-black text-[var(--accent-1)] mb-6">{block.content.price}</p>
              <p className="text-4xl text-[var(--text)]/60 mb-16">{block.content.period}</p>
              <ul className="space-y-5 text-2xl text-[var(--text)]/80 mb-16">
                {block.content.features?.map(f => <li key={f}>✓ {f}</li>) ?? <li className="text-[var(--text)]/40">Benefícios em breve</li>}
              </ul>
              <button className="px-28 py-12 bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-[var(--background)] text-5xl font-black rounded-3xl shadow-2xl hover:scale-105 transition-transform">
                ATIVAR DOMÍNIO
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </Reorder.Item>
  );
};

export default function LandingPageBuilder() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>('desktop');
  const [pageName, setPageName] = useState('Portal Supremo');
  const [pageId, setPageId] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('landing_pages').select('*').order('updated_at', { ascending: false }).limit(1);
      if (data?.[0]) {
        setPageId(data[0].id);
        setPageName(data[0].name);
        setBlocks(data[0].structure || []);
        if (data[0].published_url) setPublishedUrl(data[0].published_url);
      }
    };
    load();
  }, []);

  const save = async (customBlocks?: Block[], customName?: string) => {
    const payload = { name: customName || pageName, structure: customBlocks || blocks };
    if (pageId) {
      await supabase.from('landing_pages').update(payload).eq('id', pageId);
    } else {
      const { data } = await supabase.from('landing_pages').insert(payload).select().single();
      if (data) setPageId(data.id);
    }
    toast.success('Salvo automaticamente');
  };

  const publish = async () => {
    await save();
    const url = `https://${pageName.toLowerCase().replace(/\s+/g, '-')}.alsham.app`;
    await supabase.from('landing_pages').upsert({ id: pageId, published_url: url });
    setPublishedUrl(url);
    toast.success('PORTAL ABERTO PARA O MUNDO', { icon: <Globe className="w-6 h-6" />, duration: 10000 });
  };

  const generateWithAI = async () => {
    if (!aiPrompt) return;
    toast.loading('Vortex AI despertando...', { duration: 10000 });
    const { data } = await supabase.rpc('generate_landing_page', { prompt: aiPrompt });
    if (data?.structure) {
      setBlocks(data.structure);
      setPageName(data.name || 'Portal Forjado pela IA');
      await save(data.structure, data.name || 'Portal Forjado pela IA');
      toast.success('PORTAL CRIADO PELO VÓRTICE EM SEGUNDOS', { icon: <Crown className="w-6 h-6" /> });
    } else {
      toast.error('A IA precisa de mais energia...');
    }
    setAiPrompt('');
  };

  const selected = blocks.find(b => b.id === selectedId);

  return (
    <div className="flex-1 flex flex-col bg-[var(--background)] text-[var(--text)] overflow-hidden">
      {/* TOOLBAR SUPERIOR - Compacta e elegante */}
      <div className="h-20 border-b border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-md flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <h1 className="text-4xl font-black bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent">
            VORTEX ARCHITECT
          </h1>
          <input
            value={pageName}
            onChange={e => setPageName(e.target.value)}
            className="text-2xl font-bold bg-transparent border-none outline-none max-w-md"
            placeholder="Nome do Portal"
          />
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => save()} className="px-6 py-3 bg-[var(--surface)]/70 hover:bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-center gap-3 text-lg font-bold">
            <Save className="h-5 w-5" /> SALVAR
          </button>
          <div className="flex gap-2 bg-[var(--surface)]/50 rounded-xl p-1">
            <button onClick={() => setDevice('desktop')} className={`${device === 'desktop' ? 'bg-[var(--accent-1)] text-[var(--background)]' : 'text-[var(--text)]/60'} p-3 rounded-lg`}><Monitor className="w-5 h-5" /></button>
            <button onClick={() => setDevice('tablet')} className={`${device === 'tablet' ? 'bg-[var(--accent-1)] text-[var(--background)]' : 'text-[var(--text)]/60'} p-3 rounded-lg`}><Tablet className="w-5 h-5" /></button>
            <button onClick={() => setDevice('mobile')} className={`${device === 'mobile' ? 'bg-[var(--accent-1)] text-[var(--background)]' : 'text-[var(--text)]/60'} p-3 rounded-lg`}><Smartphone className="w-5 h-5" /></button>
          </div>
          <button onClick={publish} className="px-10 py-4 bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-[var(--background)] text-2xl font-black rounded-2xl shadow-xl hover:scale-105 transition-transform">
            PUBLICAR PORTAL
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* BIBLIOTECA DIVINA - Compacta */}
        <motion.div className="w-80 border-r border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-sm p-6 overflow-y-auto">
          <h2 className="text-4xl font-black mb-10 bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent">
            BIBLIOTECA DIVINA
          </h2>
          {(['hero', 'features', 'cta', 'testimonials', 'pricing'] as BlockType[]).map(type => (
            <button
              key={type}
              onClick={() => setBlocks(prev => [...prev, { id: Date.now().toString(), type, content: DEFAULTS[type] }])}
              className="w-full mb-6 p-6 rounded-2xl bg-[var(--surface)]/40 hover:bg-[var(--accent-1)]/20 border border-[var(--border)] hover:border-[var(--accent-1)] transition-all text-left group"
            >
              <div className="flex items-center gap-5">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--accent-1)] to-[var(--accent-2)]">
                  {type === 'hero' && <Layout className="w-10 h-10 text-[var(--background)]" />}
                  {type === 'features' && <Zap className="w-10 h-10 text-[var(--background)]" />}
                  {type === 'cta' && <MousePointer2 className="w-10 h-10 text-[var(--background)]" />}
                  {type === 'testimonials' && <Type className="w-10 h-10 text-[var(--background)]" />}
                  {type === 'pricing' && <Crown className="w-10 h-10 text-[var(--background)]" />}
                </div>
                <p className="text-2xl font-bold capitalize">{type === 'cta' ? 'Call to Action' : type}</p>
              </div>
            </button>
          ))}
        </motion.div>

        {/* CANVAS CENTRAL */}
        <div className="flex-1 overflow-auto p-8 bg-gradient-to-br from-[var(--background)] via-[var(--surface)]/10 to-[var(--background)]">
          <Reorder.Group axis="y" values={blocks} onReorder={setBlocks} className="max-w-6xl mx-auto">
            {blocks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text)]/30">
                <Plus className="w-24 h-24 mb-8" />
                <p className="text-5xl font-black">O VÓRTICE ESTÁ VAZIO</p>
                <p className="text-2xl mt-6">Adicione blocos da Biblioteca Divina</p>
              </div>
            ) : (
              blocks.map(block => (
                <BlockPreview key={block.id} block={block} selected={selectedId === block.id} onSelect={() => setSelectedId(block.id)} device={device} />
              ))
            )}
          </Reorder.Group>
        </div>

        {/* INSPECTOR DIREITO */}
        <AnimatePresence>
          {selectedId && selected && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-80 border-l border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-sm p-6 overflow-y-auto"
            >
              <h3 className="text-4xl font-black mb-8">EDITAR {selected.type.toUpperCase()}</h3>
              {Object.entries(selected.content).map(([key, value]) => (
                <div key={key} className="mb-8">
                  <label className="text-[var(--text)]/60 text-lg uppercase tracking-widest">{key}</label>
                  <textarea
                    value={value as string}
                    onChange={e => {
                      const newContent = { ...selected.content, [key]: e.target.value };
                      setBlocks(prev => prev.map(b => b.id === selectedId ? { ...b, content: newContent } : b));
                    }}
                    className="w-full mt-3 px-6 py-4 bg-[var(--background)]/50 border border-[var(--border)] rounded-xl text-xl text-[var(--text)] focus:border-[var(--accent-1)] outline-none min-h-[100px]"
                    rows={key === 'headline' || key === 'quote' ? 4 : 3}
                  />
                </div>
              ))}
              <div className="space-y-4 mt-12">
                <button
                  onClick={() => {
                    const duplicate = { ...selected, id: Date.now().toString() };
                    setBlocks(prev => [...prev, duplicate]);
                  }}
                  className="w-full py-5 bg-gradient-to-r from-[var(--accent-1)]/40 to-[var(--accent-2)]/40 rounded-xl text-xl font-black hover:from-[var(--accent-1)]/60 hover:to-[var(--accent-2)]/60 transition-colors flex items-center justify-center gap-4"
                >
                  <Copy className="h-7 w-7" /> DUPLICAR
                </button>
                <button
                  onClick={() => {
                    setBlocks(prev => prev.filter(b => b.id !== selectedId));
                    setSelectedId(null);
                  }}
                  className="w-full py-5 bg-red-600/40 hover:bg-red-600/60 rounded-xl text-xl font-black flex items-center justify-center gap-4"
                >
                  <Trash2 className="h-7 w-7" /> DELETAR
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI PROMPT BOX */}
      <motion.div className="fixed inset-x-4 bottom-8 z-50 pointer-events-none">
        <div className="max-w-5xl mx-auto relative pointer-events-auto">
          <input
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && generateWithAI()}
            placeholder="Fale com o Vortex: 'landing black friday com contagem regressiva'"
            className="w-full px-20 py-8 text-2xl font-light bg-[var(--surface)]/70 backdrop-blur-xl border-4 border-[var(--accent-1)]/50 rounded-2xl outline-none text-[var(--text)] placeholder-[var(--text)]/40 shadow-2xl"
          />
          <button
            onClick={generateWithAI}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-8 rounded-full bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] shadow-xl hover:scale-110 transition-transform"
          >
            <Wand2 className="h-12 w-12 text-[var(--background)]" />
          </button>
        </div>
      </motion.div>

      {/* PUBLISHED OVERLAY */}
      <AnimatePresence>
        {publishedUrl && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 right-8 z-50 bg-[var(--surface)]/90 backdrop-blur-xl border-4 border-[var(--accent-1)]/50 p-8 rounded-3xl shadow-2xl max-w-md"
          >
            <div className="flex items-center gap-6">
              <Globe className="h-16 w-16 text-[var(--accent-1)]" />
              <div>
                <h3 className="text-3xl font-black text-[var(--text)]">PORTAL ABERTO</h3>
                <p className="text-[var(--accent-1)] text-lg mt-2 break-all">{publishedUrl}</p>
              </div>
              <button onClick={() => setPublishedUrl(null)} className="ml-auto">
                <X className="h-8 w-8 text-[var(--text)]/50 hover:text-[var(--text)]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
