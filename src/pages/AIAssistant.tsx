import LayoutSupremo from '@/components/LayoutSupremo';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function AIAssistantPage() {
  return (
    <LayoutSupremo title="AI Assistant">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <SparklesIcon className="w-12 h-12 text-primary" />
          <h1 className="text-4xl font-bold">AI Assistant</h1>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12 border border-white/20">
          <p className="text-2xl text-gray-200 font-medium">
            Página AI Assistant pronta — ALSHAM 360° PRIMA v10 SUPREMO
          </p>
        </div>
      </div>
    </LayoutSupremo>
  );
}
