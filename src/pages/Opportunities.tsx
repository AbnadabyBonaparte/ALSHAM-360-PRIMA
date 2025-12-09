import LayoutSupremo from '@/components/LayoutSupremo';
import { BriefcaseIcon } from '@heroicons/react/24/outline';

export default function OpportunitiesPage() {
  return (
    <LayoutSupremo title="Oportunidades">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <BriefcaseIcon className="w-12 h-12 text-primary" />
          <h1 className="text-4xl font-bold">Oportunidades</h1>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12 border border-white/20">
          <p className="text-2xl text-gray-200 font-medium mb-6">
            Gestão completa de oportunidades de venda
          </p>
          <p className="text-lg text-gray-400">
            Pipeline visual • Forecast automático • Win Probability • Next Best Action por IA • Histórico 360°
          </p>
          <p className="text-sm text-gray-500 mt-8">
            ALSHAM 360° PRIMA v10 SUPREMO — Gerada por Citizen Supremo X.1
          </p>
        </div>
      </div>
    </LayoutSupremo>
  );
}
