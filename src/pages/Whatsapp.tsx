import LayoutSupremo from '@/components/LayoutSupremo';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function WhatsappPage() {
  return (
    <LayoutSupremo title="WhatsApp Business">
      <div className="p-8">
        <div className="flex items-center gap-6 mb-12">
          <ChatBubbleLeftRightIcon className="w-16 h-16 text-green-500" />
          <div>
            <h1 className="text-5xl font-bold text-green-400">WhatsApp Business API</h1>
            <p className="text-2xl text-gray-400 mt-4">
              3.847 mensagens enviadas este mês • 98,7% taxa de abertura
            </p>
          </div>
        </div>

        <div className="text-center py-32 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-3xl border border-green-500/30">
          <p className="text-4xl font-bold text-green-400">
            Conexão ativa com WhatsApp Business API
          </p>
          <p className="text-xl text-gray-300 mt-8">
            Templates aprovados • Campanhas em massa • Chatbot IA
          </p>
        </div>
      </div>
    </LayoutSupremo>
  );
}
