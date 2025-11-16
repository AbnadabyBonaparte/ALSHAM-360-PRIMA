// src/components/leads/LeadCard.tsx
import { motion } from 'framer-motion';
import { Mail, Phone, Building, Calendar, Star, TrendingUp, MoreVertical, Edit, Trash2, Eye, MessageSquare, User, MapPin } from 'lucide-react';
import { useState } from 'react';
import LeadScoreGauge from './LeadScoreGauge';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  score_ia?: number;
  status: string;
  lead_source?: string;
  created_at: string;
  last_contact?: string;
  ai_conversion_probability?: number;
  ai_next_best_action?: any;
  ai_sentiment?: any;
}

interface LeadCardProps {
  lead: Lead;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  onView?: (lead: Lead) => void;
  delay?: number;
}

export default function LeadCard({ lead, onEdit, onDelete, onView, delay = 0 }: LeadCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'from-[var(--accent-blue)] to-[var(--accent-indigo)]',
      contacted: 'from-[var(--accent-purple)] to-[var(--accent-pink)]',
      qualified: 'from-[var(--accent-emerald)] to-[var(--accent-teal)]',
      proposal: 'from-[var(--accent-orange)] to-[var(--accent-yellow)]',
      negotiation: 'from-[var(--accent-cyan)] to-[var(--accent-blue)]',
      won: 'from-[var(--accent-green)] to-[var(--accent-emerald)]',
      lost: 'from-[var(--accent-red)] to-[var(--accent-pink)]'
    };
    return colors[status as keyof typeof colors] || 'from-[var(--neutral-gray)] to-[var(--neutral-gray-dark)]';
  };

  const getInitials = () => {
    return `${lead.first_name?.[0] || ''}${lead.last_name?.[0] || ''}`.toUpperCase();
  };

  const daysSinceContact = lead.last_contact ? Math.floor((Date.now() - new Date(lead.last_contact).getTime()) / (1000 * 60 * 60 * 24)) : null;

  const handleCall = () => {
    if (!lead.phone) {
      alert('Lead sem telefone cadastrado');
      return;
    }
    const cleanPhone = lead.phone.replace(/\D/g, '');
    window.location.href = `tel:+55${cleanPhone}`;
  };

  const handleWhatsApp = () => {
    if (!lead.phone) {
      alert('Lead sem telefone cadastrado');
      return;
    }
    const cleanPhone = lead.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá ${lead.first_name}! 👋\n\nVi que você demonstrou interesse e gostaria de conversar com você.\n\nQuando seria um bom momento?\n\nAtenciosamente,\nEquipe ALSHAM`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const handleEmail = () => {
    if (!lead.email) {
      alert('Lead sem email cadastrado');
      return;
    }
    const subject = encodeURIComponent('Contato - ALSHAM 360° PRIMA');
    const body = encodeURIComponent(
      `Olá ${lead.first_name} ${lead.last_name},\n\nEspero que este email encontre você bem.\n\nEntramos em contato sobre seu interesse em nossos serviços.\n\nAtenciosamente,\nEquipe ALSHAM 360° PRIMA`
    );
    window.location.href = `mailto:${lead.email}?subject=${subject}&body=${body}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[var(--neutral-900)] border border-[var(--neutral-800)] rounded-2xl p-4 sm:p-6 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-pink)] flex items-center justify-center text-white font-bold text-sm">
            {getInitials()}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getStatusColor(lead.status)} text-white`}>
            {lead.status}
          </span>
        </div>
        <motion.button
          onClick={() => setShowMenu(!showMenu)}
          whileHover={{ scale: 1.05 }}
          className="text-[var(--text-gray)] hover:text-[var(--text-white)]"
        >
          <MoreVertical className="w-5 h-5" />
        </motion.button>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-8 right-4 bg-[var(--neutral-950)] border border-[var(--neutral-800)] rounded-lg shadow-lg py-2 z-10"
          >
            {onEdit && (
              <button onClick={() => onEdit(lead)} className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-gray)] hover:bg-[var(--neutral-900)] w-full">
                <Edit className="w-4 h-4" /> Editar
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(lead)} className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-gray)] hover:bg-[var(--neutral-900)] w-full">
                <Trash2 className="w-4 h-4" /> Excluir
              </button>
            )}
            {onView && (
              <button onClick={() => onView(lead)} className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-gray)] hover:bg-[var(--neutral-900)] w-full">
                <Eye className="w-4 h-4" /> Ver Detalhes
              </button>
            )}
          </motion.div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-[var(--text-white)] text-lg">
          {lead.first_name} {lead.last_name}
        </h3>
        {lead.position && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-gray)]">
            <User className="w-4 h-4" />
            {lead.position}
          </div>
        )}
        {lead.company && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-gray)]">
            <Building className="w-4 h-4" />
            {lead.company}
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-[var(--text-gray)]">
          <Mail className="w-4 h-4" />
          {lead.email}
        </div>
        {lead.phone && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-gray)]">
            <Phone className="w-4 h-4" />
            {lead.phone}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <LeadScoreGauge score={lead.score_ia || 50} size={60} />
          <div className="text-right">
            <div className="text-xs text-[var(--text-gray)]">Conversão</div>
            <div className="font-bold text-[var(--accent-emerald)]">{lead.ai_conversion_probability || 0}%</div>
          </div>
        </div>
        
        {lead.ai_next_best_action && (
          <div className="bg-[var(--neutral-950)] p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--accent-blue)] mb-1">
              {lead.ai_next_best_action.icon} Próxima Ação
            </div>
            <p className="text-xs text-[var(--text-gray)]">{lead.ai_next_best_action.script}</p>
          </div>
        )}
        
        <div className="flex justify-between text-xs text-[var(--text-gray)] mt-4">
          <span>{new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
          {daysSinceContact !== null && (
            <span className="text-[var(--accent-orange)]">{daysSinceContact}d sem contato</span>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button 
          onClick={handleCall}
          className="flex-1 py-2 bg-[var(--accent-blue-10)] border border-[var(--accent-blue-20)] text-[var(--accent-blue)] rounded-lg text-sm hover:bg-[var(--accent-blue-20)] transition-colors flex items-center justify-center gap-1"
        >
          <Phone className="w-4 h-4" />
          Ligar
        </button>
        <button 
          onClick={handleWhatsApp}
          className="flex-1 py-2 bg-[var(--accent-green-10)] border border-[var(--accent-green-20)] text-[var(--accent-green)] rounded-lg text-sm hover:bg-[var(--accent-green-20)] transition-colors flex items-center justify-center gap-1"
        >
          <MessageSquare className="w-4 h-4" />
          Zap
        </button>
        <button 
          onClick={handleEmail}
          className="flex-1 py-2 bg-[var(--accent-pink-10)] border border-[var(--accent-pink-20)] text-[var(--accent-pink)] rounded-lg text-sm hover:bg-[var(--accent-pink-20)] transition-colors flex items-center justify-center gap-1"
        >
          <Mail className="w-4 h-4" />
          Email
        </button>
      </div>
    </motion.div>
  );
}
