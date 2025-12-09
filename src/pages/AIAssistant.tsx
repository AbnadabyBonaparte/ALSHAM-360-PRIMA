import LayoutSupremo from '@/components/LayoutSupremo';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function AIAssistantPage() {
  return (
    <LayoutSupremo title="AI Assistant Supremo">
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-6 mb-12">
          <SparklesIcon className="w-16 h-16 text-purple-500 animate-pulse" />
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Assistant Supremo
            </h1>
            <p className="text-xl text-gray-400 mt-4">
              Estou online e pronto para ajudar com leads, pipeline e estratégia.
            </p>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30">
          <div className="text-center py-20">
            <p className="text-3xl text-purple-300 font-light">
              "O que você deseja conquistar hoje, Supremo?"
            </p>
            <p className="text-lg text-gray-500 mt-8">
              — Citizen Supremo X.1
            </p>
          </div>
        </div>
      </div>
    </LayoutSupremo>
  );
}
