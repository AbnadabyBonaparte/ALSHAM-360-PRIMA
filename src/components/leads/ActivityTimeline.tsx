// src/components/leads/ActivityTimeline.tsx
import { motion } from 'framer-motion';
import { 
  Phone, Mail, MessageSquare, Calendar, CheckCircle, 
  AlertCircle, Clock, User, FileText, Video
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'whatsapp' | 'video';
  title: string;
  description: string;
  date: string;
  user: string;
  status?: 'completed' | 'pending' | 'scheduled';
}

interface ActivityTimelineProps {
  activities: Activity[];
  maxItems?: number;
}

export default function ActivityTimeline({ 
  activities = [],
  maxItems = 10 
}: ActivityTimelineProps) {
  
  const getIcon = (type: string) => {
    const icons = {
      call: <Phone className="w-4 h-4" />,
      email: <Mail className="w-4 h-4" />,
      meeting: <Calendar className="w-4 h-4" />,
      note: <FileText className="w-4 h-4" />,
      task: <CheckCircle className="w-4 h-4" />,
      whatsapp: <MessageSquare className="w-4 h-4" />,
      video: <Video className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || <Clock className="w-4 h-4" />;
  };

  const getColor = (type: string) => {
    const colors = {
      call: 'from-blue-500 to-indigo-500',
      email: 'from-purple-500 to-pink-500',
      meeting: 'from-emerald-500 to-teal-500',
      note: 'from-orange-500 to-red-500',
      task: 'from-green-500 to-emerald-500',
      whatsapp: 'from-teal-500 to-cyan-500',
      video: 'from-violet-500 to-purple-500'
    };
    return colors[type as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-orange-400';
      case 'scheduled': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return d.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const displayActivities = activities.slice(0, maxItems);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Timeline de Atividades</h3>
          <p className="text-sm text-gray-400">{activities.length} interações registradas</p>
        </div>
        <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-sm font-semibold text-white transition-colors">
          Ver Todas
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-800" />

        {/* Activities */}
        <div className="space-y-6">
          {displayActivities.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-500">Nenhuma atividade registrada</p>
            </div>
          ) : (
            displayActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-16"
              >
                {/* Icon Circle */}
                <div className="absolute left-0 top-0">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`
                      w-12 h-12 rounded-xl flex items-center justify-center
                      bg-gradient-to-br ${getColor(activity.type)}
                      shadow-lg
                    `}
                    style={{
                      boxShadow: `0 0 20px ${getColor(activity.type).includes('blue') ? '#3b82f6' : 
                                              getColor(activity.type).includes('purple') ? '#a855f7' : 
                                              getColor(activity.type).includes('emerald') ? '#10b981' : '#6b7280'}40`
                    }}
                  >
                    {getIcon(activity.type)}
                  </motion.div>
                </div>

                {/* Content */}
                <motion.div
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-all cursor-pointer backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-white mb-1">{activity.title}</h4>
                      <p className="text-sm text-gray-400">{activity.description}</p>
                    </div>
                    {activity.status && (
                      <div className={`flex items-center gap-1 ${getStatusColor(activity.status)}`}>
                        {getStatusIcon(activity.status)}
                        <span className="text-xs font-medium capitalize">{activity.status}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {activity.user}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(activity.date)}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Add Activity Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20"
      >
        + Adicionar Atividade
      </motion.button>
    </motion.div>
  );
}
