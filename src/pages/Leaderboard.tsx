import LayoutSupremo from '@/components/LayoutSupremo';
import { TrophyIcon } from '@heroicons/react/24/outline';

export default function LeaderboardPage() {
  return (
    <LayoutSupremo title="Leaderboard">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <TrophyIcon className="w-12 h-12 text-primary" />
          <h1 className="text-4xl font-bold">Leaderboard</h1>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12 border border-white/20">
          <p className="text-2xl text-gray-200 font-medium">
            Ranking Supremo — Gamificação ALSHAM 360° PRIMA v10
          </p>
        </div>
      </div>
    </LayoutSupremo>
  );
}
