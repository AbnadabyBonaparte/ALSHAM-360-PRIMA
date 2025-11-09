// src/components/leads/LeadCard.tsx
import { motion } from 'framer-motion';
import { Phone, Mail, Building, Calendar, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { formatPhoneForWhatsApp, formatPhoneDisplay, isValidBrazilianPhone } from '../../utils/phoneFormatter';
import LeadScoreGauge from './LeadScoreGauge';

interface LeadCardProps {
  lead: any;
  delay?: number;
  onView?: (lead: any) => void;
}

export default function LeadCard({ lead, delay = 0, onView }: LeadCardProps) {
  const [isHovered, setIsHovered] = useState(false);

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

    const cleanPhone = phone.replace(/\D/g, '');
    window.location.href = `tel:+55${cleanPhone}`;
  };

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

    const whatsappPhone = formatPhoneForWhatsApp(phone);
    
    const message = encodeURIComponent(
      `Olá ${lead.nome || 'cliente'}! 👋\n\n` +
      `Vi que você demonstrou interesse em nossos serviços e gostaria de conversar com você.\n\n` +
      `Quando seria um bom momento para conversarmos?\n\n` +
      `Atenciosamente,\nEquipe ALSHAM 360° PRIMA`
    );

    window.open(`https://wa.me/${whatsappPhone}?text=${message}`, '_blank');
  };

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
        <div className="absolute inset-0 pointer-events-none" 
             style={{ 
               background: `linear-gradient(135deg, var(--color-primary-from), var(--color-primary-to))`,
               opacity: 0.05
             }} 
        />
      )}

      {/* Header com Nome, Email e Gráfico de Pizza */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">
            {lead.nome || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Lead sem nome'}
          </h3>
          <p className="text-sm text-gray-400">{lead.email || 'Sem email'}</p>
        </div>

        {/* 🍕 GRÁFICO DE PIZZA! */}
        <div className="flex-shrink-0">
          <LeadScoreGauge score={score} size={60} />
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
        <span 
          className="px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{ 
            background: `linear-gradient(135deg, var(--color-primary-from), var(--color-primary-to))`,
            opacity: 0.9
          }}
        >
          {lead.status || 'novo'}
        </span>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 🎨 BOTÕES COM CORES DINÂMICAS DO TEMA */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-3 gap-2 relative z-10">
        {/* Botão Ligar - Usa cores INFO do tema */}
        <motion.button
          whileHover={{ scale: hasValidPhone ? 1.05 : 1 }}
          whileTap={{ scale: hasValidPhone ? 0.95 : 1 }}
          onClick={handleCall}
          disabled={!hasValidPhone}
          className="px-3 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 text-sm text-white"
          style={hasValidPhone ? {
            background: `linear-gradient(135deg, var(--color-info-from), var(--color-info-to))`
          } : {
            background: '#27272a',
            color: '#71717a',
            cursor: 'not-allowed'
          }}
        >
          <Phone className="w-3.5 h-3.5" />
          Ligar
        </motion.button>

        {/* Botão WhatsApp - Usa cores SUCCESS do tema */}
        <motion.button
          whileHover={{ scale: hasValidPhone ? 1.05 : 1 }}
          whileTap={{ scale: hasValidPhone ? 0.95 : 1 }}
          onClick={handleWhatsApp}
          disabled={!hasValidPhone}
          className="px-3 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 text-sm text-white"
          style={hasValidPhone ? {
            background: `linear-gradient(135deg, var(--color-success-from), var(--color-success-to))`
          } : {
            background: '#27272a',
            color: '#71717a',
            cursor: 'not-allowed'
          }}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Zap
        </motion.button>

        {/* Botão Email - Usa cores ACCENT do tema */}
        <motion.button
          whileHover={{ scale: lead.email ? 1.05 : 1 }}
          whileTap={{ scale: lead.email ? 0.95 : 1 }}
          onClick={handleEmail}
          disabled={!lead.email}
          className="px-3 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 text-sm text-white"
          style={lead.email ? {
            background: `linear-gradient(135deg, var(--color-accent-from), var(--color-accent-to))`
          } : {
            background: '#27272a',
            color: '#71717a',
            cursor: 'not-allowed'
          }}
        >
          <Mail className="w-3.5 h-3.5" />
          Email
        </motion.button>
      </div>

      {/* IA Insights Preview */}
      {lead.ai_conversion_probability && (
        <div className="mt-4 pt-4 border-t border-neutral-800 relative z-10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Conversão prevista:</span>
            <span 
              className="font-bold"
              style={{ color: 'var(--color-primary-from)' }}
            >
              {lead.ai_conversion_probability}%
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
