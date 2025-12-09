import LayoutSupremo from '@/components/LayoutSupremo';
import { UserGroupIcon } from '@heroicons/react/24/outline';

export default function ContactsPage() {
  return (
    <LayoutSupremo title="Contatos">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <UserGroupIcon className="w-12 h-12 text-primary" />
          <h1 className="text-4xl font-bold">Contatos</h1>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12 border border-white/20">
          <p className="text-2xl text-gray-200 font-medium">
            Página Contatos pronta — ALSHAM 360° PRIMA v10 SUPREMO
          </p>
        </div>
      </div>
    </LayoutSupremo>
  );
}
