import LayoutSupremo from '@/components/LayoutSupremo';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  return (
    <LayoutSupremo title="Configurações">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <Cog6ToothIcon className="w-12 h-12 text-primary" />
          <h1 className="text-4xl font-bold">Configurações</h1>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12 border border-white/20">
          <p className="text-2xl text-gray-200 font-medium">
            Configurações Supremo — Billing, Temas, Segurança — ALSHAM 360° PRIMA
          </p>
        </div>
      </div>
    </LayoutSupremo>
  );
}
