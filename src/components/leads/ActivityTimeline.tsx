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
      call: <Phone className="w-3 h-3" />,
      email: <Mail className="w-3 h-3" />,
      meeting: <Calendar className="w-3 h-3" />,
      note: <FileText className="w-3 h-3" />,
      task: <CheckCircle className="w-3 h-3" />,
      whatsapp: <MessageSquare className="w-3 h-3" />,
      video: <Video className="w-3 h-3" />
    };
    return icons[type as keyof typeof icons] || <Clock className="w-3 h-3" />;
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
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'pending': return <AlertCircle className="w-3 h-3" />;
      case 'scheduled': return <Clock className="w-3 h-3" />;
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
      className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-xl p-3"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-white mb-0.5">Timeline de Atividades</h3>
          <p className="text-xs text-gray-400">{activities.length} interações registradas</p>
        </div>
        <button className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-xs font-semibold text-white transition-colors">
          Ver Todas
        </button>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-800" />

        <div className="space-y-3">
          {displayActivities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-500">Nenhuma atividade registrada</p>
            </div>
          ) : (
            displayActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-11"
              >
                <div className="absolute left-0 top-0">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${getColor(activity.type)} shadow-lg`}
                  >
                    {getIcon(activity.type)}
                  </motion.div>
                </div>

                <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-2">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white">{activity.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{activity.description}</p>
                    </div>
                    {activity.status && (
                      <div className={`flex items-center gap-1 ${getStatusColor(activity.status)}`}>
                        {getStatusIcon(activity.status)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    <span>{activity.user}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(activity.date)}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
