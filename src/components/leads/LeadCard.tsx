// src/components/leads/LeadCard.tsx
import { motion } from 'framer-motion';
import { Phone, Mail, Building, Calendar, TrendingUp, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { formatPhoneForWhatsApp, formatPhoneDisplay, isValidBrazilianPhone } from '../../utils/phoneFormatter';

interface LeadCardProps {
  lead: any;
  delay?: number;
  onView?: (lead: any) => void;
}

export default function LeadCard({ lead, delay = 0, onView }: LeadCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔧 FIX 1: LIGAR (TELEFONEMA)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const phone = lead.telefone || lead.phone;
    if (!phone) {
      alert('❌ Lead sem telefone cadastrado');
      return;
    }

    if (!isValidBrazilianPhone(phone)) {
      alert('⚠️ Telefone inválido');
      return;
    }

    // Abrir discador do telefone
    const cleanPhone = phone.replace(/\D/g, '');
    window.location.href = `tel:+55${cleanPhone}`;
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔧 FIX 2: WHATSAPP COM NÚMERO BRASILEIRO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const phone = lead.telefone || lead.phone;
    if (!phone) {
      alert('❌ Lead sem telefone cadastrado');
      return;
    }

    if (!isValidBrazilianPhone(phone)) {
      alert('⚠️ Telefone inválido');
      return;
    }

    // Formatar para WhatsApp (com +55)
    const whatsappPhone = formatPhoneForWhatsApp(phone);
    
    // Mensagem personalizada
    const message = encodeURIComponent(
      `Olá ${lead.nome || 'cliente'}! 👋\n\n` +
      `Vi que você demonstrou interesse em nossos serviços e gostaria de conversar com você.\n\n` +
      `Quando seria um bom momento para conversarmos?\n\n` +
      `Atenciosamente,\nEquipe ALSHAM 360° PRIMA`
    );

    // Abrir WhatsApp
    window.open(`https://wa.me/${whatsappPhone}?text=${message}`, '_blank');
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔧 FIX 3: EMAIL COM MAILTO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const email = lead.email;
    if (!email) {
      alert('❌ Lead sem email cadastrado');
      return;
    }

    const subject = encodeURIComponent('Contato - ALSHAM 360° PRIMA');
    const body = encodeURIComponent(
      `Olá ${lead.nome || 'cliente'},\n\n` +
      `Espero que este email encontre você bem.\n\n` +
      `Entramos em contato sobre seu interesse em nossos serviços.\n\n` +
      `Gostaríamos de agendar uma conversa para entender melhor suas necessidades.\n\n` +
      `Atenciosamente,\n` +
      `Equipe ALSHAM 360° PRIMA\n` +
      `www.alshamglobal.com.br`
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-blue-500 to-cyan-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const score = lead.score_ia || 0;
  const phone = lead.telefone || lead.phone;
  const hasValidPhone = phone && isValidBrazilianPhone(phone);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView?.(lead)}
      className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6 cursor-pointer hover:border-emerald-500 transition-all relative overflow-hidden"
    >
      {/* Glow effect */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">
            {lead.nome || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Lead sem nome'}
          </h3>
          <p className="text-sm text-gray-400">{lead.email || 'Sem email'}</p>
        </div>

        {/* Score Badge */}
        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getScoreColor(score)} text-white text-sm font-bold`}>
          {score}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4 relative z-10">
        {lead.empresa && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Building className="w-4 h-4" />
            {lead.empresa}
          </div>
        )}

        {phone && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Phone className="w-4 h-4" />
            {formatPhoneDisplay(phone)}
          </div>
        )}

        {lead.created_at && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            {new Date(lead.created_at).toLocaleDateString('pt-BR')}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="mb-4 relative z-10">
        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold">
          {lead.status || 'novo'}
        </span>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 🔧 FIX: BOTÕES TODOS FUNCIONANDO */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-3 gap-2 relative z-10">
        {/* Botão Ligar */}
        <motion.button
          whileHover={{ scale: hasValidPhone ? 1.05 : 1 }}
          whileTap={{ scale: hasValidPhone ? 0.95 : 1 }}
          onClick={handleCall}
          disabled={!hasValidPhone}
          className={`
            px-3 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 text-sm
            ${hasValidPhone
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
              : 'bg-neutral-800 text-gray-600 cursor-not-allowed'
            }
          `}
        >
          <Phone className="w-3.5 h-3.5" />
          Ligar
        </motion.button>

        {/* Botão WhatsApp */}
        <motion.button
          whileHover={{ scale: hasValidPhone ? 1.05 : 1 }}
          whileTap={{ scale: hasValidPhone ? 0.95 : 1 }}
          onClick={handleWhatsApp}
          disabled={!hasValidPhone}
          className={`
            px-3 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 text-sm
            ${hasValidPhone
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
              : 'bg-neutral-800 text-gray-600 cursor-not-allowed'
            }
          `}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Zap
        </motion.button>

        {/* Botão Email */}
        <motion.button
          whileHover={{ scale: lead.email ? 1.05 : 1 }}
          whileTap={{ scale: lead.email ? 0.95 : 1 }}
          onClick={handleEmail}
          disabled={!lead.email}
          className={`
            px-3 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 text-sm
            ${lead.email
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              : 'bg-neutral-800 text-gray-600 cursor-not-allowed'
            }
          `}
        >
          <Mail className="w-3.5 h-3.5" />
          Email
        </motion.button>
      </div>

      {/* IA Insights Preview */}
      {lead.ai_conversion_probability && (
        <div className="mt-4 pt-4 border-t border-neutral-800 relative z-10">
          <div className="flex items-center gap-2 text-xs">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-gray-400">Conversão:</span>
            <span className="text-emerald-400 font-bold">
              {lead.ai_conversion_probability}%
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
