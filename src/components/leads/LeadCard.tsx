// src/components/leads/LeadCard.tsx
import { motion } from 'framer-motion';
import { 
  Mail, Phone, Building, Calendar, Star, TrendingUp,
  MoreVertical, Edit, Trash2, Eye, MessageSquare,
  User, MapPin, MessageCircle
} from 'lucide-react';
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

export default function LeadCard({ 
  lead, 
  onEdit, 
  onDelete, 
  onView,
  delay = 0 
}: LeadCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'from-blue-500 to-indigo-500',
      contacted: 'from-purple-500 to-pink-500',
      qualified: 'from-emerald-500 to-teal-500',
      proposal: 'from-orange-500 to-yellow-500',
      negotiation: 'from-cyan-500 to-blue-500',
      won: 'from-green-500 to-emerald-500',
      lost: 'from-red-500 to-pink-500'
    };
    return colors[status as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getInitials = () => {
    return `${lead.first_name?.[0] || ''}${lead.last_name?.[0] || ''}`.toUpperCase();
  };

  const daysSinceContact = lead.last_contact 
    ? Math.floor((Date.now() - new Date(lead.last_contact).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // 🟢 WHATSAPP - Formatação brasileira
  const formatPhone = (phone?: string) => {
    if (!phone) return '';
    const numbers = phone.replace(/\D/g, '');
    return numbers.startsWith('55') ? numbers : `55${numbers}`;
  };

  const openWhatsApp = () => {
    const formattedPhone = formatPhone(lead.phone);
    if (formattedPhone) {
      const message = encodeURIComponent(
        `Olá ${lead.first_name}! Entrei em contato através do ALSHAM 360° PRIMA.`
      );
      window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all shadow-xl hover:shadow-2xl"
    >
      {/* Header with Avatar */}
      <div className="relative h-32 bg-gradient-to-br from-neutral-800 to-neutral-900 p-6">
        <div className="absolute top-4 right-4">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 bg-neutral-900/50 hover:bg-neutral-900 rounded-lg backdrop-blur-sm transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl overflow-hidden z-10"
            >
              <button 
                onClick={() => onView?.(lead)}
                className="w-full px-4 py-3 text-left hover:bg-neutral-800 transition-colors flex items-center gap-3 text-gray-300"
              >
                <Eye className="w-4 h-4" />
                Ver Detalhes
              </button>
              <button 
                onClick={() => onEdit?.(lead)}
                className="w-full px-4 py-3 text-left hover:bg-neutral-800 transition-colors flex items-center gap-3 text-gray-300"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
              <button 
                onClick={() => onDelete?.(lead)}
                className="w-full px-4 py-3 text-left hover:bg-red-500/10 transition-colors flex items-center gap-3 text-red-400"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </motion.div>
          )}
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-10 left-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl font-bold text-white shadow-xl border-4 border-neutral-950">
            {getInitials()}
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`
            px-3 py-1 rounded-full text-xs font-semibold text-white
            bg-gradient-to-r ${getStatusColor(lead.status)}
          `}>
            {lead.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pt-14">
        {/* Name and Position */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-1">
            {lead.first_name} {lead.last_name}
          </h3>
          {lead.position && (
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <User className="w-3 h-3" />
              {lead.position}
            </p>
          )}
          {lead.company && (
            <p className="text-sm text-emerald-400 flex items-center gap-1 mt-1">
              <Building className="w-3 h-3" />
              {lead.company}
            </p>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Mail className="w-4 h-4" />
            <span className="truncate">{lead.email}</span>
          </div>
          {lead.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Phone className="w-4 h-4" />
              <span>{lead.phone}</span>
            </div>
          )}
        </div>

        {/* AI Metrics */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <LeadScoreGauge 
              score={lead.score_ia || 0} 
              size="sm"
              showLabel={false}
            />
          </div>
          
          <div className="flex-1 text-center">
            <div className="text-xs text-gray-400 mb-1">Conversão</div>
            <div className="text-2xl font-bold text-emerald-400">
              {lead.ai_conversion_probability || 0}%
            </div>
          </div>
        </div>

        {/* Next Action */}
        {lead.ai_next_best_action && (
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{lead.ai_next_best_action.icon}</span>
              <span className="text-xs font-semibold text-purple-400">Próxima Ação</span>
            </div>
            <p className="text-xs text-gray-300">{lead.ai_next_best_action.script}</p>
          </div>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(lead.created_at).toLocaleDateString('pt-BR')}
          </div>
          {daysSinceContact !== null && (
            <div className={`flex items-center gap-1 ${daysSinceContact > 14 ? 'text-orange-400' : ''}`}>
              <MessageSquare className="w-3 h-3" />
              {daysSinceContact}d sem contato
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all"
          >
            <Phone className="w-4 h-4 inline mr-1" />
            Ligar
          </motion.button>
          
          {lead.phone && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openWhatsApp}
              className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-green-500/20"
              title="Abrir WhatsApp"
            >
              <MessageCircle className="w-4 h-4 inline mr-1" />
              WhatsApp
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <Mail className="w-4 h-4 inline mr-1" />
            Email
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
