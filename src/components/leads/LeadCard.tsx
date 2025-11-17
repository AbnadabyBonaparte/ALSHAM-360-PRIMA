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

  // ✅ PROTEÇÃO CONTRA LEAD UNDEFINED
  if (!lead) {
    return null;
  }

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-500',
      contacted: 'bg-purple-500',
      qualified: 'bg-emerald-500',
      proposal: 'bg-orange-500',
      negotiation: 'bg-cyan-500',
      won: 'bg-green-500',
      lost: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
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
      className="bg-[var(--neutral-900)] border border-[var(--neutral-800)] rounded-xl p-3 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
            {getInitials()}
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">{lead.first_name} {lead.last_name}</h3>
            <p className="text-xs text-gray-400">{lead.company || 'Sem empresa'}</p>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-white/5 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-[var(--neutral-800)] border border-[var(--neutral-700)] rounded-lg shadow-xl z-10 py-1 min-w-[140px]">
              <button
                onClick={() => { onView?.(lead); setShowMenu(false); }}
                className="w-full px-3 py-1.5 text-left text-sm text-white hover:bg-white/5 flex items-center gap-2"
              >
                <Eye className="w-3 h-3" />
                Ver Detalhes
              </button>
              <button
                onClick={() => { onEdit?.(lead); setShowMenu(false); }}
                className="w-full px-3 py-1.5 text-left text-sm text-white hover:bg-white/5 flex items-center gap-2"
              >
                <Edit className="w-3 h-3" />
                Editar
              </button>
              <button
                onClick={() => { onDelete?.(lead); setShowMenu(false); }}
                className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
              >
                <Trash2 className="w-3 h-3" />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.status)} text-white inline-block mb-2`}>
        {lead.status}
      </div>

      <div className="space-y-1.5 mb-3">
        {lead.email && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Mail className="w-3 h-3" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Phone className="w-3 h-3" />
            <span>{lead.phone}</span>
          </div>
        )}
        {lead.position && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <User className="w-3 h-3" />
            <span className="truncate">{lead.position}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center mb-3">
        <LeadScoreGauge score={lead.score_ia || 0} size="sm" showLabel={false} />
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={handleCall}
          className="flex-1 px-2 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1"
        >
          <Phone className="w-3 h-3" />
          Ligar
        </button>
        <button
          onClick={handleWhatsApp}
          className="flex-1 px-2 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1"
        >
          <MessageSquare className="w-3 h-3" />
          Zap
        </button>
        <button
          onClick={handleEmail}
          className="flex-1 px-2 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg text-xs font-semibold hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-1"
        >
          <Mail className="w-3 h-3" />
          Email
        </button>
      </div>

      {daysSinceContact !== null && daysSinceContact > 7 && (
        <div className="mt-2 px-2 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-xs text-orange-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>Sem contato há {daysSinceContact} dias</span>
        </div>
      )}
    </motion.div>
  );
}
